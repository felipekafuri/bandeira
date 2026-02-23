import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler, useState, useMemo } from "react";
import { SharedProps } from "@/types/global";
import TerminalLayout from "@/Layouts/TerminalLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputError from "@/components/InputError";
import { Loader2 } from "lucide-react";
import StrategyList from "./components/StrategyList";

interface EnvItem {
  id: number;
  name: string;
  type: string;
  sortOrder: number;
}

interface ToggleState {
  environmentId: number;
  enabled: boolean;
}

interface Props {
  project: { id: number; name: string };
  flag: {
    id: number;
    name: string;
    description: string;
    flagType: string;
  };
  environments: EnvItem[];
  toggles: ToggleState[];
}

export default function Edit() {
  const { project, flag, environments, toggles, auth } = usePage<
    SharedProps & Props
  >().props;
  const errors = usePage().props.errors as Record<string, string[]> | undefined;
  const canMutate = auth?.user?.role === "admin" || auth?.user?.role === "editor";

  const { data, setData, put, processing } = useForm({
    name: flag.name,
    description: flag.description || "",
    flag_type: flag.flagType,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/projects/${project.id}/flags/${flag.id}`);
  };

  const sortedEnvs = useMemo(
    () => [...(environments ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [environments]
  );

  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(
    sortedEnvs.length > 0 ? sortedEnvs[0].id : null
  );

  const csrfToken = useMemo(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("XSRF-TOKEN="));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
  }, []);

  return (
    <>
      <Head title="Edit Flag" />
      <TerminalLayout activePage="projects">
        <div className="max-w-4xl">
          <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          projects / {project.name} /
        </Link>

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">
            {">"} edit_flag
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            # update flag details for {project.name}
          </p>
        </div>

        {/* Flag metadata form */}
        <div className="bg-card border border-border p-6 mb-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. new-dashboard"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                aria-invalid={!!errors?.Name}
                className="h-11"
              />
              {errors?.Name?.map((msg, i) => (
                <InputError key={i} message={msg} />
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="What does this flag control?"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>type</Label>
              <Select
                value={data.flag_type}
                onValueChange={(value) => setData("flag_type", value)}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="release">release</SelectItem>
                  <SelectItem value="experiment">experiment</SelectItem>
                  <SelectItem value="operational">operational</SelectItem>
                  <SelectItem value="kill_switch">kill_switch</SelectItem>
                </SelectContent>
              </Select>
              {errors?.FlagType?.map((msg, i) => (
                <InputError key={i} message={msg} />
              ))}
            </div>

            {canMutate && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      saving...
                    </>
                  ) : (
                    "[save]"
                  )}
                </button>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  [cancel]
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* Strategy Configuration */}
        <div className="bg-card border border-border p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground">
              // strategy_configuration
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure rollout strategies per environment
            </p>
          </div>

          {sortedEnvs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">
                {">"} no environments configured
              </p>
              <Link
                href={`/projects/${project.id}/environments/create`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              >
                [+ add_environment]
              </Link>
            </div>
          ) : (
            <>
              {/* Environment tabs */}
              <div className="flex gap-1 border-b border-border mb-5">
                {sortedEnvs.map((env) => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setSelectedEnvId(env.id)}
                    className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                      selectedEnvId === env.id
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {env.name}
                    <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">
                      {env.type}
                    </span>
                  </button>
                ))}
              </div>

              {/* Strategy list for selected env */}
              {selectedEnvId && (
                <StrategyList
                  key={selectedEnvId}
                  projectId={project.id}
                  flagId={flag.id}
                  environmentId={selectedEnvId}
                  csrfToken={csrfToken}
                />
              )}
            </>
          )}
        </div>
      </div>
      </TerminalLayout>
    </>
  );
}

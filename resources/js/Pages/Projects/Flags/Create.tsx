import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";
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

interface Props {
  project: { id: number; name: string };
}

export default function Create() {
  const { project } = usePage<SharedProps & Props>().props;
  const errors = usePage().props.errors as Record<string, string[]> | undefined;

  const { data, setData, post, processing } = useForm({
    name: "",
    description: "",
    flag_type: "release",
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(`/projects/${project.id}/flags`);
  };

  return (
    <>
      <Head title="New Flag" />
      <TerminalLayout activePage="projects">
        <div className="max-w-2xl">
            <div className="mb-6">
              <Link
              href="/projects"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              projects
            </Link>
            <span className="text-sm text-muted-foreground mx-1">/</span>
            <Link
              href={`/projects/${project.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {project.name}
            </Link>
            <span className="text-sm text-muted-foreground mx-1">/</span>
            <span className="text-sm text-foreground">create flag</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {">"} create_flag
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              # add a new feature flag to {project.name}.
            </p>
          </div>

          <div className="bg-card border border-border p-6">
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
                    <SelectItem value="release">Release</SelectItem>
                    <SelectItem value="experiment">Experiment</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="kill_switch">Kill Switch</SelectItem>
                  </SelectContent>
                </Select>
                {errors?.FlagType?.map((msg, i) => (
                  <InputError key={i} message={msg} />
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      creating...
                    </>
                  ) : (
                    "[create]"
                  )}
                </button>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  [cancel]
                </Link>
              </div>
            </form>
          </div>
      </div>
      </TerminalLayout>
    </>
  );
}

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
  environments: { id: number; name: string }[];
}

export default function Create() {
  const { project, environments } = usePage<SharedProps & Props>().props;
  const errors = usePage().props.errors as Record<string, string[]> | undefined;

  const { data, setData, post, processing } = useForm({
    name: "",
    token_type: "client",
    environment: "",
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(`/projects/${project.id}/api-tokens`);
  };

  return (
    <>
      <Head title="New API Token" />
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
            <Link
              href={`/projects/${project.id}/api-tokens`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              api tokens
            </Link>
            <span className="text-sm text-muted-foreground mx-1">/</span>
            <span className="text-sm text-foreground">create</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {">"} create_api_token
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              # create a new api token for {project.name}.
            </p>
          </div>

          <div className="bg-card border border-border p-6">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Production SDK Token"
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
                <Label>token type</Label>
                <Select
                  value={data.token_type}
                  onValueChange={(value) => setData("token_type", value)}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors?.TokenType?.map((msg, i) => (
                  <InputError key={i} message={msg} />
                ))}
              </div>

              {data.token_type === "client" && (
                <div className="space-y-2">
                  <Label>environment</Label>
                  <Select
                    value={data.environment}
                    onValueChange={(value) => setData("environment", value)}
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select an environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {environments.map((env) => (
                        <SelectItem key={env.id} value={env.name}>
                          {env.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors?.Environment?.map((msg, i) => (
                    <InputError key={i} message={msg} />
                  ))}
                </div>
              )}

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
                  href={`/projects/${project.id}/api-tokens`}
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

import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { SharedProps } from "@/types/global";
import TerminalLayout from "@/Layouts/TerminalLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/InputError";
import { Loader2 } from "lucide-react";

interface ProjectData {
  id: number;
  name: string;
  description: string;
}

interface Props {
  project: ProjectData;
}

export default function Edit() {
  const { project } = usePage<SharedProps & Props>().props;
  const errors = usePage().props.errors as Record<string, string[]> | undefined;

  const { data, setData, put, processing } = useForm({
    name: project.name,
    description: project.description || "",
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/projects/${project.id}`);
  };

  return (
    <>
      <Head title="Edit Project" />
      <TerminalLayout activePage="projects">
        <div className="max-w-2xl">
            <div className="mb-8">
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
            <span className="text-sm text-foreground">edit</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {">"} edit_project
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              # update your project details.
            </p>
          </div>

          <div className="bg-card border border-border p-6">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. My App"
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
                  placeholder="A short description of this project"
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  className="h-11"
                />
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
            </form>
          </div>
      </div>
      </TerminalLayout>
    </>
  );
}

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
  environment: {
    id: number;
    name: string;
    type: string;
    sortOrder: number;
  };
}

export default function Edit() {
  const { project, environment } = usePage<SharedProps & Props>().props;
  const errors = usePage().props.errors as Record<string, string[]> | undefined;

  const { data, setData, put, processing } = useForm({
    name: environment.name,
    type: environment.type,
    sort_order: String(environment.sortOrder),
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/projects/${project.id}/environments/${environment.id}`);
  };

  return (
    <>
      <Head title="Edit Environment" />
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
            <span className="text-sm text-foreground">edit environment</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {">"} edit_environment
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              # update environment details for {project.name}.
            </p>
          </div>

          <div className="bg-card border border-border p-6">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Production"
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
                <Label>type</Label>
                <Select
                  value={data.type}
                  onValueChange={(value) => setData("type", value)}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
                {errors?.Type?.map((msg, i) => (
                  <InputError key={i} message={msg} />
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">
                  sort order{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  placeholder="0"
                  value={data.sort_order}
                  onChange={(e) => setData("sort_order", e.target.value)}
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

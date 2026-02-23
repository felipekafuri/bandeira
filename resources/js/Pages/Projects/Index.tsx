import { Head, Link, usePage } from "@inertiajs/react";
import { SharedProps } from "@/types/global";
import TerminalLayout from "@/Layouts/TerminalLayout";

interface ProjectItem {
  id: number;
  name: string;
  description: string;
  flagCount: number;
  environmentCount: number;
  createdAt: string;
}

interface Props {
  projects: ProjectItem[];
}

export default function Index() {
  const { projects, auth } = usePage<SharedProps & Props>().props;
  const canMutate = auth?.user?.role === "admin" || auth?.user?.role === "editor";

  return (
    <>
      <Head title="Projects" />
      <TerminalLayout activePage="projects">
        <div className="max-w-5xl">
          {/* Page heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {">"} projects
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              # manage your feature flag projects
            </p>
          </div>
          {canMutate && (
            <Link
              href="/projects/create"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              [+ new_project]
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-card border border-border">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-muted-foreground text-lg mb-2">
                {">"} no projects yet
              </p>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                Get started by creating your first project. Projects contain
                feature flags, environments, and API tokens.
              </p>
              <Link
                href="/projects/create"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                [+ new_project]
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block"
              >
                <div className="bg-card border border-border p-5 hover:border-primary/50 transition-colors">
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    $ {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {!project.description && <div className="mb-4" />}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{project.flagCount} flags</span>
                    <span>{project.environmentCount} envs</span>
                    <span className="ml-auto">{project.createdAt}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </TerminalLayout>
    </>
  );
}

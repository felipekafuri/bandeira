import { Head, Link, usePage } from "@inertiajs/react";
import { SharedProps } from "@/types/global";
import TerminalLayout from "@/Layouts/TerminalLayout";

interface RecentProject {
  id: number;
  name: string;
  description: string;
  flagCount: number;
  environmentCount: number;
  createdAt: string;
}

interface DashboardProps {
  projectCount: number;
  flagCount: number;
  environmentCount: number;
  recentProjects: RecentProject[];
}

export default function Dashboard() {
  const { projectCount, flagCount, environmentCount, recentProjects } =
    usePage<SharedProps & DashboardProps>().props;

  return (
    <>
      <Head title="Dashboard" />
      <TerminalLayout activePage="dashboard">
        <div className="max-w-5xl">
          {/* Page heading */}
          <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">
            {">"} dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            # overview of your feature flag projects
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border p-5">
            <span className="text-xs text-muted-foreground">
              total_projects
            </span>
            <p className="text-3xl font-semibold text-foreground mt-1">
              {projectCount}
            </p>
          </div>

          <div className="bg-card border border-border p-5">
            <span className="text-xs text-muted-foreground">
              feature_flags
            </span>
            <p className="text-3xl font-semibold text-foreground mt-1">
              {flagCount}
            </p>
          </div>

          <div className="bg-card border border-border p-5">
            <span className="text-xs text-muted-foreground">
              environments
            </span>
            <p className="text-3xl font-semibold text-foreground mt-1">
              {environmentCount}
            </p>
          </div>
        </div>

        {/* Recent projects or empty state */}
        {recentProjects && recentProjects.length > 0 ? (
          <div className="bg-card border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                // recent_projects
              </h2>
              <Link
                href="/projects"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                [view_all]
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <span className="font-medium text-foreground text-sm">
                      $ {project.name}
                    </span>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{project.flagCount} flags</span>
                    <span>{project.environmentCount} envs</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-muted-foreground text-lg mb-2">
                {">"} no feature flags yet
              </p>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                Get started by creating your first project and adding feature
                flags to control your application's behavior.
              </p>
              <Link
                href="/projects/create"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                [+ create_project]
              </Link>
            </div>
          </div>
        )}
      </div>
      </TerminalLayout>
    </>
  );
}

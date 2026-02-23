import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState, useCallback } from "react";
import { SharedProps } from "@/types/global";
import TerminalLayout from "@/Layouts/TerminalLayout";

interface FlagItem {
  id: number;
  name: string;
  description: string;
  flagType: string;
  createdAt: string;
}

interface EnvItem {
  id: number;
  name: string;
  type: string;
  sortOrder: number;
}

interface ToggleState {
  flagId: number;
  environmentId: number;
  enabled: boolean;
}

interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  flags: FlagItem[];
  environments: EnvItem[];
  toggles: ToggleState[];
}

interface Props {
  project: ProjectDetail;
}

const flagTypeBadge: Record<string, string> = {
  release: "text-foreground border-border",
  experiment: "text-cyan-400 border-cyan-400/30",
  operational: "text-amber-400 border-amber-400/30",
  kill_switch: "text-red-400 border-red-400/30",
};

export default function Show() {
  const { project, auth } = usePage<SharedProps & Props>().props;
  const canMutate = auth?.user?.role === "admin" || auth?.user?.role === "editor";

  const handleDeleteProject = () => {
    if (confirm("Are you sure you want to delete this project?")) {
      router.delete(`/projects/${project.id}`);
    }
  };

  const handleDeleteEnv = (envId: number) => {
    if (confirm("Are you sure you want to delete this environment?")) {
      router.delete(
        `/projects/${project.id}/environments/${envId}`,
      );
    }
  };

  const handleDeleteFlag = (flagId: number) => {
    if (confirm("Are you sure you want to delete this flag?")) {
      router.delete(`/projects/${project.id}/flags/${flagId}`);
    }
  };

  // Local toggle state for optimistic UI
  const [toggleMap, setToggleMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (project.toggles) {
      for (const t of project.toggles) {
        map[`${t.flagId}-${t.environmentId}`] = t.enabled;
      }
    }
    return map;
  });

  const getToggle = useCallback(
    (flagId: number, envId: number) => {
      return toggleMap[`${flagId}-${envId}`] ?? false;
    },
    [toggleMap],
  );

  const handleToggle = useCallback(
    async (flagId: number, envId: number) => {
      const key = `${flagId}-${envId}`;
      const current = toggleMap[key] ?? false;
      const next = !current;

      // Optimistic update
      setToggleMap((prev) => ({ ...prev, [key]: next }));

      try {
        const csrfCookie = document.cookie
          .split("; ")
          .find((c) => c.startsWith("XSRF-TOKEN="));
        const csrfToken = csrfCookie
          ? decodeURIComponent(csrfCookie.split("=")[1])
          : "";

        const res = await fetch(
          `/projects/${project.id}/flags/${flagId}/toggle`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({ environmentId: envId, enabled: next }),
          },
        );

        if (!res.ok) {
          setToggleMap((prev) => ({ ...prev, [key]: current }));
        }
      } catch {
        setToggleMap((prev) => ({ ...prev, [key]: current }));
      }
    },
    [toggleMap, project.id],
  );

  const sortedEnvs = [...project.environments].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const hasMatrix =
    project.flags.length > 0 && project.environments.length > 0;

  return (
    <>
      <Head title={project.name} />
      <TerminalLayout activePage="projects">
        <div className="max-w-6xl">
          {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          projects /
        </Link>

        {/* Project header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {">"} {project.name}/
            </h1>
            {project.description && (
              <p className="text-muted-foreground mt-1 text-sm">
                # {project.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              created {project.createdAt}
            </p>
          </div>
          {canMutate && (
            <div className="flex items-center gap-2">
              <Link
                href={`/projects/${project.id}/edit`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              >
                [edit]
              </Link>
              <Link
                href={`/projects/${project.id}/api-tokens`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              >
                [api_tokens]
              </Link>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors border border-destructive/30 px-3 py-1.5"
              >
                [delete]
              </button>
            </div>
          )}
        </div>

        {/* Flag Matrix */}
        {hasMatrix && (
          <div className="bg-card border border-border mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                // flag_matrix
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Toggle flags across environments
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 min-w-[200px]">
                      flag
                    </th>
                    {sortedEnvs.map((env) => (
                      <th
                        key={env.id}
                        className="text-center text-xs font-medium text-muted-foreground px-4 py-3 min-w-[100px]"
                      >
                        <div>{env.name}</div>
                        <div className="text-[10px] opacity-60 font-normal">
                          {env.type}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {project.flags.map((flag) => (
                    <tr
                      key={flag.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm">
                            {flag.name}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 border font-medium ${flagTypeBadge[flag.flagType] ?? flagTypeBadge.release}`}
                          >
                            [{flag.flagType.replace("_", " ")}]
                          </span>
                        </div>
                        {flag.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {flag.description}
                          </p>
                        )}
                      </td>
                      {sortedEnvs.map((env) => {
                        const enabled = getToggle(flag.id, env.id);
                        return (
                          <td key={env.id} className="text-center px-4 py-3">
                            <button
                              type="button"
                              onClick={() => canMutate && handleToggle(flag.id, env.id)}
                              disabled={!canMutate}
                              className={`text-sm font-medium transition-colors ${
                                !canMutate ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"
                              }`}
                              role="switch"
                              aria-checked={enabled}
                              aria-label={`Toggle ${flag.name} in ${env.name}`}
                            >
                              {enabled ? (
                                <span className="text-primary">● on</span>
                              ) : (
                                <span className="text-muted-foreground">○ off</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Flags section */}
        <div className="bg-card border border-border mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              // feature_flags
            </h2>
            {canMutate && (
              <Link
                href={`/projects/${project.id}/flags/create`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              >
                [+ new_flag]
              </Link>
            )}
          </div>
          {project.flags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {">"} no feature flags yet
              </p>
              <Link
                href={`/projects/${project.id}/flags/create`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              >
                [+ create_first_flag]
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {project.flags.map((flag) => (
                <div
                  key={flag.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {flag.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 border font-medium ${flagTypeBadge[flag.flagType] ?? flagTypeBadge.release}`}
                      >
                        [{flag.flagType.replace("_", " ")}]
                      </span>
                    </div>
                    {flag.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {flag.description}
                      </p>
                    )}
                  </div>
                  {canMutate && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${project.id}/flags/${flag.id}/edit`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        [edit]
                      </Link>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                        onClick={() => handleDeleteFlag(flag.id)}
                      >
                        [x]
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Environments section */}
        <div className="bg-card border border-border mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              // environments
            </h2>
            {canMutate && (
              <Link
                href={`/projects/${project.id}/environments/create`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              >
                [+ new_env]
              </Link>
            )}
          </div>
          {project.environments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {">"} no environments yet
              </p>
              <Link
                href={`/projects/${project.id}/environments/create`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              >
                [+ create_first_env]
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedEnvs.map((env) => (
                <div
                  key={env.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm">
                      {env.name}
                    </span>
                    <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5">
                      [{env.type}]
                    </span>
                  </div>
                  {canMutate && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${project.id}/environments/${env.id}/edit`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        [edit]
                      </Link>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                        onClick={() => handleDeleteEnv(env.id)}
                      >
                        [x]
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Tokens section */}
        <div className="bg-card border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              // api_tokens
            </h2>
            <Link
              href={`/projects/${project.id}/api-tokens`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
            >
              [manage_tokens]
            </Link>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Create and manage API tokens for SDK access to this project's feature flags.
            </p>
          </div>
        </div>
      </div>
      </TerminalLayout>
    </>
  );
}

import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import { SharedProps } from "@/types/global";
import TerminalLayout from "@/Layouts/TerminalLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

interface TokenItem {
  id: number;
  name: string;
  tokenType: string;
  environment: string;
  plainToken: string;
  createdAt: string;
}

interface Props {
  project: { id: number; name: string };
  tokens: TokenItem[];
}

export default function Index() {
  const { project, tokens, auth } = usePage<SharedProps & Props>().props;
  const canMutate = auth?.user?.role === "admin" || auth?.user?.role === "editor";

  const [visibleTokens, setVisibleTokens] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const toggleVisibility = (id: number) => {
    setVisibleTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (id: number, plainToken: string) => {
    await navigator.clipboard.writeText(plainToken);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (tokenId: number) => {
    if (confirm("Are you sure you want to revoke this token? This cannot be undone.")) {
      router.delete(`/projects/${project.id}/api-tokens/${tokenId}`);
    }
  };

  return (
    <>
      <Head title="API Tokens" />
      <TerminalLayout activePage="projects">
        <div className="max-w-5xl">
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
            <span className="text-sm text-foreground">api tokens</span>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {">"} api_tokens
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                # manage api tokens for {project.name}.
              </p>
            </div>
            {canMutate && (
              <Link
                href={`/projects/${project.id}/api-tokens/create`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                [add token]
              </Link>
            )}
          </div>

          {/* Token list */}
          <div className="bg-card border border-border">
            {tokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  no api tokens yet.
                </p>
                <Link
                  href={`/projects/${project.id}/api-tokens/create`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  [create your first token]
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {tokens.map((tok) => (
                  <div key={tok.id} className="px-5 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-sm">
                              {tok.name}
                            </span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5">
                              {tok.tokenType}
                            </span>
                            {tok.environment && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5">
                                {tok.environment}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Created {tok.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleVisibility(tok.id)}
                          title={visibleTokens[tok.id] ? "Hide token" : "Show token"}
                        >
                          {visibleTokens[tok.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleCopy(tok.id, tok.plainToken)}
                          title="Copy token"
                        >
                          {copiedId === tok.id ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        {canMutate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(tok.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                    {visibleTokens[tok.id] && (
                      <code className="block bg-muted text-foreground px-3 py-2 text-xs font-mono break-all select-all">
                        {tok.plainToken}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
      </TerminalLayout>
    </>
  );
}

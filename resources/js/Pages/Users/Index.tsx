import { Head, Link, usePage, router } from "@inertiajs/react";
import { SharedProps } from "@/types/global";
import TerminalLayout from "@/Layouts/TerminalLayout";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Props {
  users: UserItem[];
}

const roleBadge: Record<string, string> = {
  admin: "text-red-400 border-red-400/30",
  editor: "text-cyan-400 border-cyan-400/30",
  viewer: "text-muted-foreground border-border",
};

export default function Index() {
  const { users } = usePage<SharedProps & Props>().props;

  const handleDelete = (userId: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      router.delete(`/users/${userId}`);
    }
  };

  return (
    <>
      <Head title="Users" />
      <TerminalLayout activePage="users">
        <div className="max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
            <h1 className="text-xl font-semibold text-foreground">
              {">"} users
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              # manage user accounts and roles
            </p>
          </div>
          <Link
            href="/users/create"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            [+ new_user]
          </Link>
        </div>

        <div className="bg-card border border-border">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-muted-foreground text-lg mb-2">
                {">"} no users yet
              </p>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                Get started by creating your first user account.
              </p>
              <Link
                href="/users/create"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                [+ new_user]
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">
                          {u.name}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 border font-medium ${roleBadge[u.role] ?? roleBadge.viewer}`}
                        >
                          [{u.role}]
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {u.email} · Joined {u.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/users/${u.id}/edit`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      [edit]
                    </Link>
                    <button
                      type="button"
                      className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                      onClick={() => handleDelete(u.id, u.name)}
                    >
                      [x]
                    </button>
                  </div>
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

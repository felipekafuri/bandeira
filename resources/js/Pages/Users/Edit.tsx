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
  editUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function Edit() {
  const { editUser } = usePage<SharedProps & Props>().props;
  const errors = usePage().props.errors as Record<string, string[]> | undefined;

  const { data, setData, put, processing } = useForm({
    name: editUser.name,
    email: editUser.email,
    password: "",
    role: editUser.role,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/users/${editUser.id}`);
  };

  return (
    <>
      <Head title="Edit User" />
      <TerminalLayout activePage="users">
        <div className="max-w-2xl">
          <div className="mb-6">
          <Link
            href="/users"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            users
          </Link>
          <span className="text-sm text-muted-foreground mx-1">/</span>
          <span className="text-sm text-foreground">{editUser.name}</span>
          <span className="text-sm text-muted-foreground mx-1">/</span>
          <span className="text-sm text-foreground">edit</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {">"} edit_user
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            # update account details for {editUser.name}.
          </p>
        </div>

        <div className="bg-card border border-border p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
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
              <Label htmlFor="email">email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                aria-invalid={!!errors?.Email}
                className="h-11"
              />
              {errors?.Email?.map((msg, i) => (
                <InputError key={i} message={msg} />
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                password{" "}
                <span className="text-muted-foreground font-normal">
                  (leave blank to keep current)
                </span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="New password"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                aria-invalid={!!errors?.Password}
                className="h-11"
              />
              {errors?.Password?.map((msg, i) => (
                <InputError key={i} message={msg} />
              ))}
            </div>

            <div className="space-y-2">
              <Label>role</Label>
              <Select
                value={data.role}
                onValueChange={(value) => setData("role", value)}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              {errors?.Role?.map((msg, i) => (
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
                    saving...
                  </>
                ) : (
                  "[save]"
                )}
              </button>
              <Link
                href="/users"
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

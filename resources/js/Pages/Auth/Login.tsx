import { Head, useForm, Link } from "@inertiajs/react";
import { FormEventHandler, useRef, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SharedProps } from "@/types/global";
import { usePage } from "@inertiajs/react";
import { useFlashToasts } from "@/hooks/useFlashToast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/InputError";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const { flash } = usePage<SharedProps>().props;
  const errors = usePage().props.errors as Record<string, string[]> | undefined;
  useFlashToasts(flash);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing } = useForm({
    email: "",
    password: "",
  });

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Clear password and re-focus on validation error
  useEffect(() => {
    if (errors?.Email || errors?.Password) {
      setData("password", "");
      passwordRef.current?.focus();
    }
  }, [errors]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post("/user/login");
  };

  return (
    <>
      <Head title="Login" />
      <div className="min-h-screen flex flex-col bg-background">
        <Toaster />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {">"} bandeira
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo & heading */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-foreground">
              {">"} bandeira
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              # authenticate to continue
            </p>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border p-6">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">$ email</Label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
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
                <Label htmlFor="password">$ password</Label>
                <div className="relative">
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    aria-invalid={!!errors?.Password}
                    className="pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors?.Password?.map((msg, i) => (
                  <InputError key={i} message={msg} />
                ))}
              </div>

              <button
                type="submit"
                className="w-full h-11 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center"
                disabled={processing}
              >
                {processing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    authenticating...
                  </span>
                ) : (
                  "[authenticate]"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            // powered by bandeira v1.0.0
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              [back_to_home]
            </Link>
          </p>
        </div>
      </main>
      </div>
    </>
  );
}

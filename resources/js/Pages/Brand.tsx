import { Head } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppearance, type Appearance } from "@/hooks/useAppearance";
import {
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  Type,
  Palette,
  Component,
  Sparkles,
  Flag,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Color tokens                                                       */
/* ------------------------------------------------------------------ */

interface ColorToken {
  name: string;
  cssVar: string;
  twClass: string;
}

const coreColors: ColorToken[] = [
  { name: "Background", cssVar: "--background", twClass: "bg-background" },
  { name: "Foreground", cssVar: "--foreground", twClass: "text-foreground" },
  { name: "Primary", cssVar: "--primary", twClass: "bg-primary" },
  {
    name: "Primary Foreground",
    cssVar: "--primary-foreground",
    twClass: "text-primary-foreground",
  },
  { name: "Secondary", cssVar: "--secondary", twClass: "bg-secondary" },
  {
    name: "Secondary Foreground",
    cssVar: "--secondary-foreground",
    twClass: "text-secondary-foreground",
  },
];

const uiColors: ColorToken[] = [
  { name: "Card", cssVar: "--card", twClass: "bg-card" },
  {
    name: "Card Foreground",
    cssVar: "--card-foreground",
    twClass: "text-card-foreground",
  },
  { name: "Muted", cssVar: "--muted", twClass: "bg-muted" },
  {
    name: "Muted Foreground",
    cssVar: "--muted-foreground",
    twClass: "text-muted-foreground",
  },
  { name: "Accent", cssVar: "--accent", twClass: "bg-accent" },
  {
    name: "Accent Foreground",
    cssVar: "--accent-foreground",
    twClass: "text-accent-foreground",
  },
  { name: "Destructive", cssVar: "--destructive", twClass: "bg-destructive" },
  { name: "Border", cssVar: "--border", twClass: "border-border" },
  { name: "Ring", cssVar: "--ring", twClass: "ring-ring" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getComputedColor(cssVar: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {copied ? (
        <Check className="w-3 h-3 text-primary" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Color Swatch                                                       */
/* ------------------------------------------------------------------ */

function ColorSwatch({ token }: { token: ColorToken }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const update = () => setValue(getComputedColor(token.cssVar));
    update();
    // Re-read when theme changes
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [token.cssVar]);

  return (
    <div className="flex items-start gap-3 p-3 border border-border bg-card">
      <div
        className="w-12 h-12 border border-border shrink-0"
        style={{ backgroundColor: value || "transparent" }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{token.name}</p>
        <p className="text-xs text-muted-foreground font-mono truncate">
          {token.twClass}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground font-mono truncate">
            {value}
          </p>
          <CopyButton text={token.twClass} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section anchor nav                                                 */
/* ------------------------------------------------------------------ */

const sections = [
  { id: "colors", label: "Colors", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "components", label: "Components", icon: Component },
  { id: "identity", label: "Logo & Identity", icon: Sparkles },
] as const;

function AnchorNav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-16 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 md:px-6 flex items-center gap-1 overflow-x-auto py-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              active === s.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme toggle                                                       */
/* ------------------------------------------------------------------ */

function ThemeToggle() {
  const { appearance, updateAppearance } = useAppearance();
  const modes: { value: Appearance; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted border border-border">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => updateAppearance(m.value)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            appearance === m.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <m.icon className="w-3.5 h-3.5" />
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shadow showcase                                                    */
/* ------------------------------------------------------------------ */

const shadowLevels = ["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl"] as const;

/* ------------------------------------------------------------------ */
/*  AI Logo prompt                                                     */
/* ------------------------------------------------------------------ */

const logoPrompt = `Minimal, modern logo for "Bandeira" — an open-source feature flag management tool for developers. The icon should be a stylized flag or banner shape, geometric and clean. Primary brand color is vibrant green (oklch 0.887 0.212 128.5 — approximately #7AE66B). The word "Bandeira" means "flag" in Portuguese.

Requirements:
- Works as a small favicon (16px) and as a full wordmark
- Geometric, not illustrative
- Should feel like a developer tool — clean, precise, trustworthy
- Style reference: Linear, Vercel, Supabase aesthetic
- Black or dark navy for text, vibrant green for the icon mark
- The flag/banner shape should subtly suggest "feature toggling" or "on/off"`;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Brand() {
  const promptRef = useRef<HTMLPreElement>(null);
  const [promptCopied, setPromptCopied] = useState(false);

  return (
    <>
      <Head title="Brand" />
      <PublicLayout activePage="brand">
        {/* Hero */}
      <section className="py-16 px-4 md:px-6 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
            {">"} brand
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            # colors, typography, and components
          </p>
        </div>
      </section>

      <AnchorNav />

      {/* ---- Colors ---- */}
      <section id="colors" className="py-16 px-4 md:px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1">
                // color_palette
              </h2>
              <p className="text-sm text-muted-foreground">
                Semantic tokens using OKLch color space. Toggle the theme to
                preview both palettes.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Core
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {coreColors.map((c) => (
              <ColorSwatch key={c.cssVar} token={c} />
            ))}
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            UI
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uiColors.map((c) => (
              <ColorSwatch key={c.cssVar} token={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Typography ---- */}
      <section
        id="typography"
        className="py-16 px-4 md:px-6 bg-background border-t border-border"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-foreground mb-1">
            // typography
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Three font families for different contexts.
          </p>

          <div className="space-y-6">
            {/* Inter */}
            <div className="bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-foreground">Inter</h3>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  font-sans
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-foreground font-normal">
                  Regular (400) — The quick brown fox jumps over the lazy dog
                </p>
                <p className="text-foreground font-medium">
                  Medium (500) — The quick brown fox jumps over the lazy dog
                </p>
                <p className="text-foreground font-semibold">
                  Semibold (600) — The quick brown fox jumps over the lazy dog
                </p>
                <p className="text-foreground font-bold">
                  Bold (700) — The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </div>

            {/* JetBrains Mono */}
            <div className="bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-foreground">
                  JetBrains Mono
                </h3>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  font-mono
                </span>
              </div>
              <pre className="text-sm text-foreground/80 font-mono leading-relaxed overflow-x-auto">
                {`const client = bandeira.New({ url: "http://localhost:8080" })
if (client.isEnabled("new-checkout")) {
    // show new checkout flow
}`}
              </pre>
            </div>

            {/* Type scale */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Type Scale</h3>
              <div className="space-y-3">
                {(
                  [
                    ["text-xs", "0.75rem"],
                    ["text-sm", "0.875rem"],
                    ["text-base", "1rem"],
                    ["text-lg", "1.125rem"],
                    ["text-xl", "1.25rem"],
                    ["text-2xl", "1.5rem"],
                    ["text-3xl", "1.875rem"],
                  ] as const
                ).map(([cls, size]) => (
                  <div
                    key={cls}
                    className="flex items-baseline gap-4 flex-wrap"
                  >
                    <span className="text-xs text-muted-foreground font-mono w-20 shrink-0">
                      {cls}
                    </span>
                    <span className={`${cls} text-foreground`}>
                      Bandeira — {size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Components ---- */}
      <section
        id="components"
        className="py-16 px-4 md:px-6 bg-background border-t border-border"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-foreground mb-1">
            // components
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Live rendered components from the actual UI library.
          </p>

          <div className="space-y-6">
            {/* Buttons */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Buttons</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                    Variants
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                    Sizes
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                    States
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button>Enabled</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Inputs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Default
                  </label>
                  <Input placeholder="Enter a value..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Disabled
                  </label>
                  <Input placeholder="Disabled input" disabled />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    With value
                  </label>
                  <Input defaultValue="new-checkout-flow" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Error state
                  </label>
                  <Input
                    defaultValue="invalid"
                    aria-invalid="true"
                  />
                </div>
              </div>
            </div>

            {/* Card */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Card</h3>
              <div className="max-w-sm">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Flag</CardTitle>
                    <CardDescription>
                      new-checkout-flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Gradual rollout at 50% with user-based stickiness.
                      Currently enabled in production.
                    </p>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button size="sm">Edit</Button>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Status badges */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Status Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium border border-current/20 bg-primary/10 text-primary">
                  Enabled
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium border border-current/20 bg-destructive/10 text-destructive">
                  Disabled
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium border border-current/20 bg-muted text-muted-foreground">
                  Draft
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium border border-current/20 bg-secondary text-secondary-foreground">
                  Archived
                </span>
              </div>
            </div>

            {/* Shadows */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Shadows</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {shadowLevels.map((s) => (
                  <div key={s} className="text-center">
                    <div
                      className={`w-full aspect-square bg-card border border-border ${s} mb-2`}
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Border radius */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Border Radius
              </h3>
              <div className="flex flex-wrap gap-4">
                {(
                  [
                    ["rounded-sm", "sm"],
                    ["rounded-md", "md"],
                    ["rounded-lg", "lg"],
                    ["rounded-xl", "xl"],
                    ["rounded-full", "full"],
                  ] as const
                ).map(([cls, label]) => (
                  <div key={cls} className="text-center">
                    <div
                      className={`w-16 h-16 bg-primary/20 border-2 border-primary ${cls}`}
                    />
                    <span className="text-xs text-muted-foreground font-mono mt-1 block">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Logo & Identity ---- */}
      <section
        id="identity"
        className="py-16 px-4 md:px-6 bg-background border-t border-border"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-foreground mb-1">
            // logo_and_identity
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Current mark and a ready-to-use prompt for AI logo generators.
          </p>

          {/* Current mark */}
          <div className="bg-card border border-border p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Current Mark</h3>
            <div className="flex flex-wrap gap-6 items-end">
              {[16, 32, 64, 128].map((size) => (
                <div key={size} className="text-center">
                  <div className="inline-flex items-center justify-center mb-2">
                    <Logo size={size} />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {size}px
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                On dark background
              </p>
              <div className="bg-[oklch(0.13_0.04_265)] p-6 flex flex-wrap gap-6 items-end">
                {[32, 64, 128].map((size) => (
                  <div key={size} className="text-center">
                    <div className="mx-auto mb-2">
                      <Logo size={size} />
                    </div>
                    <p className="text-xs text-[oklch(0.71_0.04_257)] font-mono">
                      {size}px
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                Wordmark
              </p>
              <div className="flex items-center gap-3">
                <Logo size={40} />
                <span className="text-2xl font-semibold text-foreground tracking-tight">
                  Bandeira
                </span>
              </div>
            </div>
          </div>

          {/* AI Logo Prompt */}
          <div className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-semibold text-foreground">
                AI Logo Generator Prompt
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(logoPrompt);
                  setPromptCopied(true);
                  setTimeout(() => setPromptCopied(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {promptCopied ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {promptCopied ? "Copied!" : "Copy prompt"}
              </button>
            </div>
            <pre
              ref={promptRef}
              className="text-sm text-foreground/80 font-mono leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 border border-border"
            >
              {logoPrompt}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center bg-background">
        <p className="text-xs text-muted-foreground">
          // bandeira — open source feature flag management
        </p>
      </footer>
      </PublicLayout>
    </>
  );
}

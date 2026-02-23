import { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { SharedProps } from "@/types/global";
import { FeatureFlagToggle } from "@/components/ui/feature-flag-toggle";
import { AnimateInView, AnimateChild } from "@/components/ui/animate-in-view";
import { SSEStreamDemo } from "@/components/ui/sse-stream-demo";
import { FlagEvaluationDemo } from "@/components/ui/flag-evaluation-demo";
import { LiveMetricsPulse } from "@/components/ui/live-metrics-pulse";
import PublicLayout from "@/Layouts/PublicLayout";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";

function FloatingShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={`absolute ${className ?? ""}`}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div className="absolute inset-0 border border-primary/[0.12] bg-primary/[0.04]" />
      </motion.div>
    </motion.div>
  );
}

const features = [
  {
    title: "per_environment_toggles",
    description:
      "Enable flags independently across development, staging, and production.",
  },
  {
    title: "targeting_strategies",
    description:
      "Roll out to specific users, percentages, or IP ranges with built-in strategies.",
    href: "/strategies",
  },
  {
    title: "constraint_engine",
    description:
      "AND/OR logic with operators like IN, STR_CONTAINS, NUM_GT, and date comparisons.",
    href: "/strategies",
  },
  {
    title: "zero_latency_sdks",
    description:
      "SDKs for Go, JS/TS, Python, PHP, Dart, and Elixir poll and cache locally — flag checks are pure in-memory lookups.",
  },
];

const steps = [
  {
    number: 1,
    title: "create_project",
    description: "Set up environments like staging and production.",
  },
  {
    number: 2,
    title: "define_flags",
    description: "Add feature flags with strategies and constraints.",
  },
  {
    number: 3,
    title: "evaluate_anywhere",
    description: "Use any of our 6 SDKs to check flags at runtime.",
  },
];

const goCode = `client, _ := bandeira.New(bandeira.Config{
    URL:   "http://localhost:8080",
    Token: "your-token",
})
defer client.Close()

if client.IsEnabled("new-checkout", bandeira.Context{
    UserID: "42",
}) {
    // show new checkout
}`;

const jsCode = `const client = new BandeiraClient({
  url: "http://localhost:8080",
  token: "your-token",
});
await client.start();

if (client.isEnabled("new-checkout", {
  userId: "42",
})) {
  // show new checkout
}`;

const pyCode = `client = BandeiraClient(Config(
    url="http://localhost:8080",
    token="your-token",
))
client.start()

if client.is_enabled("new-checkout", Context(
    user_id="42",
)):
    # show new checkout`;

const phpCode = `$client = new Client(new Config(
    url: 'http://localhost:8080',
    token: 'your-token',
));

if ($client->isEnabled('new-checkout', new Context(
    userId: '42',
))) {
    // show new checkout
}`;

const dartCode = `final client = await BandeiraClient.create(
  const BandeiraConfig(
    url: "http://localhost:8080",
    token: "your-token",
  ),
);

if (client.isEnabled("new-checkout",
    const BandeiraContext(userId: "42"))) {
  // show new checkout
}`;

const elixirCode = `{:ok, client} =
  Client.start_link(%Config{
    url: "http://localhost:8080",
    token: "your-token"
  })

if Client.is_enabled(client, "new-checkout",
     %Context{user_id: "42"}) do
  # show new checkout
end`;

const curlCode = `curl http://localhost:8080/api/v1/flags \\
  -H "Authorization: Bearer <token>"`;

const sdkTabs = [
  { key: "go", label: "Go", code: goCode },
  { key: "js", label: "JavaScript", code: jsCode },
  { key: "py", label: "Python", code: pyCode },
  { key: "php", label: "PHP", code: phpCode },
  { key: "dart", label: "Dart", code: dartCode },
  { key: "elixir", label: "Elixir", code: elixirCode },
  { key: "curl", label: "curl", code: curlCode },
] as const;

function CodeTabs() {
  const [active, setActive] = useState<string>("go");
  const current = sdkTabs.find((t) => t.key === active)!;

  return (
    <div className="bg-card border border-border overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-1">
        {sdkTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              active === tab.key
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre className="p-4 text-sm text-foreground/80 overflow-x-auto leading-relaxed bg-muted/30">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}

function ConnectorLine() {
  return (
    <svg
      className="hidden md:block absolute top-6 h-[2px] overflow-visible"
      style={{ left: "calc(100% / 6)", width: "calc(100% * 2 / 3)" }}
      preserveAspectRatio="none"
    >
      <motion.line
        x1="0"
        y1="1"
        x2="100%"
        y2="1"
        stroke="currentColor"
        className="text-border"
        strokeWidth={1}
        strokeDasharray="6 4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      />
    </svg>
  );
}

export default function Home() {
  const { auth } = usePage<SharedProps>().props;

  return (
    <>
      <Head title="Open-Source Feature Flags" />
      <PublicLayout>
        {/* Terminal Hero */}
      <section className="relative py-24 md:py-32 px-4 md:px-6 bg-background overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingShape
            delay={0.3}
            width={600}
            height={140}
            rotate={12}
            className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
          />
          <FloatingShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
          />
          <FloatingShape
            delay={0.4}
            width={300}
            height={80}
            rotate={-8}
            className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
          />
          <FloatingShape
            delay={0.6}
            width={200}
            height={60}
            rotate={20}
            className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
          />
          <FloatingShape
            delay={0.7}
            width={150}
            height={40}
            rotate={-25}
            className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <AnimateInView preset="fade-up" staggerChildren={0.1}>
            <AnimateChild>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs text-primary border border-primary/30 px-2 py-1">
                  [open_source]
                </span>
              </div>
            </AnimateChild>
            <AnimateChild>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-2">
                {">"} feature_flags
              </h1>
            </AnimateChild>
            <AnimateChild>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary mb-6">
                made_simple
              </h2>
            </AnimateChild>
            <AnimateChild>
              <p className="text-muted-foreground max-w-2xl mb-8 text-sm md:text-base">
                Self-hosted feature flag management with per-environment toggles,
                gradual rollouts, and SDKs for Go, JS/TS, Python, PHP, Dart, and
                Elixir — deploy with Docker in 60 seconds.
              </p>
            </AnimateChild>
            <AnimateChild>
              <div className="flex items-center gap-3 mb-12">
                <Link
                  href={auth?.user ? "/dashboard" : "https://github.com/felipekafuri/bandeira"}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {auth?.user ? "[go_to_dashboard]" : "[get_started]"}
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border px-5 py-2.5"
                >
                  [read_docs]
                </Link>
              </div>
            </AnimateChild>
            <AnimateChild>
              <FeatureFlagToggle />
            </AnimateChild>
          </AnimateInView>
        </div>
      </section>

      {/* Features Grid */}
      <AnimateInView
        as="section"
        preset="fade-up"
        staggerChildren={0.1}
        className="relative py-24 px-4 md:px-6 bg-background"
      >
        <div className="max-w-5xl mx-auto">
          <AnimateChild>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 tracking-tight text-foreground">
              // capabilities
            </h2>
          </AnimateChild>
          <AnimateChild>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto text-sm">
              Everything you need to ship with confidence
            </p>
          </AnimateChild>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <AnimateChild key={feature.title} className="h-full">
                <div className="h-full flex flex-col bg-card border border-border p-6 hover:border-primary/50 transition-colors">
                  <h3 className="font-semibold text-foreground mb-2">
                    {">"} {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  {feature.href && (
                    <Link
                      href={feature.href}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
                    >
                      [learn_more] <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </AnimateChild>
            ))}
          </div>
        </div>
      </AnimateInView>

      {/* Real-time Demos */}
      <AnimateInView
        as="section"
        preset="fade-up"
        staggerChildren={0.12}
        className="relative py-24 px-4 md:px-6 bg-background"
      >
        <div className="max-w-5xl mx-auto">
          <AnimateChild>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 tracking-tight text-foreground">
              // real_time_by_design
            </h2>
          </AnimateChild>
          <AnimateChild>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto text-sm">
              SDKs stream flag updates via SSE and evaluate locally — zero
              network latency, instant rollouts
            </p>
          </AnimateChild>
          <AnimateChild>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <SSEStreamDemo />
              <FlagEvaluationDemo />
              <div className="sm:col-span-2 lg:col-span-1">
                <LiveMetricsPulse />
              </div>
            </div>
          </AnimateChild>
        </div>
      </AnimateInView>

      {/* How It Works */}
      <AnimateInView
        as="section"
        preset="fade-up"
        staggerChildren={0.15}
        className="relative py-24 px-4 md:px-6 bg-background"
      >
        <div className="max-w-4xl mx-auto">
          <AnimateChild>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 tracking-tight text-foreground">
              // how_it_works
            </h2>
          </AnimateChild>
          <AnimateChild>
            <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto text-sm">
              Three steps from zero to feature flags in production
            </p>
          </AnimateChild>
          <AnimateChild>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
              <ConnectorLine />

              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + i * 0.2,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className="text-center relative"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 border border-primary/30 text-primary font-bold text-lg mb-4 relative z-10">
                    [{step.number}]
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {">"} {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </AnimateChild>
        </div>
      </AnimateInView>

      {/* Code Snippet */}
      <AnimateInView
        as="section"
        preset="fade-up"
        staggerChildren={0.1}
        className="relative py-24 px-4 md:px-6 bg-background"
      >
        <div className="max-w-5xl mx-auto">
          <AnimateChild>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 tracking-tight text-foreground">
              // integrate_in_minutes
            </h2>
          </AnimateChild>
          <AnimateChild>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto text-sm">
              Pick your language — all SDKs evaluate flags locally with zero network
              latency
            </p>
          </AnimateChild>
          <CodeTabs />
        </div>
      </AnimateInView>

      {/* Open Source CTA */}
      <AnimateInView
        as="section"
        preset="scale-up"
        duration={0.7}
        className="relative py-24 px-4 md:px-6 bg-background"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 tracking-tight text-foreground">
            // self_host_in_60_seconds
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
            Bandeira is open source and runs anywhere Docker does. No cloud
            account, no vendor lock-in.
          </p>
          <div className="bg-card border border-border p-4 mb-8 inline-block">
            <code className="text-sm text-foreground">
              $ docker compose up -d
            </code>
          </div>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://github.com/felipekafuri/bandeira"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Github className="w-4 h-4" />
              [github]
            </a>
            <Link
              href={auth?.user ? "/dashboard" : "https://github.com/felipekafuri/bandeira"}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {auth?.user ? "[dashboard]" : "[get_started]"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </AnimateInView>

      {/* Footer */}
      <AnimateInView
        as="footer"
        preset="fade"
        duration={0.5}
        viewportAmount={0.5}
        className="border-t border-border py-8 px-4 bg-background"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            // bandeira — open source feature flag management
          </p>
          <Link
            href="/brand"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            [brand]
          </Link>
        </div>
      </AnimateInView>
      </PublicLayout>
    </>
  );
}

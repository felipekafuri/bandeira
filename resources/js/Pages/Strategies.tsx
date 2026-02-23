import { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StrategyParams from "@/Pages/Projects/Flags/components/StrategyParams";
import {
  evaluateStrategy,
  type Strategy,
  type Constraint,
  type EvalContext,
  type EvalTrace,
} from "@/lib/evaluate";
import {
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Crosshair,
  Shield,
  ChevronDown,
  Users,
  Percent,
  Globe,
  ToggleRight,
  Zap,
  ExternalLink,
} from "lucide-react";

// ── Shared data ───────────────────────────────────────────────────────────

const STRATEGY_TYPES = [
  { value: "default", label: "Default (always on)" },
  { value: "gradualRollout", label: "Gradual Rollout" },
  { value: "userWithId", label: "User Targeting" },
  { value: "remoteAddress", label: "IP Filtering" },
];

const OPERATORS = [
  "IN",
  "NOT_IN",
  "STR_CONTAINS",
  "STR_STARTS_WITH",
  "STR_ENDS_WITH",
  "NUM_EQ",
  "NUM_GT",
  "NUM_GTE",
  "NUM_LT",
  "NUM_LTE",
  "DATE_AFTER",
  "DATE_BEFORE",
] as const;

// ── Preset examples ───────────────────────────────────────────────────────

interface Preset {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  strategy: { name: string; parameters: Record<string, any> };
  constraints: Constraint[];
  context: {
    userId: string;
    sessionId: string;
    remoteAddress: string;
    properties: { key: string; value: string }[];
  };
}

const PRESETS: Preset[] = [
  {
    label: "50% Rollout",
    description: "Half your users see the feature",
    icon: Percent,
    strategy: { name: "gradualRollout", parameters: { rollout: 50, stickiness: "userId", groupId: "" } },
    constraints: [],
    context: { userId: "42", sessionId: "", remoteAddress: "", properties: [] },
  },
  {
    label: "Target Users",
    description: "Only user 42 and 100 see it",
    icon: Users,
    strategy: { name: "userWithId", parameters: { userIds: "42\n100" } },
    constraints: [],
    context: { userId: "42", sessionId: "", remoteAddress: "", properties: [] },
  },
  {
    label: "IP Allow-list",
    description: "Only office IPs allowed",
    icon: Globe,
    strategy: { name: "remoteAddress", parameters: { ips: "10.0.0.1\n192.168.1." } },
    constraints: [],
    context: { userId: "", sessionId: "", remoteAddress: "192.168.1.55", properties: [] },
  },
  {
    label: "With Constraint",
    description: "Enterprise users in Brazil only",
    icon: Shield,
    strategy: { name: "default", parameters: {} },
    constraints: [
      { context_name: "plan", operator: "IN", values: ["enterprise", "pro"], inverted: false, case_insensitive: false },
      { context_name: "country", operator: "IN", values: ["BR"], inverted: false, case_insensitive: true },
    ],
    context: { userId: "", sessionId: "", remoteAddress: "", properties: [{ key: "plan", value: "enterprise" }, { key: "country", value: "BR" }] },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function SectionCard({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-card border border-border p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">
        // {title.toLowerCase().replace(/\s+/g, "_")}
      </h2>
      {children}
    </section>
  );
}

function emptyConstraint(): Constraint {
  return {
    context_name: "",
    operator: "IN",
    values: [],
    inverted: false,
    case_insensitive: false,
  };
}

// ── Evaluation Flow ───────────────────────────────────────────────────────

function EvaluationFlow() {
  const steps = [
    {
      label: "1. Is the flag enabled?",
      desc: "If the flag is toggled off in this environment, stop here — the flag is disabled.",
      yes: "Flag is on",
      no: "Disabled",
    },
    {
      label: "2. Does it have strategies?",
      desc: "If no strategies are configured, the flag is enabled for everyone.",
      yes: "Has strategies",
      no: "Enabled for all",
    },
    {
      label: "3. Check each strategy",
      desc: "For each strategy: first check all constraints (AND — every constraint must pass), then run the strategy logic (rollout %, user list, etc).",
    },
    {
      label: "4. Any strategy pass? (OR)",
      desc: "If at least one strategy evaluates to true, the flag is enabled. If all fail, it's disabled.",
    },
  ];

  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="relative">
          {/* Connector line */}
          {i > 0 && (
            <div className="flex justify-center -mt-px mb-0">
              <div className="flex flex-col items-center">
                <div className="w-px h-4 bg-border" />
                <ChevronDown className="w-4 h-4 text-muted-foreground -mt-1" />
              </div>
            </div>
          )}
          <div className="border border-border p-4 bg-muted/30">
            <p className="text-sm font-semibold text-foreground">{step.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
            {step.yes && (
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-3 h-3" /> {step.yes}
                </span>
                <span className="inline-flex items-center gap-1 text-red-500">
                  <XCircle className="w-3 h-3" /> {step.no}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-0">
        <div className="flex flex-col items-center">
          <div className="w-px h-4 bg-border" />
          <ChevronDown className="w-4 h-4 text-muted-foreground -mt-1" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 p-3 bg-green-500/10 border border-green-500/20 text-center">
          <p className="text-sm font-medium text-green-600">Enabled</p>
        </div>
        <div className="flex-1 p-3 bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-sm font-medium text-red-500">Disabled</p>
        </div>
      </div>

      <div className="mt-4 bg-muted p-3">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Key rule:</strong>{" "}
          Constraints within a strategy use{" "}
          <strong className="text-foreground">AND</strong> logic (all must
          pass). Multiple strategies on a flag use{" "}
          <strong className="text-foreground">OR</strong> logic (any one
          passing is enough).
        </p>
      </div>
    </div>
  );
}

// ── Strategy Type Cards ───────────────────────────────────────────────────

function StrategyDocs() {
  const strategies = [
    {
      name: "default",
      label: "Default",
      icon: ToggleRight,
      color: "text-blue-600 bg-blue-500/10",
      summary: "Always on — use as a simple on/off switch",
      example: "A flag with just a Default strategy is enabled for everyone when the flag is toggled on.",
      params: null,
    },
    {
      name: "gradualRollout",
      label: "Gradual Rollout",
      icon: Percent,
      color: "text-amber-600 bg-amber-500/10",
      summary: "Enable for a percentage of users with consistent hashing",
      example: "Set rollout to 25 — the same 25% of users always see the feature. Increase to 50, 75, 100 to ramp up.",
      params: [
        { name: "rollout", desc: "Percentage (0-100)" },
        { name: "stickiness", desc: "Which field to hash: userId, sessionId, or custom" },
        { name: "groupId", desc: "Optional — salt for independent rollout groups" },
      ],
      formula: "hash(stickinessValue + groupId) % 100 < rollout",
    },
    {
      name: "userWithId",
      label: "User Targeting",
      icon: Users,
      color: "text-violet-600 bg-violet-500/10",
      summary: "Enable only for specific user IDs",
      example: 'Set userIds to "42, 100" — only those users see the feature. Great for internal testing.',
      params: [
        { name: "userIds", desc: "Comma or newline separated list of user IDs" },
      ],
    },
    {
      name: "remoteAddress",
      label: "IP Filtering",
      icon: Globe,
      color: "text-emerald-600 bg-emerald-500/10",
      summary: "Enable for specific IP addresses or subnets",
      example: 'Set ips to "192.168.1." — matches any IP starting with that prefix (like a simple CIDR).',
      params: [
        { name: "ips", desc: "Comma or newline separated IPs or IP prefixes" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {strategies.map((s) => (
        <div
          key={s.name}
          className="border border-border overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border">
            <div className={`flex items-center justify-center w-8 h-8 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.name}</code>
              </div>
              <p className="text-xs text-muted-foreground">{s.summary}</p>
            </div>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="bg-primary/5 p-3 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Example:</strong> {s.example}
              </p>
            </div>
            {s.params && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Parameters</p>
                <div className="space-y-1">
                  {s.params.map((p) => (
                    <div key={p.name} className="flex items-baseline gap-2 text-xs">
                      <code className="bg-muted px-1.5 py-0.5 text-foreground font-medium shrink-0">{p.name}</code>
                      <span className="text-muted-foreground">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {"formula" in s && s.formula && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Formula</p>
                <pre className="bg-muted px-3 py-2 text-xs overflow-x-auto">
                  <code>{s.formula}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Constraints Reference ─────────────────────────────────────────────────

function ConstraintsReference() {
  const groups = [
    {
      category: "Set",
      desc: "Check if a value is in a list",
      operators: [
        { op: "IN", desc: "Value matches any item in the list", example: 'country IN ["US", "BR"]' },
        { op: "NOT_IN", desc: "Value does not match any item", example: 'plan NOT_IN ["free"]' },
      ],
    },
    {
      category: "String",
      desc: "Text pattern matching",
      operators: [
        { op: "STR_CONTAINS", desc: "Value contains the substring", example: 'email STR_CONTAINS "@acme.com"' },
        { op: "STR_STARTS_WITH", desc: "Value starts with prefix", example: 'domain STR_STARTS_WITH "app."' },
        { op: "STR_ENDS_WITH", desc: "Value ends with suffix", example: 'email STR_ENDS_WITH ".edu"' },
      ],
    },
    {
      category: "Numeric",
      desc: "Number comparisons",
      operators: [
        { op: "NUM_EQ", desc: "Equal to", example: "version NUM_EQ 2" },
        { op: "NUM_GT", desc: "Greater than", example: "age NUM_GT 18" },
        { op: "NUM_GTE", desc: "Greater than or equal", example: "score NUM_GTE 80" },
        { op: "NUM_LT", desc: "Less than", example: "retries NUM_LT 3" },
        { op: "NUM_LTE", desc: "Less than or equal", example: "load NUM_LTE 100" },
      ],
    },
    {
      category: "Date",
      desc: "Date/time comparisons (ISO 8601)",
      operators: [
        { op: "DATE_AFTER", desc: "Date is after target", example: 'created DATE_AFTER "2025-01-01"' },
        { op: "DATE_BEFORE", desc: "Date is before target", example: 'trial_end DATE_BEFORE "2025-12-31"' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.category}>
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-sm font-semibold text-foreground">{g.category}</h3>
            <span className="text-xs text-muted-foreground">{g.desc}</span>
          </div>
          <div className="border border-border divide-y divide-border overflow-hidden">
            {g.operators.map((o) => (
              <div key={o.op} className="flex items-start gap-3 px-3 py-2.5 text-xs">
                <code className="bg-muted px-1.5 py-0.5 text-foreground font-medium shrink-0 mt-px">{o.op}</code>
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground">{o.desc}</p>
                  <p className="text-muted-foreground/60 mt-0.5 font-mono text-[11px]">{o.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="border border-border p-4 bg-muted/30">
        <p className="text-sm font-medium text-foreground mb-2">Modifier flags</p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            <code className="bg-muted px-1.5 py-0.5 text-foreground font-medium">inverted</code>{" "}
            — Flips the result. Example: <code className="text-foreground">IN</code> + inverted = "NOT in the list" without using <code className="text-foreground">NOT_IN</code>.
          </p>
          <p>
            <code className="bg-muted px-1.5 py-0.5 text-foreground font-medium">case_insensitive</code>{" "}
            — Lowercases both sides before comparing. Works with Set and String operators. Example: <code className="text-foreground">"brazil"</code> matches <code className="text-foreground">"Brazil"</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Interactive Playground ────────────────────────────────────────────────

function Playground() {
  const [activePreset, setActivePreset] = useState<string | null>("50% Rollout");
  const [strategyName, setStrategyName] = useState("gradualRollout");
  const [parameters, setParameters] = useState<Record<string, any>>({ rollout: 50, stickiness: "userId", groupId: "" });
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [userId, setUserId] = useState("42");
  const [sessionId, setSessionId] = useState("");
  const [remoteAddress, setRemoteAddress] = useState("");
  const [properties, setProperties] = useState<{ key: string; value: string }[]>([]);

  const ctx: EvalContext = useMemo(
    () => ({
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      remoteAddress: remoteAddress || undefined,
      properties: properties.reduce(
        (acc, p) => {
          if (p.key) acc[p.key] = p.value;
          return acc;
        },
        {} as Record<string, string>,
      ),
    }),
    [userId, sessionId, remoteAddress, properties],
  );

  const strategy: Strategy = useMemo(
    () => ({ name: strategyName, parameters, constraints }),
    [strategyName, parameters, constraints],
  );

  const trace: EvalTrace = useMemo(
    () => evaluateStrategy(strategy, ctx),
    [strategy, ctx],
  );

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.label);
    setStrategyName(preset.strategy.name);
    setParameters({ ...preset.strategy.parameters });
    setConstraints(preset.constraints.map((c) => ({ ...c, values: [...c.values] })));
    setUserId(preset.context.userId);
    setSessionId(preset.context.sessionId);
    setRemoteAddress(preset.context.remoteAddress);
    setProperties(preset.context.properties.map((p) => ({ ...p })));
  };

  // Clear active preset when user manually changes anything
  const clearPreset = () => setActivePreset(null);

  const updateConstraint = (index: number, c: Constraint) => {
    setConstraints((prev) => prev.map((item, i) => (i === index ? c : item)));
  };

  const removeConstraint = (index: number) => {
    setConstraints((prev) => prev.filter((_, i) => i !== index));
  };

  const addProperty = () => {
    setProperties((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateProperty = (index: number, field: "key" | "value", val: string) => {
    setProperties((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: val } : p)),
    );
  };

  const removeProperty = (index: number) => {
    setProperties((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStrategyChange = (name: string) => {
    clearPreset();
    setStrategyName(name);
    setParameters({});
  };

  const handleParamsChange = (params: Record<string, any>) => {
    clearPreset();
    setParameters(params);
  };

  return (
    <div className="space-y-6">
      {/* Preset buttons */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Try an example:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const isActive = activePreset === preset.label;
            return (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`inline-flex items-center gap-2 px-3 py-2 border transition-all text-left group ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:bg-muted hover:border-primary/30"
                }`}
              >
                <preset.icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                }`} />
                <div>
                  <p className={`text-xs font-medium ${isActive ? "text-primary" : "text-foreground"}`}>{preset.label}</p>
                  <p className="text-[11px] text-muted-foreground">{preset.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result banner — always visible */}
      <div
        className={`p-4 flex items-center gap-3 transition-colors border ${
          trace.finalResult
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}
      >
        <div>
          <p className={`text-sm font-bold ${trace.finalResult ? "text-green-600" : "text-red-600"}`}>
            {trace.finalResult ? "[ENABLED]" : "[DISABLED]"}
          </p>
          <p className="text-xs text-muted-foreground">
            {trace.strategyReason}
          </p>
        </div>
      </div>

      {/* Two-column: Config + Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Configuration (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Strategy */}
          <div className="border border-border p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-primary" />
              Strategy
            </h3>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={strategyName} onValueChange={handleStrategyChange}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <StrategyParams
              strategyName={strategyName}
              parameters={parameters}
              onChange={handleParamsChange}
            />
          </div>

          {/* Context */}
          <div className="border border-border p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Context
              <span className="text-xs font-normal text-muted-foreground">— the user/request data sent to the SDK</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">User ID</Label>
                <Input
                  placeholder="e.g. 42"
                  value={userId}
                  onChange={(e) => { clearPreset(); setUserId(e.target.value); }}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Session ID</Label>
                <Input
                  placeholder="e.g. sess_abc"
                  value={sessionId}
                  onChange={(e) => { clearPreset(); setSessionId(e.target.value); }}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Remote Address</Label>
                <Input
                  placeholder="e.g. 192.168.1.100"
                  value={remoteAddress}
                  onChange={(e) => { clearPreset(); setRemoteAddress(e.target.value); }}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Custom Properties</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addProperty}
                  type="button"
                  className="h-7 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </div>
              {properties.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No custom properties. Add key-value pairs used by constraints (e.g. plan=enterprise, country=BR).
                </p>
              )}
              {properties.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Key"
                    value={p.key}
                    onChange={(e) => updateProperty(i, "key", e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <span className="text-muted-foreground text-xs">=</span>
                  <Input
                    placeholder="Value"
                    value={p.value}
                    onChange={(e) => updateProperty(i, "value", e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeProperty(i)}
                    type="button"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Constraints
                <span className="text-xs font-normal text-muted-foreground">— all must pass (AND)</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConstraints((prev) => [...prev, emptyConstraint()])}
                type="button"
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
            </div>
            {constraints.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No constraints — the strategy applies to everyone. Add a constraint to narrow the audience.
              </p>
            )}
            {constraints.map((c, i) => (
              <div
                key={i}
                className="border border-border p-3 space-y-3 bg-muted/30"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Context field (e.g. country, plan, userId)"
                      value={c.context_name}
                      onChange={(e) =>
                        updateConstraint(i, { ...c, context_name: e.target.value })
                      }
                      className="h-9 text-sm"
                    />
                    <Select
                      value={c.operator}
                      onValueChange={(v) => updateConstraint(i, { ...c, operator: v })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op} value={op}>
                            {op.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Values (comma-separated)"
                      value={c.values.join(", ")}
                      onChange={(e) =>
                        updateConstraint(i, {
                          ...c,
                          values: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                        })
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeConstraint(i)}
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={c.inverted}
                      onCheckedChange={(checked) =>
                        updateConstraint(i, { ...c, inverted: checked === true })
                      }
                    />
                    Inverted
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={c.case_insensitive}
                      onCheckedChange={(checked) =>
                        updateConstraint(i, { ...c, case_insensitive: checked === true })
                      }
                    />
                    Case insensitive
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Evaluation trace (2 cols) */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Evaluation Trace
            </h3>
            <p className="text-xs text-muted-foreground">
              Step-by-step breakdown of how the SDK evaluates this strategy with the given context.
            </p>

            <div className="space-y-2">
              {/* Constraint steps */}
              {trace.constraints.length > 0 && (
                <>
                  <p className="text-xs font-medium text-foreground mt-2">
                    Constraints — all must pass:
                  </p>
                  {trace.constraints.map((cr, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 text-xs p-3 rounded-lg border ${
                        cr.passed
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-red-500/5 border-red-500/20"
                      }`}
                    >
                      {cr.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {cr.constraint.context_name || "(empty)"}{" "}
                          {cr.constraint.inverted ? "NOT " : ""}
                          {cr.constraint.operator}{" "}
                          [{cr.constraint.values.join(", ")}]
                        </p>
                        <p className="text-muted-foreground mt-0.5">{cr.reason}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Strategy step */}
              <p className="text-xs font-medium text-foreground mt-2">
                Strategy logic:
              </p>
              <div
                className={`flex items-start gap-2 text-xs p-3 rounded-lg border ${
                  trace.strategyResult
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                {trace.strategyResult ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {STRATEGY_TYPES.find((t) => t.value === strategyName)?.label ?? strategyName}
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    {trace.strategyReason}
                  </p>
                </div>
              </div>

              {/* Final result */}
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex items-center gap-2">
                  {trace.finalResult ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <p className={`text-sm font-semibold ${trace.finalResult ? "text-green-600" : "text-red-600"}`}>
                    Final: {trace.finalResult ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function Strategies() {
  return (
    <>
      <Head title="Strategies" />
      <PublicLayout activePage="strategies">
        <div className="pt-8 pb-16 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {">"} strategies
            </h1>
            <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
              # how strategies work
            </p>

            {/* Quick nav */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { label: "playground", href: "#playground" },
                { label: "evaluation_flow", href: "#flow" },
                { label: "strategy_types", href: "#types" },
                { label: "constraints", href: "#constraints" },
                { label: "go_sdk", href: "#sdk" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  [{link.label}]
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Playground FIRST — let users play immediately */}
            <SectionCard id="playground" title="Interactive Playground">
              <p className="text-sm text-muted-foreground mb-4">
                Pick an example below or build your own — the result updates live as you change any value.
              </p>
              <Playground />
            </SectionCard>

            {/* Evaluation Flow */}
            <SectionCard id="flow" title="Evaluation Flow">
              <p className="text-sm text-muted-foreground mb-4">
                When your app calls <code className="bg-muted px-1.5 py-0.5 text-foreground text-xs">client.IsEnabled("flag-name", context)</code>,
                the SDK runs through these steps:
              </p>
              <EvaluationFlow />
            </SectionCard>

            {/* Strategy Types */}
            <SectionCard id="types" title="Strategy Types">
              <p className="text-sm text-muted-foreground mb-4">
                Each strategy answers: <em>"Should this flag be on for this user?"</em>
              </p>
              <StrategyDocs />
            </SectionCard>

            {/* Constraints */}
            <SectionCard id="constraints" title="Constraints Reference">
              <p className="text-sm text-muted-foreground mb-4">
                Constraints are filters that run <em>before</em> the strategy logic.
                All constraints must pass (AND) for the strategy to be evaluated.
              </p>
              <ConstraintsReference />
            </SectionCard>

            {/* Go SDK */}
            <SectionCard id="sdk" title="Using Strategies in the Go SDK">
              <p className="text-sm text-muted-foreground mb-4">
                The Go SDK evaluates strategies locally — your app polls the server for flag definitions, then all{" "}
                <code className="bg-muted px-1.5 py-0.5 text-foreground text-xs">IsEnabled</code> checks
                run in-memory with zero network latency.
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Install</p>
                  <pre className="bg-muted px-4 py-3 text-sm overflow-x-auto">
                    <code>go get github.com/felipekafuri/bandeira-sdks/go</code>
                  </pre>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Simple check</p>
                  <pre className="bg-muted px-4 py-3 text-sm overflow-x-auto leading-relaxed">
                    <code>{`client, _ := bandeira.New(bandeira.Config{
    URL:   "http://localhost:8080",
    Token: "your-client-token",
})
defer client.Close()

if client.IsEnabled("new-checkout") {
    // flag is on — default strategy or no strategies
}`}</code>
                  </pre>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground mb-2">With context for strategy evaluation</p>
                  <pre className="bg-muted px-4 py-3 text-sm overflow-x-auto leading-relaxed">
                    <code>{`if client.IsEnabled("premium-feature", bandeira.Context{
    UserID:    "42",
    SessionID: "sess_abc",
    RemoteAddress: "192.168.1.55",
    Properties: map[string]string{
        "plan":    "enterprise",
        "country": "BR",
    },
}) {
    // strategies evaluate against this context:
    // - gradualRollout hashes UserID (or SessionID)
    // - userWithId checks UserID against the list
    // - remoteAddress matches RemoteAddress
    // - constraints check any field including Properties
}`}</code>
                  </pre>
                </div>

                <div className="bg-primary/5 p-4 border border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">How it connects:</strong>{" "}
                    The context fields you tested in the playground above (<code className="bg-muted px-1 py-0.5 text-foreground text-xs">userId</code>,{" "}
                    <code className="bg-muted px-1 py-0.5 text-foreground text-xs">sessionId</code>,{" "}
                    <code className="bg-muted px-1 py-0.5 text-foreground text-xs">remoteAddress</code>,{" "}
                    and custom properties) map directly to the{" "}
                    <code className="bg-muted px-1 py-0.5 text-foreground text-xs">bandeira.Context</code> struct in Go.
                    The SDK runs the exact same evaluation logic.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/felipekafuri/bandeira-sdks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Go SDK on GitHub
                  </a>
                  <a
                    href="/docs"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    Full API Docs
                  </a>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

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

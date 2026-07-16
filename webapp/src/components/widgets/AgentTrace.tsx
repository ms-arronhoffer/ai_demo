"use client";

import { useState } from "react";

/**
 * Agent Trace Visualizer.
 *
 * An animated, clickable timeline of a single agent run against the fictional
 * TaskFlow app. Each step is a node in the reason → act → observe loop with
 * token, latency, and cost metrics. Selecting a node reveals the raw prompt /
 * tool payload for that step. This widget is intentionally *pre-recorded* (no
 * backend) so the visualisation is deterministic and always available — the
 * live, LLM-driven experience lives in the Live Agent Playground.
 */

type StepKind = "reason" | "tool" | "observe" | "answer";

interface TraceStep {
  id: string;
  kind: StepKind;
  title: string;
  detail: string;
  raw: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
}

const GOAL = "Which tasks are blocked, and who owns them?";

const STEPS: TraceStep[] = [
  {
    id: "s1",
    kind: "reason",
    title: "Plan the approach",
    detail:
      "The model reads the goal and decides it needs live task data before it can answer.",
    raw: `system: You are the TaskFlow assistant. You can call tools.
user: Which tasks are blocked, and who owns them?

assistant (thought): I don't have the task list in context. I should call
query_tasks with a status filter of "blocked" and then summarise the owners.`,
    tokensIn: 412,
    tokensOut: 38,
    latencyMs: 640,
  },
  {
    id: "s2",
    kind: "tool",
    title: "Call query_tasks",
    detail: "The model emits a structured tool call with a status filter.",
    raw: `assistant (tool_call): query_tasks({
  "status": "blocked",
  "fields": ["id", "title", "owner", "blocked_reason"]
})`,
    tokensIn: 0,
    tokensOut: 29,
    latencyMs: 120,
  },
  {
    id: "s3",
    kind: "observe",
    title: "Observe tool result",
    detail: "Your code runs the query and returns rows the model can read.",
    raw: `tool_result: [
  { "id": "TF-482", "title": "Billing export", "owner": "Priya",  "blocked_reason": "waiting on finance API key" },
  { "id": "TF-491", "title": "SSO rollout",    "owner": "Marco",  "blocked_reason": "pending security review" },
  { "id": "TF-503", "title": "Mobile deep links", "owner": "Priya", "blocked_reason": "needs design sign-off" }
]`,
    tokensIn: 156,
    tokensOut: 0,
    latencyMs: 210,
  },
  {
    id: "s4",
    kind: "answer",
    title: "Compose grounded answer",
    detail:
      "With real rows in context, the model writes a concise, grounded reply.",
    raw: `assistant: 3 tasks are blocked:
• TF-482 Billing export — Priya (waiting on finance API key)
• TF-491 SSO rollout — Marco (pending security review)
• TF-503 Mobile deep links — Priya (needs design sign-off)

Priya owns two of the three blockers.`,
    tokensIn: 198,
    tokensOut: 96,
    latencyMs: 880,
  },
];

// Blended $/1K token price used purely to illustrate per-step cost.
const PRICE_PER_1K = 0.01;

const KIND_META: Record<
  StepKind,
  { label: string; dot: string; badge: string }
> = {
  reason: {
    label: "Reason",
    dot: "bg-navy",
    badge: "bg-navy/5 text-navy ring-navy/10",
  },
  tool: {
    label: "Tool call",
    dot: "bg-gold",
    badge: "bg-gold/10 text-gold ring-gold/20",
  },
  observe: {
    label: "Observe",
    dot: "bg-navy-light",
    badge: "bg-navy-light/10 text-navy-light ring-navy-light/20",
  },
  answer: {
    label: "Answer",
    dot: "bg-green-600",
    badge: "bg-green-50 text-green-700 ring-green-200",
  },
};

function stepCost(s: TraceStep): number {
  return ((s.tokensIn + s.tokensOut) / 1000) * PRICE_PER_1K;
}

export default function AgentTrace() {
  const [selected, setSelected] = useState<string>(STEPS[0].id);
  const active = STEPS.find((s) => s.id === selected) ?? STEPS[0];

  const totalTokens = STEPS.reduce((n, s) => n + s.tokensIn + s.tokensOut, 0);
  const totalLatency = STEPS.reduce((n, s) => n + s.latencyMs, 0);
  const totalCost = STEPS.reduce((n, s) => n + stepCost(s), 0);

  return (
    <div className="rounded-xl border border-cream-dark bg-white shadow-sm overflow-hidden">
      {/* Goal bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cream-dark bg-cream-dark/40 px-4 py-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-mid">
          Agent goal
        </span>
        <span className="text-sm font-medium text-navy">{GOAL}</span>
      </div>

      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Timeline */}
        <ol className="relative space-y-1 p-4">
          <span
            aria-hidden
            className="absolute left-[26px] top-6 bottom-6 w-px bg-cream-dark"
          />
          {STEPS.map((s, i) => {
            const meta = KIND_META[s.kind];
            const isActive = s.id === selected;
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  onClick={() => setSelected(s.id)}
                  aria-pressed={isActive}
                  className={`group flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                    isActive
                      ? "border-navy/25 bg-cream-dark/40 shadow-sm"
                      : "border-transparent hover:border-cream-dark hover:bg-cream-dark/20"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-4 ring-white ${meta.dot}`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                      <span className="truncate text-sm font-medium text-navy">
                        {s.title}
                      </span>
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-slate-mid">
                      <span>{s.tokensIn + s.tokensOut} tok</span>
                      <span>{s.latencyMs} ms</span>
                      <span>${stepCost(s).toFixed(4)}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Detail panel */}
        <div className="border-t border-cream-dark bg-navy p-4 md:border-l md:border-t-0">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${KIND_META[active.kind].badge}`}
            >
              {KIND_META[active.kind].label}
            </span>
            <span className="text-[10px] font-mono text-white/40">
              raw step payload
            </span>
          </div>
          <p className="mb-3 text-sm text-white/70">{active.detail}</p>
          <pre className="max-h-64 overflow-auto rounded-lg bg-black/30 p-3 text-[11px] leading-relaxed text-white/90 font-mono whitespace-pre-wrap ring-1 ring-white/10">
            <code>{active.raw}</code>
          </pre>
        </div>
      </div>

      {/* Totals */}
      <dl className="grid grid-cols-3 divide-x divide-cream-dark border-t border-cream-dark">
        {[
          { label: "Total tokens", value: totalTokens.toLocaleString() },
          {
            label: "End-to-end",
            value: `${(totalLatency / 1000).toFixed(1)} s`,
          },
          { label: "Run cost", value: `$${totalCost.toFixed(4)}` },
        ].map((m) => (
          <div key={m.label} className="px-4 py-3 text-center">
            <dt className="text-[10px] uppercase tracking-widest text-slate-mid">
              {m.label}
            </dt>
            <dd className="mt-0.5 font-serif text-lg font-semibold text-navy">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

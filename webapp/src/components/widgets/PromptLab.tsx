"use client";

import { useState } from "react";
import { useTypewriter } from "./useWidgetMotion";

/**
 * Prompt Engineering Lab.
 *
 * Pick a system-prompt strategy and watch the same user request produce a very
 * different response — typed out live — alongside a small scorecard that makes
 * the quality trade-offs (length, whether the blocker / owner / ETA survive)
 * concrete. The outputs are deterministic, curated examples (no backend) so the
 * contrast between strategies is always clear and available.
 */

interface Strategy {
  key: string;
  label: string;
  system: string;
  output: string;
  note: string;
  /** Qualitative scorecard used to contrast strategies at a glance. */
  scores: { blocker: boolean; owner: boolean; eta: boolean; concise: boolean };
}

const USER_REQUEST =
  "Summarise this task thread into a status update:\n\n" +
  "> Priya: billing export still failing\n" +
  "> Marco: it's the missing finance API key\n" +
  "> Priya: raised a ticket with finance, ETA tomorrow";

const STRATEGIES: Strategy[] = [
  {
    key: "zero",
    label: "Zero-shot",
    system: "You are a helpful assistant.",
    output:
      "The billing export is currently failing. The team discussed it and found the cause. Priya has taken an action and expects it resolved soon.",
    note: "Vague and wordy — no constraints on length, tone, or specifics.",
    scores: { blocker: false, owner: true, eta: false, concise: false },
  },
  {
    key: "constrained",
    label: "Constrained",
    system:
      "You write status updates. Rules: under 40 words, neutral tone, name the blocker, name the owner, include the ETA.",
    output:
      "Billing export is blocked by a missing finance API key (owner: Priya). A ticket is open with finance; ETA tomorrow.",
    note: "Tight and useful — explicit constraints shape a professional result.",
    scores: { blocker: true, owner: true, eta: true, concise: true },
  },
  {
    key: "fewshot",
    label: "Few-shot",
    system:
      "You write status updates in this exact style:\n" +
      "Example → \"⛔ SSO rollout — blocked on security review (Marco). ETA Thu.\"",
    output:
      "⛔ Billing export — blocked on missing finance API key (Priya). Ticket open with finance, ETA tomorrow.",
    note: "Matches the demonstrated format — few-shot examples transfer style precisely.",
    scores: { blocker: true, owner: true, eta: true, concise: true },
  },
  {
    key: "cot",
    label: "Chain-of-thought",
    system:
      "First list the facts (blocker, owner, ETA) as bullets, then write a one-line status update.",
    output:
      "Facts:\n• Blocker: missing finance API key\n• Owner: Priya\n• ETA: tomorrow\n\nStatus: Billing export blocked on a missing finance API key (Priya); ticket open, ETA tomorrow.",
    note: "Reasoning first improves accuracy on multi-step extraction.",
    scores: { blocker: true, owner: true, eta: true, concise: false },
  },
];

const SCORE_LABELS: Array<{ key: keyof Strategy["scores"]; label: string }> = [
  { key: "blocker", label: "Names blocker" },
  { key: "owner", label: "Names owner" },
  { key: "eta", label: "Includes ETA" },
  { key: "concise", label: "Concise" },
];

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export default function PromptLab() {
  const [key, setKey] = useState(STRATEGIES[1].key);
  const active = STRATEGIES.find((s) => s.key === key) ?? STRATEGIES[0];
  const typed = useTypewriter(active.output, true, 12);
  const passed = SCORE_LABELS.filter((s) => active.scores[s.key]).length;

  return (
    <div className="rounded-xl border border-cream-dark bg-white shadow-sm overflow-hidden">
      {/* Strategy tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-cream-dark bg-cream-dark/40 p-3">
        {STRATEGIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setKey(s.key)}
            aria-pressed={s.key === key}
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
              s.key === key
                ? "bg-navy text-white ring-navy/20"
                : "bg-white text-slate-mid ring-cream-dark hover:text-navy"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        {/* Prompt column */}
        <div className="space-y-3 border-b border-cream-dark p-4 md:border-b-0 md:border-r">
          <div>
            <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-slate-mid">
              System prompt
            </p>
            <pre className="whitespace-pre-wrap rounded-lg border border-navy/15 bg-navy/[0.03] p-3 text-xs leading-relaxed text-navy/80">
              {active.system}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-slate-mid">
              User request
            </p>
            <pre className="whitespace-pre-wrap rounded-lg border border-cream-dark bg-white p-3 text-xs leading-relaxed text-charcoal/80">
              {USER_REQUEST}
            </pre>
          </div>
        </div>

        {/* Output column */}
        <div className="flex flex-col bg-navy p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Model output
            </p>
            <span className="font-mono text-[10px] text-white/40">
              {wordCount(active.output)} words
            </span>
          </div>
          <pre className="mb-3 min-h-[92px] whitespace-pre-wrap rounded-lg border border-gold/30 bg-white/5 p-3 text-sm leading-relaxed text-white/90">
            {typed.shown}
            {!typed.done && (
              <span className="ml-0.5 inline-block h-4 w-1.5 -translate-y-px animate-pulse bg-gold align-middle" />
            )}
          </pre>

          {/* Quality scorecard */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                Quality scorecard
              </p>
              <span className="font-mono text-[10px] text-gold">
                {passed}/{SCORE_LABELS.length}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-1.5">
              {SCORE_LABELS.map((s) => {
                const ok = active.scores[s.key];
                return (
                  <li
                    key={s.key}
                    className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] ring-1 transition-colors ${
                      ok
                        ? "bg-green-500/10 text-green-300 ring-green-400/20"
                        : "bg-white/5 text-white/40 ring-white/10"
                    }`}
                  >
                    <span aria-hidden>{ok ? "✓" : "—"}</span>
                    {s.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mt-auto text-xs leading-relaxed text-white/60">
            <span className="font-semibold text-gold">Why: </span>
            {active.note}
          </p>
        </div>
      </div>
    </div>
  );
}

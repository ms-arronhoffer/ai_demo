"use client";

import { useState } from "react";

/**
 * Prompt Engineering Lab.
 *
 * Pick a system-prompt strategy and see how the same user request produces a
 * very different response. The outputs are deterministic, curated examples (no
 * backend) so the contrast between strategies is clear and always available.
 */

interface Strategy {
  key: string;
  label: string;
  system: string;
  output: string;
  note: string;
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
  },
  {
    key: "constrained",
    label: "Constrained",
    system:
      "You write status updates. Rules: under 40 words, neutral tone, name the blocker, name the owner, include the ETA.",
    output:
      "Billing export is blocked by a missing finance API key (owner: Priya). A ticket is open with finance; ETA tomorrow.",
    note: "Tight and useful — explicit constraints shape a professional result.",
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
  },
  {
    key: "cot",
    label: "Chain-of-thought",
    system:
      "First list the facts (blocker, owner, ETA) as bullets, then write a one-line status update.",
    output:
      "Facts:\n• Blocker: missing finance API key\n• Owner: Priya\n• ETA: tomorrow\n\nStatus: Billing export blocked on a missing finance API key (Priya); ticket open, ETA tomorrow.",
    note: "Reasoning first improves accuracy on multi-step extraction.",
  },
];

export default function PromptLab() {
  const [key, setKey] = useState(STRATEGIES[1].key);
  const active = STRATEGIES.find((s) => s.key === key) ?? STRATEGIES[0];

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
        <div className="bg-navy p-4">
          <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
            Model output
          </p>
          <pre className="mb-3 whitespace-pre-wrap rounded-lg border border-gold/30 bg-white/5 p-3 text-sm leading-relaxed text-white/90">
            {active.output}
          </pre>
          <p className="text-xs leading-relaxed text-white/60">
            <span className="font-semibold text-gold">Why: </span>
            {active.note}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

/**
 * RAG Explorer.
 *
 * A deterministic illustration of a retrieval-augmented generation pipeline
 * over a small TaskFlow knowledge base. Ask one of the sample questions, adjust
 * top-k, and watch which chunks are retrieved and how the grounded answer is
 * assembled with citations. Retrieval here is a transparent keyword-overlap
 * score (not a real embedding model) so the demo is self-contained and always
 * available; the live, Azure-backed experience lives in the Live Agent
 * Playground.
 */

interface Chunk {
  id: string;
  source: string;
  text: string;
}

const KNOWLEDGE_BASE: Chunk[] = [
  {
    id: "runbook#oncall",
    source: "runbook.md · On-call",
    text: "On-call escalation: page the primary on-call engineer first. If unacknowledged for 10 minutes, escalate to the secondary, then to the engineering manager.",
  },
  {
    id: "runbook#rotation",
    source: "runbook.md · Rotation",
    text: "The on-call rotation is weekly, handed over every Monday at 10:00. The current rotation is Priya, then Marco, then Dana.",
  },
  {
    id: "sla#uptime",
    source: "sla.md · Uptime",
    text: "TaskFlow targets 99.9% monthly uptime. Any incident breaching this must have a public post-incident review within 3 business days.",
  },
  {
    id: "security#access",
    source: "security.md · Access",
    text: "Production access requires SSO and an approved just-in-time elevation. Standing admin credentials are prohibited.",
  },
  {
    id: "billing#exports",
    source: "billing.md · Exports",
    text: "Billing exports run nightly and require a finance API key stored in Key Vault. A missing key blocks the export job.",
  },
  {
    id: "onboarding#setup",
    source: "onboarding.md · Setup",
    text: "New engineers get repo access on day one and shadow the on-call rotation before joining it in week three.",
  },
];

interface Question {
  q: string;
  answer: (cites: string[]) => string;
}

const QUESTIONS: Question[] = [
  {
    q: "What's our on-call escalation policy?",
    answer: (c) =>
      `Page the primary on-call engineer first; if it's unacknowledged for 10 minutes, escalate to the secondary and then the engineering manager [${c[0]}].`,
  },
  {
    q: "Who is on call this week?",
    answer: (c) =>
      `The rotation is weekly and hands over Mondays at 10:00 — the order is Priya, then Marco, then Dana [${c[0]}].`,
  },
  {
    q: "Why might the billing export fail?",
    answer: (c) =>
      `Billing exports run nightly and need a finance API key from Key Vault; a missing key blocks the job [${c[0]}].`,
  },
];

const STOP = new Set([
  "the", "a", "an", "our", "is", "are", "who", "what", "why", "on", "our",
  "this", "week", "might", "policy", "of", "to", "and", "for", "in",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
}

function score(query: string, chunk: Chunk): number {
  const q = new Set(tokenize(query));
  const words = tokenize(chunk.text + " " + chunk.source);
  let hits = 0;
  for (const w of words) if (q.has(w)) hits++;
  return hits;
}

export default function RagExplorer() {
  const [qIndex, setQIndex] = useState(0);
  const [topK, setTopK] = useState(2);

  const question = QUESTIONS[qIndex];

  const ranked = useMemo(() => {
    return KNOWLEDGE_BASE.map((c) => ({ chunk: c, s: score(question.q, c) }))
      .sort((a, b) => b.s - a.s);
  }, [question]);

  const retrieved = ranked.slice(0, topK).filter((r) => r.s > 0);
  const citations = retrieved.map((r) => r.chunk.source.split(" · ")[0]);
  const answer =
    retrieved.length > 0
      ? question.answer(citations.length ? citations : ["knowledge base"])
      : "No relevant context was retrieved — the model would either refuse or answer from general knowledge (ungrounded).";

  return (
    <div className="rounded-xl border border-cream-dark bg-white shadow-sm overflow-hidden">
      {/* Controls */}
      <div className="border-b border-cream-dark bg-cream-dark/40 p-4">
        <div className="flex flex-wrap gap-1.5">
          {QUESTIONS.map((qq, i) => (
            <button
              key={qq.q}
              type="button"
              onClick={() => setQIndex(i)}
              aria-pressed={i === qIndex}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
                i === qIndex
                  ? "bg-navy text-white ring-navy/20"
                  : "bg-white text-slate-mid ring-cream-dark hover:text-navy"
              }`}
            >
              {qq.q}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-3 text-xs text-slate-mid">
          <span className="font-mono uppercase tracking-widest">top-k</span>
          <input
            type="range"
            min={1}
            max={5}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="flex-1 accent-navy"
          />
          <span className="w-6 text-center font-semibold text-navy">{topK}</span>
        </label>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        {/* Retrieval */}
        <div className="border-b border-cream-dark p-4 md:border-b-0 md:border-r">
          <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-mid">
            Vector search · ranked chunks
          </p>
          <ol className="space-y-2">
            {ranked.map((r, i) => {
              const isRetrieved = i < topK && r.s > 0;
              return (
                <li
                  key={r.chunk.id}
                  className={`rounded-lg border p-3 text-xs transition-all ${
                    isRetrieved
                      ? "border-gold/50 bg-gold/5 shadow-sm"
                      : "border-cream-dark bg-white opacity-60"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-navy">
                      {r.chunk.source}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                        isRetrieved
                          ? "bg-gold/15 text-gold"
                          : "bg-cream-dark text-slate-mid"
                      }`}
                    >
                      score {r.s}
                    </span>
                  </div>
                  <p className="leading-relaxed text-charcoal/80">
                    {r.chunk.text}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Generation */}
        <div className="bg-navy p-4">
          <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-white/40">
            Augmented prompt → grounded answer
          </p>
          <div className="mb-3 rounded-lg bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/80 ring-1 ring-white/10">
            <span className="text-white/40">system:</span> Answer only from the
            context below. Cite sources.
            {"\n"}
            <span className="text-white/40">context:</span>{" "}
            {retrieved.length > 0
              ? retrieved.map((r) => r.chunk.source.split(" · ")[0]).join(", ")
              : "(none)"}
            {"\n"}
            <span className="text-white/40">user:</span> {question.q}
          </div>
          <div className="rounded-lg border border-gold/30 bg-white/5 p-3">
            <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-gold">
              Answer
            </p>
            <p className="text-sm leading-relaxed text-white/90">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

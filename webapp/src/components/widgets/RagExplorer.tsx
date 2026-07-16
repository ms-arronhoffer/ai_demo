"use client";

import { Fragment, useMemo, useState } from "react";
import { useTypewriter } from "./useWidgetMotion";

/**
 * RAG Explorer.
 *
 * An interactive illustration of a retrieval-augmented generation pipeline over
 * a small TaskFlow knowledge base. Type any question (or pick a sample), tune
 * top-k, and watch which chunks are retrieved — with animated relevance bars
 * and the matched query terms highlighted in-line — before the grounded answer
 * types itself out with citations.
 *
 * Retrieval here is a transparent keyword-overlap score (not a real embedding
 * model) so the demo is self-contained and always available; the live,
 * Azure-backed experience lives in the Live Agent Playground.
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
  "this", "week", "might", "policy", "of", "to", "and", "for", "in", "how",
  "do", "does", "we", "i", "my", "when", "where", "which", "can", "should",
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

/** Renders chunk text with query terms highlighted. */
function Highlighted({ text, terms }: { text: string; terms: Set<string> }) {
  if (terms.size === 0) return <>{text}</>;
  const parts = text.split(/(\b)/);
  return (
    <>
      {parts.map((part, i) =>
        terms.has(part.toLowerCase()) ? (
          <mark
            key={i}
            className="rounded bg-gold/25 px-0.5 text-charcoal"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Builds a grounded answer for an arbitrary (non-preset) query. */
function extractiveAnswer(retrieved: Chunk[]): string {
  if (retrieved.length === 0) return "";
  const top = retrieved[0];
  const firstSentence = top.text.split(/(?<=[.!?])\s/)[0];
  const cite = top.source.split(" · ")[0];
  return `${firstSentence} [${cite}]`;
}

export default function RagExplorer() {
  const [query, setQuery] = useState(QUESTIONS[0].q);
  const [submitted, setSubmitted] = useState(QUESTIONS[0].q);
  const [topK, setTopK] = useState(2);

  const preset = QUESTIONS.find((qq) => qq.q === submitted);

  const ranked = useMemo(() => {
    return KNOWLEDGE_BASE.map((c) => ({ chunk: c, s: score(submitted, c) }))
      .sort((a, b) => b.s - a.s);
  }, [submitted]);

  const maxScore = ranked[0]?.s ?? 0;
  const retrieved = ranked.slice(0, topK).filter((r) => r.s > 0);
  const retrievedChunks = retrieved.map((r) => r.chunk);
  const citations = retrievedChunks.map((c) => c.source.split(" · ")[0]);
  const queryTerms = useMemo(() => new Set(tokenize(submitted)), [submitted]);

  const answer =
    retrieved.length === 0
      ? "No relevant context was retrieved — the model would either refuse or answer from general knowledge (ungrounded)."
      : preset
        ? preset.answer(citations.length ? citations : ["knowledge base"])
        : extractiveAnswer(retrievedChunks);

  // Re-type the answer whenever a new query is submitted or top-k changes.
  const typed = useTypewriter(answer, true, 10);

  function submit(next: string) {
    const q = next.trim();
    if (!q) return;
    setSubmitted(q);
  }

  return (
    <div className="rounded-xl border border-cream-dark bg-white shadow-sm overflow-hidden">
      {/* Controls */}
      <div className="border-b border-cream-dark bg-cream-dark/40 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the TaskFlow knowledge base…"
            className="flex-1 rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-navy/40"
          />
          <button
            type="submit"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white ring-1 ring-navy/10 transition-colors hover:bg-navy-mid"
          >
            Retrieve
          </button>
        </form>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUESTIONS.map((qq) => (
            <button
              key={qq.q}
              type="button"
              onClick={() => {
                setQuery(qq.q);
                submit(qq.q);
              }}
              aria-pressed={qq.q === submitted}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
                qq.q === submitted
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
              const pct = maxScore > 0 ? Math.max(6, (r.s / maxScore) * 100) : 0;
              return (
                <li
                  key={r.chunk.id}
                  className={`rounded-lg border p-3 text-xs transition-all duration-500 ${
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
                  {/* Relevance bar */}
                  <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-cream-dark">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                        isRetrieved ? "bg-gold" : "bg-slate-mid/40"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="leading-relaxed text-charcoal/80">
                    <Highlighted text={r.chunk.text} terms={queryTerms} />
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
            <span className="text-white/40">user:</span> {submitted}
          </div>
          <div className="rounded-lg border border-gold/30 bg-white/5 p-3">
            <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-gold">
              Answer
            </p>
            <p className="text-sm leading-relaxed text-white/90">
              {typed.shown}
              {!typed.done && (
                <span className="ml-0.5 inline-block h-4 w-1.5 -translate-y-px animate-pulse bg-gold align-middle" />
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

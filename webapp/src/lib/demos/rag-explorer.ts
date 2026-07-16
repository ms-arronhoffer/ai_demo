/**
 * Stage content definitions for the RAG Explorer demo.
 *
 * This track shows how retrieval-augmented generation grounds an LLM in your
 * own knowledge base: chunking and indexing, retrieving the right context,
 * and composing a cited answer. The interactive RAG Explorer widget lets the
 * visitor change top-k and watch retrieval quality change.
 */

import type { Demo, Stage } from "./types";

const stages: Stage[] = [
  // ─── 1. RETRIEVE ────────────────────────────────────────────────────────────
  {
    slug: "retrieve",
    number: 1,
    name: "Retrieve",
    tagline: "Fetch the right context before the model ever writes a word.",
    summary:
      "Retrieval-augmented generation turns a general model into a domain expert by pulling the most relevant passages from your own documents at query time and placing them in the prompt. This stage walks the pipeline end to end and lets you drive it.",
    challenge:
      "TaskFlow's assistant confidently answers policy questions — but it makes up details, because the model has never seen TaskFlow's internal runbook, SLAs, or security docs.",
    impact: "Grounded answers from private docs instead of hallucinations",
    timeSaved: "Grounds every answer",
    humanPrompt: `Our TaskFlow assistant invents answers about our internal policies.
We have a folder of markdown docs (runbook, SLA, security, onboarding).

Explain how RAG would fix this, and let me actually see retrieval working:
which chunks get pulled for a given question, and how top-k changes it.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "How RAG Grounds the Assistant",
      },
      {
        type: "paragraph",
        text: "Instead of relying on what the model memorised during training, RAG retrieves relevant passages from your documents at query time and hands them to the model as context. The model then answers from that context — and can cite it.",
      },
      {
        type: "flow",
        title: "The RAG pipeline",
        steps: [
          { label: "Chunk", detail: "Split docs into passages" },
          { label: "Embed", detail: "Vector per chunk" },
          { label: "Search", detail: "Nearest neighbours" },
          { label: "Augment", detail: "Inject top-k into prompt" },
          { label: "Generate", detail: "Cited answer" },
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Try it: retrieval you can steer",
      },
      {
        type: "paragraph",
        text: "Pick a question and drag top-k. Highlighted chunks are the ones retrieved and placed in the prompt; watch the grounded answer and its citations change with them.",
      },
      {
        type: "widget",
        widget: "rag-explorer",
        title: "Interactive · RAG Explorer",
      },
      {
        type: "callout",
        variant: "info",
        text: "Too small a top-k misses the answer; too large floods the prompt with noise and cost. Tuning retrieval is as important as the prompt itself.",
      },
    ],
  },

  // ─── 2. INDEX ───────────────────────────────────────────────────────────────
  {
    slug: "index",
    number: 2,
    name: "Chunk & Index",
    tagline: "Good retrieval starts with good chunks.",
    summary:
      "Retrieval quality is decided before any query runs — in how documents are split, embedded, and stored. This stage covers chunking strategy, embeddings, and the vector index that makes semantic search fast.",
    challenge:
      "The first RAG attempt retrieved half-sentences and duplicated boilerplate, because the docs were split naively on a fixed character count.",
    impact: "Clean, semantically-whole chunks that retrieve precisely",
    timeSaved: "~1 day of tuning",
    humanPrompt: `Help me set up the indexing side of RAG for our docs:
1. How should I chunk markdown so retrieval is clean?
2. What embedding model and vector store fit an Azure-first team?
3. Show the shape of an indexed record.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Chunking & Indexing Strategy",
      },
      {
        type: "table",
        headers: ["Decision", "Recommendation", "Why"],
        rows: [
          ["Chunk boundary", "Split on headings, then ~300 tokens", "Keeps a passage semantically whole"],
          ["Overlap", "~15% between chunks", "Avoids cutting an answer in half"],
          ["Embeddings", "text-embedding-3-large (Azure OpenAI)", "Strong retrieval, one Azure resource"],
          ["Vector store", "Azure AI Search or pgvector", "Managed hybrid search vs. Postgres-native"],
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Shape of an indexed record",
      },
      {
        type: "code",
        language: "json",
        code: `{
  "id": "runbook#oncall",
  "source": "runbook.md",
  "heading": "On-call",
  "text": "On-call escalation: page the primary...",
  "embedding": [0.0123, -0.0456, 0.0789, ...],  // 3072 dims
  "tokens": 96
}`,
      },
      {
        type: "callout",
        variant: "success",
        text: "Store the human-readable source and heading alongside the vector. You need them to render citations and to let reviewers audit what the model was shown.",
      },
    ],
  },

  // ─── 3. GROUND ──────────────────────────────────────────────────────────────
  {
    slug: "ground",
    number: 3,
    name: "Ground & Cite",
    tagline: "Answer only from context — and prove it.",
    summary:
      "The final step is composing an answer that stays faithful to the retrieved context and links every claim back to a source. This stage covers the grounding prompt, citations, and refusing gracefully when the context doesn't contain the answer.",
    challenge:
      "Even with good retrieval, the model sometimes blended retrieved facts with its own guesses — so answers looked cited but weren't fully trustworthy.",
    impact: "Faithful, auditable answers with source links",
    timeSaved: "Audit-ready responses",
    humanPrompt: `Now write the generation side:
1. A system prompt that forces answers to come only from the context
2. How to attach citations
3. What the assistant should do when the context has no answer`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Grounded Generation",
      },
      {
        type: "code",
        language: "text",
        code: `SYSTEM:
Answer the question using ONLY the numbered context passages below.
- Cite the source of every claim like [runbook.md].
- If the context does not contain the answer, say so and do not guess.

CONTEXT:
[1] (runbook.md · On-call) On-call escalation: page the primary...
[2] (sla.md · Uptime) TaskFlow targets 99.9% monthly uptime...

QUESTION: {user_question}`,
      },
      {
        type: "heading",
        level: 3,
        text: "Faithfulness guardrails",
      },
      {
        type: "list",
        items: [
          "Refuse-when-unknown: if no chunk is relevant, the model must say it can't find the answer rather than inventing one.",
          "Citations: every sentence links to the passage it came from, so reviewers can verify.",
          "Faithfulness eval: score answers against their context in CI (covered in the AI Observability track).",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Retrieved documents are untrusted input. If a chunk contains instructions ('ignore previous rules'), treat it as data, not commands — a classic RAG prompt-injection vector handled in the Guardrails concepts.",
      },
      {
        type: "paragraph",
        text: "Next: see the same grounding-plus-tools idea become a fully autonomous agent in the Agentic Playground track.",
      },
    ],
  },
];

export const ragExplorerDemo: Demo = {
  slug: "rag-explorer",
  badge: "Track 04",
  title: "RAG Explorer",
  tagline: "Ground an LLM in your own knowledge — visibly.",
  description:
    "Watch retrieval-augmented generation work end to end: chunk and index your docs, retrieve the right context (drag top-k and see it change), then compose a cited, faithful answer.",
  audience: "Teams putting private knowledge behind an assistant",
  outcome: "Grounded, cited answers",
  status: "available",
  stages,
};

/**
 * Stage content definitions for the Agentic Playground demo.
 *
 * This track turns the abstract "agent loop" into something you can watch and
 * then drive live. It covers the reason → act → observe loop (Agent Trace
 * visualiser), how tools give a model hands, how prompting steers behaviour,
 * and a real Azure-backed, Entra-gated Live Agent Playground.
 */

import type { Demo, Stage } from "./types";

const stages: Stage[] = [
  // ─── 1. THE LOOP ────────────────────────────────────────────────────────────
  {
    slug: "loop",
    number: 1,
    name: "The Agent Loop",
    tagline: "See an agent reason, act, and observe — step by step.",
    summary:
      "An agent is a model in a loop: it reasons about a goal, calls a tool, observes the result, and repeats until it can answer. This stage visualises a real run against TaskFlow with per-step tokens, latency, and cost.",
    challenge:
      "The team hears 'agent' everywhere but can't picture what actually happens between a question and an answer — it feels like a black box.",
    impact: "The agent loop becomes concrete and inspectable",
    timeSaved: "Demystifies agents",
    humanPrompt: `Show me what an agent actually does, step by step, when I ask
"Which tasks are blocked, and who owns them?" — including the tool calls,
and the tokens, latency, and cost of each step.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Reason → Act → Observe",
      },
      {
        type: "paragraph",
        text: "Rather than answering in one shot, the agent plans, calls a tool to fetch live data, reads the result, and only then writes a grounded answer. Click any step below to inspect its raw payload.",
      },
      {
        type: "widget",
        widget: "agent-trace",
        title: "Interactive · Agent Trace Visualizer",
      },
      {
        type: "callout",
        variant: "info",
        text: "Every loop iteration is another model call — which is why step count, tokens, and tool latency all drive an agent's cost and speed.",
      },
    ],
  },

  // ─── 2. TOOLS ───────────────────────────────────────────────────────────────
  {
    slug: "tools",
    number: 2,
    name: "Giving It Hands",
    tagline: "Tool calling turns a chat model into an agent.",
    summary:
      "A model can only read and write text. Tools let it take actions — query a database, call an API, open a PR. This stage shows how a tool is described to the model and how your code executes the call it requests.",
    challenge:
      "Without tools, the assistant can only talk about tasks; it can't actually look them up, so every answer is a guess from stale training data.",
    impact: "The assistant acts on live systems, safely",
    timeSaved: "Live data, not guesses",
    humanPrompt: `Define a query_tasks tool for our TaskFlow agent.
Show me the tool schema the model sees, and how our backend runs the call
and returns the result to the model.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Anatomy of a Tool",
      },
      {
        type: "code",
        language: "json",
        code: `{
  "type": "function",
  "function": {
    "name": "query_tasks",
    "description": "Query the TaskFlow task list; filter by status and/or owner.",
    "parameters": {
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["todo","in_progress","blocked","done"] },
        "owner":  { "type": "string" }
      }
    }
  }
}`,
      },
      {
        type: "flow",
        title: "One tool call",
        steps: [
          { label: "Model", detail: "Requests query_tasks(status='blocked')" },
          { label: "Your code", detail: "Runs the query" },
          { label: "Result", detail: "Rows returned to model" },
          { label: "Model", detail: "Answers from the rows" },
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "The model only *requests* a call — your code decides whether to run it. That boundary is where you enforce permissions, validation, and approvals.",
      },
    ],
  },

  // ─── 3. STEER ───────────────────────────────────────────────────────────────
  {
    slug: "steer",
    number: 3,
    name: "Steer the Model",
    tagline: "The same request, four prompting strategies, four results.",
    summary:
      "Before reaching for tools or fine-tuning, prompting is the fastest lever on quality. This stage contrasts zero-shot, constrained, few-shot, and chain-of-thought prompts on one TaskFlow request.",
    challenge:
      "The team kept tweaking prompts by feel, unsure why one wording produced a crisp status update and another produced waffle.",
    impact: "Deliberate prompting instead of guesswork",
    timeSaved: "~3 hrs per feature",
    humanPrompt: `Show me how different system prompts change the output for the
same task-thread summary — zero-shot vs constrained vs few-shot vs
chain-of-thought — so I can pick the right approach.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Prompting Strategies, Side by Side",
      },
      {
        type: "paragraph",
        text: "Switch strategies below and watch the same user request produce very different outputs. Notice how explicit constraints and worked examples do most of the work.",
      },
      {
        type: "widget",
        widget: "prompt-lab",
        title: "Interactive · Prompt Engineering Lab",
      },
      {
        type: "list",
        items: [
          "Zero-shot: fast to write, but vague without constraints.",
          "Constrained: rules on length, tone, and required fields shape a professional result.",
          "Few-shot: a demonstrated example transfers format precisely.",
          "Chain-of-thought: reason first, then answer — better on multi-step extraction.",
        ],
      },
    ],
  },

  // ─── 4. LIVE ────────────────────────────────────────────────────────────────
  {
    slug: "live",
    number: 4,
    name: "Live Playground",
    tagline: "Talk to a real agent — backed by Azure, gated by Entra.",
    summary:
      "This is the real thing: a live agent running on Azure OpenAI. Because LLM usage costs money and must be governed, access requires a Microsoft Entra sign-in and membership of an approved-users allowlist before a single token is spent.",
    challenge:
      "A live demo is compelling — but you can't expose an LLM endpoint to the whole internet without controlling who can spend tokens through it.",
    impact: "A real agent, with enterprise access control",
    timeSaved: "Live, governed demo",
    humanPrompt: `Give me a real, interactive agent I can chat with — but make sure
only approved people in our tenant can actually use the LLM, and keep the
model configuration in the environment, not the code.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "A Governed Live Agent",
      },
      {
        type: "paragraph",
        text: "The playground streams the agent's reason → tool → observe → answer loop live. Sign in with an approved Microsoft account to run it; the model, endpoint, and credentials all come from environment variables.",
      },
      {
        type: "widget",
        widget: "live-agent-playground",
        title: "Live · Azure OpenAI + Microsoft Entra",
      },
      {
        type: "heading",
        level: 3,
        text: "How access is controlled",
      },
      {
        type: "table",
        headers: ["Control", "Mechanism"],
        rows: [
          ["Who can sign in", "Microsoft Entra ID (Azure AD)"],
          ["Who can use the LLM", "ALLOWED_USERS allowlist — fail-closed if empty"],
          ["Which model", "AZURE_OPENAI_DEPLOYMENT env var (no model in code)"],
          ["Where the call runs", "Server-side /api/chat, after the access checks"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "The allowlist is enforced on the server before any Azure call. Even a valid tenant sign-in cannot reach the model unless the account is explicitly approved.",
      },
    ],
  },
];

export const agenticPlaygroundDemo: Demo = {
  slug: "agentic-playground",
  badge: "Track 05",
  title: "Agentic Playground",
  tagline: "Watch the agent loop — then drive a real one.",
  description:
    "See an agent reason, call tools, and observe results step by step; learn how tools and prompting shape behaviour; then chat with a live agent running on Azure OpenAI behind Microsoft Entra sign-in.",
  audience: "Anyone who wants agents to stop being a black box",
  outcome: "A real, governed agent",
  status: "available",
  stages,
};

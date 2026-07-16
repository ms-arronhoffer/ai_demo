/**
 * Stage content definitions for the Multi-Agent Orchestration demo.
 *
 * This track shows the planner → workers → reviewer pattern: a lead agent
 * decomposes a feature request, delegates to specialist sub-agents running in
 * parallel, and merges their results into a single reviewed deliverable.
 */

import type { Demo, Stage } from "./types";

const stages: Stage[] = [
  // ─── 1. DECOMPOSE ───────────────────────────────────────────────────────────
  {
    slug: "decompose",
    number: 1,
    name: "Decompose",
    tagline: "A lead agent breaks a goal into parallelisable work.",
    summary:
      "One agent doing everything sequentially is slow and unfocused. A planner agent instead decomposes a feature request into independent sub-tasks that specialist agents can tackle in parallel. This stage shows the plan.",
    challenge:
      "A single TaskFlow agent asked to 'add task pagination' tries to design, code, test, and document all at once — and does each part poorly.",
    impact: "Focused specialists instead of one overloaded generalist",
    timeSaved: "Parallel, higher-quality work",
    humanPrompt: `We want a lead agent to take "add pagination to the task list"
and break it into work for specialist agents. Show the decomposition and how
the pieces relate.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Planner Decomposition",
      },
      {
        type: "paragraph",
        text: "The planner turns one goal into a small dependency graph of sub-tasks, each assigned to a specialist agent.",
      },
      {
        type: "flow",
        title: "Plan for 'add pagination'",
        steps: [
          { label: "Planner", detail: "Decompose the goal" },
          { label: "Design", detail: "API + UI contract" },
          { label: "Code", detail: "Implement endpoints + UI" },
          { label: "Test", detail: "Write test suite" },
          { label: "Docs", detail: "Update README" },
        ],
      },
      {
        type: "table",
        headers: ["Sub-task", "Specialist", "Depends on"],
        rows: [
          ["Design the paging contract", "Architect agent", "—"],
          ["Implement API + UI", "Coder agent", "Design"],
          ["Write tests", "Tester agent", "Design"],
          ["Update docs", "Doc agent", "Code"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "Design blocks everything, but Code and Tests can run in parallel once the contract is set — that fan-out is where multi-agent shines.",
      },
    ],
  },

  // ─── 2. DELEGATE ────────────────────────────────────────────────────────────
  {
    slug: "delegate",
    number: 2,
    name: "Fan Out",
    tagline: "Specialists work in parallel, each with its own context.",
    summary:
      "Each specialist agent runs with a focused system prompt and only the tools it needs, in its own context window. This stage shows delegation and why isolated contexts improve quality and reduce cost.",
    challenge:
      "Cramming design, code, and test instructions into one context confuses the model and blows the token budget.",
    impact: "Clean, isolated contexts per specialist",
    timeSaved: "Faster via parallelism",
    humanPrompt: `Show how the planner delegates to the coder and tester agents in
parallel, and why giving each its own context and tools is better than one
big agent.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Delegation in Parallel",
      },
      {
        type: "code",
        language: "text",
        code: `planner: design complete → contract v1 (offset/limit, 25/page)

┌─ spawn coder-agent   (tools: repo, editor)   ─┐   run in
└─ spawn tester-agent  (tools: repo, test-run)  ┘   parallel

coder-agent  → implements /tasks?offset&limit + UI controls
tester-agent → writes pagination.test.ts (edge cases: page 0, overflow)`,
      },
      {
        type: "table",
        headers: ["Agent", "System prompt focus", "Tools"],
        rows: [
          ["Architect", "API/UX contracts, trade-offs", "read repo, write design doc"],
          ["Coder", "Production TypeScript, minimal diffs", "read/write repo, editor"],
          ["Tester", "Edge cases, coverage", "read repo, run tests"],
          ["Doc", "Clear README prose", "read repo, write docs"],
        ],
      },
      {
        type: "callout",
        variant: "success",
        text: "Isolated contexts mean each agent sees only what it needs — better focus, smaller prompts, and failures that don't cascade across roles.",
      },
    ],
  },

  // ─── 3. MERGE ───────────────────────────────────────────────────────────────
  {
    slug: "merge",
    number: 3,
    name: "Merge & Review",
    tagline: "Fan back in — a reviewer agent gates the result.",
    summary:
      "The orchestrator collects each specialist's output and hands it to a reviewer agent that checks consistency, correctness, and standards before anything ships. This stage shows the fan-in and the review gate.",
    challenge:
      "Parallel work can drift — the tests might assume a different API shape than the code produced. Something must reconcile them.",
    impact: "One coherent, reviewed deliverable",
    timeSaved: "Fewer integration surprises",
    humanPrompt: `Once the specialists finish, how do we merge their work and make
sure it's consistent? Show the reviewer step and what it checks.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Fan-In and the Review Gate",
      },
      {
        type: "flow",
        title: "Merge",
        steps: [
          { label: "Collect", detail: "Code + tests + docs" },
          { label: "Reviewer", detail: "Check consistency" },
          { label: "Gate", detail: "Pass → PR · Fail → back to worker" },
        ],
      },
      {
        type: "checklist",
        items: [
          { checked: true, text: "Code and tests agree on the paging contract (offset/limit)" },
          { checked: true, text: "Tests cover edge cases (empty page, overflow)" },
          { checked: true, text: "Docs describe the new query parameters" },
          { checked: false, text: "Human approval before merge (human-in-the-loop)" },
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Keep a human-in-the-loop gate for anything that ships or touches production. Multi-agent speed is only safe with a clear approval boundary.",
      },
      {
        type: "paragraph",
        text: "Orchestration patterns like this pair naturally with the governance and observability covered in the AI Observability track.",
      },
    ],
  },
];

export const multiAgentDemo: Demo = {
  slug: "multi-agent",
  badge: "Track 08",
  title: "Multi-Agent Orchestration",
  tagline: "Planner → specialists → reviewer, working in parallel.",
  description:
    "See how a lead agent decomposes a feature request, delegates to specialist agents running in parallel with isolated contexts, and merges their work behind a reviewer gate.",
  audience: "Teams building complex, multi-step agent workflows",
  outcome: "Coordinated specialist agents",
  status: "available",
  stages,
};

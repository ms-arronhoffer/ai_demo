/**
 * Stage content definitions for the Skills Library demo.
 *
 * This track explains skills: packaged, reusable capabilities (a name +
 * instructions + optional code) that a model loads on demand via progressive
 * disclosure — rather than hard-coding every behaviour into one giant prompt.
 */

import type { Demo, Stage } from "./types";

const stages: Stage[] = [
  // ─── 1. SKILL VS TOOL ───────────────────────────────────────────────────────
  {
    slug: "skill-vs-tool",
    number: 1,
    name: "Skill vs. Tool",
    tagline: "A named capability the model loads when it's relevant.",
    summary:
      "A tool is a single function the model can call. A skill is a packaged capability — a name, a description, instructions, and sometimes bundled code or resources — that the model pulls in only when a task needs it. This stage draws the distinction.",
    challenge:
      "TaskFlow's assistant prompt has grown into a 4,000-token wall of instructions for every possible task — slow, expensive, and hard to maintain.",
    impact: "Lean prompts; capabilities added without bloat",
    timeSaved: "Smaller, cheaper prompts",
    humanPrompt: `Our system prompt is enormous because we've stuffed every
capability into it. Explain how 'skills' fix this and how a skill differs
from just adding another tool.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Tools, Skills — What's the Difference?",
      },
      {
        type: "table",
        headers: ["", "Tool", "Skill"],
        rows: [
          ["Granularity", "One function call", "A whole capability (may use several tools)"],
          ["Contains", "Name + schema", "Name + instructions + optional code/resources"],
          ["Loaded", "Always declared", "On demand, only when relevant"],
          ["Example", "query_tasks()", "\"Generate a PDF status report\""],
        ],
      },
      {
        type: "flow",
        title: "A skill packages a workflow",
        steps: [
          { label: "Metadata", detail: "Name + when to use" },
          { label: "Instructions", detail: "How to do it" },
          { label: "Tools", detail: "query_tasks, render_pdf" },
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "Think of skills as a library the model checks out from: it reads the titles, then only opens the book it needs for the current task.",
      },
    ],
  },

  // ─── 2. PROGRESSIVE DISCLOSURE ──────────────────────────────────────────────
  {
    slug: "progressive-disclosure",
    number: 2,
    name: "Progressive Disclosure",
    tagline: "Load skill metadata first, full instructions only when needed.",
    summary:
      "Skills keep prompts small through progressive disclosure: the model first sees just each skill's name and one-line description, and only loads the full instructions once it decides a skill is relevant. This stage shows the token savings.",
    challenge:
      "Loading every skill's full instructions up front would be even worse than the original mega-prompt — the point is to load lazily.",
    impact: "Big context savings, more room for real work",
    timeSaved: "~70% prompt tokens",
    humanPrompt: `Show me how progressive disclosure keeps the context small —
what the model sees before vs. after it picks a skill, and roughly the
token difference.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Two-Phase Loading",
      },
      {
        type: "code",
        language: "text",
        code: `Phase 1 — always in context (cheap):
  • pdf-report   — "Generate a PDF status report from tasks"
  • excel-export — "Export filtered tasks to an .xlsx file"
  • incident-brief — "Draft an incident brief from a thread"

Phase 2 — loaded only after the model picks 'pdf-report':
  <full instructions, formatting rules, and render_pdf tool spec>`,
      },
      {
        type: "diff",
        filename: "context budget",
        lines: [
          { kind: "context", text: "system prompt (base)            ~600 tokens" },
          { kind: "remove", text: "all skills, full instructions   ~3,900 tokens" },
          { kind: "add", text: "skill titles only               ~120 tokens" },
          { kind: "add", text: "one skill loaded on demand      ~700 tokens" },
        ],
      },
      {
        type: "callout",
        variant: "success",
        text: "Adding a new skill costs one line of metadata in the default context — capabilities scale without the prompt ballooning.",
      },
    ],
  },

  // ─── 3. INVOKE ──────────────────────────────────────────────────────────────
  {
    slug: "invoke",
    number: 3,
    name: "Invoke a Skill",
    tagline: "Pick the right skill and run it end to end.",
    summary:
      "This stage follows a request through skill selection and execution: the model matches the task to a skill, loads its instructions, and uses the skill's tools to produce the result.",
    challenge:
      "A user asks for 'a PDF of everything Priya is blocked on' — the assistant must choose the right skill and combine data access with document rendering.",
    impact: "Complex outputs from a single request",
    timeSaved: "Multi-step work, one ask",
    humanPrompt: `Walk through what happens when a user says:
"Give me a PDF of everything Priya is blocked on."
Which skill runs, and what does it do?`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Selection → Execution",
      },
      {
        type: "flow",
        title: "pdf-report skill run",
        steps: [
          { label: "Match", detail: "Request → pdf-report skill" },
          { label: "Load", detail: "Skill instructions" },
          { label: "Gather", detail: "query_tasks(owner=Priya, status=blocked)" },
          { label: "Render", detail: "render_pdf(...)" },
          { label: "Return", detail: "Download link" },
        ],
      },
      {
        type: "code",
        language: "text",
        code: `user: Give me a PDF of everything Priya is blocked on.

model (skill match): pdf-report  ← "generate a PDF status report from tasks"
skill → query_tasks({ "owner": "Priya", "status": "blocked" })   → 2 rows
skill → render_pdf({ "title": "Priya · Blocked", "rows": [...] }) → report.pdf

model: Here's the report — 2 blocked tasks (TF-482, TF-503). [Download PDF]`,
      },
      {
        type: "callout",
        variant: "warning",
        text: "Skills can bundle code that runs on your infrastructure. Review and sandbox them like any dependency — a skill is as trusted as the tools it can reach.",
      },
    ],
  },
];

export const skillsLibraryDemo: Demo = {
  slug: "skills-library",
  badge: "Track 07",
  title: "Skills Library",
  tagline: "Reusable capabilities the model loads on demand.",
  description:
    "Learn how skills package a whole workflow behind a name, how progressive disclosure keeps prompts lean, and how the model selects and executes the right skill for a request.",
  audience: "Teams scaling assistant capabilities without prompt bloat",
  outcome: "Composable, on-demand capabilities",
  status: "available",
  stages,
};

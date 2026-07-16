/**
 * Stage content definitions for the MCP in Action demo.
 *
 * This track explains the Model Context Protocol: an open standard that lets a
 * host app connect to external servers advertising tools, resources, and
 * prompts — so agent capabilities become pluggable and portable across apps.
 */

import type { Demo, Stage } from "./types";

const stages: Stage[] = [
  // ─── 1. PROTOCOL ────────────────────────────────────────────────────────────
  {
    slug: "protocol",
    number: 1,
    name: "The Protocol",
    tagline: "One standard interface between models and the tools they use.",
    summary:
      "The Model Context Protocol (MCP) standardises how an AI host discovers and calls external capabilities. Instead of bespoke integrations per app, a server advertises its tools, resources, and prompts over a common protocol any MCP host can speak.",
    challenge:
      "Every AI feature re-implements its own integrations — the TaskFlow assistant, the IDE, and the chatbot each wire up GitHub access differently, and none of it is reusable.",
    impact: "Write an integration once, use it in any MCP host",
    timeSaved: "No more per-app glue",
    humanPrompt: `Explain MCP to my team. What problem does it solve, what does a
server actually expose, and how is it different from just adding a tool to
one app?`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Model Context Protocol in One Picture",
      },
      {
        type: "paragraph",
        text: "An MCP host (your app) connects to one or more MCP servers. Each server advertises capabilities the model can use — and because the protocol is shared, the same server works in any host that speaks MCP.",
      },
      {
        type: "flow",
        title: "Host ↔ servers",
        steps: [
          { label: "Host", detail: "TaskFlow assistant" },
          { label: "MCP", detail: "Standard protocol" },
          { label: "Servers", detail: "GitHub · Filesystem · DB" },
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "What a server advertises",
      },
      {
        type: "table",
        headers: ["Primitive", "What it is", "TaskFlow example"],
        rows: [
          ["Tools", "Actions the model can invoke", "list_pull_requests, read_log"],
          ["Resources", "Readable data/context", "A file, a DB row, a wiki page"],
          ["Prompts", "Reusable prompt templates", "\"Summarise this incident\""],
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "A raw tool is bound to one app. An MCP server is a portable capability: connect it to the IDE, the assistant, or a CI bot without rewriting the integration.",
      },
    ],
  },

  // ─── 2. HANDSHAKE ───────────────────────────────────────────────────────────
  {
    slug: "handshake",
    number: 2,
    name: "Capability Handshake",
    tagline: "How a host discovers what a server can do.",
    summary:
      "When a host connects to a server, they negotiate capabilities: the server lists its tools, resources, and prompts, and the host exposes them to the model. This stage shows the discovery exchange and a tool definition.",
    challenge:
      "The team needs to know exactly what a connected server can do — and be able to review it — before letting a model call into it.",
    impact: "Transparent, reviewable capability discovery",
    timeSaved: "Auditable integrations",
    humanPrompt: `When our assistant connects to the GitHub MCP server, what does the
discovery handshake look like, and how does a single tool get described?`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Discovery Exchange",
      },
      {
        type: "code",
        language: "json",
        code: `// Host → server: what can you do?
{ "method": "tools/list" }

// Server → host: here are my tools
{
  "tools": [
    {
      "name": "list_pull_requests",
      "description": "List open PRs for a repository",
      "inputSchema": {
        "type": "object",
        "properties": {
          "repo": { "type": "string" },
          "state": { "type": "string", "enum": ["open","closed","all"] }
        },
        "required": ["repo"]
      }
    }
  ]
}`,
      },
      {
        type: "flow",
        title: "Connection lifecycle",
        steps: [
          { label: "Initialize", detail: "Version + capabilities" },
          { label: "List", detail: "tools / resources / prompts" },
          { label: "Call", detail: "Invoke a tool" },
          { label: "Result", detail: "Structured response" },
        ],
      },
      {
        type: "callout",
        variant: "success",
        text: "Because capabilities are declared, you can review, allow-list, or deny specific tools per host — governance the model can't bypass.",
      },
    ],
  },

  // ─── 3. ROUTING ─────────────────────────────────────────────────────────────
  {
    slug: "routing",
    number: 3,
    name: "Routing a Request",
    tagline: "One agent, many servers — picking the right one.",
    summary:
      "With several servers connected, the model chooses the right tool for each request. This stage shows the same agent answering a GitHub question and a filesystem question by routing to different servers.",
    challenge:
      "The assistant needs to answer 'what PRs are open?' and 'what's in the deploy log?' — two very different backends — without the user thinking about which system holds the answer.",
    impact: "A single assistant spanning multiple systems",
    timeSaved: "Unified interface",
    humanPrompt: `We've connected a GitHub MCP server and a filesystem MCP server.
Show how the agent routes "which PRs are open on taskflow?" versus
"what's the last error in the deploy log?" to the right server.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Same Agent, Different Servers",
      },
      {
        type: "table",
        headers: ["User asks", "Model routes to", "Tool"],
        rows: [
          ["Which PRs are open on taskflow?", "GitHub server", "list_pull_requests(repo='taskflow')"],
          ["Last error in the deploy log?", "Filesystem server", "read_log(path='deploy.log')"],
          ["Summarise this incident", "Prompts (GitHub server)", "prompt: incident_summary"],
        ],
      },
      {
        type: "code",
        language: "text",
        code: `user: which PRs are open on taskflow, and what's the last deploy error?

agent → github.list_pull_requests({ "repo": "taskflow", "state": "open" })
agent → filesystem.read_log({ "path": "deploy.log", "tail": 20 })

agent: 2 PRs are open (#128 pagination, #131 SSO). The last deploy error is
"missing finance API key" at 02:14 — matching the blocked billing export.`,
      },
      {
        type: "callout",
        variant: "warning",
        text: "Grant each server least privilege. The filesystem server should expose only the log directory, not the whole disk — the model will use whatever you connect.",
      },
      {
        type: "paragraph",
        text: "See these capabilities packaged as reusable, on-demand units in the Skills Library track.",
      },
    ],
  },
];

export const mcpInActionDemo: Demo = {
  slug: "mcp-in-action",
  badge: "Track 06",
  title: "MCP in Action",
  tagline: "Pluggable, portable capabilities via the Model Context Protocol.",
  description:
    "Understand MCP from the ground up: what a server advertises (tools, resources, prompts), the discovery handshake, and how one agent routes requests across GitHub, filesystem, and database servers.",
  audience: "Platform teams standardising AI integrations",
  outcome: "Reusable, governed capabilities",
  status: "available",
  stages,
};

/**
 * Content for the "AI & Agentic Building Blocks" concepts overview.
 *
 * A layered reference map of the components that make up modern AI and agentic
 * deployments — from the model layer up through retrieval, tools, agentic
 * patterns, deployment, and operations. Each concept has a plain-English
 * definition, a concrete TaskFlow example, and (where relevant) a link to the
 * demo track that shows it in action.
 */

export interface Concept {
  term: string;
  definition: string;
  example: string;
  /** Slug of the demo that best demonstrates this concept, if any. */
  demoSlug?: string;
}

export interface ConceptLayer {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  concepts: Concept[];
}

export const conceptLayers: ConceptLayer[] = [
  {
    id: "foundations",
    number: 1,
    title: "Foundations",
    subtitle: "The model layer",
    concepts: [
      {
        term: "LLM / Foundation model",
        definition: "The core text (and often vision) model that generates responses.",
        example: "A GPT-class model drafts a TaskFlow status update from a thread.",
      },
      {
        term: "Tokens & context window",
        definition: "Text is processed as tokens; the context window is the model's working-memory limit.",
        example: "A 200-message thread must be summarised before it fits the window.",
      },
      {
        term: "Embeddings",
        definition: "Numeric vectors that capture meaning — the basis of semantic search.",
        example: "Each TaskFlow doc paragraph becomes a vector for retrieval.",
        demoSlug: "rag-explorer",
      },
      {
        term: "Prompt engineering",
        definition: "Using system, user, and few-shot prompts to steer model behaviour.",
        example: "A system prompt forces neutral, under-60-word summaries.",
        demoSlug: "agentic-playground",
      },
      {
        term: "Structured output",
        definition: "Constraining responses to JSON or a schema the app can consume directly.",
        example: "The agent returns { task_id, status, owner } the UI renders as a table.",
      },
    ],
  },
  {
    id: "retrieval",
    number: 2,
    title: "Retrieval & Knowledge",
    subtitle: "Grounding the model",
    concepts: [
      {
        term: "RAG",
        definition: "Retrieval-Augmented Generation: fetch relevant docs at query time and feed them to the model so answers are grounded and current.",
        example: "\"What's our escalation policy?\" pulls the runbook section and answers with a citation.",
        demoSlug: "rag-explorer",
      },
      {
        term: "Vector database / search",
        definition: "Stores embeddings and returns nearest neighbours for a query.",
        example: "Azure AI Search or pgvector holds TaskFlow's knowledge base.",
        demoSlug: "rag-explorer",
      },
      {
        term: "Chunking & indexing",
        definition: "Splitting documents into retrievable, semantically-whole pieces.",
        example: "The runbook is split into ~300-token sections with overlap.",
        demoSlug: "rag-explorer",
      },
      {
        term: "Reranking",
        definition: "A second-pass model that reorders retrieved chunks by relevance.",
        example: "The exact 'on-call rotation' paragraph is promoted above generic ones.",
        demoSlug: "rag-explorer",
      },
      {
        term: "Grounding & citations",
        definition: "Tying each claim in an answer back to a source passage.",
        example: "Every sentence footnotes the doc it came from, so reviewers can verify.",
        demoSlug: "rag-explorer",
      },
      {
        term: "Knowledge graphs / GraphRAG",
        definition: "Relationship-aware retrieval that traverses entities and links.",
        example: "\"Which incidents touched billing?\" follows entity links across records.",
      },
    ],
  },
  {
    id: "tools",
    number: 3,
    title: "Tools & Interoperability",
    subtitle: "Giving the model hands",
    concepts: [
      {
        term: "Tool / function calling",
        definition: "The model requests a function; your code runs it and returns the result.",
        example: "query_tasks(status='blocked') fetches live rows for the agent.",
        demoSlug: "agentic-playground",
      },
      {
        term: "MCP (Model Context Protocol)",
        definition: "An open standard letting a host connect to servers that advertise tools, resources, and prompts — pluggable and portable across apps.",
        example: "A GitHub MCP server exposes list_pull_requests; the same agent also reads logs from a filesystem server.",
        demoSlug: "mcp-in-action",
      },
      {
        term: "Skills",
        definition: "Packaged, reusable capabilities loaded on demand via progressive disclosure, rather than hard-coded into one giant prompt.",
        example: "A 'generate PDF report' skill loads only when a report is requested.",
        demoSlug: "skills-library",
      },
      {
        term: "Connectors / plugins",
        definition: "Prebuilt integrations to SaaS systems.",
        example: "Jira and Slack connectors let the agent post status updates.",
      },
    ],
  },
  {
    id: "agentic",
    number: 4,
    title: "Agentic Patterns",
    subtitle: "Autonomy & orchestration",
    concepts: [
      {
        term: "Agent",
        definition: "An LLM in a loop that plans, calls tools, observes results, and iterates toward a goal.",
        example: "A 'triage this bug' agent reproduces, locates the file, and proposes a fix.",
        demoSlug: "agentic-playground",
      },
      {
        term: "Agent loop (ReAct)",
        definition: "Reason → Act (tool) → Observe → repeat until the goal is met.",
        example: "The Agent Trace visualiser shows each iteration with its cost.",
        demoSlug: "agentic-playground",
      },
      {
        term: "Tasks",
        definition: "Discrete, often long-running units of work an agent completes, sometimes asynchronously in the background.",
        example: "\"Open a PR that adds pagination\" runs as a background task and reports back.",
        demoSlug: "multi-agent",
      },
      {
        term: "Planning / decomposition",
        definition: "Breaking a goal into ordered sub-steps.",
        example: "A feature request becomes design → code → test → docs.",
        demoSlug: "multi-agent",
      },
      {
        term: "Multi-agent orchestration",
        definition: "Specialist agents coordinated by an orchestrator (planner / worker / reviewer).",
        example: "Coder, tester, and reviewer sub-agents collaborate on one feature.",
        demoSlug: "multi-agent",
      },
      {
        term: "Memory",
        definition: "Short-term (conversation) and long-term (persisted facts and preferences).",
        example: "The agent remembers a team's coding conventions across sessions.",
      },
      {
        term: "Human-in-the-loop / approvals",
        definition: "Gating risky actions on explicit human confirmation.",
        example: "The agent drafts an infra change but waits for approval before applying it.",
        demoSlug: "multi-agent",
      },
    ],
  },
  {
    id: "deployment",
    number: 5,
    title: "Deployment",
    subtitle: "Running it in production",
    concepts: [
      {
        term: "Inference hosting & model deployment",
        definition: "Serving pinned model versions with predictable capacity.",
        example: "An Azure AI Foundry model deployment backs the assistant.",
        demoSlug: "deployment-patterns",
      },
      {
        term: "Orchestration frameworks",
        definition: "Libraries that wire models, tools, and memory together.",
        example: "LangChain, LlamaIndex, Semantic Kernel, or Foundry Agents define the agent.",
      },
      {
        term: "Infrastructure as Code for AI",
        definition: "Provisioning AI resources reproducibly and reviewably.",
        example: "Bicep provisions the Foundry account, project, and agents.",
        demoSlug: "deployment-patterns",
      },
      {
        term: "Gateways & routing",
        definition: "Model routers, fallback, and rate limiting in front of providers.",
        example: "Cheap queries route to a small model; hard ones to a large model.",
      },
      {
        term: "Caching",
        definition: "Prompt/response and semantic caching to cut cost and latency.",
        example: "A repeated policy question is served from cache, not the model.",
      },
      {
        term: "Authentication & access control",
        definition: "Identity-gated access so only approved people can consume the LLM.",
        example: "Microsoft Entra sign-in plus an allowlist guards the Live Agent Playground.",
        demoSlug: "agentic-playground",
      },
    ],
  },
  {
    id: "operations",
    number: 6,
    title: "Operations, Safety & Governance",
    subtitle: "Keeping it healthy and safe",
    concepts: [
      {
        term: "Observability & tracing",
        definition: "Step-level traces plus token and cost metrics for every run.",
        example: "Each agent step's tokens, latency, and cost are recorded and inspectable.",
        demoSlug: "ai-observability",
      },
      {
        term: "Evaluation (evals)",
        definition: "Automated quality scoring — LLM-as-judge and regression suites.",
        example: "Every summary-prompt change is scored in CI before it ships.",
        demoSlug: "ai-observability",
      },
      {
        term: "Guardrails",
        definition: "Input/output filtering, PII redaction, and jailbreak defence.",
        example: "Prompt-injection hidden in a retrieved doc is treated as data, not commands.",
        demoSlug: "ai-observability",
      },
      {
        term: "Cost governance",
        definition: "Budgets, quotas, and per-team spend attribution.",
        example: "A token-spend dashboard flags a runaway agent before the bill does.",
        demoSlug: "ai-observability",
      },
      {
        term: "Security & data boundaries",
        definition: "Least-privilege tool access, tenant isolation, and secrets handling.",
        example: "The agent can read tasks but cannot delete them without approval.",
        demoSlug: "mcp-in-action",
      },
    ],
  },
];

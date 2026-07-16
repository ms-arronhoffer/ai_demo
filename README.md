# AI Demos

An interactive web application — a **catalog of demo "tracks"** that show how AI
accelerates the way we build *and* ship software. Each track follows the
fictional **TaskFlow** app and pairs real human prompts with rich AI responses.

## Tracks

### Track 01 · AI-Powered SDLC
Walks through all six stages of the Software Development Life Cycle and how AI
accelerates each one.

| Stage | What AI Does |
|-------|-------------|
| **01 · Plan** | Generates user stories, acceptance criteria, architecture recommendations |
| **02 · Code** | Scaffolds production-ready TypeScript React components |
| **03 · Test** | Writes a full Jest + React Testing Library test suite |
| **04 · Document** | Produces README sections, JSDoc comments, and usage examples |
| **05 · Deploy** | Creates GitHub Actions CI/CD pipelines |
| **06 · Operate** | Diagnoses production incidents and writes monitoring configs |

### Track 02 · Deployment Patterns
Takes the app to production using an **Infrastructure as Code (IaC)** approach,
with the specifics needed for **AI resources** — Azure AI Foundry, model
deployments, and Agents.

| Stage | Focus |
|-------|-------|
| **01 · Foundations** | Choosing IaC tooling, repo layout, state, secrets, drift |
| **02 · Core Infrastructure** | Container Apps, registry, Key Vault, observability (Bicep) |
| **03 · AI Resources** | Azure AI Foundry account, project, pinned model deployments |
| **04 · Agents** | Declarative Foundry Agent definitions and tools |
| **05 · Environments** | One template, dev/test/prod promotion via parameters |
| **06 · Pipeline & Governance** | CI/CD, approvals, and AI-specific monitoring |

### Track 03 · AI Observability
Monitoring, evaluating, and tracing AI features in production — evaluation
harnesses, prompt tracing, token/cost tracking, and content safety.

### Track 04 · RAG Explorer
Retrieval-Augmented Generation end to end — chunk and index docs, retrieve the
right context (drag **top-k** and watch it change in the interactive **RAG
Explorer** widget), then compose a cited, faithful answer.

### Track 05 · Agentic Playground
The agent loop made visible and then **live**:

| Stage | Focus |
|-------|-------|
| **01 · The Agent Loop** | Interactive **Agent Trace** visualiser — reason → act → observe, with per-step tokens/latency/cost |
| **02 · Giving It Hands** | Tool calling: schema the model sees + how your code runs the call |
| **03 · Steer the Model** | Interactive **Prompt Lab** — zero-shot vs constrained vs few-shot vs chain-of-thought |
| **04 · Live Playground** | A real agent on **Azure OpenAI**, gated by **Microsoft Entra** sign-in + an approved-users allowlist |

### Track 06 · MCP in Action
The Model Context Protocol — what a server advertises (tools, resources,
prompts), the capability handshake, and routing one agent across multiple
servers.

### Track 07 · Skills Library
Reusable, packaged capabilities loaded on demand — skill vs. tool, progressive
disclosure (with a token-budget diff), and running a skill end to end.

### Track 08 · Multi-Agent Orchestration
Planner → specialists → reviewer: decompose a feature request, fan out to
specialist agents in parallel, then merge behind a review gate.

New tracks are added over time — the landing page also advertises upcoming
tracks as "coming soon" stubs.

## AI & Agentic Building Blocks

`/concepts` is a **layered reference map** of the components behind modern AI
and agentic deployments — Foundations, Retrieval (RAG), Tools & Interop (MCP,
skills), Agentic Patterns (agents, tasks, orchestration), Deployment, and
Operations. Every concept has a plain-English definition, a concrete TaskFlow
example, and a link to the demo that shows it in action.

## Live Agent Playground (Azure + Microsoft Entra)

The Agentic Playground's final stage is a **real** agent backed by Azure
OpenAI. Because LLM usage costs money and must be governed, it is gated:

- **Authentication** — Microsoft Entra ID (Azure AD) sign-in, via Auth.js.
- **Authorization** — only individuals on the `ALLOWED_USERS` allowlist may
  reach the model. The check is **fail-closed**: an empty allowlist approves
  nobody, even after a valid tenant sign-in, and is enforced server-side in
  `/api/chat` before any Azure call.
- **Model config in the environment** — the model is chosen via
  `AZURE_OPENAI_DEPLOYMENT`; no model or secret is hard-coded.

When these variables are not set, the app still builds and runs — the live
playground reports that it is unavailable and the deterministic (pre-recorded)
widgets keep working.

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cd webapp
cp .env.example .env.local
# set AUTH_SECRET, the AUTH_MICROSOFT_ENTRA_ID_* app-registration values,
# ALLOWED_USERS, and the AZURE_OPENAI_* settings
npm run dev
```

Register this redirect URI on your Entra app registration:
`https://<your-host>/api/auth/callback/microsoft-entra-id`.

## Tech Stack

- **Next.js 16** (App Router, statically generated, standalone output)
- **TypeScript** — strict mode
- **Tailwind CSS v4** — custom brand tokens (navy / gold / cream)
- **Geist** (sans + mono) + **Source Serif 4** (headings)
- **Auth.js (next-auth v5)** — Microsoft Entra ID sign-in for the live playground
- **Azure OpenAI** — backend for the live, LLM-driven interactive features

## Getting Started

```bash
cd webapp
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
```

## Run as a Container

The app is packaged as a container image using Next.js standalone output.

```bash
cd webapp

# With Docker
docker build -t ai-demos-webapp .
docker run --rm -p 3000:3000 ai-demos-webapp   # → http://localhost:3000

# Or with Docker Compose
docker compose up --build
```

## Project Structure

```
webapp/
├── Dockerfile                     # Multi-stage container build
├── docker-compose.yml
├── .env.example                   # Auth.js / Entra / Azure OpenAI config
├── src/
│   ├── auth.ts                    # Auth.js + Microsoft Entra ID setup
│   ├── app/
│   │   ├── page.tsx               # Landing page (track catalog)
│   │   ├── concepts/              # AI & Agentic Building Blocks overview
│   │   ├── demos/[demo]/[stage]/  # Demo-scoped stage pages
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # Entra sign-in routes
│   │       └── chat/              # Entra+allowlist-gated Azure agent stream
│   ├── components/
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   ├── TrackCard.tsx          # Landing-page track cards
│   │   ├── StageCard.tsx
│   │   ├── AIInteraction.tsx      # Prompt ↔ Response display
│   │   └── widgets/               # Interactive demo widgets
│   │       ├── AgentTrace.tsx
│   │       ├── RagExplorer.tsx
│   │       ├── PromptLab.tsx
│   │       ├── LiveAgentPlayground.tsx
│   │       └── WidgetRenderer.tsx
│   └── lib/
│       ├── access.ts              # Allowlist / Entra config (fail-closed)
│       ├── azure.ts               # Azure OpenAI agent loop (server-only)
│       ├── concepts.ts            # Building-blocks reference data
│       └── demos/                 # Track content & registry
│           ├── types.ts           # Shared content types
│           ├── ai-sdlc.ts         # Track 01 content
│           ├── deployment-patterns.ts  # Track 02 content
│           └── index.ts           # Demo registry & helpers
```

### Adding a New Demo

1. Create `src/lib/demos/<your-demo>.ts` exporting a `Demo` object (see the
   existing tracks for the shape).
2. Register it in the `demos` array in `src/lib/demos/index.ts`.
3. Optionally add stage icons in `StageCard.tsx` (a default icon is used
   otherwise). A `coming-soon` stub with no stages will simply appear on the
   landing page as an upcoming track.

## Design

Professional-services aesthetic: restrained **navy** primary, **gold** as a rare
accent, editorial **Source Serif 4** for headings. Inspired by law firm /
management consulting visual language.

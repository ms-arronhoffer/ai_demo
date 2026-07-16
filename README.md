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

New tracks are added over time — the landing page also advertises upcoming
tracks as "coming soon" stubs.

## Tech Stack

- **Next.js 16** (App Router, statically generated, standalone output)
- **TypeScript** — strict mode
- **Tailwind CSS v4** — custom brand tokens (navy / gold / cream)
- **Geist** (sans + mono) + **Source Serif 4** (headings)

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
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page (track catalog)
│   │   └── demos/[demo]/[stage]/  # Demo-scoped stage pages
│   ├── components/
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   ├── TrackCard.tsx          # Landing-page track cards
│   │   ├── StageCard.tsx
│   │   └── AIInteraction.tsx      # Prompt ↔ Response display
│   └── lib/
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

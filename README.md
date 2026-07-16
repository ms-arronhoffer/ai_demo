# AI-Powered SDLC Demo

An interactive web application that walks students through all six stages of the Software Development Life Cycle — and shows how AI accelerates each one.

## The Story

We follow the fictional **TaskFlow** team as they build a simple task management app. At every stage you see a real human prompt, the AI response, and the artifact produced.

| Stage | What AI Does |
|-------|-------------|
| **01 · Plan** | Generates user stories, acceptance criteria, architecture recommendations |
| **02 · Code** | Scaffolds production-ready TypeScript React components |
| **03 · Test** | Writes a full Jest + React Testing Library test suite |
| **04 · Document** | Produces README sections, JSDoc comments, and usage examples |
| **05 · Deploy** | Creates GitHub Actions CI/CD pipelines |
| **06 · Operate** | Diagnoses production incidents and writes monitoring configs |

## Tech Stack

- **Next.js 16** (App Router, fully statically generated)
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

## Project Structure

```
webapp/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   └── stages/[slug]/page.tsx # Dynamic stage pages (6 total)
│   ├── components/
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   ├── StageCard.tsx
│   │   └── AIInteraction.tsx      # Prompt ↔ Response display
│   └── lib/
│       └── stages.ts              # All stage content & types
```

## Design

Professional-services aesthetic: restrained **navy** primary, **gold** as a rare accent, editorial **Source Serif 4** for headings. Inspired by law firm / management consulting visual language.

/**
 * Demo (track) registry.
 *
 * Add a new demo by creating a module that exports a `Demo` and registering it
 * in the `demos` array below. Stub demos (status: "coming-soon") appear on the
 * landing page but have no stages yet — a lightweight way to advertise future
 * tracks.
 */

import type { Demo, Stage } from "./types";
import { aiSdlcDemo } from "./ai-sdlc";
import { deploymentPatternsDemo } from "./deployment-patterns";

export type { ContentBlock, Stage, Demo, DemoStatus } from "./types";

/**
 * Template for a future track. Copy this shape into its own module, fill in
 * `stages`, flip `status` to "available", and register it in `demos` below.
 */
const comingSoonDemo: Demo = {
  slug: "ai-observability",
  badge: "Track 03",
  title: "AI Observability",
  tagline: "Monitor, evaluate, and trace AI systems in production.",
  description:
    "A future track covering evaluation harnesses, prompt/response tracing, token and cost telemetry, and content-safety monitoring for AI-powered features.",
  audience: "SRE and ML engineers running AI features in production.",
  outcome: "Planned track",
  status: "coming-soon",
  stages: [],
};

export const demos: Demo[] = [
  aiSdlcDemo,
  deploymentPatternsDemo,
  comingSoonDemo,
];

/** Demos that are ready to explore (have stages). */
export const availableDemos: Demo[] = demos.filter(
  (d) => d.status === "available",
);

export function getDemo(slug: string): Demo | undefined {
  return demos.find((d) => d.slug === slug);
}

export interface StageLocation {
  demo: Demo;
  stage: Stage;
}

export function getStage(
  demoSlug: string,
  stageSlug: string,
): StageLocation | undefined {
  const demo = getDemo(demoSlug);
  const stage = demo?.stages.find((s) => s.slug === stageSlug);
  if (!demo || !stage) return undefined;
  return { demo, stage };
}

export function getAdjacentStages(
  demoSlug: string,
  stageSlug: string,
): { prev: Stage | null; next: Stage | null } {
  const demo = getDemo(demoSlug);
  if (!demo) return { prev: null, next: null };
  const idx = demo.stages.findIndex((s) => s.slug === stageSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? demo.stages[idx - 1] : null,
    next: idx < demo.stages.length - 1 ? demo.stages[idx + 1] : null,
  };
}

/** Path to a stage page. */
export function stagePath(demoSlug: string, stageSlug: string): string {
  return `/demos/${demoSlug}/${stageSlug}`;
}

/** Path to the first stage of a demo (its entry point). */
export function demoStartPath(demo: Demo): string {
  return demo.stages.length > 0
    ? stagePath(demo.slug, demo.stages[0].slug)
    : "/";
}

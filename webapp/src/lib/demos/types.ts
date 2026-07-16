/**
 * Shared content types for the interactive demo tracks.
 *
 * A "demo" (also called a track) is a self-contained walkthrough made up of
 * ordered stages. Each stage pairs a human prompt with a rich AI response so
 * students can see how AI accelerates a specific phase of work.
 */

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; items: string[] }
  | { type: "checklist"; items: Array<{ checked: boolean; text: string }> }
  | { type: "callout"; variant: "info" | "success" | "warning"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface Stage {
  slug: string;
  number: number;
  name: string;
  tagline: string;
  summary: string;
  challenge: string;
  impact: string;
  timeSaved: string;
  humanPrompt: string;
  aiResponse: ContentBlock[];
}

export type DemoStatus = "available" | "coming-soon";

export interface Demo {
  /** URL-safe identifier used in `/demos/<slug>` routes. */
  slug: string;
  /** Short label shown on badges and pills, e.g. "Track 01". */
  badge: string;
  /** Display title, e.g. "AI-Powered SDLC". */
  title: string;
  /** One-line hook describing the track. */
  tagline: string;
  /** Longer paragraph describing what the track covers. */
  description: string;
  /** Who the track is aimed at. */
  audience: string;
  /** Headline outcome, e.g. estimated time saved end-to-end. */
  outcome: string;
  /** Whether the track is ready to explore or a future stub. */
  status: DemoStatus;
  /** Ordered stages that make up the track. Empty for stubs. */
  stages: Stage[];
}

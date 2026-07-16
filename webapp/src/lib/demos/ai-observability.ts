/**
 * Stage content definitions for the AI Observability demo.
 *
 * Each stage shows how AI helps teams monitor, evaluate, and trace AI-powered
 * features once they are running in production — from building evaluation
 * harnesses to tracing prompts, tracking token spend, and guarding against
 * unsafe content.
 */

import type { Demo, Stage } from "./types";

const stages: Stage[] = [
  // ─── 1. EVALUATE ────────────────────────────────────────────────────────────
  {
    slug: "evaluate",
    number: 1,
    name: "Evaluate",
    tagline: "Turn gut-feel prompt tweaks into measurable quality scores.",
    summary:
      "Before you can improve an AI feature you have to measure it. AI helps assemble an evaluation harness — a labelled dataset, graded metrics, and an automated scorer — so every prompt change is validated against real examples instead of vibes.",
    challenge:
      "The team ships prompt changes for TaskFlow's AI assistant with no way to tell whether quality went up or down. Regressions only surface when a customer complains.",
    impact: "Replaced manual spot-checking with an automated eval suite",
    timeSaved: "~10 hours",
    humanPrompt: `Our TaskFlow assistant summarises a task thread into a short status update.
We keep tweaking the prompt but have no idea if quality is improving.

Please help me build an evaluation harness:
1. Define quality metrics for a summary
2. Suggest a labelled eval dataset structure
3. Write an automated LLM-as-judge scorer we can run in CI`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Evaluation Harness for the Summary Assistant",
      },
      {
        type: "heading",
        level: 3,
        text: "Quality Metrics",
      },
      {
        type: "table",
        headers: ["Metric", "Scale", "What it measures"],
        rows: [
          ["Faithfulness", "0–1", "Summary contains no facts absent from the thread"],
          ["Coverage", "0–1", "Key decisions and blockers are captured"],
          ["Conciseness", "0–1", "Under 60 words, no redundant phrasing"],
          ["Tone", "pass/fail", "Neutral, professional status-update voice"],
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Labelled Eval Dataset",
      },
      {
        type: "paragraph",
        text: "Store a versioned JSONL file so cases are reviewable in pull requests and grow over time. Each row pairs an input with a reference answer and the traits a good summary must have.",
      },
      {
        type: "code",
        language: "json",
        code: `{
  "id": "eval-001",
  "input": "Thread: Auth flow broke on staging after the NextAuth bump...",
  "reference": "Auth is failing on staging after the NextAuth upgrade. Dana is rolling back to 4.24 and will re-test tonight.",
  "must_include": ["staging", "rollback", "owner: Dana"],
  "must_not_include": ["production outage"]
}`,
      },
      {
        type: "heading",
        level: 3,
        text: "LLM-as-Judge Scorer",
      },
      {
        type: "code",
        language: "typescript",
        code: `// eval/score.ts — run in CI on every prompt change
import { readFileSync } from "node:fs";
import { judge } from "./judge"; // wraps a low-temperature model call

interface EvalCase {
  id: string;
  input: string;
  reference: string;
  must_include: string[];
  must_not_include: string[];
}

const cases: EvalCase[] = readFileSync("eval/dataset.jsonl", "utf8")
  .trim()
  .split("\\n")
  .map((line) => JSON.parse(line));

let total = 0;
for (const c of cases) {
  const summary = await runAssistant(c.input);
  const { faithfulness, coverage, conciseness, tone } = await judge({
    input: c.input,
    reference: c.reference,
    candidate: summary,
    mustInclude: c.must_include,
    mustNotInclude: c.must_not_include,
  });
  const score = (faithfulness + coverage + conciseness) / 3;
  total += tone === "pass" ? score : 0;
  console.log(\`\${c.id}: \${score.toFixed(2)} (tone: \${tone})\`);
}

const avg = total / cases.length;
console.log(\`\\nAverage score: \${avg.toFixed(3)}\`);
process.exit(avg >= 0.8 ? 0 : 1); // fail the build on regressions`,
      },
      {
        type: "callout",
        variant: "success",
        text: "Wire the scorer into CI with a 0.80 threshold. Prompt changes now come with a pass/fail signal, and the eval dataset becomes a living regression suite.",
      },
    ],
  },

  // ─── 2. TRACE ───────────────────────────────────────────────────────────────
  {
    slug: "trace",
    number: 2,
    name: "Trace",
    tagline: "See the full prompt, context, and response behind every call.",
    summary:
      "When an AI feature misbehaves, aggregate metrics are not enough — you need the exact prompt, retrieved context, model parameters, and response for the failing request. AI helps instrument prompt/response tracing so every call is reproducible.",
    challenge:
      "A user reports the assistant hallucinated a due date. With no per-request trace, the team cannot see what context the model was given or reproduce the failure.",
    impact: "Made every AI call reproducible and debuggable",
    timeSaved: "~8 hours",
    humanPrompt: `We need to debug bad AI responses in production but we only log the final text.
Add end-to-end tracing so I can inspect the exact prompt, retrieved context,
model settings, latency, and response for any request.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Prompt / Response Tracing",
      },
      {
        type: "paragraph",
        text: "Use OpenTelemetry spans so traces flow into the same backend as the rest of your service telemetry. Capture one span per AI call with the inputs, outputs, and metadata attached as attributes.",
      },
      {
        type: "code",
        language: "typescript",
        code: `import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("taskflow-ai");

export async function tracedSummarise(threadId: string, context: string[]) {
  return tracer.startActiveSpan("ai.summarise", async (span) => {
    const prompt = buildPrompt(context);
    span.setAttributes({
      "ai.request.id": crypto.randomUUID(),
      "ai.thread.id": threadId,
      "ai.model": "gpt-4o-mini",
      "ai.temperature": 0.2,
      "ai.prompt.tokens": estimateTokens(prompt),
      "ai.context.doc_count": context.length,
      "ai.prompt": prompt.slice(0, 8000), // redact PII before storing
    });
    try {
      const started = performance.now();
      const res = await model.complete(prompt, { temperature: 0.2 });
      span.setAttributes({
        "ai.response": res.text,
        "ai.completion.tokens": res.usage.completion_tokens,
        "ai.latency_ms": Math.round(performance.now() - started),
      });
      return res.text;
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      throw err;
    } finally {
      span.end();
    }
  });
}`,
      },
      {
        type: "heading",
        level: 3,
        text: "What each trace lets you answer",
      },
      {
        type: "list",
        items: [
          "Which retrieved documents were actually in the context window?",
          "What temperature and model version produced this answer?",
          "How long did retrieval vs. generation take?",
          "Can I replay this exact prompt to reproduce the bug?",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Prompts and responses can contain personal data. Redact or hash PII before persisting spans, and set a short retention window on trace payloads.",
      },
    ],
  },

  // ─── 3. METER ───────────────────────────────────────────────────────────────
  {
    slug: "meter",
    number: 3,
    name: "Meter",
    tagline: "Attribute every token and dollar back to a feature and user.",
    summary:
      "Token usage is the unit economics of AI features. AI helps build cost telemetry that rolls token counts into dollar estimates, breaks spend down by feature and tenant, and alerts before a runaway prompt blows the budget.",
    challenge:
      "The monthly model bill doubled with no explanation. Finance wants spend attributed per feature, and engineering needs an alert before the next surprise invoice.",
    impact: "Gave every team real-time visibility into AI spend",
    timeSaved: "~6 hours",
    humanPrompt: `Our model spend is unpredictable. Help me instrument token and cost telemetry:
1. Record prompt + completion tokens per request
2. Convert tokens to a dollar estimate by model
3. Break spend down by feature and tenant
4. Alert when daily spend crosses a threshold`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Token & Cost Telemetry",
      },
      {
        type: "heading",
        level: 3,
        text: "Emit a usage metric per request",
      },
      {
        type: "code",
        language: "typescript",
        code: `import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("taskflow-ai");
const tokenCounter = meter.createCounter("ai.tokens", { unit: "token" });
const costCounter = meter.createCounter("ai.cost_usd", { unit: "usd" });

// Per-1K-token pricing kept in one place so it is auditable.
const PRICING: Record<string, { in: number; out: number }> = {
  "gpt-4o-mini": { in: 0.00015, out: 0.0006 },
  "gpt-4o": { in: 0.005, out: 0.015 },
};

export function recordUsage(opts: {
  model: string;
  feature: string;
  tenant: string;
  promptTokens: number;
  completionTokens: number;
}) {
  const price = PRICING[opts.model];
  const cost =
    (opts.promptTokens / 1000) * price.in +
    (opts.completionTokens / 1000) * price.out;
  const dims = { model: opts.model, feature: opts.feature, tenant: opts.tenant };
  tokenCounter.add(opts.promptTokens + opts.completionTokens, dims);
  costCounter.add(cost, dims);
}`,
      },
      {
        type: "heading",
        level: 3,
        text: "Spend breakdown",
      },
      {
        type: "table",
        headers: ["Feature", "Model", "Tokens / day", "Est. cost / day"],
        rows: [
          ["Thread summariser", "gpt-4o-mini", "4.2M", "$1.85"],
          ["Task auto-tagging", "gpt-4o-mini", "1.1M", "$0.42"],
          ["Weekly digest", "gpt-4o", "0.6M", "$5.40"],
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Budget alert",
      },
      {
        type: "code",
        language: "yaml",
        code: `# alerts/ai-spend.yaml
- alert: DailyAISpendHigh
  expr: sum(increase(ai_cost_usd_total[1d])) > 25
  for: 5m
  labels: { severity: warning }
  annotations:
    summary: "AI spend exceeded $25/day"
    description: "Check the ai.cost_usd metric grouped by feature and tenant."`,
      },
      {
        type: "callout",
        variant: "info",
        text: "Because usage is tagged by feature and tenant, the same metric powers finance chargeback, per-customer cost limits, and the anomaly alert — no extra plumbing.",
      },
    ],
  },

  // ─── 4. GUARD ───────────────────────────────────────────────────────────────
  {
    slug: "guard",
    number: 4,
    name: "Guard",
    tagline: "Catch unsafe prompts and responses before users see them.",
    summary:
      "Production AI needs a safety net. AI helps add content-safety monitoring that screens inputs and outputs, blocks or flags unsafe content, and feeds violations into dashboards and alerts so the team can respond to abuse trends.",
    challenge:
      "A jailbreak prompt coaxed the assistant into producing toxic output. There is no automated screening and no record of how often unsafe content slips through.",
    impact: "Added automated safety screening with an audit trail",
    timeSaved: "~9 hours",
    humanPrompt: `We had a jailbreak incident. Add content-safety monitoring:
1. Screen user input and model output for unsafe categories
2. Block or flag violations with a clear policy
3. Record every violation so we can watch trends and alert on spikes`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Content-Safety Monitoring",
      },
      {
        type: "heading",
        level: 3,
        text: "Screen input and output",
      },
      {
        type: "code",
        language: "typescript",
        code: `import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("taskflow-ai");
const violations = meter.createCounter("ai.safety.violations");

type Category = "hate" | "harassment" | "self_harm" | "sexual" | "violence";
const BLOCK_THRESHOLD = 0.8;

export async function guardedComplete(input: string, ctx: { userId: string }) {
  const inputScan = await moderate(input);
  if (isUnsafe(inputScan)) {
    record("input", inputScan, ctx.userId);
    throw new SafetyError("Input violated content policy");
  }

  const output = await model.complete(buildPrompt(input));

  const outputScan = await moderate(output.text);
  if (isUnsafe(outputScan)) {
    record("output", outputScan, ctx.userId);
    return SAFE_FALLBACK; // never surface the unsafe text
  }
  return output.text;
}

function isUnsafe(scan: Record<Category, number>) {
  return Object.values(scan).some((score) => score >= BLOCK_THRESHOLD);
}

function record(stage: "input" | "output", scan: Record<Category, number>, userId: string) {
  const category = topCategory(scan);
  violations.add(1, { stage, category });
  logger.warn("safety.violation", { stage, category, userId }); // for audit trail
}`,
      },
      {
        type: "heading",
        level: 3,
        text: "Policy",
      },
      {
        type: "table",
        headers: ["Category", "Score ≥ 0.8", "Score 0.5–0.8"],
        rows: [
          ["Hate / harassment", "Block + log", "Flag for review"],
          ["Self-harm", "Block + safe resources", "Flag for review"],
          ["Sexual / violence", "Block + log", "Flag for review"],
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Spike alert",
      },
      {
        type: "code",
        language: "yaml",
        code: `# alerts/ai-safety.yaml
- alert: SafetyViolationSpike
  expr: sum(increase(ai_safety_violations_total[15m])) > 20
  for: 5m
  labels: { severity: critical }
  annotations:
    summary: "Unusual spike in content-safety violations"
    description: "Possible coordinated abuse or jailbreak attempt — review the ai.safety.violations metric by category."`,
      },
      {
        type: "checklist",
        items: [
          { checked: true, text: "Inputs and outputs screened before reaching users" },
          { checked: true, text: "Unsafe responses replaced with a safe fallback" },
          { checked: true, text: "Every violation logged for audit and trend analysis" },
          { checked: true, text: "Alert fires on abnormal violation spikes" },
        ],
      },
      {
        type: "callout",
        variant: "success",
        text: "Evaluate, trace, meter, and guard together give you a full observability loop: you can measure quality, reproduce failures, control cost, and keep the experience safe in production.",
      },
    ],
  },
];

export const aiObservabilityDemo: Demo = {
  slug: "ai-observability",
  badge: "Track 03",
  title: "AI Observability",
  tagline: "Monitor, evaluate, and trace AI systems in production.",
  description:
    "A track covering evaluation harnesses, prompt/response tracing, token and cost telemetry, and content-safety monitoring for AI-powered features.",
  audience: "SRE and ML engineers running AI features in production.",
  outcome: "~33 hours saved standing up AI observability",
  status: "available",
  stages,
};

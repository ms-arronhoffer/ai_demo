/**
 * Azure-backed agent runtime for the Live Agent Playground.
 *
 * All interactive LLM calls are served by Azure OpenAI. The model and endpoint
 * come from environment variables (see .env.example) and requests authenticate
 * with Microsoft Entra ID rather than an API key: a bearer token is acquired
 * from the app's Azure **managed identity**, so no Azure OpenAI secret lives in
 * the codebase or the environment. This module also hosts a small, in-memory
 * TaskFlow dataset and a `query_tasks` tool the agent can call — the "hands"
 * that turn a chat model into an agent.
 *
 * This file is server-only. It must never be imported into a client component.
 */

import "server-only";
import {
  DefaultAzureCredential,
  ManagedIdentityCredential,
  getBearerTokenProvider,
  type TokenCredential,
} from "@azure/identity";

/** Entra scope for data-plane access to Azure Cognitive Services / OpenAI. */
const AZURE_OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
  tool_calls?: ToolCall[];
}

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

/** A single observable event in an agent run, streamed to the client. */
export type AgentEvent =
  | { type: "step"; kind: "reason" | "tool" | "observe"; title: string; detail: string }
  | { type: "answer"; text: string }
  | { type: "usage"; promptTokens: number; completionTokens: number }
  | { type: "error"; message: string };

export interface AzureConfig {
  endpoint: string;
  deployment: string;
  apiVersion: string;
}

/** Reads Azure OpenAI configuration from the environment, if fully present. */
export function getAzureConfig(): AzureConfig | null {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";
  if (!endpoint || !deployment) return null;
  return {
    endpoint: endpoint.replace(/\/$/, ""),
    deployment,
    apiVersion,
  };
}

export function azureConfigured(): boolean {
  return getAzureConfig() !== null;
}

/**
 * Lazily-created provider that returns a cached Microsoft Entra ID bearer token
 * for Azure OpenAI, refreshing it automatically before expiry. Using a token
 * provider (rather than an API key) means access is governed by the app's Entra
 * identity — a managed identity in Azure — with no secret to store.
 *
 * Credential selection:
 *   - If `AZURE_MANAGED_IDENTITY_CLIENT_ID` is set, a **user-assigned** managed
 *     identity with that client id is used.
 *   - Otherwise `DefaultAzureCredential` is used, which picks up the host's
 *     **system-assigned** managed identity when running in Azure. (It does not
 *     rely on `az login`, which is unavailable on locked-down hosts.)
 */
let bearerTokenProvider: (() => Promise<string>) | null = null;

function createCredential(): TokenCredential {
  const clientId = process.env.AZURE_MANAGED_IDENTITY_CLIENT_ID;
  if (clientId) {
    return new ManagedIdentityCredential({ clientId });
  }
  return new DefaultAzureCredential();
}

function getBearerToken(): Promise<string> {
  if (!bearerTokenProvider) {
    bearerTokenProvider = getBearerTokenProvider(
      createCredential(),
      AZURE_OPENAI_SCOPE,
    );
  }
  return bearerTokenProvider();
}

// ── TaskFlow dataset + tool ──────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  owner: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  blocked_reason?: string;
}

const TASKS: Task[] = [
  { id: "TF-482", title: "Billing export", owner: "Priya", status: "blocked", blocked_reason: "waiting on finance API key" },
  { id: "TF-491", title: "SSO rollout", owner: "Marco", status: "blocked", blocked_reason: "pending security review" },
  { id: "TF-503", title: "Mobile deep links", owner: "Priya", status: "blocked", blocked_reason: "needs design sign-off" },
  { id: "TF-465", title: "Task search", owner: "Dana", status: "in_progress" },
  { id: "TF-470", title: "Audit log viewer", owner: "Marco", status: "in_progress" },
  { id: "TF-451", title: "Dark mode", owner: "Dana", status: "done" },
  { id: "TF-510", title: "Bulk import CSV", owner: "Priya", status: "todo" },
];

const QUERY_TASKS_TOOL = {
  type: "function" as const,
  function: {
    name: "query_tasks",
    description:
      "Query the TaskFlow task list. Optionally filter by status and/or owner. Returns matching tasks.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["todo", "in_progress", "blocked", "done"],
          description: "Only return tasks with this status.",
        },
        owner: {
          type: "string",
          description: "Only return tasks owned by this person (first name).",
        },
      },
      additionalProperties: false,
    },
  },
};

interface QueryArgs {
  status?: Task["status"];
  owner?: string;
}

function runQueryTasks(rawArgs: string): { rows: Task[]; summary: string } {
  let args: QueryArgs = {};
  try {
    args = JSON.parse(rawArgs || "{}") as QueryArgs;
  } catch {
    args = {};
  }
  const rows = TASKS.filter((t) => {
    if (args.status && t.status !== args.status) return false;
    if (args.owner && t.owner.toLowerCase() !== args.owner.toLowerCase())
      return false;
    return true;
  });
  const parts: string[] = [];
  if (args.status) parts.push(`status=${args.status}`);
  if (args.owner) parts.push(`owner=${args.owner}`);
  const summary = `query_tasks(${parts.join(", ") || "all"}) → ${rows.length} row(s)`;
  return { rows, summary };
}

const SYSTEM_PROMPT = `You are the TaskFlow assistant, an agent that answers questions about a task-tracking app.
You can call the query_tasks tool to read live task data. Prefer calling the tool over guessing.
When you have the data you need, answer concisely and cite task IDs (e.g. TF-482). Do not invent tasks.`;

const MAX_STEPS = 4;

interface AzureChoiceMessage {
  role: "assistant";
  content: string | null;
  tool_calls?: ToolCall[];
}

interface AzureResponse {
  choices: Array<{ message: AzureChoiceMessage; finish_reason: string }>;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

async function callAzure(
  cfg: AzureConfig,
  messages: ChatMessage[],
): Promise<AzureResponse> {
  const url = `${cfg.endpoint}/openai/deployments/${cfg.deployment}/chat/completions?api-version=${cfg.apiVersion}`;
  const token = await getBearerToken();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      messages,
      tools: [QUERY_TASKS_TOOL],
      tool_choice: "auto",
      temperature: 0.2,
      max_tokens: 600,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Azure OpenAI request failed (${res.status}). ${body.slice(0, 300)}`,
    );
  }
  return (await res.json()) as AzureResponse;
}

/**
 * Runs the reason → act → observe loop for a single user turn against Azure
 * OpenAI, yielding observable events as it goes.
 */
export async function* runAgent(
  userMessages: ChatMessage[],
): AsyncGenerator<AgentEvent> {
  const cfg = getAzureConfig();
  if (!cfg) {
    yield { type: "error", message: "Azure OpenAI is not configured." };
    return;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...userMessages,
  ];

  let promptTokens = 0;
  let completionTokens = 0;

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const resp = await callAzure(cfg, messages);
      promptTokens += resp.usage?.prompt_tokens ?? 0;
      completionTokens += resp.usage?.completion_tokens ?? 0;

      const choice = resp.choices[0]?.message;
      if (!choice) {
        yield { type: "error", message: "Empty response from Azure OpenAI." };
        return;
      }

      const toolCalls = choice.tool_calls ?? [];
      if (toolCalls.length > 0) {
        // Record the assistant's tool-calling turn.
        messages.push({
          role: "assistant",
          content: choice.content ?? "",
          tool_calls: toolCalls,
        });
        if (choice.content) {
          yield {
            type: "step",
            kind: "reason",
            title: "Plan the approach",
            detail: choice.content,
          };
        }
        for (const call of toolCalls) {
          yield {
            type: "step",
            kind: "tool",
            title: `Call ${call.function.name}`,
            detail: call.function.arguments || "{}",
          };
          const { rows, summary } = runQueryTasks(call.function.arguments);
          yield {
            type: "step",
            kind: "observe",
            title: "Observe tool result",
            detail: summary,
          };
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            name: call.function.name,
            content: JSON.stringify(rows),
          });
        }
        continue;
      }

      // No tool call → this is the final answer.
      yield { type: "answer", text: choice.content ?? "" };
      yield { type: "usage", promptTokens, completionTokens };
      return;
    }
    yield {
      type: "error",
      message: "The agent reached its step limit without finishing.",
    };
  } catch (err) {
    yield {
      type: "error",
      message: err instanceof Error ? err.message : "Unknown error.",
    };
  }
}

import { auth } from "@/auth";
import { entraConfigured, isApproved } from "@/lib/access";
import { azureConfigured, runAgent, type ChatMessage } from "@/lib/azure";

export const runtime = "nodejs";

/**
 * Reports the readiness of the live playground so the client can render an
 * accurate state (configured? signed in? approved?) without attempting a run.
 */
export async function GET(): Promise<Response> {
  const entra = entraConfigured();
  const azure = azureConfigured();
  const session = entra ? await auth() : null;
  const authenticated = !!session?.user;
  const oid = (session?.user as { oid?: string | null } | undefined)?.oid ?? null;
  const approved = authenticated && isApproved(session?.user?.email, oid);
  return Response.json({
    entra,
    azure,
    authenticated,
    approved,
    user: authenticated
      ? { name: session?.user?.name ?? null, email: session?.user?.email ?? null }
      : null,
  });
}

interface ChatRequestBody {
  messages?: Array<{ role: string; content: unknown }>;
}

const MAX_MESSAGES = 20;
const MAX_CHARS = 4000;

/** Normalises and validates the incoming conversation. */
function sanitizeMessages(body: ChatRequestBody): ChatMessage[] | null {
  if (!Array.isArray(body.messages) || body.messages.length === 0) return null;
  const messages = body.messages.slice(-MAX_MESSAGES);
  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") return null;
    if (typeof m.content !== "string") return null;
    const content = m.content.trim();
    if (!content) continue;
    out.push({ role: m.role, content: content.slice(0, MAX_CHARS) });
  }
  return out.length > 0 ? out : null;
}

export async function POST(req: Request): Promise<Response> {
  // 1. Require Microsoft Entra sign-in.
  if (!entraConfigured()) {
    return Response.json(
      { error: "sign_in_unavailable", message: "Entra sign-in is not configured." },
      { status: 503 },
    );
  }
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { error: "unauthenticated", message: "Sign in with Microsoft to continue." },
      { status: 401 },
    );
  }

  // 2. Require the signed-in user to be an approved individual.
  const oid = (session.user as { oid?: string | null }).oid ?? null;
  if (!isApproved(session.user.email, oid)) {
    return Response.json(
      { error: "forbidden", message: "Your account is not approved for the live playground." },
      { status: 403 },
    );
  }

  // 3. Require the Azure OpenAI backend to be configured.
  if (!azureConfigured()) {
    return Response.json(
      { error: "backend_unavailable", message: "The Azure OpenAI backend is not configured." },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const messages = sanitizeMessages(body);
  if (!messages) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // 4. Stream the agent run as newline-delimited JSON events.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of runAgent(messages)) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error.";
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", message }) + "\n"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

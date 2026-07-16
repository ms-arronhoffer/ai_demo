"use client";

import { signIn, signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Live Agent Playground.
 *
 * A real, interactive chat panel wired to an Azure OpenAI backend through the
 * gated `/api/chat` route. Access requires a Microsoft Entra sign-in *and*
 * membership of the approved-users allowlist — the LLM is never called for
 * anyone else. The panel streams the agent's reason → tool → observe → answer
 * loop as it happens.
 *
 * When the backend or sign-in is not configured, the panel degrades gracefully
 * into an explanatory state instead of failing.
 */

interface Status {
  entra: boolean;
  azure: boolean;
  authenticated: boolean;
  approved: boolean;
  user: { name: string | null; email: string | null } | null;
}

type StepKind = "reason" | "tool" | "observe";

interface RunStep {
  kind: StepKind;
  title: string;
  detail: string;
}

const SAMPLE_PROMPTS = [
  "Which tasks are blocked, and who owns them?",
  "What is Priya working on?",
  "How many tasks are still in progress?",
];

const STEP_META: Record<StepKind, { label: string; badge: string }> = {
  reason: { label: "Reason", badge: "bg-navy/5 text-navy ring-navy/10" },
  tool: { label: "Tool call", badge: "bg-gold/10 text-gold ring-gold/20" },
  observe: {
    label: "Observe",
    badge: "bg-navy-light/10 text-navy-light ring-navy-light/20",
  },
};

export default function LiveAgentPlayground() {
  const [status, setStatus] = useState<Status | null>(null);
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<RunStep[]>([]);
  const [answer, setAnswer] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { method: "GET" });
      return (await res.json()) as Status;
    } catch {
      return {
        entra: false,
        azure: false,
        authenticated: false,
        approved: false,
        user: null,
      } as Status;
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/chat", { method: "GET" })
      .then((r) => r.json())
      .then((d: Status) => {
        if (active) setStatus(d);
      })
      .catch(() => {
        if (active)
          setStatus({
            entra: false,
            azure: false,
            authenticated: false,
            approved: false,
            user: null,
          });
      });
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(
    async (prompt: string) => {
      const question = prompt.trim();
      if (!question || running) return;
      setRunning(true);
      setError(null);
      setSteps([]);
      setAnswer("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
            error?: string;
          };
          if (res.status === 401) {
            setError("Please sign in with Microsoft to run the live agent.");
          } else if (res.status === 403) {
            setError(
              data.message ??
                "Your account is not on the approved list for the live playground.",
            );
          } else if (res.status === 503) {
            setError(
              data.message ??
                "The live backend is not configured in this environment.",
            );
          } else {
            setError(data.message ?? "The request could not be completed.");
          }
          setStatus(await loadStatus());
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setError("Streaming is not supported in this browser.");
          return;
        }
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            handleEvent(line);
          }
        }
        if (buffer.trim()) handleEvent(buffer);
      } catch {
        setError("A network error interrupted the run.");
      } finally {
        setRunning(false);
      }
    },
    [running, loadStatus],
  );

  function handleEvent(line: string) {
    let evt: Record<string, unknown>;
    try {
      evt = JSON.parse(line) as Record<string, unknown>;
    } catch {
      return;
    }
    if (evt.type === "step") {
      setSteps((prev) => [
        ...prev,
        {
          kind: evt.kind as StepKind,
          title: String(evt.title ?? ""),
          detail: String(evt.detail ?? ""),
        },
      ]);
    } else if (evt.type === "answer") {
      setAnswer(String(evt.text ?? ""));
    } else if (evt.type === "error") {
      setError(String(evt.message ?? "The agent reported an error."));
    }
  }

  useEffect(() => {
    answerRef.current?.scrollTo({ top: answerRef.current.scrollHeight });
  }, [answer, steps]);

  // ── Not-configured / sign-in states ──
  const notConfigured = status && (!status.entra || !status.azure);
  const needsSignIn = status && status.entra && !status.authenticated;
  const notApproved =
    status && status.authenticated && !status.approved;

  return (
    <div className="rounded-xl border border-cream-dark bg-white shadow-sm overflow-hidden">
      {/* Header / auth bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-dark bg-cream-dark/40 px-4 py-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-mid">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${
                status?.approved ? "animate-ping bg-green-500 opacity-60" : ""
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                status?.approved ? "bg-green-500" : "bg-slate-mid/40"
              }`}
            />
          </span>
          Live Agent · Azure OpenAI
        </span>
        {status?.authenticated ? (
          <span className="flex items-center gap-3 text-xs text-slate-mid">
            <span className="truncate max-w-[180px]">
              {status.user?.name ?? status.user?.email ?? "Signed in"}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded border border-cream-dark px-2 py-1 font-medium text-navy hover:border-navy/30"
            >
              Sign out
            </button>
          </span>
        ) : status?.entra ? (
          <button
            type="button"
            onClick={() => void signIn("microsoft-entra-id")}
            className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-white ring-1 ring-navy/10 transition-colors hover:bg-navy-mid"
          >
            Sign in with Microsoft
          </button>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-4">
        {notConfigured ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Live backend not configured here</p>
            <p className="mt-1 leading-relaxed">
              This deployment has not set the Microsoft Entra and Azure OpenAI
              environment variables, so the live agent is unavailable. The
              deterministic Agent Trace visualiser on the other stages still
              works. See <code className="font-mono">.env.example</code> to
              enable the live playground.
            </p>
          </div>
        ) : notApproved ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Signed in, but not yet approved</p>
            <p className="mt-1 leading-relaxed">
              LLM usage is limited to approved individuals. Ask an administrator
              to add your account to <code className="font-mono">ALLOWED_USERS</code>.
            </p>
          </div>
        ) : (
          <>
            {/* Prompt input */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void run(input);
                }}
                placeholder="Ask the TaskFlow agent…"
                disabled={running || !!needsSignIn}
                className="flex-1 rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-navy/40 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void run(input)}
                disabled={running || !input.trim() || !!needsSignIn}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white ring-1 ring-navy/10 transition-colors hover:bg-navy-mid disabled:opacity-50"
              >
                {running ? "Running…" : "Run agent"}
              </button>
            </div>

            {/* Sample prompts */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setInput(p);
                    void run(p);
                  }}
                  disabled={running || !!needsSignIn}
                  className="rounded-full border border-cream-dark px-2.5 py-1 text-xs text-slate-mid transition-colors hover:border-navy/30 hover:text-navy disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>

            {needsSignIn && (
              <p className="mt-3 text-xs text-slate-mid">
                Sign in with your approved Microsoft account to run the agent.
              </p>
            )}

            {error && (
              <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Trace + answer */}
            {(steps.length > 0 || answer || running) && (
              <div ref={answerRef} className="mt-4 max-h-80 overflow-auto">
                {steps.length > 0 && (
                  <ol className="space-y-2">
                    {steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${STEP_META[s.kind].badge}`}
                        >
                          {STEP_META[s.kind].label}
                        </span>
                        <span className="min-w-0">
                          <span className="text-sm font-medium text-navy">
                            {s.title}
                          </span>
                          <pre className="mt-0.5 whitespace-pre-wrap break-words font-mono text-[11px] text-slate-mid">
                            {s.detail}
                          </pre>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                {answer && (
                  <div className="mt-3 rounded-lg border border-gold/30 bg-cream p-3">
                    <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-gold">
                      Grounded answer
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-charcoal/90">
                      {answer}
                    </p>
                  </div>
                )}

                {running && !answer && (
                  <p className="mt-3 text-xs text-slate-mid">
                    The agent is thinking…
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

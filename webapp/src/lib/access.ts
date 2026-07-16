/**
 * Access control for the live, LLM-backed interactive elements.
 *
 * LLM usage is deliberately restricted to *approved individuals*. Approval is
 * expressed as an allowlist of Microsoft Entra identities (email / UPN or the
 * stable object id) in the `ALLOWED_USERS` environment variable, comma
 * separated. The list is evaluated case-insensitively.
 *
 * Security posture: fail closed. If no allowlist is configured, nobody is
 * approved — an administrator must explicitly add approved users. This keeps
 * an unconfigured or misconfigured deployment from silently granting LLM
 * access (and therefore spend) to everyone in the tenant.
 */

function parseAllowList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Identities explicitly approved to use the live LLM features. */
export function allowedIdentities(): string[] {
  return parseAllowList(process.env.ALLOWED_USERS);
}

/**
 * Returns true when at least one of the supplied identities (e.g. email/UPN
 * and object id) is on the approval allowlist.
 */
export function isApproved(...identities: Array<string | null | undefined>): boolean {
  const allow = allowedIdentities();
  if (allow.length === 0) return false; // fail closed
  return identities.some(
    (id) => !!id && allow.includes(id.trim().toLowerCase()),
  );
}

/** Whether Microsoft Entra sign-in is configured for this deployment. */
export function entraConfigured(): boolean {
  return (
    !!process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    !!process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET
  );
}

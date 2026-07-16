import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { entraConfigured, isApproved } from "@/lib/access";

/**
 * Authentication for the live playground.
 *
 * Sign-in is handled by Microsoft Entra ID (Azure AD). Only individuals on the
 * `ALLOWED_USERS` allowlist are permitted to complete sign-in — the `signIn`
 * callback rejects everyone else, so unapproved tenant members cannot reach the
 * LLM-backed endpoints even after authenticating with a valid Microsoft account.
 *
 * The Entra provider is only registered when its credentials are present, so an
 * unconfigured deployment still builds and runs (with the live features simply
 * reporting that sign-in is unavailable).
 */

interface EntraProfile {
  email?: string;
  preferred_username?: string;
  upn?: string;
  oid?: string;
  sub?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: entraConfigured() ? [MicrosoftEntraID] : [],
  callbacks: {
    signIn({ profile }) {
      const p = (profile ?? {}) as EntraProfile;
      const email = p.email ?? p.preferred_username ?? p.upn ?? null;
      const oid = p.oid ?? p.sub ?? null;
      // Only approved individuals may complete sign-in.
      return isApproved(email, oid);
    },
    jwt({ token, profile }) {
      if (profile) {
        const p = profile as EntraProfile;
        token.oid = p.oid ?? p.sub ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { oid?: string | null }).oid =
          (token.oid as string | null) ?? null;
      }
      return session;
    },
  },
});

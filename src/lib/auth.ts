import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { ensureOpsUser } from "./provision";
import { prisma } from "./prisma";
import { SESSION_COOKIE, SESSION_SEEN_INTERVAL_MS } from "./session";

type OpsUser = NonNullable<Awaited<ReturnType<typeof ensureOpsUser>>>;

export type DeniedReason =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  // Signed in to Supabase, but this browser's console session was replaced by
  // a sign-in on another device.
  | "SESSION_REPLACED"
  // Signed in to Supabase, but no console session was started in this browser
  // (e.g. a sign-in that stopped at the "signed in elsewhere" prompt).
  | "SESSION_MISSING";

export type SessionCheck =
  | { status: "OK"; user: OpsUser }
  | { status: Exclude<DeniedReason, "FORBIDDEN"> };

// Resolves the signed-in ops user and checks that this browser holds the
// account's current console session.
export async function checkSession(): Promise<SessionCheck> {
  // Supabase not configured (local dev): no session to resolve.
  if (!isSupabaseConfigured) return { status: "UNAUTHENTICATED" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "UNAUTHENTICATED" };

  const email = user.email?.toLowerCase();
  if (!email) return { status: "UNAUTHENTICATED" };

  // Provision on first sign-in so authenticated users always resolve to a role.
  const name =
    (typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : null) ?? null;

  const opsUser = await ensureOpsUser({
    id: user.id,
    email,
    name,
    emailConfirmed: Boolean(user.email_confirmed_at),
  });
  if (!opsUser) return { status: "UNAUTHENTICATED" };

  const sid = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sid) return { status: "SESSION_MISSING" };
  if (sid !== opsUser.sessionId) return { status: "SESSION_REPLACED" };

  // Record activity so a sign-in elsewhere can tell this session is in use.
  const seen = opsUser.sessionSeenAt?.getTime() ?? 0;
  if (Date.now() - seen > SESSION_SEEN_INTERVAL_MS) {
    await prisma.opsUser.updateMany({
      where: { id: opsUser.id, sessionId: sid },
      data: { sessionSeenAt: new Date() },
    });
  }

  return { status: "OK", user: opsUser };
}

// Returns the current authenticated ops user (with role) or null.
export async function getCurrentOpsUser() {
  const session = await checkSession();
  return session.status === "OK" ? session.user : null;
}

// Role guard helper for server components / route handlers.
export async function requireRole(
  roles: string[]
): Promise<{ allowed: true; user: OpsUser } | { allowed: false; reason: DeniedReason }> {
  // No Supabase config means nobody can authenticate, so nobody gets in, in
  // every environment. (There used to be a dev-only bypass; it handed full
  // ADMIN access to anyone whenever NODE_ENV wasn't "production".)
  if (!isSupabaseConfigured) {
    return { allowed: false, reason: "UNAUTHENTICATED" };
  }

  const session = await checkSession();
  if (session.status !== "OK") return { allowed: false, reason: session.status };
  if (!roles.includes(session.user.role)) return { allowed: false, reason: "FORBIDDEN" };
  return { allowed: true, user: session.user };
}

// Where to send a page request that requireRole() denied. Redirecting to
// /login would loop: middleware bounces any signed-in user away from /login.
//  - UNAUTHENTICATED with a live Supabase session (unknown or deactivated
//    staff): end the session, then show the login notice.
//  - SESSION_REPLACED: end this browser's session and say another device
//    signed in. SESSION_MISSING: end it quietly.
//  - FORBIDDEN (staff without this page's role): their profile page, which every
//    staff role can open.
export function deniedPath(reason: DeniedReason): string {
  switch (reason) {
    case "FORBIDDEN":
      return "/operations/settings?denied=1";
    case "SESSION_REPLACED":
      return "/api/auth/logout?replaced=1";
    case "SESSION_MISSING":
      return "/api/auth/logout";
    default:
      return "/api/auth/logout?denied=1";
  }
}

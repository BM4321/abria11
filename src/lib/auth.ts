import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { ensureOpsUser } from "./provision";

// Returns the current authenticated ops user (with role) or null.
export async function getCurrentOpsUser() {
  // Supabase not configured (local dev): no session to resolve.
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = user.email?.toLowerCase();
  if (!email) return null;

  // Provision on first sign-in so authenticated users always resolve to a role.
  const name =
    (typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : null) ?? null;

  return ensureOpsUser({
    id: user.id,
    email,
    name,
    emailConfirmed: Boolean(user.email_confirmed_at),
  });
}

// Role guard helper for server components / route handlers.
export async function requireRole(roles: string[]) {
  // No Supabase config means nobody can authenticate, so nobody gets in, in
  // every environment. (There used to be a dev-only bypass; it handed full
  // ADMIN access to anyone whenever NODE_ENV wasn't "production".)
  if (!isSupabaseConfigured) {
    return { allowed: false, reason: "UNAUTHENTICATED" as const };
  }

  const opsUser = await getCurrentOpsUser();
  if (!opsUser) return { allowed: false, reason: "UNAUTHENTICATED" as const };
  if (!roles.includes(opsUser.role)) return { allowed: false, reason: "FORBIDDEN" as const };
  return { allowed: true as const, user: opsUser };
}

// Where to send a page request that requireRole() denied. Redirecting to
// /login would loop: middleware bounces any signed-in user away from /login.
//  - UNAUTHENTICATED with a live Supabase session (unknown or deactivated
//    staff): end the session, then show the login notice.
//  - FORBIDDEN (staff without this page's role): their profile page, which every
//    staff role can open.
export function deniedPath(reason: "UNAUTHENTICATED" | "FORBIDDEN"): string {
  return reason === "FORBIDDEN" ? "/operations/settings?denied=1" : "/api/auth/logout?denied=1";
}

"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ACTIVITY_COOKIE, ACTIVITY_COOKIE_MAX_AGE } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ensureOpsUser } from "@/lib/provision";
import { safeNextPath } from "@/lib/safe-redirect";

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // One message for unknown email and wrong password, so the form can't be
    // used to discover which addresses have accounts.
    const throttled = error.status === 429 || /rate limit|too many/i.test(error.message);
    return {
      error: throttled
        ? "Too many sign-in attempts. Please wait a few minutes and try again."
        : "Incorrect email or password.",
    };
  }

  // Resolve the staff record (and promote known admins) for this login.
  const name =
    (typeof data.user?.user_metadata?.name === "string"
      ? data.user.user_metadata.name
      : null) ?? null;
  const opsUser = await ensureOpsUser({
    id: data.user?.id ?? "",
    email: data.user?.email ?? email,
    name,
    emailConfirmed: Boolean(data.user?.email_confirmed_at),
  });

  // A valid Supabase login is not enough: only provisioned, active staff may
  // use the console. Drop the session so it can't be reused elsewhere.
  if (!opsUser) {
    await supabase.auth.signOut();
    return {
      error: "This account does not have access to the ABRIA console. Contact an administrator.",
    };
  }

  // Start the inactivity clock now. A leftover activity cookie from an earlier
  // session would otherwise make the middleware treat this brand-new session
  // as idle and sign it straight back out on the first console request.
  (await cookies()).set(ACTIVITY_COOKIE, String(Date.now()), {
    path: "/",
    maxAge: ACTIVITY_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  let destination = safeNextPath(next, "/operations/dashboard");
  if (!next && opsUser.role === "ADMIN") destination = "/admin";

  redirect(destination);
}

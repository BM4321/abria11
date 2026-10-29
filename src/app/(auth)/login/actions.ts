"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import {
  ACTIVITY_COOKIE,
  ACTIVITY_COOKIE_MAX_AGE,
  SESSION_COOKIE,
  activeSessionElsewhere,
} from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ensureOpsUser } from "@/lib/provision";
import { safeNextPath } from "@/lib/safe-redirect";
import { prisma } from "@/lib/prisma";

export type LoginState = {
  error: string | null;
  // Set when the account is in use on another device: the form asks whether
  // to continue (signing that device out) or cancel.
  conflict?: { lastActiveMinutes: number };
};

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

  if (activeSessionElsewhere(opsUser, (await cookies()).get(SESSION_COOKIE)?.value)) {
    // Keep the Supabase session for continueLoginAction; until a console
    // session is started it opens nothing (requireRole needs SESSION_COOKIE).
    const seenMs = Date.now() - (opsUser.sessionSeenAt?.getTime() ?? Date.now());
    return { error: null, conflict: { lastActiveMinutes: Math.floor(seenMs / 60000) } };
  }

  await startConsoleSession(opsUser);
  redirect(loginDestination(next, opsUser.role));
}

// "Continue" on the signed-in-elsewhere prompt: take over the account's
// console session, signing the other device out.
export async function continueLoginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const next = String(formData.get("next") ?? "").trim();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const opsUser = user?.email
    ? await ensureOpsUser({
        id: user.id,
        email: user.email,
        name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null,
        emailConfirmed: Boolean(user.email_confirmed_at),
      })
    : null;
  if (!opsUser) {
    return { error: "Your sign-in expired. Please sign in again." };
  }

  await startConsoleSession(opsUser);
  redirect(loginDestination(next, opsUser.role));
}

// "Cancel" on the signed-in-elsewhere prompt: drop this browser's sign-in and
// leave the other device's session alone.
export async function cancelLoginAction(): Promise<LoginState> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  return { error: null };
}

async function startConsoleSession(opsUser: { id: string }) {
  const sessionId = randomUUID();
  await prisma.opsUser.update({
    where: { id: opsUser.id },
    data: { sessionId, sessionSeenAt: new Date() },
  });

  // The other device keeps its Supabase sign-in on purpose: the session-id
  // check locks it out of the console, and it needs its identity to be told
  // why ("signed in on another device") before it signs itself out locally.

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    path: "/",
    maxAge: ACTIVITY_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Start the inactivity clock now. A leftover activity cookie from an earlier
  // session would otherwise make the middleware treat this brand-new session
  // as idle and sign it straight back out on the first console request.
  cookieStore.set(ACTIVITY_COOKIE, String(Date.now()), {
    path: "/",
    maxAge: ACTIVITY_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

function loginDestination(next: string, role: string) {
  if (!next && role === "ADMIN") return "/admin";
  return safeNextPath(next, "/operations/dashboard");
}

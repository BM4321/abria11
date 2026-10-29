"use server";

import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { passwordProblem } from "@/lib/password-policy";

export type SetupState = { error: string | null };

// Constant-time comparison so a mismatched setup token can't be brute-forced
// via response-time differences.
function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function setupAction(
  _prevState: SetupState,
  formData: FormData
): Promise<SetupState> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured. Set the environment variables first." };
  }

  // Setup is only reachable with a token so an anonymous visitor can't race
  // the real operator to create the founding admin account.
  const setupToken = process.env.ABRIA_SETUP_TOKEN;
  if (!setupToken) {
    return { error: "Setup is disabled. Set ABRIA_SETUP_TOKEN in the environment to enable it." };
  }

  const token = String(formData.get("token") ?? "");
  if (!token || !safeCompare(token, setupToken)) {
    return { error: "Invalid setup token." };
  }

  const adminCount = await prisma.opsUser.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) {
    return { error: "Setup is closed. An admin account already exists." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !name || !password) {
    return { error: "Email, name and password are required." };
  }
  const pwProblem = await passwordProblem(password);
  if (pwProblem) return { error: pwProblem };

  const existing = await prisma.opsUser.findUnique({ where: { email } });
  if (existing) {
    return { error: `A user with email ${email} already exists.` };
  }

  const admin = createAdminClient();

  const { data: existingAuth, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    return { error: `Could not check Supabase users: ${listError.message}` };
  }

  const found = existingAuth.users.find((u) => u.email?.toLowerCase() === email);

  let authUserId: string;
  if (found) {
    authUserId = found.id;
  } else {
    const { data, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "ADMIN" },
    });
    if (createError) {
      return { error: createError.message };
    }
    authUserId = data.user.id;
  }

  await prisma.opsUser.create({
    data: { id: authUserId, email, name, role: "ADMIN" },
  });

  redirect("/login?setup=1");
}

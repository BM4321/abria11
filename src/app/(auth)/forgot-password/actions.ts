"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { configuredSiteUrl } from "@/lib/safe-redirect";

export type ForgotPasswordState = { error: string | null; sent: boolean };

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email is required.", sent: false };
  }

  const supabase = await createClient();

  // The reset link is emailed, so its origin must not come from request
  // headers in production (host-header poisoning). NEXT_PUBLIC_SITE_URL is the
  // source of truth; headers are only a fallback for local development.
  let origin = configuredSiteUrl() ?? undefined;
  if (!origin && process.env.NODE_ENV !== "production") {
    const headerList = await headers();
    const host = headerList.get("host");
    origin = host ? `http://${host}` : undefined;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin
      ? `${origin}/auth/confirm?next=/reset-password`
      : undefined,
  });

  if (error) {
    // Don't reveal whether the address exists; only surface throttling.
    if (error.status === 429 || /rate limit|too many/i.test(error.message)) {
      return { error: "Too many reset requests. Please wait a few minutes and try again.", sent: false };
    }
    console.error("[ABRIA] Password reset request failed:", error.message);
  }

  return { error: null, sent: true };
}

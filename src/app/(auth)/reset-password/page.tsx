import Link from "next/link";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import AuthShell from "@/components/AuthShell";
import AuthNotice from "@/components/AuthNotice";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)");

  const configured = missing.length === 0;

  if (!configured) {
    return (
      <AuthShell title="Set a new password">
        <AuthNotice tone="warning" title="Supabase not configured">
          <p style={{ margin: "0 0 6px" }}>
            Password reset is unavailable because the following environment
            variable(s) are empty:
          </p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {missing.map((m) => (
              <li key={m}>
                <code>{m}</code>
              </li>
            ))}
          </ul>
        </AuthNotice>
      </AuthShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The recovery link must have produced a session via /auth/confirm.
  if (!user || error === "auth") {
    return (
      <AuthShell title="Set a new password" subtitle="This link is no longer valid">
        <AuthNotice tone="error" title="Reset link invalid or expired">
          Password reset links can only be used once and expire after a short
          time.
        </AuthNotice>
        <Link
          href="/forgot-password"
          className="btn btn-primary btn-block"
          style={{ minHeight: 42, fontSize: 15 }}
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle={`Signed in as ${user.email ?? "your account"}`}
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}

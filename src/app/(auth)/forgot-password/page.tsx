import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import AuthShell from "@/components/AuthShell";
import AuthNotice from "@/components/AuthNotice";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)");

  const configured = missing.length === 0;

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to choose a new one"
    >
      {configured ? (
        <ForgotPasswordForm />
      ) : (
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
          <p style={{ margin: "6px 0 0" }}>
            Set them in your platform&apos;s environment settings, then redeploy.
          </p>
        </AuthNotice>
      )}
    </AuthShell>
  );
}

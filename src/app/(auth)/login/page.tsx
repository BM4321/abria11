import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import AuthShell from "@/components/AuthShell";
import AuthNotice from "@/components/AuthNotice";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string; reset?: string; error?: string; next?: string; timeout?: string; denied?: string; replaced?: string }>;
}) {
  const { setup, reset, error, next, timeout, denied, replaced } = await searchParams;

  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)");

  const configured = missing.length === 0;

  return (
    <AuthShell title="Sign in" subtitle="Operations & admin console">
      {setup === "1" && (
        <AuthNotice tone="success" title="Admin account created">
          You can sign in below.
        </AuthNotice>
      )}

      {reset === "1" && (
        <AuthNotice tone="success" title="Password updated">
          Sign in with your new password.
        </AuthNotice>
      )}

      {error === "auth" && (
        <AuthNotice tone="error" title="Link expired or invalid">
          Please request a new link and try again.
        </AuthNotice>
      )}

      {timeout === "1" && (
        <AuthNotice tone="warning" title="Signed out for inactivity">
          You were inactive for 5 minutes, so we signed you out to keep your
          account secure. Sign in to continue.
        </AuthNotice>
      )}

      {replaced === "1" && (
        <AuthNotice tone="warning" title="Signed in on another device">
          Your account was signed in on another device, so this one was signed
          out. Only one device can use the console at a time.
        </AuthNotice>
      )}

      {denied === "1" && (
        <AuthNotice tone="error" title="No console access">
          This account is not an active ABRIA staff account. Contact an
          administrator if you need access.
        </AuthNotice>
      )}

      {configured ? (
        <>
          <LoginForm next={next} />
          <div
            className="hr"
            style={{ margin: "22px 0 16px" }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 14,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link href="/forgot-password" style={{ textDecoration: "none" }}>
              Forgot password?
            </Link>
            <Link
              href="/setup"
              className="text-muted"
              style={{ textDecoration: "none" }}
            >
              Create admin account
            </Link>
          </div>
        </>
      ) : (
        <AuthNotice tone="warning" title="Supabase not configured">
          <p style={{ margin: "0 0 6px" }}>
            Sign-in is unavailable because the following environment variable(s)
            are empty:
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

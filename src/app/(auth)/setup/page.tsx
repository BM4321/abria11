import { redirect } from "next/navigation";
import SetupForm from "@/components/SetupForm";
import AuthShell from "@/components/AuthShell";
import AuthNotice from "@/components/AuthNotice";
import { supabaseUrl, supabaseAnonKey, supabaseSecretKey } from "@/lib/supabase/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  if (!supabaseSecretKey) missing.push("SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  if (!process.env.ABRIA_SETUP_TOKEN) missing.push("ABRIA_SETUP_TOKEN");

  const configured = missing.length === 0;

  // First-run only: once any admin exists, setup is closed.
  if (configured) {
    const adminCount = await prisma.opsUser.count({ where: { role: "ADMIN" } });
    if (adminCount > 0) redirect("/login");
  }

  return (
    <AuthShell
      title="Create admin account"
      subtitle="Set up the first ABRIA administrator"
    >
      {configured ? (
        <SetupForm />
      ) : (
        <AuthNotice tone="warning" title="Setup not configured">
          <p style={{ margin: "0 0 6px" }}>
            Setup is unavailable because the following environment variable(s)
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

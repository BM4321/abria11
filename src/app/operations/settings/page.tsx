import Link from "next/link";
import { getCurrentOpsUser } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function OpsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;
  const user = await getCurrentOpsUser();
  const isAdmin = !user || user.role === "ADMIN";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Settings" subtitle="Your account and notification preferences." />
      {denied === "1" && (
        <p role="alert" style={{ margin: 0, padding: "12px 16px", borderRadius: 12, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", fontSize: 14 }}>
          Your role doesn&apos;t include access to that page. Ask an administrator if you need it.
        </p>
      )}
      <section style={{ padding: 22, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--app-muted)" }}>Signed in as</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{user?.name ?? "Local Dev"}</div>
          <div style={{ fontSize: 13, color: "var(--app-muted)" }}>{user?.email ?? "Auth bypassed in local development"}</div>
        </div>
        {isAdmin ? (
          <Link className="btn btn-primary" href="/admin/settings/general" style={{ width: "fit-content", minHeight: 42, borderRadius: 10 }}>
            <i className="ph ph-gear" aria-hidden="true" />
            Open admin settings
          </Link>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>
            Website and system settings are managed by administrators.
          </p>
        )}
      </section>
    </div>
  );
}

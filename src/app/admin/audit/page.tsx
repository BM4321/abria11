import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { fmtRelative } from "@/lib/console";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Audit logs"
        subtitle="Every change made in the console, who made it and when. Entries can't be edited or deleted."
      />
      <section style={{ borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {logs.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <i className="ph-duotone ph-scroll" aria-hidden="true" style={{ fontSize: 44, color: "var(--app-muted)" }} />
            <p style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600 }}>No activity recorded</p>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
              Changes made by managers and admins will appear here.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["User", "Action", "Resource", "Description", "When"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    style={{
                      textAlign: "left",
                      padding: "10px 16px",
                      borderBottom: "1px solid var(--app-line)",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--app-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--app-line)", whiteSpace: "nowrap" }}>{l.userName}</td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--app-line)" }}>{l.action}</td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--app-line)" }}>{l.resource}</td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--app-line)" }}>{l.description}</td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--app-line)", color: "var(--app-muted)", whiteSpace: "nowrap" }}>
                    {fmtRelative(l.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

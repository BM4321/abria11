import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable, { type Row } from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { fmtRelative, requestUiStatus } from "@/lib/console";

export const dynamic = "force-dynamic";

// A submission is "Open" while the underlying record still needs action.
function requestSubmissionStatus(status: string): string {
  const ui = requestUiStatus(status);
  if (ui === "Confirmed") return "Closed";
  if (ui === "Rejected") return "Closed";
  if (ui === "Reviewing") return "In Review";
  return "Open";
}

const MESSAGE_STATUS: Record<string, string> = { OPEN: "Open", IN_REVIEW: "In Review", CLOSED: "Closed" };

function partnerSubmissionStatus(status: string): string {
  return status === "PENDING" ? "Open" : "Closed";
}

export default async function SubmissionsPage() {
  const requests = await prisma.request.findMany({ orderBy: { createdAt: "desc" } });
  const partners = await prisma.partner.findMany({ orderBy: { createdAt: "desc" } });
  const messages = await prisma.formSubmission.findMany({ where: { formId: "contact" }, orderBy: { createdAt: "desc" } });

  const rows: Row[] = [
    ...requests.map((r) => {
      const status = requestSubmissionStatus(r.status);
      return {
        id: `REQ-${r.id}`,
        href: `/operations/requests/${r.id}`,
        date: r.createdAt.toISOString(),
        search: [r.requestId, r.contactPerson, r.companyName ?? ""].join(" "),
        f: { form: "Request Quote", status },
        cells: {
          ref: { t: r.requestId, href: `/operations/requests/${r.id}`, sub: "Request Quote" },
          name: { t: r.contactPerson, sub: r.companyName ?? "" },
          form: { t: "Request Quote" },
          status: { badge: status },
          at: { t: fmtRelative(r.createdAt) },
        },
        actions: [{ label: "Open", icon: "ph-arrow-right", href: `/operations/requests/${r.id}` }],
      };
    }),
    ...partners.map((p) => {
      const status = partnerSubmissionStatus(p.status);
      return {
        id: `CAR-${p.id}`,
        href: `/operations/carriers/${p.id}`,
        date: p.createdAt.toISOString(),
        search: [p.partnerId, p.contactPerson, p.companyName ?? ""].join(" "),
        f: { form: "Truck Registration", status },
        cells: {
          ref: { t: p.partnerId, href: `/operations/carriers/${p.id}`, sub: "Truck Registration" },
          name: { t: p.contactPerson, sub: p.companyName ?? "" },
          form: { t: "Truck Registration" },
          status: { badge: status },
          at: { t: fmtRelative(p.createdAt) },
        },
        actions: [{ label: "Open", icon: "ph-arrow-right", href: `/operations/carriers/${p.id}` }],
      };
    }),
    ...messages.map((m) => {
      const status = MESSAGE_STATUS[m.status] ?? "Open";
      const data = (m.data ?? {}) as Record<string, unknown>;
      return {
        id: `MSG-${m.id}`,
        href: `/admin/forms/submissions/${m.id}`,
        date: m.createdAt.toISOString(),
        search: [m.name, m.email ?? "", m.phone ?? "", String(data.message ?? "")].join(" "),
        f: { form: "Contact", status },
        cells: {
          ref: { t: `MSG-${m.id.slice(-6).toUpperCase()}`, href: `/admin/forms/submissions/${m.id}`, sub: String(data.topic ?? "Contact") },
          name: { t: m.name, sub: String(data.company ?? "") },
          form: { t: "Contact" },
          status: { badge: status },
          at: { t: fmtRelative(m.createdAt) },
        },
        actions: [{ label: "Open", icon: "ph-arrow-right", href: `/admin/forms/submissions/${m.id}` }],
      };
    }),
  ].sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : -1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Form submissions"
        subtitle="Every submission across the public forms."
        actions={
          <Link className="btn btn-secondary" href="/admin/forms" style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)" }}>
            <i className="ph ph-list-bullets" aria-hidden="true" />
            All forms
          </Link>
        }
      />
      <DataTable
        columns={[
          { key: "ref", label: "Reference" },
          { key: "name", label: "Submitted by" },
          { key: "form", label: "Form" },
          { key: "status", label: "Status" },
          { key: "at", label: "Received" },
        ]}
        rows={rows}
        filters={[
          { key: "form", label: "Form", options: ["Request Quote", "Truck Registration", "Contact"] },
          { key: "status", label: "Status", options: ["Open", "In Review", "Closed"] },
        ]}
        search="Search submissions"
        dateFilter
        noun="submissions"
        pageSize={12}
        emptyTitle="No submissions yet"
        emptyText="Submissions from the public forms will appear here."
        emptyIcon="ph-tray"
      />
    </div>
  );
}

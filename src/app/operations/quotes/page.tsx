import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { quoteRow, QUOTE_COLUMNS } from "@/lib/console-views";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const quotes = await prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: { request: true },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Quotes"
        subtitle="Prepare, send and follow up on transport quotations."
      />
      <DataTable
        columns={QUOTE_COLUMNS}
        rows={quotes.map(quoteRow)}
        filters={[
          { key: "status", label: "Status", options: ["Draft", "Sent", "Accepted", "Rejected", "Expired", "Cancelled"] },
        ]}
        search="Search by quote, request or customer"
        dateFilter
        noun="quotes"
        pageSize={10}
        emptyTitle="No quotes yet"
        emptyText="Create a quote from any transport request."
        emptyIcon="ph-receipt"
      />
    </div>
  );
}

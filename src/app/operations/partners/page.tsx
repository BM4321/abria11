import { prisma } from "@/lib/prisma";
import PartnersManager from "@/components/PartnersManager";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OperationsPartnersPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
  });

  const counts: Record<string, number> = { Total: partners.length };
  for (const p of partners) {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 text-brand-text">
      <h1 className="mb-8 text-3xl font-bold">Transport Partners</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-5">
        {Object.entries(counts).map(([label, count]) => (
          <div
            key={label}
            className="rounded-lg border border-brand-border bg-brand-card p-5"
          >
            <div className="text-sm uppercase tracking-wide text-brand-muted">{label}</div>
            <div className="mt-1 text-3xl font-bold text-brand-gold">{count}</div>
          </div>
        ))}
      </div>

      <PartnersManager
        partners={partners.map((p) => ({
          id: p.id,
          partnerId: p.partnerId,
          companyName: p.companyName,
          contactPerson: p.contactPerson,
          phone: p.phone,
          email: p.email,
          truckType: p.truckType,
          truckCapacity: p.truckCapacity,
          registrationNumber: p.registrationNumber,
          makeModel: p.makeModel,
          currentLocation: p.currentLocation,
          routesCovered: p.routesCovered,
          status: p.status,
          createdAt: p.createdAt,
        }))}
      />
    </main>
  );
}

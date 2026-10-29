import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import DataTable, { type Row } from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function TrucksPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const [trucks, partners] = await Promise.all([
    prisma.truck.findMany({ orderBy: { createdAt: "desc" }, include: { partner: true } }),
    prisma.partner.findMany(),
  ]);

  // Fall back to partner vehicle records for carriers without a Truck row.
  const partnerRows = partners
    .filter((p) => !trucks.some((t) => t.partnerId === p.id))
    .map((p) => ({
      id: p.id,
      registrationNumber: p.registrationNumber,
      truckType: p.truckType,
      capacity: p.truckCapacity,
      makeModel: p.makeModel,
      region: p.currentLocation,
      status: p.status === "VERIFIED" ? "AVAILABLE" : "PENDING",
      verification: p.status === "VERIFIED" ? "VERIFIED" : "PENDING",
      partner: p,
    }));

  type TruckView = {
    id: string;
    registrationNumber: string;
    truckType: string;
    capacity: string | null;
    makeModel: string | null;
    region: string | null;
    status: string;
    verification: string;
    partner: { companyName: string | null; contactPerson: string };
  };
  const all: TruckView[] = [
    ...trucks.map((t) => ({
      id: t.id,
      registrationNumber: t.registrationNumber,
      truckType: t.truckType,
      capacity: t.capacity,
      makeModel: t.makeModel,
      region: t.region,
      status: t.status,
      verification: t.verification,
      partner: t.partner,
    })),
    ...partnerRows,
  ];

  const uiStatus = (s: string) =>
    s === "AVAILABLE" ? "Available" : s === "MAINTENANCE" ? "Maintenance" : s === "INACTIVE" ? "Inactive" : s === "PENDING" ? "Pending" : "Assigned";
  const uiVer = (s: string) => (s === "VERIFIED" ? "Verified" : "Pending");

  const rows: Row[] = all.map((t) => ({
    id: t.registrationNumber,
    search: [t.registrationNumber, t.truckType, t.makeModel ?? "", t.partner.companyName ?? "", t.region ?? ""].join(" "),
    f: { type: t.truckType, status: uiStatus(t.status), ver: uiVer(t.verification), region: t.region ?? "" },
    s: { cap: t.capacity ?? "" },
    cells: {
      reg: { t: t.registrationNumber, sub: t.makeModel ?? "" },
      type: { t: t.truckType },
      cap: { t: t.capacity ?? "—", align: "right" },
      owner: { t: t.partner.companyName ?? t.partner.contactPerson },
      region: { t: t.region ?? "—" },
      status: { badge: uiStatus(t.status) },
      ver: { badge: uiVer(t.verification) },
    },
    actions: [],
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Trucks"
        subtitle="Every vehicle registered with an ABRIA carrier."
      />
      <DataTable
        columns={[
          { key: "reg", label: "Registration" },
          { key: "type", label: "Truck type" },
          { key: "cap", label: "Capacity", align: "right" },
          { key: "owner", label: "Owner" },
          { key: "region", label: "Region" },
          { key: "status", label: "Status" },
          { key: "ver", label: "Verification" },
        ]}
        rows={rows}
        filters={[
          { key: "type", label: "Type", options: [...new Set(all.map((t) => t.truckType))].sort() },
          { key: "status", label: "Status", options: ["Available", "Assigned", "Maintenance", "Inactive", "Pending"] },
          { key: "ver", label: "Verification", options: ["Verified", "Pending"] },
        ]}
        search="Search by registration, type, owner or region"
        noun="trucks"
        pageSize={10}
        emptyTitle="No trucks registered"
        emptyText="Vehicles registered by carriers will appear here."
        emptyIcon="ph-steering-wheel"
      />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { fmtKg, fmtRelative, fmtDate, requestUiStatus } from "@/lib/console";
import type { Row } from "@/components/DataTable";
import type { Request } from "@prisma/client";

export function requestRow(r: Request): Row {
  const ui = requestUiStatus(r.status);
  const route = `${r.pickupLocation} → ${r.deliveryLocation}`;
  return {
    id: r.requestId,
    href: `/operations/requests/${r.id}`,
    date: r.createdAt.toISOString(),
    search: [
      r.requestId,
      r.contactPerson,
      r.companyName ?? "",
      r.pickupLocation,
      r.deliveryLocation,
      r.cargoType,
      r.cargoDescription ?? "",
    ].join(" "),
    f: { status: ui, cargo: r.cargoType },
    s: {
      created: r.createdAt.toISOString(),
      date: r.transportDate?.toISOString() ?? "",
      weight: r.weight ?? 0,
    },
    cells: {
      id: { t: r.requestId, href: `/operations/requests/${r.id}` },
      cust: { t: r.contactPerson },
      company: { t: r.companyName ?? "—", sub: r.pickupLocation },
      route: { t: route },
      cargo: { t: r.cargoType, sub: r.weight != null ? fmtKg(r.weight) : "" },
      date: { t: r.transportDate ? fmtDate(r.transportDate) : "—" },
      status: { badge: ui },
      created: { t: fmtRelative(r.createdAt) },
    },
    actions: [{ label: "Open", icon: "ph-arrow-right", href: `/operations/requests/${r.id}` }],
  };
}

export const REQUEST_COLUMNS_FULL = [
  { key: "id", label: "Request ID" },
  { key: "cust", label: "Customer" },
  { key: "company", label: "Company" },
  { key: "route", label: "Route" },
  { key: "cargo", label: "Cargo" },
  { key: "date", label: "Requested date" },
  { key: "status", label: "Status" },
  { key: "created", label: "Created" },
];

export const REQUEST_COLUMNS_SHORT = [
  { key: "id", label: "Request ID" },
  { key: "company", label: "Customer" },
  { key: "route", label: "Route" },
  { key: "cargo", label: "Cargo" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
];

export async function loadRequests() {
  return prisma.request.findMany({ orderBy: { createdAt: "desc" } });
}

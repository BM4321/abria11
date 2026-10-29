import { fmtDateShort, fmtRelative, partnerUiStatus, fmtTzs } from "@/lib/console";
import type { Row } from "@/components/DataTable";
import { isAhead } from "@/lib/request-progress";
import type { Partner, Quotation, Request, Truck, Shipment } from "@prisma/client";

export function partnerRow(
  p: Partner & { trucks?: Truck[]; shipments?: Shipment[] }
): Row {
  const ui = partnerUiStatus(p.status);
  const truckCount = p.trucks?.length ?? (p.registrationNumber ? 1 : 0);
  const activeJobs =
    p.shipments?.filter((s) => s.status !== "DELIVERED").length ?? 0;
  const completed =
    p.shipments?.filter((s) => s.status === "DELIVERED").length ?? 0;
  return {
    id: p.partnerId,
    href: `/operations/carriers/${p.id}`,
    date: p.createdAt.toISOString(),
    search: [
      p.partnerId,
      p.contactPerson,
      p.companyName ?? "",
      p.currentLocation ?? "",
      p.routesCovered ?? "",
      p.phone,
    ].join(" "),
    f: { status: ui, location: p.currentLocation ?? "" },
    s: { trucks: truckCount, active: activeJobs, completed, joined: p.createdAt.toISOString() },
    cells: {
      carrier: { t: p.contactPerson, href: `/operations/carriers/${p.id}`, sub: p.partnerId },
      company: { t: p.companyName ?? "—" },
      phone: { t: p.phone },
      location: { t: p.currentLocation ?? "—" },
      trucks: { t: String(truckCount), align: "right" },
      active: { t: String(activeJobs), align: "right" },
      completed: { t: String(completed), align: "right" },
      status: { badge: ui },
    },
    actions: [{ label: "Open", icon: "ph-arrow-right", href: `/operations/carriers/${p.id}` }],
  };
}

export const CARRIER_COLUMNS = [
  { key: "carrier", label: "Carrier" },
  { key: "company", label: "Company" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "trucks", label: "Trucks", align: "right" as const },
  { key: "active", label: "Active jobs", align: "right" as const },
  { key: "completed", label: "Completed", align: "right" as const },
  { key: "status", label: "Verification" },
];

export function quoteRow(
  q: Quotation & { request?: Request | null }
): Row {
  const r = q.request;
  const route = r ? `${r.pickupLocation} → ${r.deliveryLocation}` : "—";
  // The customer's decision (recorded on the request) outranks send/expiry.
  const status =
    r && (r.status === "APPROVED" || isAhead(r.status, "APPROVED"))
      ? "Accepted"
      : r?.status === "REJECTED"
        ? "Rejected"
        : r?.status === "CANCELLED"
          ? "Cancelled"
          : q.sentAt
            ? q.validUntil && q.validUntil < new Date()
              ? "Expired"
              : "Sent"
            : "Draft";
  const expiring = status === "Sent" && q.validUntil
    ? q.validUntil.toDateString() === new Date().toDateString()
    : false;
  return {
    id: q.id.slice(0, 12).toUpperCase(),
    href: r ? `/operations/requests/${r.id}` : undefined,
    date: q.createdAt.toISOString(),
    search: [q.id, r?.requestId ?? "", r?.contactPerson ?? "", route].join(" "),
    f: { status },
    s: { amount: q.total, created: q.createdAt.toISOString() },
    cells: {
      id: {
        t: r?.requestId ?? "—",
        href: r ? `/operations/requests/${r.id}` : undefined,
        sub: "from request",
      },
      cust: { t: r?.companyName ?? r?.contactPerson ?? "—", sub: route },
      route: { t: route },
      amount: { t: fmtTzs(q.total), align: "right" },
      created: { t: fmtDateShort(q.createdAt) },
      valid: {
        t: q.validUntil ? fmtDateShort(q.validUntil) : "—",
        sub: expiring ? "Expires today" : "",
      },
      status: { badge: status },
    },
    actions: r
      ? [{ label: "Open", icon: "ph-arrow-right", href: `/operations/requests/${r.id}` }]
      : [],
  };
}

export const QUOTE_COLUMNS = [
  { key: "id", label: "Request ID" },
  { key: "cust", label: "Customer" },
  { key: "route", label: "Route" },
  { key: "amount", label: "Amount", align: "right" as const },
  { key: "created", label: "Created" },
  { key: "valid", label: "Valid until" },
  { key: "status", label: "Status" },
];

export type CustomerGroup = {
  key: string;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  region: string;
  requests: number;
  shipments: number;
  last: string;
};

export function customerRows(groups: CustomerGroup[]): Row[] {
  return groups.map((c) => ({
    id: c.key,
    href: `/operations/requests`,
    date: c.last,
    search: [c.name, c.company ?? "", c.email ?? "", c.phone, c.region].join(" "),
    f: { status: "Active", region: c.region },
    s: { requests: c.requests, shipments: c.shipments, last: c.last },
    cells: {
      cust: { t: c.name, sub: c.key },
      company: { t: c.company ?? "—", sub: c.region },
      phone: { t: c.phone },
      email: { t: c.email ?? "—" },
      requests: { t: String(c.requests), align: "right" },
      shipments: { t: String(c.shipments), align: "right" },
      last: { t: fmtRelative(c.last) },
      status: { badge: "Active" },
    },
    actions: [{ label: "Open", icon: "ph-arrow-right", href: `/operations/requests` }],
  }));
}

export const CUSTOMER_COLUMNS = [
  { key: "cust", label: "Customer" },
  { key: "company", label: "Company" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "requests", label: "Requests", align: "right" as const },
  { key: "shipments", label: "Shipments", align: "right" as const },
  { key: "last", label: "Last activity" },
  { key: "status", label: "Status" },
];

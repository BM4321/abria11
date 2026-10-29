import { fmtKg, fmtDateShort, fmtRelative, shipmentUiStatus, daysFrom } from "@/lib/console";
import type { Row } from "@/components/DataTable";
import type { Shipment, Partner, Truck } from "@prisma/client";

type ShipmentWith = Shipment & {
  partner?: Partner | null;
  truck?: Truck | null;
};

export function shipmentRow(s: ShipmentWith): Row {
  const ui = shipmentUiStatus(s.status);
  const late = s.delayed && s.status !== "DELIVERED";
  const route = `${s.pickupLocation} → ${s.deliveryLocation}`;
  return {
    id: s.shipmentId,
    href: `/operations/shipments/${s.id}`,
    date: s.createdAt.toISOString(),
    search: [
      s.shipmentId,
      s.customerCompany ?? "",
      s.customerName ?? "",
      s.pickupLocation,
      s.deliveryLocation,
      s.partner?.companyName ?? "",
      s.truck?.registrationNumber ?? "",
      s.driverName ?? "",
      s.cargoDescription ?? "",
    ].join(" "),
    f: {
      status: ui,
      carrier: s.partner?.companyName ?? "",
      region: s.deliveryLocation,
      delay: late ? "Delayed" : "On time",
    },
    s: {
      eta: s.eta?.toISOString() ?? "",
      created: s.createdAt.toISOString(),
    },
    cells: {
      id: { t: s.shipmentId, href: `/operations/shipments/${s.id}` },
      cust: { t: s.customerCompany ?? s.customerName ?? "—", sub: s.customerName ?? "" },
      cargo: { t: s.cargoDescription ?? "—", sub: s.weight != null ? fmtKg(s.weight) : "" },
      route: { t: route },
      carrier: { t: s.partner?.companyName ?? "Unassigned", sub: s.partner?.contactPerson ?? "" },
      truck: { t: s.truck?.registrationNumber ?? "—", sub: s.truck?.truckType ?? "" },
      status: { badge: ui, sub: late ? "Past ETA" : "" },
      eta: {
        t: s.eta ? fmtDateShort(s.eta) : "—",
        sub: late && s.eta ? `Overdue by ${-daysFrom(s.eta)}d` : "",
      },
      created: { t: fmtRelative(s.createdAt) },
    },
    actions: [{ label: "Open", icon: "ph-arrow-right", href: `/operations/shipments/${s.id}` }],
  };
}

export const SHIPMENT_COLUMNS_FULL = [
  { key: "id", label: "Shipment ID" },
  { key: "cust", label: "Customer" },
  { key: "cargo", label: "Cargo" },
  { key: "route", label: "Route" },
  { key: "carrier", label: "Carrier" },
  { key: "truck", label: "Truck" },
  { key: "status", label: "Status" },
  { key: "eta", label: "ETA" },
  { key: "created", label: "Created" },
];

export const SHIPMENT_COLUMNS_SHORT = [
  { key: "id", label: "Shipment ID" },
  { key: "cust", label: "Customer" },
  { key: "route", label: "Route" },
  { key: "carrier", label: "Carrier" },
  { key: "status", label: "Status" },
  { key: "eta", label: "ETA" },
];

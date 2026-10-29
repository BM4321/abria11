import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { partnerUiStatus, requestUiStatus, shipmentUiStatus } from "@/lib/console";
import {
  REPORT_EXPORTS,
  buildSummary,
  eatToday,
  exportFileName,
  isReportExportKey,
  parseRange,
  rangeLabel,
  toCsv,
  type Cell,
  type ReportExportKey,
  type ReportRange,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

// GET /api/reports/export?type=requests&from=YYYY-MM-DD&to=YYYY-MM-DD
// Downloads one Operations > Reports dataset as CSV, limited to records
// created in the period.
export async function GET(request: NextRequest) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "FORBIDDEN" ? 403 : 401 });
  }

  const params = request.nextUrl.searchParams;
  const type = params.get("type");
  if (!isReportExportKey(type)) {
    return NextResponse.json({ error: "Unknown report type." }, { status: 400 });
  }
  const range = parseRange(params.get("from"), params.get("to"));

  const { header, rows } = await buildExport(type, range);
  const csv = toCsv(header, rows);

  // The exports carry customer contact details, so record who took them.
  const label = REPORT_EXPORTS.find((r) => r.key === type)!.label;
  await prisma.auditLog.create({
    data: {
      userName: access.user.name,
      action: "Exported",
      resource: "Report",
      description: `Exported ${label} (${rangeLabel(range)}, ${rows.length} row${rows.length === 1 ? "" : "s"})`,
    },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFileName(type, range, eatToday())}"`,
      "Cache-Control": "no-store",
    },
  });
}

async function buildExport(
  type: ReportExportKey,
  range: ReportRange
): Promise<{ header: string[]; rows: Cell[][] }> {
  const createdAt = range.where;

  switch (type) {
    case "summary": {
      const [requests, shipments] = await Promise.all([
        prisma.request.findMany({ where: { createdAt } }),
        prisma.shipment.findMany({ where: { createdAt } }),
      ]);
      const s = buildSummary(requests, shipments);
      const period = rangeLabel(range);
      const section = (name: string, data: { label: string; value: number }[]): Cell[][] =>
        data.map((d) => [period, name, d.label, d.value]);
      return {
        header: ["Period", "Report", "Item", "Count"],
        rows: [
          [period, "Totals", "Transport requests", requests.length],
          [period, "Totals", "Shipments", shipments.length],
          ...section("Requests by status", s.byStatus),
          ...section("Shipments by status", s.shipmentStatus),
          ...section("Popular routes", s.routes),
          ...section("Deliveries by region", s.regions),
          ...section("Cargo types", s.cargo),
        ],
      };
    }

    case "requests": {
      const requests = await prisma.request.findMany({
        where: { createdAt },
        orderBy: { createdAt: "asc" },
        include: { assignedOperator: true, assignedPartner: true, quotation: true, shipment: true },
      });
      return {
        header: [
          "Request ID", "Created", "Status", "Status detail", "Company", "Contact person", "Phone", "Email",
          "Pickup", "Delivery", "Cargo type", "Cargo description", "Quantity", "Weight (kg)", "Dimensions",
          "Packages", "Cargo value (TZS)", "Transport type", "Transport date", "Preferred pickup",
          "Required delivery", "Special handling", "Instructions", "Assigned operator", "Assigned carrier",
          "Quote total (TZS)", "Quote sent", "Shipment ID", "POD received",
        ],
        rows: requests.map((r) => [
          r.requestId, r.createdAt, requestUiStatus(r.status), r.status, r.companyName, r.contactPerson,
          r.phone, r.email, r.pickupLocation, r.deliveryLocation, r.cargoType, r.cargoDescription,
          r.quantity, r.weight, r.dimensions, r.numberOfPackages, r.cargoValue, r.transportType,
          r.transportDate, r.preferredPickupDate, r.requiredDeliveryDate, r.specialHandling,
          r.additionalInstructions, r.assignedOperator?.name,
          r.assignedPartner ? r.assignedPartner.companyName ?? r.assignedPartner.contactPerson : null,
          r.quotation?.total, r.quotation?.sentAt, r.shipment?.shipmentId, r.podReceivedAt,
        ]),
      };
    }

    case "shipments": {
      const shipments = await prisma.shipment.findMany({
        where: { createdAt },
        orderBy: { createdAt: "asc" },
        include: { request: true, partner: true, truck: true },
      });
      return {
        header: [
          "Shipment ID", "Created", "Request ID", "Status", "Delayed", "Delay note", "Customer", "Company",
          "Customer phone", "Cargo", "Weight (kg)", "Quantity", "Pickup", "Delivery", "Carrier", "Truck",
          "Driver", "Driver phone", "ETA", "Delivered", "Progress (%)",
        ],
        rows: shipments.map((s) => [
          s.shipmentId, s.createdAt, s.request?.requestId, shipmentUiStatus(s.status), s.delayed, s.delayNote,
          s.customerName, s.customerCompany, s.customerPhone, s.cargoDescription, s.weight, s.quantity,
          s.pickupLocation, s.deliveryLocation, s.partner ? s.partner.companyName ?? s.partner.contactPerson : null,
          s.truck?.registrationNumber, s.driverName, s.driverPhone, s.eta, s.deliveredAt,
          Math.round(s.progress),
        ]),
      };
    }

    case "quotations": {
      const quotes = await prisma.quotation.findMany({
        where: { createdAt },
        orderBy: { createdAt: "asc" },
        include: { request: true },
      });
      return {
        header: [
          "Request ID", "Created", "Customer", "Company", "Route", "Request status", "Transport",
          "Loading", "Offloading", "Tolls", "Fuel surcharge", "Handling", "Insurance", "Other", "VAT",
          "Total (TZS)", "Valid until", "Sent", "Sent to",
        ],
        rows: quotes.map((q) => [
          q.request.requestId, q.createdAt, q.request.contactPerson, q.request.companyName,
          `${q.request.pickupLocation} → ${q.request.deliveryLocation}`, requestUiStatus(q.request.status),
          q.transportCost, q.loadingCost, q.offloadingCost, q.tolls, q.fuelSurcharge, q.handling,
          q.insurance, q.otherCharges, q.vat, q.total, q.validUntil, q.sentAt, q.sentTo,
        ]),
      };
    }

    case "carriers": {
      const partners = await prisma.partner.findMany({
        where: { createdAt },
        orderBy: { createdAt: "asc" },
        include: { trucks: true, _count: { select: { shipments: true } } },
      });
      return {
        header: [
          "Carrier ID", "Registered", "Status", "Company", "Contact person", "Phone", "Email", "Truck type",
          "Capacity", "Registration", "Make / model", "Current location", "Routes covered", "Fleet",
          "Shipments",
        ],
        rows: partners.map((p) => [
          p.partnerId, p.createdAt, partnerUiStatus(p.status), p.companyName, p.contactPerson, p.phone,
          p.email, p.truckType, p.truckCapacity, p.registrationNumber, p.makeModel, p.currentLocation,
          p.routesCovered, p.trucks.map((t) => t.registrationNumber).join("; "), p._count.shipments,
        ]),
      };
    }
  }
}

import { requestUiStatus, shipmentUiStatus } from "./console";

// Report periods and CSV exports for Operations > Reports. Dates are entered
// and written in Tanzania time (EAT, UTC+3, no daylight saving).
export const REPORT_TIME_ZONE = "Africa/Dar_es_Salaam";
const EAT_OFFSET = "+03:00";
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export type ReportRange = {
  from: string; // YYYY-MM-DD or ""
  to: string;
  where: { gte?: Date; lte?: Date } | undefined; // Prisma createdAt filter
};

// The instant a Tanzania calendar day starts or ends; null for anything that
// isn't a real YYYY-MM-DD date (e.g. 2026-02-30).
function dayBound(day: string, time: string): Date | null {
  if (!DAY.test(day)) return null;
  const d = new Date(`${day}T${time}${EAT_OFFSET}`);
  if (Number.isNaN(d.getTime())) return null;
  return eatToday(d) === day ? d : null;
}

const startOfDay = (day: string) => dayBound(day, "00:00:00.000");
const endOfDay = (day: string) => dayBound(day, "23:59:59.999");

// Parses ?from=YYYY-MM-DD&to=YYYY-MM-DD (both optional, both inclusive).
// Invalid dates are ignored; a reversed range is swapped.
export function parseRange(fromRaw?: string | null, toRaw?: string | null): ReportRange {
  let from = startOfDay(fromRaw ?? "") ? (fromRaw as string) : "";
  let to = endOfDay(toRaw ?? "") ? (toRaw as string) : "";
  if (from && to && from > to) [from, to] = [to, from];

  const gte = from ? startOfDay(from)! : undefined;
  const lte = to ? endOfDay(to)! : undefined;
  return { from, to, where: gte || lte ? { ...(gte && { gte }), ...(lte && { lte }) } : undefined };
}

// Today's date in Tanzania as YYYY-MM-DD.
export function eatToday(now: Date = new Date()): string {
  return new Date(now.getTime() + EAT_OFFSET_MS).toISOString().slice(0, 10);
}

export function rangeLabel(range: Pick<ReportRange, "from" | "to">): string {
  if (range.from && range.to) return range.from === range.to ? range.from : `${range.from} to ${range.to}`;
  if (range.from) return `From ${range.from}`;
  if (range.to) return `Up to ${range.to}`;
  return "All time";
}

// Quick period shortcuts shown above the reports.
export function presetRanges(now: Date = new Date()): { label: string; from: string; to: string }[] {
  const today = eatToday(now);
  const [y, m] = today.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = (yy: number, mm: number) => new Date(Date.UTC(yy, mm, 0)).getUTCDate();
  const prevY = m === 1 ? y - 1 : y;
  const prevM = m === 1 ? 12 : m - 1;
  const minus = (days: number) =>
    new Date(Date.parse(`${today}T00:00:00Z`) - days * 86400000).toISOString().slice(0, 10);

  return [
    { label: "This month", from: `${y}-${pad(m)}-01`, to: today },
    {
      label: "Last month",
      from: `${prevY}-${pad(prevM)}-01`,
      to: `${prevY}-${pad(prevM)}-${pad(lastDay(prevY, prevM))}`,
    },
    { label: "Last 30 days", from: minus(29), to: today },
    { label: "This year", from: `${y}-01-01`, to: today },
    { label: "All time", from: "", to: "" },
  ];
}

// ---------------------------------------------------------------------------
// Summary figures (shared by the Reports page and the summary export).

type Counted = { label: string; value: number };

export type ReportSummary = {
  byStatus: Counted[];
  shipmentStatus: Counted[];
  routes: Counted[];
  regions: Counted[];
  cargo: Counted[];
};

function tally(values: string[]): Counted[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildSummary(
  requests: { status: string; pickupLocation: string; deliveryLocation: string; cargoType: string }[],
  shipments: { status: string; deliveryLocation: string }[]
): ReportSummary {
  return {
    byStatus: ["New", "Reviewing", "Quoted", "Confirmed", "Rejected"].map((s) => ({
      label: s,
      value: requests.filter((r) => requestUiStatus(r.status) === s).length,
    })),
    shipmentStatus: ["Assigned", "Picked Up", "In Transit", "Out for Delivery", "Delivered"].map((s) => ({
      label: s,
      value: shipments.filter((x) => shipmentUiStatus(x.status) === s).length,
    })),
    routes: tally(requests.map((r) => `${r.pickupLocation} → ${r.deliveryLocation}`)),
    regions: tally(shipments.map((s) => s.deliveryLocation)),
    cargo: tally(requests.map((r) => r.cargoType)),
  };
}

// ---------------------------------------------------------------------------
// CSV

export const REPORT_EXPORTS = [
  { key: "summary", label: "Summary", description: "The figures shown on this page: requests and shipments by status, routes, regions and cargo types." },
  { key: "requests", label: "Transport requests", description: "Every request with customer, cargo, route, dates and status." },
  { key: "shipments", label: "Shipments", description: "Shipments with carrier, truck, driver, status, ETA and delivery date." },
  { key: "quotations", label: "Quotations", description: "Quotes with the full cost breakdown, VAT, total and when they were sent." },
  { key: "carriers", label: "Carriers", description: "Registered carriers and their trucks, with verification status." },
] as const;

export type ReportExportKey = (typeof REPORT_EXPORTS)[number]["key"];

export function isReportExportKey(key: string | null | undefined): key is ReportExportKey {
  return REPORT_EXPORTS.some((r) => r.key === key);
}

export type Cell = string | number | boolean | Date | null | undefined;

// "YYYY-MM-DD HH:mm" in Tanzania time.
export function fmtCsvDate(d: Date): string {
  return new Date(d.getTime() + EAT_OFFSET_MS).toISOString().slice(0, 16).replace("T", " ");
}

function cellText(value: Cell): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return fmtCsvDate(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  // Customer-entered text: stop spreadsheet apps from running it as a formula.
  // Plain numbers such as "+255 712 345 678" can't run anything; leave them.
  if (/^[+-]?[\d\s().-]+$/.test(value)) return value;
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function quote(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// RFC 4180 CSV with a UTF-8 byte-order mark so Excel opens accents and "→"
// correctly.
export function toCsv(header: string[], rows: Cell[][]): string {
  const lines = [header, ...rows].map((row) => row.map((c) => quote(cellText(c))).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export function exportFileName(key: ReportExportKey, range: Pick<ReportRange, "from" | "to">, today: string): string {
  const period =
    range.from || range.to ? `${range.from || "start"}_to_${range.to || today}` : `all-time_${today}`;
  return `abria-${key}-${period}.csv`;
}

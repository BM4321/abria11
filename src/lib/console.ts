// Console formatting + status-tone helpers, ported from UI/abria-mock.js.

export type Tone = { bg: string; fg: string; dot: string };

export const TONES: Record<string, Tone> = {
  info: {
    bg: "color-mix(in srgb,var(--color-accent) 14%,transparent)",
    fg: "var(--color-accent-800)",
    dot: "var(--color-accent)",
  },
  warn: {
    bg: "color-mix(in srgb,var(--color-process-yellow) 24%,transparent)",
    fg: "color-mix(in srgb,var(--color-process-yellow) 32%,var(--color-text))",
    dot: "var(--color-process-yellow)",
  },
  ok: {
    bg: "color-mix(in srgb,oklch(0.62 0.13 155) 16%,transparent)",
    fg: "color-mix(in srgb,oklch(0.55 0.13 155) 55%,var(--color-text))",
    dot: "oklch(0.62 0.13 155)",
  },
  bad: {
    bg: "color-mix(in srgb,var(--color-accent-2) 13%,transparent)",
    fg: "var(--color-accent-2-800)",
    dot: "var(--color-accent-2)",
  },
  muted: {
    bg: "color-mix(in srgb,var(--color-text) 8%,transparent)",
    fg: "color-mix(in srgb,var(--color-text) 75%,transparent)",
    dot: "color-mix(in srgb,var(--color-text) 45%,transparent)",
  },
};

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  New: "info",
  Reviewing: "warn",
  Quoted: "info",
  Confirmed: "ok",
  Rejected: "bad",
  Draft: "muted",
  Sent: "info",
  Accepted: "ok",
  Expired: "bad",
  Cancelled: "bad",
  Assigned: "info",
  "Picked Up": "info",
  "In Transit": "warn",
  "Out for Delivery": "warn",
  Delivered: "ok",
  Delayed: "bad",
  Scheduled: "muted",
  Active: "ok",
  Inactive: "muted",
  "Pending Verification": "warn",
  Pending: "warn",
  Verified: "ok",
  Suspended: "bad",
  Available: "ok",
  Maintenance: "warn",
  Published: "ok",
  Unpublished: "muted",
  Archived: "muted",
  Open: "info",
  "In Review": "warn",
  Closed: "muted",
  Invited: "info",
  Disabled: "bad",
  Connected: "ok",
  "Not connected": "muted",
  Error: "bad",
};

export function tone(label: string): Tone {
  return TONES[STATUS_TONE[label] ?? "muted"];
}

// Maps the Prisma request status enum to the console's friendly labels.
export const REQUEST_STATUS_UI: Record<string, string> = {
  NEW_REQUEST: "New",
  UNDER_REVIEW: "Reviewing",
  QUOTATION_PREPARATION: "Reviewing",
  QUOTATION_SENT: "Quoted",
  AWAITING_CUSTOMER_APPROVAL: "Quoted",
  APPROVED: "Confirmed",
  REJECTED: "Rejected",
  BOOKED: "Confirmed",
  VEHICLE_ASSIGNED: "Confirmed",
  DRIVER_ASSIGNED: "Confirmed",
  PICKED_UP: "Confirmed",
  IN_TRANSIT: "Confirmed",
  ARRIVED_DESTINATION: "Confirmed",
  DELIVERED: "Confirmed",
  POD_RECEIVED: "Confirmed",
  COMPLETED: "Confirmed",
  CANCELLED: "Rejected",
};

export function requestUiStatus(status: string): string {
  return REQUEST_STATUS_UI[status] ?? status;
}

export const PARTNER_STATUS_UI: Record<string, string> = {
  PENDING: "Pending Verification",
  VERIFIED: "Verified",
  REJECTED: "Suspended",
  SUSPENDED: "Suspended",
};

export function partnerUiStatus(status: string): string {
  return PARTNER_STATUS_UI[status] ?? status;
}

export const SHIPMENT_STATUS_UI: Record<string, string> = {
  ASSIGNED: "Assigned",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  DELAYED: "Delayed",
};

export function shipmentUiStatus(status: string): string {
  return SHIPMENT_STATUS_UI[status] ?? status;
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return { d, iso: d.toISOString() };
}

export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const { d } = parts(value);
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDateShort(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const { d } = parts(value);
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}

export function fmtTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const { d } = parts(value);
  return d.toISOString().slice(11, 16);
}

export function fmtRelative(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const { d } = parts(value);
  const now = new Date();
  const startOfDay = (x: Date) =>
    Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
  const diff = Math.round(
    (startOfDay(now) - startOfDay(d)) / 86400000
  );
  if (diff === 0) return `Today${fmtTime(value) ? ", " + fmtTime(value) : ""}`;
  if (diff === 1) return "Yesterday";
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return fmtDateShort(d);
}

export function fmtTzs(n: number | null | undefined): string {
  if (n == null) return "—";
  return "TZS " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function fmtKg(n: number | null | undefined): string {
  if (n == null) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)} t` : `${n} kg`;
}

export function daysFrom(value: string | Date): number {
  const { d } = parts(value);
  const now = new Date();
  const startOfDay = (x: Date) =>
    Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
  return Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

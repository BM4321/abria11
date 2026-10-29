import { STATUS_LABELS, RequestStatus } from "@/lib/status";

const STATUS_COLORS: Record<string, string> = {
  NEW_REQUEST: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  QUOTATION_PREPARATION: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  QUOTATION_SENT: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  AWAITING_CUSTOMER_APPROVAL: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  UNDER_REVIEW: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  APPROVED: "bg-green-500/20 text-green-300 border-green-500/40",
  BOOKED: "bg-green-500/20 text-green-300 border-green-500/40",
  VEHICLE_ASSIGNED: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  DRIVER_ASSIGNED: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  PICKED_UP: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  IN_TRANSIT: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  ARRIVED_DESTINATION: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  DELIVERED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  POD_RECEIVED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/40",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-500/40",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-brand-card text-brand-muted border-brand-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {STATUS_LABELS[status as RequestStatus] ?? status}
    </span>
  );
}

import type { RequestStatus } from "@/lib/status";

// Shipment stages in order. DELAYED is not a stage: delays are a flag on the
// shipment (legacy rows with status DELAYED are treated as in transit).
export const SHIPMENT_FLOW = ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
export type ShipmentStatus = (typeof SHIPMENT_FLOW)[number];

export function shipmentStage(status: string): number {
  if (status === "DELAYED") return SHIPMENT_FLOW.indexOf("IN_TRANSIT");
  return SHIPMENT_FLOW.indexOf(status as ShipmentStatus);
}

export const SHIPMENT_PROGRESS: Record<string, number> = {
  ASSIGNED: 0.1,
  PICKED_UP: 0.35,
  IN_TRANSIT: 0.6,
  OUT_FOR_DELIVERY: 0.85,
  DELIVERED: 1,
};

// Request status that each shipment stage corresponds to.
export const SHIPMENT_TO_REQUEST: Record<string, RequestStatus> = {
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "ARRIVED_DESTINATION",
  DELIVERED: "POD_RECEIVED",
};

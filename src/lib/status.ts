// ABRIA request status state machine (Phase 1 surfaces the queue/review levels,
// full enum defined for later phases).
export const REQUEST_STATUSES = [
  "NEW_REQUEST",
  "UNDER_REVIEW",
  "QUOTATION_PREPARATION",
  "QUOTATION_SENT",
  "AWAITING_CUSTOMER_APPROVAL",
  "APPROVED",
  "REJECTED",
  "BOOKED",
  "VEHICLE_ASSIGNED",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_DESTINATION",
  "DELIVERED",
  "POD_RECEIVED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

// Human-readable labels for the dashboard UI.
export const STATUS_LABELS: Record<RequestStatus, string> = {
  NEW_REQUEST: "New",
  UNDER_REVIEW: "Under Review",
  QUOTATION_PREPARATION: "Quotation Prep",
  QUOTATION_SENT: "Quotation Sent",
  AWAITING_CUSTOMER_APPROVAL: "Awaiting Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  BOOKED: "Booked",
  VEHICLE_ASSIGNED: "Vehicle Assigned",
  DRIVER_ASSIGNED: "Driver Assigned",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  ARRIVED_DESTINATION: "Arrived Destination",
  DELIVERED: "Delivered",
  POD_RECEIVED: "POD Received",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// The set of valid next states for each status (per the spec's state machine).
export const NEXT_STATUSES: Record<RequestStatus, RequestStatus[]> = {
  NEW_REQUEST: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["QUOTATION_PREPARATION", "CANCELLED"],
  QUOTATION_PREPARATION: ["QUOTATION_SENT", "CANCELLED"],
  QUOTATION_SENT: ["AWAITING_CUSTOMER_APPROVAL", "CANCELLED"],
  AWAITING_CUSTOMER_APPROVAL: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["BOOKED", "CANCELLED"],
  REJECTED: [],
  BOOKED: ["VEHICLE_ASSIGNED", "CANCELLED"],
  VEHICLE_ASSIGNED: ["DRIVER_ASSIGNED", "CANCELLED"],
  DRIVER_ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["ARRIVED_DESTINATION", "CANCELLED"],
  ARRIVED_DESTINATION: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["POD_RECEIVED", "CANCELLED"],
  POD_RECEIVED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// Dashboard count buckets.
export const QUEUE_BUCKETS: Record<string, RequestStatus[]> = {
  New: ["NEW_REQUEST"],
  Quotes: ["UNDER_REVIEW", "QUOTATION_PREPARATION", "QUOTATION_SENT", "AWAITING_CUSTOMER_APPROVAL"],
  Booked: ["APPROVED", "BOOKED"],
  Transit: ["VEHICLE_ASSIGNED", "DRIVER_ASSIGNED", "PICKED_UP", "IN_TRANSIT", "ARRIVED_DESTINATION"],
};

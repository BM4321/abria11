export const PARTNER_STATUSES = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"] as const;
export type PartnerStatus = (typeof PARTNER_STATUSES)[number];

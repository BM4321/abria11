// Canonical internal ops roles. CUSTOMER is the public/anonymous experience and
// is not stored on OpsUser. Phase 3 collapses OPERATIONS -> MANAGER and retires
// DRIVER, but existing rows are tolerated here until the migration runs.
export const OPS_ROLES = ["ADMIN", "MANAGER", "OPERATIONS", "DRIVER"] as const;
export type OpsRole = (typeof OPS_ROLES)[number];

// Roles allowed to mutate requests, partners and quotations.
export const REQUEST_MANAGER_ROLES = ["ADMIN", "MANAGER", "OPERATIONS"] as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  OPERATIONS: "Operations",
  DRIVER: "Driver",
  CUSTOMER: "Customer",
};

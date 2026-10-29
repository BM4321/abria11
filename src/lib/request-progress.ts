import type { Prisma } from "@prisma/client";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/status";

// The happy-path order of request statuses. Work done elsewhere (saving or
// sending a quote, progressing the shipment) moves the request forward along
// this path so the request page, queue and tracking stay in step.
export const MAIN_PATH = REQUEST_STATUSES.filter(
  (s) => s !== "REJECTED" && s !== "CANCELLED"
) as RequestStatus[];

// A quote can be created, edited or (re)sent until the customer has decided.
export const QUOTE_EDITABLE: string[] = [
  "NEW_REQUEST",
  "UNDER_REVIEW",
  "QUOTATION_PREPARATION",
  "QUOTATION_SENT",
  "AWAITING_CUSTOMER_APPROVAL",
];

export function isAhead(target: string, current: string): boolean {
  const t = MAIN_PATH.indexOf(target as RequestStatus);
  const c = MAIN_PATH.indexOf(current as RequestStatus);
  return t !== -1 && c !== -1 && t > c;
}

// Moves the request to `target` if that is further along the main path than
// its current status; never moves backwards or out of REJECTED/CANCELLED.
// Compare-and-set on the status read, and records one history row.
export async function advanceRequest(
  tx: Prisma.TransactionClient,
  request: { id: string; status: string },
  target: RequestStatus,
  actor: { name: string | null; email: string | null }
): Promise<boolean> {
  if (!isAhead(target, request.status)) return false;
  const { count } = await tx.request.updateMany({
    where: { id: request.id, status: request.status },
    data: { status: target },
  });
  if (count === 0) return false;
  await tx.requestStatusHistory.create({
    data: {
      requestId: request.id,
      fromStatus: request.status,
      toStatus: target,
      changedByName: actor.name,
      changedByEmail: actor.email,
    },
  });
  return true;
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NEXT_STATUSES, RequestStatus } from "@/lib/status";
import { requireRole } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { getCurrentOpsUser } from "@/lib/auth";
import { readJsonObject, badRequest } from "@/lib/validate";

// Delivery stages owned by the shipment once one exists (kept in sync by
// /api/shipments/[id]); setting them here would desynchronise the two.
const SHIPMENT_DRIVEN = [
  "VEHICLE_ASSIGNED",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_DESTINATION",
  "DELIVERED",
  "POD_RECEIVED",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const { id } = await params;
  const request = await prisma.request.findUnique({
    where: { id },
    include: { assignedPartner: true, history: { orderBy: { changedAt: "desc" } } },
  });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  return NextResponse.json(request);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const { id } = await params;
  const raw = await readJsonObject(req);
  if (!raw) return badRequest("Invalid JSON body.");
  const body = raw as {
    status?: unknown;
    assignedOperatorId?: unknown;
    assignedPartnerId?: unknown;
  };
  for (const key of ["status", "assignedOperatorId", "assignedPartnerId"] as const) {
    if (body[key] !== undefined && body[key] !== null && typeof body[key] !== "string") {
      return badRequest(`${key} must be a string.`);
    }
  }

  const current = await prisma.request.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const data: {
    status?: string;
    assignedOperatorId?: string | null;
    assignedPartnerId?: string | null;
  } = {};

  if (body.status === "BOOKED") {
    return NextResponse.json(
      { error: "Book a request with \"Convert to shipment\", which also creates the shipment." },
      { status: 409 }
    );
  }
  if (body.status !== undefined && SHIPMENT_DRIVEN.includes(body.status as string)) {
    const hasShipment = await prisma.shipment.findUnique({ where: { requestId: id }, select: { id: true } });
    if (hasShipment) {
      return NextResponse.json(
        { error: "This stage is updated from the shipment page." },
        { status: 409 }
      );
    }
  }

  if (body.status !== undefined) {
    const next = NEXT_STATUSES[current.status as RequestStatus];
    if (!next || !next.includes(body.status as RequestStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${current.status} to ${body.status}` },
        { status: 400 }
      );
    }
    data.status = body.status as string;
  }

  if (body.assignedOperatorId !== undefined) {
    const operatorId = (body.assignedOperatorId as string | null) || null;
    if (operatorId && !(await prisma.opsUser.findFirst({ where: { id: operatorId, active: true } }))) {
      return badRequest("Assigned operator does not exist or is inactive.");
    }
    data.assignedOperatorId = operatorId;
  }

  if (body.assignedPartnerId !== undefined) {
    const partnerId = (body.assignedPartnerId as string | null) || null;
    if (partnerId && !(await prisma.partner.findUnique({ where: { id: partnerId } }))) {
      return badRequest("Assigned carrier does not exist.");
    }
    data.assignedPartnerId = partnerId;
  }

  const actor = data.status ? await getCurrentOpsUser() : null;

  const updated = await prisma.$transaction(async (tx) => {
    // Compare-and-set on the status we validated against: if another operator
    // moved the request meanwhile, fail instead of applying a stale transition.
    const { count } = await tx.request.updateMany({
      where: { id, status: current.status },
      data,
    });
    if (count === 0) return null;
    const result = await tx.request.findUniqueOrThrow({ where: { id } });

    // Record status change in the audit history.
    if (data.status && data.status !== current.status) {
      await tx.requestStatusHistory.create({
        data: {
          requestId: id,
          fromStatus: current.status,
          toStatus: data.status,
          changedByName: actor?.name ?? null,
          changedByEmail: actor?.email ?? null,
        },
      });
    }

    return result;
  });

  if (!updated) {
    return NextResponse.json(
      { error: "This request was updated by someone else. Reload and try again." },
      { status: 409 }
    );
  }

  return NextResponse.json(updated);
}

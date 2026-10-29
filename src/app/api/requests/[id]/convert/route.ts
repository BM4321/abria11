import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { generateShipmentId } from "@/lib/shipment-id";
import { REQUEST_STATUS_UI } from "@/lib/console";

// Converts a request into a shipment. Idempotent per request.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  const { id } = await params;
  const request = await prisma.request.findUnique({
    where: { id },
    include: { shipment: true },
  });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (request.shipment) {
    return NextResponse.json(
      { shipmentId: request.shipment.shipmentId, id: request.shipment.id },
      { status: 200 }
    );
  }

  if (request.status === "REJECTED" || request.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Rejected or cancelled requests cannot be converted to a shipment." },
      { status: 409 }
    );
  }

  const shipmentId = await generateShipmentId();

  let shipment;
  try {
    shipment = await prisma.$transaction(async (tx) => {
      const created = await tx.shipment.create({
        data: {
          shipmentId,
          requestId: request.id,
          customerName: request.contactPerson,
          customerCompany: request.companyName,
          customerPhone: request.phone,
          cargoDescription: request.cargoDescription,
          weight: request.weight,
          quantity: request.quantity,
          pickupLocation: request.pickupLocation,
          deliveryLocation: request.deliveryLocation,
          partnerId: request.assignedPartnerId,
          eta: request.requiredDeliveryDate,
          status: "ASSIGNED",
        },
      });

      // Mark the request as confirmed/booked and record it.
      await tx.request.update({
        where: { id: request.id },
        data: { status: "BOOKED" },
      });
      await tx.requestStatusHistory.create({
        data: {
          requestId: request.id,
          fromStatus: request.status,
          toStatus: "BOOKED",
          changedByName: access.user?.name ?? "ABRIA Team",
        },
      });
      await tx.auditLog.create({
        data: {
          userName: access.user?.name ?? "ABRIA Team",
          action: "Converted",
          resource: "Request",
          description: `Converted ${request.requestId} to shipment ${shipmentId}`,
        },
      });

      return created;
    });
  } catch (err) {
    // A concurrent convert (double click, two operators) won the unique
    // Shipment.requestId race: return the shipment it created.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await prisma.shipment.findUnique({ where: { requestId: request.id } });
      if (existing) {
        return NextResponse.json({ shipmentId: existing.shipmentId, id: existing.id }, { status: 200 });
      }
    }
    throw err;
  }

  return NextResponse.json(
    { shipmentId: shipment.shipmentId, id: shipment.id, status: REQUEST_STATUS_UI.BOOKED },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTNER_STATUSES } from "@/lib/partner-status";
import { requireRole, getCurrentOpsUser } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { readJsonObject, badRequest } from "@/lib/validate";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "FORBIDDEN" ? 403 : 401 });
  }

  const { id } = await params;
  const raw = await readJsonObject(req);
  if (!raw) return badRequest("Invalid JSON body.");
  const body = raw as { status?: string };

  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  if (body.status !== undefined) {
    if (!PARTNER_STATUSES.includes(body.status as (typeof PARTNER_STATUSES)[number])) {
      return NextResponse.json(
        { error: `Invalid partner status: ${body.status}` },
        { status: 400 }
      );
    }
  }

  const status = body.status ?? partner.status;
  const actor = await getCurrentOpsUser();

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.partner.update({ where: { id }, data: { status } });

    // The public "Register Truck" form records the truck on the carrier itself.
    // On verification, add it to the fleet so it can be assigned to shipments.
    // A registration number already held by another carrier is left alone.
    if (status === "VERIFIED" && partner.registrationNumber) {
      const reg = partner.registrationNumber.trim().toUpperCase();
      const existing = await tx.truck.findUnique({ where: { registrationNumber: reg } });
      if (!existing) {
        await tx.truck.create({
          data: {
            partnerId: id,
            registrationNumber: reg,
            truckType: partner.truckType,
            capacity: partner.truckCapacity,
            makeModel: partner.makeModel,
            region: partner.currentLocation,
            status: "AVAILABLE",
            verification: "VERIFIED",
          },
        });
      } else if (existing.partnerId === id) {
        await tx.truck.update({ where: { id: existing.id }, data: { verification: "VERIFIED" } });
      }
    }

    if (status !== partner.status) {
      await tx.auditLog.create({
        data: {
          userName: actor?.name ?? "ABRIA Staff",
          action: "Updated",
          resource: "Carrier",
          description: `${partner.partnerId} ${partner.status.toLowerCase()} → ${status.toLowerCase()}`,
        },
      });
    }
    return result;
  });

  return NextResponse.json(updated);
}

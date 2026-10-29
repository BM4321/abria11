import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("id")?.trim().toUpperCase();

  if (!requestId) {
    return NextResponse.json({ error: "Missing request id" }, { status: 400 });
  }

  const request = await prisma.request.findUnique({
    where: { requestId },
    include: { assignedPartner: true },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  return NextResponse.json({
    requestId: request.requestId,
    status: request.status,
    pickupLocation: request.pickupLocation,
    deliveryLocation: request.deliveryLocation,
    cargoType: request.cargoType,
    transportDate: request.transportDate,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    assignedPartner: request.assignedPartner
      ? {
          companyName: request.assignedPartner.companyName,
          contactPerson: request.assignedPartner.contactPerson,
          truckType: request.assignedPartner.truckType,
          registrationNumber: request.assignedPartner.registrationNumber,
        }
      : null,
  });
}

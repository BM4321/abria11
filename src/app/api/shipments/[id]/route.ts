import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentOpsUser } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { advanceRequest } from "@/lib/request-progress";
import { notifyEvent } from "@/lib/notify-events";
import { SHIPMENT_FLOW, SHIPMENT_PROGRESS, SHIPMENT_TO_REQUEST, shipmentStage } from "@/lib/shipment-flow";
import { ValidationError, badRequest, date, readJsonObject, str } from "@/lib/validate";

// Operations on one shipment, one action per call:
//   assign  – carrier / truck / driver / ETA
//   advance – move to the next stage (picked up → in transit → out for delivery)
//   deliver – record proof of delivery and close the shipment
//   delay   – flag or clear a delay
// Every change keeps the linked request's status and history in step.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "FORBIDDEN" ? 403 : 401 });
  }

  const { id } = await params;
  const body = await readJsonObject(req);
  if (!body) return badRequest("Invalid JSON body.");

  const shipment = await prisma.shipment.findUnique({ where: { id }, include: { request: true } });
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  if (shipment.status === "DELIVERED") {
    return NextResponse.json({ error: "This shipment has been delivered and can no longer be changed." }, { status: 409 });
  }

  const actor = await getCurrentOpsUser();
  const who = { name: actor?.name ?? null, email: actor?.email ?? null };
  const userName = actor?.name ?? "ABRIA Staff";
  const conflict = () =>
    NextResponse.json({ error: "This shipment was updated by someone else. Reload and try again." }, { status: 409 });

  try {
    switch (body.action) {
      case "assign": {
        // Saves the whole assignment form: omitted fields are cleared.
        const partnerId = str(body, "partnerId", { max: 64 });
        const truckId = str(body, "truckId", { max: 64 });
        const driverName = str(body, "driverName", { max: 120, label: "Driver name" });
        const driverPhone = str(body, "driverPhone", { max: 32, label: "Driver phone" });
        const eta = date(body, "eta", "ETA");

        if (driverPhone && !/^\+?[0-9 ()-]{7,}$/.test(driverPhone)) {
          return badRequest("Driver phone must be a valid phone number.");
        }
        if (partnerId) {
          const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
          if (!partner) return badRequest("Carrier not found.");
          if (partner.status !== "VERIFIED") return badRequest("Only verified carriers can be assigned.");
        }
        if (!partnerId && shipmentStage(shipment.status) >= shipmentStage("PICKED_UP")) {
          return badRequest("The cargo has been picked up, so the carrier can't be removed.");
        }
        if (truckId) {
          const truck = await prisma.truck.findUnique({ where: { id: truckId } });
          if (!truck) return badRequest("Truck not found.");
          if (truck.partnerId !== partnerId) return badRequest("That truck belongs to a different carrier.");
        }

        await prisma.$transaction(async (tx) => {
          await tx.shipment.update({
            where: { id },
            data: {
              partnerId,
              truckId,
              driverName,
              driverPhone,
              eta,
            },
          });
          if (shipment.request) {
            await tx.request.update({ where: { id: shipment.request.id }, data: { assignedPartnerId: partnerId } });
            if (partnerId) await advanceRequest(tx, shipment.request, "VEHICLE_ASSIGNED", who);
            if (partnerId && driverName) {
              const fresh = await tx.request.findUniqueOrThrow({ where: { id: shipment.request.id } });
              await advanceRequest(tx, fresh, "DRIVER_ASSIGNED", who);
            }
          }
          await tx.auditLog.create({
            data: { userName, action: "Updated", resource: "Shipment", description: `Updated assignment on ${shipment.shipmentId}` },
          });
        });
        break;
      }

      case "advance": {
        const to = str(body, "to", { required: true, max: 32 });
        const current = shipmentStage(shipment.status);
        const next = SHIPMENT_FLOW[current + 1];
        if (to === "DELIVERED") return badRequest("Use \"Record delivery\" to close the shipment with proof of delivery.");
        if (to !== next) {
          return badRequest(`A shipment that is ${shipment.status.replace(/_/g, " ").toLowerCase()} can only move to ${next?.replace(/_/g, " ").toLowerCase() ?? "nothing"}.`);
        }
        if (to === "PICKED_UP" && !shipment.partnerId) {
          return badRequest("Assign a carrier before marking the cargo as picked up.");
        }

        const ok = await prisma.$transaction(async (tx) => {
          const { count } = await tx.shipment.updateMany({
            where: { id, status: shipment.status },
            data: { status: to, progress: SHIPMENT_PROGRESS[to] },
          });
          if (count === 0) return false;
          if (shipment.request) await advanceRequest(tx, shipment.request, SHIPMENT_TO_REQUEST[to], who);
          await tx.auditLog.create({
            data: { userName, action: "Updated", resource: "Shipment", description: `${shipment.shipmentId} marked ${to.replace(/_/g, " ").toLowerCase()}` },
          });
          return true;
        });
        if (!ok) return conflict();
        break;
      }

      case "deliver": {
        const receivedBy = str(body, "receivedBy", { required: true, max: 120, label: "Received by" })!;
        const podNotes = str(body, "podNotes", { max: 2000, label: "Delivery notes" });
        const deliveredAt = date(body, "deliveredAt", "Delivery time") ?? new Date();
        if (deliveredAt.getTime() > Date.now() + 5 * 60_000) return badRequest("Delivery time cannot be in the future.");
        if (shipmentStage(shipment.status) < shipmentStage("IN_TRANSIT")) {
          return badRequest("A shipment must be in transit before it can be delivered.");
        }

        const ok = await prisma.$transaction(async (tx) => {
          const { count } = await tx.shipment.updateMany({
            where: { id, status: shipment.status },
            data: { status: "DELIVERED", progress: 1, deliveredAt, delayed: false },
          });
          if (count === 0) return false;
          if (shipment.request) {
            await tx.request.update({
              where: { id: shipment.request.id },
              data: { podReceivedBy: receivedBy, podNotes, podReceivedAt: deliveredAt },
            });
            await advanceRequest(tx, shipment.request, "POD_RECEIVED", who);
          }
          await tx.auditLog.create({
            data: { userName, action: "Delivered", resource: "Shipment", description: `${shipment.shipmentId} delivered, received by ${receivedBy}` },
          });
          return true;
        });
        if (!ok) return conflict();
        break;
      }

      case "delay": {
        const delayed = body.delayed === true;
        const delayNote = delayed ? str(body, "delayNote", { required: true, max: 500, label: "Delay reason" }) : null;
        await prisma.$transaction([
          prisma.shipment.update({ where: { id }, data: { delayed, delayNote } }),
          prisma.auditLog.create({
            data: {
              userName,
              action: "Updated",
              resource: "Shipment",
              description: delayed ? `${shipment.shipmentId} delayed: ${delayNote}` : `${shipment.shipmentId} delay cleared`,
            },
          }),
        ]);
        if (delayed && !shipment.delayed) {
          await notifyEvent("shipment", {
            title: `${shipment.shipmentId} is delayed`,
            body: `${shipment.pickupLocation} → ${shipment.deliveryLocation} · ${delayNote}`,
            href: `/operations/shipments/${id}`,
          });
        }
        break;
      }

      default:
        return badRequest("Unknown action. Use assign, advance, deliver or delay.");
    }
  } catch (err) {
    if (err instanceof ValidationError) return badRequest(err.message);
    throw err;
  }

  const updated = await prisma.shipment.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

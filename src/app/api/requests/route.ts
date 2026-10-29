import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRequestId } from "@/lib/request-id";
import { notifyRequestCreated } from "@/lib/notify";
import { notifyEvent } from "@/lib/notify-events";
import { contactFrom, getSettings } from "@/lib/settings";
import { badRequest, readJsonObject, tooManyRequests } from "@/lib/validate";
import { checkSubmission, day, number, text } from "@/lib/forms/submit";

export async function POST(req: Request) {
  const body = await readJsonObject(req);
  if (!body) return badRequest("Invalid JSON body.");

  // Validated against the form as published in Admin > Forms.
  const checked = await checkSubmission("quote", body);
  if (!checked.ok) return checked.response;
  const v = checked.values;
  const data = {
    contactPerson: text(v, "contactPerson")!,
    phone: text(v, "phone")!,
    email: text(v, "email")?.toLowerCase() ?? null,
    companyName: text(v, "companyName"),
    pickupLocation: text(v, "pickupLocation")!,
    deliveryLocation: text(v, "deliveryLocation")!,
    cargoType: text(v, "cargoType")!,
    cargoDescription: text(v, "cargoDescription"),
    weight: number(v, "weight"),
    dimensions: text(v, "dimensions"),
    numberOfPackages: number(v, "numberOfPackages"),
    cargoValue: number(v, "cargoValue"),
    transportType: text(v, "transportType") ?? "Road",
    transportDate: day(v, "transportDate"),
    requiredDeliveryDate: day(v, "requiredDeliveryDate"),
    specialHandling: text(v, "specialHandling"),
    additionalInstructions: text(v, "additionalInstructions"),
    ...(checked.extra ? { extra: checked.extra } : {}),
  };

  // Counted only for valid submissions, so a customer fixing form errors is
  // never locked out; only repeated real submissions (spam, email abuse) are.
  if (tooManyRequests(req, "requests", 10)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const requestId = await generateRequestId();

  const request = await prisma.request.create({
    data: { requestId, status: "NEW_REQUEST", ...data },
  });

  // Awaited (not fire-and-forget): on serverless hosts the function can freeze
  // right after the response is sent, which would silently drop this email.
  try {
    await notifyRequestCreated({
      requestId,
      contactPerson: request.contactPerson,
      phone: request.phone,
      email: request.email,
      pickupLocation: request.pickupLocation,
      deliveryLocation: request.deliveryLocation,
      cargoType: request.cargoType,
    }, contactFrom(await getSettings()));
  } catch (err) {
    console.error("[ABRIA] Request notification failed (non-fatal):", err);
  }
  await notifyEvent("request", {
    title: `New transport request ${requestId}`,
    body: `${request.companyName ?? request.contactPerson} · ${request.pickupLocation} → ${request.deliveryLocation} · ${request.cargoType}`,
    href: `/operations/requests/${request.id}`,
  });

  return NextResponse.json({ requestId, id: request.id }, { status: 201 });
}

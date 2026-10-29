import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePartnerId } from "@/lib/partner-id";
import { requireRole } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { notifyEvent } from "@/lib/notify-events";
import { badRequest, readJsonObject, tooManyRequests } from "@/lib/validate";
import { checkSubmission, text } from "@/lib/forms/submit";

export async function GET() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(partners);
}

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) return badRequest("Invalid JSON body.");

  // Validated against the form as published in Admin > Forms.
  const checked = await checkSubmission("truck", body);
  if (!checked.ok) return checked.response;
  const v = checked.values;
  const data = {
    contactPerson: text(v, "contactPerson")!,
    phone: text(v, "phone")!,
    email: text(v, "email")?.toLowerCase() ?? null,
    companyName: text(v, "companyName"),
    truckType: text(v, "truckType")!,
    truckCapacity: text(v, "truckCapacity"),
    registrationNumber: text(v, "registrationNumber")!.toUpperCase(),
    makeModel: text(v, "makeModel"),
    currentLocation: text(v, "currentLocation"),
    routesCovered: text(v, "routesCovered"),
    ...(checked.extra ? { extra: checked.extra } : {}),
  };

  // Counted only for valid submissions, so a customer fixing form errors is
  // never locked out; only repeated real submissions (spam, email abuse) are.
  if (tooManyRequests(req, "partners", 10)) {
    return NextResponse.json(
      { error: "Too many registrations. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const partnerId = await generatePartnerId();

  const partner = await prisma.partner.create({
    data: { partnerId, ...data, status: "PENDING" },
  });

  console.log(`[ABRIA] PARTNER_REGISTERED ${partner.partnerId}`);
  await notifyEvent("carrier", {
    title: "Carrier registration awaiting verification",
    body: `${partner.companyName ?? partner.contactPerson} registered a ${partner.truckType} (${partner.registrationNumber})`,
    href: `/operations/carriers/${partner.id}`,
  });

  return NextResponse.json(
    { partnerId: partner.partnerId, id: partner.id, status: partner.status },
    { status: 201 }
  );
}

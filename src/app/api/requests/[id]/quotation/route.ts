import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentOpsUser } from "@/lib/auth";
import { advanceRequest, QUOTE_EDITABLE } from "@/lib/request-progress";
import { readJsonObject, badRequest } from "@/lib/validate";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "FORBIDDEN" ? 403 : 401 });
  }

  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { requestId: id },
  });
  if (!quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }
  return NextResponse.json(quotation);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "FORBIDDEN" ? 403 : 401 });
  }

  const { id } = await params;
  const request = await prisma.request.findUnique({
    where: { id },
  });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (!QUOTE_EDITABLE.includes(request.status)) {
    return NextResponse.json(
      { error: "The quotation can no longer be changed: the request has moved past the quote stage." },
      { status: 409 }
    );
  }

  const raw = await readJsonObject(req);
  if (!raw) return badRequest("Invalid JSON body.");
  const body = raw as {
    transportCost?: number;
    loadingCost?: number;
    offloadingCost?: number;
    tolls?: number;
    fuelSurcharge?: number;
    handling?: number;
    insurance?: number;
    otherCharges?: number;
    vat?: number;
    validUntil?: string | null;
    notes?: string | null;
  };

  const amountFields = [
    "transportCost", "loadingCost", "offloadingCost", "tolls", "fuelSurcharge",
    "handling", "insurance", "otherCharges", "vat",
  ] as const;
  for (const key of amountFields) {
    const v = body[key];
    if (v !== undefined && v !== null && (typeof v !== "number" || !isFinite(v) || v < 0 || v > 1e13)) {
      return badRequest(`${key} must be a non-negative amount.`);
    }
  }
  if (body.notes != null && (typeof body.notes !== "string" || body.notes.length > 5000)) {
    return badRequest("Notes must be text of at most 5000 characters.");
  }

  const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);

  const transportCost = num(body.transportCost);
  const loadingCost = num(body.loadingCost);
  const offloadingCost = num(body.offloadingCost);
  const tolls = num(body.tolls);
  const fuelSurcharge = num(body.fuelSurcharge);
  const handling = num(body.handling);
  const insurance = num(body.insurance);
  const otherCharges = num(body.otherCharges);
  const subtotal =
    transportCost +
    loadingCost +
    offloadingCost +
    tolls +
    fuelSurcharge +
    handling +
    insurance +
    otherCharges;
  const vat = num(body.vat);
  const total = subtotal + vat;

  const items = [
    { label: "Transport Cost", amount: transportCost },
    { label: "Loading", amount: loadingCost },
    { label: "Offloading", amount: offloadingCost },
    { label: "Tolls", amount: tolls },
    { label: "Fuel Surcharge", amount: fuelSurcharge },
    { label: "Handling", amount: handling },
    { label: "Insurance", amount: insurance },
    { label: "Other Charges", amount: otherCharges },
  ];

  const validUntil = body.validUntil ? new Date(body.validUntil) : null;
  if (validUntil && Number.isNaN(validUntil.getTime())) {
    return badRequest("validUntil must be a valid date.");
  }

  const data = {
    transportCost,
    loadingCost,
    offloadingCost,
    tolls,
    fuelSurcharge,
    handling,
    insurance,
    otherCharges,
    vat,
    total,
    validUntil,
    notes: body.notes?.trim() || null,
    items: items as unknown as never,
  };

  const actor = await getCurrentOpsUser();
  const quotation = await prisma.$transaction(async (tx) => {
    const saved = await tx.quotation.upsert({
      where: { requestId: id },
      create: { requestId: id, ...data },
      update: data,
    });
    // Preparing a quote means the request has been reviewed.
    await advanceRequest(tx, request, "QUOTATION_PREPARATION", {
      name: actor?.name ?? null,
      email: actor?.email ?? null,
    });
    return saved;
  });

  return NextResponse.json(quotation);
}

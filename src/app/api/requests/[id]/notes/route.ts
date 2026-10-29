import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentOpsUser } from "@/lib/auth";
import { readJsonObject, badRequest } from "@/lib/validate";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";

export async function GET(
  _req: NextRequest,
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
  const notes = await prisma.internalNote.findMany({
    where: { requestId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

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
  const body = await readJsonObject(req);
  if (!body) return badRequest("Invalid JSON body.");
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return badRequest("Note text is required.");
  if (text.length > 5000) return badRequest("Notes must be at most 5000 characters.");

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const actor = await getCurrentOpsUser();
  const note = await prisma.internalNote.create({
    data: {
      requestId: id,
      authorName: actor?.name ?? "ABRIA Team",
      text,
    },
  });

  return NextResponse.json(note, { status: 201 });
}

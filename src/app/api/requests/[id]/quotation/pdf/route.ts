import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { buildQuotePdf, loadQuotePdfInput } from "@/lib/quote-pdf";

export const dynamic = "force-dynamic";

// Downloads the quotation as a PDF (the same document the email attaches).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: access.reason === "FORBIDDEN" ? 403 : 401 });
  }

  const { id } = await params;
  const input = await loadQuotePdfInput(prisma, id);
  if (!input) {
    return NextResponse.json({ error: "No quotation has been prepared for this request." }, { status: 404 });
  }

  const pdf = await buildQuotePdf(input);
  const inline = req.nextUrl.searchParams.get("inline") === "1";
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="ABRIA-quotation-${input.requestRef}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

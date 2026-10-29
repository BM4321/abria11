import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Uptime check for an external monitor (e.g. UptimeRobot, Better Stack):
// 200 when the app can reach the database, 503 otherwise. Reveals nothing
// beyond up/down; the underlying error goes to the server log.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[ABRIA] Health check: database unreachable", err);
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

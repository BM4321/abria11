import { NextResponse } from "next/server";
import { checkSession } from "@/lib/auth";

// Console heartbeat (see IdleLogout): keeps OpsUser.sessionSeenAt fresh while
// the user is active, and tells the page when its session was replaced by a
// sign-in on another device.
export async function GET() {
  const session = await checkSession();
  return NextResponse.json(
    { status: session.status },
    { status: session.status === "OK" ? 200 : 401, headers: { "Cache-Control": "no-store" } }
  );
}

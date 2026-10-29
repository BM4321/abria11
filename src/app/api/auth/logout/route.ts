import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/config";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

async function handleLogout(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const destination =
    params.get("timeout") === "1"
      ? "/login?timeout=1"
      : params.get("denied") === "1"
        ? "/login?denied=1"
        : params.get("replaced") === "1"
          ? "/login?replaced=1"
          : "/login";

  const response = NextResponse.redirect(new URL(destination, request.url), {
    status: 302,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Only the browser holding the account's current console session ends the
  // account's sign-in everywhere. Any other browser (one that was replaced by
  // a sign-in elsewhere, or never started a session) signs out locally, so it
  // can't sign out the device that took over.
  const sid = request.cookies.get(SESSION_COOKIE)?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  const ended =
    sid && email
      ? await prisma.opsUser.updateMany({
          where: { email, sessionId: sid },
          data: { sessionId: null, sessionSeenAt: null },
        })
      : { count: 0 };

  await supabase.auth.signOut({ scope: ended.count > 0 ? "global" : "local" });

  // Clear the activity cookie so the idle timer resets on the next sign-in.
  response.cookies.set("abria-active", "", { path: "/", maxAge: 0 });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });

  return response;
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

// GET support lets the middleware redirect here to force a timeout logout.
export async function GET(request: NextRequest) {
  return handleLogout(request);
}

import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ACTIVITY_COOKIE,
  ACTIVITY_COOKIE_MAX_AGE,
  IDLE_TIMEOUT_MS,
} from "@/lib/session";

export async function middleware(request: NextRequest) {
  // Without Supabase config nobody can sign in, so private routes always go to
  // /login (which explains the missing configuration). Never fail open.
  if (!isSupabaseConfigured) {
    const { pathname } = request.nextUrl;
    const isPrivate =
      pathname.startsWith("/operations") || pathname.startsWith("/admin");
    if (isPrivate) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPrivate =
    pathname.startsWith("/operations") || pathname.startsWith("/admin");

  if (!user && isPrivate) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"), "/operations/dashboard");
    return NextResponse.redirect(new URL(next, request.url));
  }

  // Inactivity enforcement for authenticated users in the console.
  if (user && isPrivate) {
    const now = Date.now();
    const raw = request.cookies.get(ACTIVITY_COOKIE)?.value;
    const last = raw ? Number(raw) : NaN;

    // A missing/invalid cookie means we cannot prove inactivity (e.g. the first
    // request after sign-in) — treat the current request as activity.
    if (Number.isFinite(last) && now - last > IDLE_TIMEOUT_MS) {
      const url = request.nextUrl.clone();
      url.pathname = "/api/auth/logout";
      url.search = "?timeout=1";
      return NextResponse.redirect(url);
    }

    response.cookies.set(ACTIVITY_COOKIE, String(now), {
      path: "/",
      maxAge: ACTIVITY_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/operations/:path*", "/admin/:path*", "/login"],
};

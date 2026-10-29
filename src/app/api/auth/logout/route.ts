import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/config";

async function handleLogout(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const destination =
    params.get("timeout") === "1"
      ? "/login?timeout=1"
      : params.get("denied") === "1"
        ? "/login?denied=1"
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

  await supabase.auth.signOut();

  // Clear the activity cookie so the idle timer resets on the next sign-in.
  response.cookies.set("abria-active", "", { path: "/", maxAge: 0 });

  return response;
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

// GET support lets the middleware redirect here to force a timeout logout.
export async function GET(request: NextRequest) {
  return handleLogout(request);
}

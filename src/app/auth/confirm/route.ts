import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/config";
import { safeNextPath, redirectOrigin } from "@/lib/safe-redirect";

// Handles email link confirmation for both PKCE (`code`) and token-hash
// (`token_hash` + `type`, e.g. password recovery) flows, then redirects to the
// requested `next` path with an authenticated session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next");
  const next = safeNextPath(rawNext, "/reset-password");
  const redirectTo = `${redirectOrigin(request)}${next}`;

  const otpTypes = ["recovery", "invite", "email", "signup", "magiclink", "email_change"] as const;
  type OtpType = (typeof otpTypes)[number];
  const otpType = otpTypes.includes(type as OtpType) ? (type as OtpType) : null;

  if (code || (tokenHash && otpType)) {
    const response = NextResponse.redirect(redirectTo);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
    });

    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          type: otpType as OtpType,
          token_hash: tokenHash as string,
        });

    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

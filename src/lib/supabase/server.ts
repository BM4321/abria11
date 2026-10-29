import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey, supabaseSecretKey } from "./config";

// Creates a Supabase server client using the request cookies (Auth.js / SSR
// pattern for Next.js App Router). Used in route handlers and server components.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — ignore (middleware refreshes sessions).
        }
      },
    },
  });
}

// A server client authenticated with the secret/service-role key, for trusted
// admin operations (e.g. creating users from the user-management page). Server-only.
export function createAdminClient() {
  return createServerClient(supabaseUrl, supabaseSecretKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

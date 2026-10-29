import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./config";

// Browser-side Supabase client for the auth flow (sign-in / callbacks).
export function createBrowserClientFn() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

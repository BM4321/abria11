// Central Supabase config. Supports both the newer Supabase key naming
// (PUBLISHABLE / SECRET) and the legacy (ANON / SERVICE_ROLE) so the app works
// regardless of which the user has set.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Public/publishable key — safe to expose in the browser.
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

// Secret/service-role key — server-only.
export const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";

// Whether the app has enough Supabase config to enable auth features.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

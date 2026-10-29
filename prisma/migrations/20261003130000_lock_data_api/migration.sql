-- Lock the Supabase Data API (PostgREST) out of the app's tables.
--
-- The app reads and writes exclusively through Prisma, which connects as the
-- table-owning `postgres` role and is unaffected by RLS. Supabase, however,
-- grants its public `anon` / `authenticated` API roles access to tables created
-- in `public`, so without this anyone holding the (browser-visible) publishable
-- key could read customer PII or write any table via /rest/v1.
--
-- RLS with no policies = deny-all for those roles. Revoking grants is a second
-- layer. Guarded so it is a no-op on plain Postgres (local dev/CI) where the
-- Supabase roles do not exist.
--
-- New tables added in later migrations must also `ENABLE ROW LEVEL SECURITY`.

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
  END IF;
END $$;

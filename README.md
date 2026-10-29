# ABRIA Logistics

ABRIA Logistics MVP Phase 1 — a Next.js 15 logistics request-and-fulfilment platform with an ops dashboard, user management, and notifications.

## Features

- **Public site** — Broadsheet marketing pages: Home, Solutions, How It Works, For Businesses, For Carriers, About, Contact, plus Request Quote, Register Truck and Track.
- **Request engine** — creates and tracks requests with unique **ABR IDs**.
- **Ops console** — Dashboard, Requests, Shipments, Quotes, Deliveries, Carriers, Trucks, Customers, Reports and Notifications.
- **Admin area** — Website pages/media, Forms, Users & roles, Settings and Audit logs.
- **Notifications** — email (Resend) and WhatsApp contact links, degrading gracefully when unconfigured.
- **Supabase Auth** — authentication for the operations dashboard, in every
  environment. Without the Supabase env vars nobody can sign in, so
  `/operations` and `/admin` stay locked (there is no local-dev bypass).

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Prisma ORM (Supabase Postgres)
- Supabase Auth
- Tailwind CSS
- Deployed on Netlify

## Local Setup

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL,
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY (see .env.example)
npx prisma migrate deploy   # apply migrations to the database
npm run prisma:seed         # create the ops admin user
npm run seed:admin          # CMS pages, media, settings, form definitions
npm run dev
```

Open http://localhost:3000.

## Design system

The UI follows the **Broadsheet** design system (light paper ground, cyan and
magenta process accents, Source Serif / Roboto). Tokens and component classes
live in `src/app/broadsheet.css`; the CMYK process-plate image treatments and
the pointer "press lean" driver live in `src/components/PrintPlates.tsx`. The
site supports light/dark mode with a circular view-transition reveal, persisted
in `localStorage` under `abria-theme`.

Public content (solutions, page routes, contact details, bilingual strings)
lives in `src/lib/site.ts`. Console formatting, status tones and label maps live
in `src/lib/console.ts`.

## Switching to Supabase (Production / Netlify)

The app uses **Supabase Postgres** (Prisma provider is `postgresql`) for all environments.

1. Create a Supabase project and get its **IPv4 pooler** connection string
   (Dashboard > Connect > ORM > Prisma). Use this — NOT the `db.<ref>.supabase.co`
   host, which is IPv6-only and unreachable from most networks.
2. Set `DATABASE_URL` to that connection string, and `DIRECT_URL` to the
   session-mode (port 5432) string, which `prisma migrate` needs.
3. Apply migrations with the **Deploy Prisma Schema** GitHub workflow (needs the
   `DATABASE_URL` and `DIRECT_URL` repository secrets) or `npx prisma migrate deploy`.
4. Set the following in Netlify (Site settings > Environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (public/anon)
   - `SUPABASE_SECRET_KEY` (server-only — never prefix with `NEXT_PUBLIC_`)
   - `DATABASE_URL`
   - `ABRIA_ADMIN_EMAIL` (used by `prisma/seed.ts`)
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://abrialogistics.co.tz`; canonical
     links, sitemap and password-reset emails)
5. In Supabase > Authentication > URL Configuration, add
   `<site URL>/auth/confirm` and `<site URL>/auth/callback` to Redirect URLs.

## Access model

- Only staff with an **active** `OpsUser` record can use `/operations` and
  `/admin`. Accounts are created by an admin (Admin > Users) or once via the
  token-gated `/setup` page. Signing in to Supabase alone grants nothing, and
  deactivating a user revokes access on their next request.
- Every table has Row Level Security enabled with no policies, and the Supabase
  `anon`/`authenticated` roles have no table grants, so the public Supabase REST
  API cannot read or write app data. The app talks to Postgres only through
  Prisma. **Any new table must `ENABLE ROW LEVEL SECURITY` in its migration.**
- `GET /api/health` returns 200 when the app can reach the database and 503
  otherwise, for an uptime monitor.

## Tests

```bash
npm test                                   # unit tests
TEST_DATABASE_URL=postgresql://localhost/abria_test npm test   # + DB integration tests
```

The integration tests need a disposable Postgres database with migrations
applied; they refuse to run against a Supabase host.

## Netlify Deploy

1. Connect your repository to Netlify (New site > Import an existing project).
2. Build settings are read automatically from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Set the environment variables above in the Netlify UI.
4. Deploy. Netlify's Next.js runtime handles `/_next` assets and `/auth/callback` automatically.

## Architecture

The project is built using a **multi-agent parallel build approach**: independent concerns (public site, request engine, ops dashboard, user management, notifications, auth) are developed in parallel by separate agents, then integrated. This keeps feature work isolated and speeds up delivery of the MVP.
# abria

# Stepaside Golf Course - Web App Rebuild

Rebuild of https://www.stepasidegolfcourse.com/ for the HDip Client Leads for Web Development project.
Architecture pattern (client / API server / shared types / database) follows the DBSAdvancedWeb
ECommerceApp reference and the JWT auth pattern from the Research folder, translated to React + Node.js
per the project proposal.

## Structure

- `client/`  - React + Vite + TypeScript single-page app (public site: home, booking; admin area).
- `server/`  - Node.js + Express + TypeScript REST API (tee times, bookings, JWT auth).
- `shared/`  - TypeScript types shared between client and server (Booking, TeeTimeSlot, User, roles).

## Database

Local development uses SQLite via Node's built-in `node:sqlite` module - no separate database server,
and no native npm package to install/compile (deliberately avoided after `better-sqlite3` hit a native
binding issue on Windows). The schema is applied automatically on server startup
(`server/src/db/schema.sql`, idempotent), and a week of sample tee-time slots plus one Admin user are
seeded automatically if the database is empty.

For the eventual AWS deployment, `server/src/db/index.ts` and the `?`-placeholder queries in
`server/src/routes/*.ts` are the two places that would move to Postgres (RDS) - the schema itself was
kept dialect-neutral (IDs/timestamps generated in application code) to make that swap contained.

**Test credentials (seeded automatically):** `admin@stepaside.local` / `Admin123!` - use this to log in
as Admin and see every booking. Change or remove this before any real deployment.

**Members** self-register via the Register page - this always creates a `Member` account (never `Admin`,
which is only ever seeded, not self-assignable). A booking made while logged in as a Member links to
that account and shows up under "My Bookings".

Guest checkout (booking without an account) was the original design. That's been reversed at the UI
level: the booking page now sits behind a login gate (`client/src/auth/RequireAuth.tsx`) and an
anonymous visitor is redirected to `/login` with a message telling them why. Note this is currently a
client-side gate only - `POST /api/bookings` still uses `optionalAuth`, not `requireAuth`, so a request
made directly against the API (bypassing the UI) would still succeed unlinked. Tightening that
(`requireAuth` instead of `optionalAuth` on the bookings route) is a five-minute follow-up if the guest
checkout removal should also be enforced server-side.

## Getting started

1. Copy `server/.env.example` to `server/.env` (defaults are fine for local dev).
2. From the repo root: `npm install` (installs all three workspaces).
3. Run the API: `npm run dev:server` (http://localhost:4000) - creates `server/data/stepaside.db`,
   applies the schema, and seeds sample data on first run.
4. In a **second terminal**, run the client: `npm run dev:client` (http://localhost:5173, proxies
   `/api` to the server). Both need to be running at the same time.

## Status

Skeleton scaffold - booking form fields, admin slot-management UI, and the real homepage copy from the
original site are still to be filled in during the Weeks 5-7 build.

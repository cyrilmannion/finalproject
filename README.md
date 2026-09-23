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

Local development uses SQLite via Node's built-in `node:sqlite` module (Node 22 or newer) - no separate
database server, and no native npm package to install or compile (deliberately avoided after
`better-sqlite3` hit a native binding issue on Windows). The schema is applied automatically on server
startup (`server/src/db/schema.sql`, idempotent).

Tee-time slots are topped up automatically on every server start, not seeded once: a rolling 14-day
window from today is kept full (`server/src/db/seed.ts`, `INSERT OR IGNORE` against the table's
`UNIQUE(date, time)`), so the window can't silently run out the way a one-time seed did during testing.
Existing slots - including ones already booked - are left untouched.

Schema changes that SQLite can't apply in place (for example widening a `CHECK` constraint) are handled
as migration guards in `server/src/db/index.ts`, run on every startup: each checks whether an existing
table still has the old shape and, if so, rebuilds it and copies the data across. This is how the
`bookings.type` column picked up `'Member'` without losing any existing rows.

`server/src/db/index.ts` and the `?`-placeholder queries in `server/src/routes/*.ts` are the two places that
would move to Postgres (RDS) in future - the schema itself was kept dialect-neutral (IDs and timestamps
generated in application code) to make that swap contained.

## Accounts and access

- **Admin:** created on first start of an empty database from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in
  `server/.env` (password of at least 12 characters). No credentials are stored in the repository, and if the
  variables are not set no Admin account is created. It is not self-assignable through the app.
- **Members** self-register via the Register page - this always creates a `Member` account, never `Admin`.
  A booking made while logged in as a Member links to that account and shows up under "My Bookings".
- **Guest checkout** was the original design and has been reversed at the UI level: the booking page sits
  behind a login gate (`client/src/auth/RequireAuth.tsx`), so every booker is already logged in as a Member
  or an Admin by the time they reach the form.

## Booking types

A booking is one of `Visitor`, `Society` or `Member` (`shared/src/types.ts`). The form only offers
`Member` to an account whose role is `Member`, defaulting to it, on the assumption that a Member is
usually booking for themselves; an Admin booking on someone else's behalf sees `Visitor`/`Society` only.
The API enforces this too, not just the client: `POST /api/bookings` rejects a `Member` booking from an
unauthenticated caller, since the API is reachable directly and not just through the UI.

## Getting started (local development)

1. Copy `server/.env.example` to `server/.env` and set your own `JWT_SECRET`, `ADMIN_EMAIL` and
   `ADMIN_PASSWORD`.
2. From the repo root: `npm install` (installs all three workspaces).
3. Run the API: `npm run dev:server` (http://localhost:4000) - creates `server/data/stepaside.db`,
   applies the schema, and seeds sample tee times (and the Admin account, if configured) on first run.
4. In a **second terminal**, run the client: `npm run dev:client` (http://localhost:5173, proxies
   `/api` to the server). Both need to be running at the same time.

## Deployment

The app is deployed to a single AWS EC2 instance behind Nginx with HTTPS. See
[DEPLOYMENT.md](DEPLOYMENT.md) for the full procedure.

## Known limitations

- `POST /api/bookings` uses `optionalAuth`, not `requireAuth`: a `Visitor`/`Society` booking can still be
  made by an unauthenticated direct API call, bypassing the UI's login gate (a `Member` booking cannot -
  see Booking types above). Tightening this further to `requireAuth` for every booking type is planned.
- SQLite on the instance disk is a single point of failure with no automated backups.
- Schema changes are handled by hand-written migration guards (see Database above), not a migration
  framework - fine at this scale, but worth revisiting alongside any move to Postgres.

## Security notes

Secrets (`.env`, private keys, database files) must never be committed - `.env` and `*.db*` are
git-ignored. Configuration is described in `server/.env.example`, which contains placeholders only.

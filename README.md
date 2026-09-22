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
startup (`server/src/db/schema.sql`, idempotent), and a week of sample tee-time slots plus one Admin user
are seeded automatically if the database is empty.

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
  behind a login gate (`client/src/auth/RequireAuth.tsx`).

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

- The login gate on the booking page is enforced in the client. Enforcing it on the API as well
  (`requireAuth` instead of `optionalAuth` on `POST /api/bookings`) is planned.
- SQLite on the instance disk is a single point of failure with no automated backups.

## Security notes

Secrets (`.env`, private keys, database files) must never be committed - `.env` and `*.db*` are
git-ignored. Configuration is described in `server/.env.example`, which contains placeholders only.

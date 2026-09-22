import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "./index.js";

// Tops up a rolling 14-day window of tee-time slots, starting from today, every time the
// server starts - rather than seeding once when the table is first empty and never again.
// A one-time seed meant the whole window silently ran out a fortnight after the database
// was first created, and GET /api/tee-times (which only returns date >= today) would then
// return nothing at all. INSERT OR IGNORE is safe here because tee_time_slots has a
// UNIQUE(date, time) constraint: a day that already has slots is left completely alone,
// including any that have already been booked (available = 0).
const insertSlot = db.prepare(
  `INSERT OR IGNORE INTO tee_time_slots (id, date, time, capacity, available, created_at)
   VALUES (?, ?, ?, ?, ?, ?)`
);

const DAYS_AHEAD = 14; // today plus the next 13 days
const START_HOUR = 8; // 08:00
const END_HOUR = 20; // 20:00 (inclusive)
const INTERVAL_MINUTES = 10;
const CAPACITY = 4; // max players per tee time - the whole slot is claimed by one booking

const times: string[] = [];
for (let minutes = START_HOUR * 60; minutes <= END_HOUR * 60; minutes += INTERVAL_MINUTES) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  times.push(`${h}:${m}`);
}

let slotsAdded = 0;
db.exec("BEGIN");
try {
  for (let day = 0; day < DAYS_AHEAD; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().slice(0, 10);
    for (const time of times) {
      const result = insertSlot.run(randomUUID(), dateStr, time, CAPACITY, CAPACITY, new Date().toISOString());
      slotsAdded += result.changes as number;
    }
  }
  db.exec("COMMIT");
} catch (err) {
  db.exec("ROLLBACK");
  throw err;
}

if (slotsAdded > 0) {
  console.log(
    `Topped up tee-time slots: added ${slotsAdded} new slot(s) to keep the next ${DAYS_AHEAD} days bookable.`
  );
}

// Seeds one Admin user if none exists yet, so the Admin-only JWT flow (Research folder's
// Books-API assignment pattern) can be used without a registration UI. The credentials come
// from the environment (ADMIN_EMAIL / ADMIN_PASSWORD in server/.env) - none are hard-coded
// here, so no default password is ever committed to the repository. If they are not set, the
// Admin account is simply not created.
const { adminCount } = db.prepare("SELECT COUNT(*) as adminCount FROM users WHERE role = 'Admin'").get() as {
  adminCount: number;
};

if (adminCount === 0) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const MIN_PASSWORD_LENGTH = 12;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "No Admin user exists and ADMIN_EMAIL / ADMIN_PASSWORD are not set in server/.env - skipping Admin seed."
    );
  } else if (adminPassword.length < MIN_PASSWORD_LENGTH) {
    console.warn(
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters - skipping Admin seed.`
    );
  } else {
    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(
      `INSERT INTO users (id, email, password_hash, role, created_at, name) VALUES (?, ?, ?, 'Admin', ?, ?)`
    ).run(randomUUID(), adminEmail, passwordHash, new Date().toISOString(), "Stepaside Admin");
    console.log(`Seeded Admin user for ${adminEmail}`);
  }
}

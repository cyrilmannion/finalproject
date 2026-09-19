import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "./index.js";

// Seeds tee-time slots for the next two weeks if the table is empty, mirroring the
// SeedData.Initialize(services) pattern from the ECommerceMVC reference repo.
const { slotCount } = db.prepare("SELECT COUNT(*) as slotCount FROM tee_time_slots").get() as {
  slotCount: number;
};

if (slotCount === 0) {
  const insertSlot = db.prepare(
    `INSERT INTO tee_time_slots (id, date, time, capacity, available, created_at)
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

  db.exec("BEGIN");
  try {
    for (let day = 0; day < DAYS_AHEAD; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().slice(0, 10);
      for (const time of times) {
        insertSlot.run(randomUUID(), dateStr, time, CAPACITY, CAPACITY, new Date().toISOString());
      }
    }
    db.exec("COMMIT");
    console.log(
      `Seeded tee-time slots for the next ${DAYS_AHEAD} days (${START_HOUR}:00-${END_HOUR}:00, every ${INTERVAL_MINUTES} min)`
    );
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// Seeds one default Admin user if none exists yet, so the Admin-only JWT flow (Research
// folder's Books-API assignment pattern) can be tested immediately without a registration UI.
const { adminCount } = db.prepare("SELECT COUNT(*) as adminCount FROM users WHERE role = 'Admin'").get() as {
  adminCount: number;
};

if (adminCount === 0) {
  const passwordHash = bcrypt.hashSync("Admin123!", 10);
  db.prepare(
    `INSERT INTO users (id, email, password_hash, role, created_at, name) VALUES (?, ?, ?, 'Admin', ?, ?)`
  ).run(randomUUID(), "admin@stepaside.local", passwordHash, new Date().toISOString(), "Stepaside Admin");
  console.log("Seeded default Admin user -> admin@stepaside.local / Admin123! (change before deploying)");
}

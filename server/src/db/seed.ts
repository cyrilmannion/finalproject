import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "./index.js";

// Seeds a week of sample tee-time slots if the table is empty, mirroring the
// SeedData.Initialize(services) pattern from the ECommerceMVC reference repo.
const { slotCount } = db.prepare("SELECT COUNT(*) as slotCount FROM tee_time_slots").get() as {
  slotCount: number;
};

if (slotCount === 0) {
  const insertSlot = db.prepare(
    `INSERT INTO tee_time_slots (id, date, time, capacity, available, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const times = ["08:00", "09:10", "10:20", "13:30", "15:00"];

  db.exec("BEGIN");
  try {
    for (let day = 1; day <= 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().slice(0, 10);
      for (const time of times) {
        insertSlot.run(randomUUID(), dateStr, time, 4, 4, new Date().toISOString());
      }
    }
    db.exec("COMMIT");
    console.log("Seeded sample tee-time slots for the next 7 days");
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
    `INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, 'Admin', ?)`
  ).run(randomUUID(), "admin@stepaside.local", passwordHash, new Date().toISOString());
  console.log("Seeded default Admin user -> admin@stepaside.local / Admin123! (change before deploying)");
}

import { randomUUID } from "node:crypto";
import { Router } from "express";
import { db } from "../db/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const teeTimesRouter = Router();

interface SlotRow {
  id: string;
  date: string;
  time: string;
  capacity: number;
  available: number;
}

// GET /api/tee-times - list bookable slots (public: visitors need to see availability).
// A slot with available = 0 is fully booked and is excluded entirely, per the "once
// reserved it should no longer display as available" requirement - not just disabled.
teeTimesRouter.get("/", (_req, res, next) => {
  try {
    const rows = db
      .prepare(
        `SELECT id, date, time, capacity, available FROM tee_time_slots
         WHERE date >= date('now') AND available > 0
         ORDER BY date, time`
      )
      .all() as unknown as SlotRow[];

    // Also hide today's slots whose time has already passed.
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const nowTimeStr = now.toISOString().slice(11, 16);
    const upcoming = rows.filter((slot) => slot.date !== todayStr || slot.time >= nowTimeStr);

    res.json(upcoming);
  } catch (err) {
    next(err);
  }
});

// POST /api/tee-times - create a slot (Admin only), mirroring the Research folder's
// "restrict certain operations to Admin users" requirement.
teeTimesRouter.post("/", requireAuth, requireRole("Admin"), (req, res, next) => {
  try {
    const { date, time, capacity } = req.body as { date?: string; time?: string; capacity?: number };
    if (!date || !time) {
      return res.status(400).json({ error: "date and time are required" });
    }
    const id = randomUUID();
    const cap = capacity ?? 4;
    db.prepare(
      `INSERT INTO tee_time_slots (id, date, time, capacity, available, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, date, time, cap, cap, new Date().toISOString());

    const slot = db
      .prepare("SELECT id, date, time, capacity, available FROM tee_time_slots WHERE id = ?")
      .get(id);
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
});

// TODO: PUT /:id and DELETE /:id (Admin only) to update/remove a slot.

import { randomUUID } from "node:crypto";
import { Router } from "express";
import { db } from "../db/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const teeTimesRouter = Router();

// GET /api/tee-times - list upcoming slots (public: visitors need to see availability).
teeTimesRouter.get("/", (_req, res, next) => {
  try {
    const rows = db
      .prepare(
        "SELECT id, date, time, capacity, available FROM tee_time_slots WHERE date >= date('now') ORDER BY date, time"
      )
      .all();
    res.json(rows);
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

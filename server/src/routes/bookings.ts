import { randomUUID } from "node:crypto";
import { Router } from "express";
import { db } from "../db/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const bookingsRouter = Router();

class NotEnoughAvailabilityError extends Error {}

interface CreateBookingParams {
  id: string;
  teeTimeSlotId: string;
  type: string;
  name: string;
  email: string;
  phone?: string;
  partySize: number;
  createdAt: string;
}

// Manual transaction (node:sqlite has no built-in .transaction() helper like better-sqlite3) -
// keeps the availability check and the decrement atomic so two bookings can't race each other.
function createBooking(params: CreateBookingParams) {
  db.exec("BEGIN");
  try {
    const slot = db
      .prepare("SELECT available FROM tee_time_slots WHERE id = ?")
      .get(params.teeTimeSlotId) as { available: number } | undefined;

    if (!slot || slot.available < params.partySize) {
      throw new NotEnoughAvailabilityError("Not enough availability for this slot");
    }

    db.prepare(
      `INSERT INTO bookings (id, tee_time_slot_id, type, name, email, phone, party_size, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      params.id,
      params.teeTimeSlotId,
      params.type,
      params.name,
      params.email,
      params.phone ?? null,
      params.partySize,
      params.createdAt
    );

    db.prepare("UPDATE tee_time_slots SET available = available - ? WHERE id = ?").run(
      params.partySize,
      params.teeTimeSlotId
    );

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(params.id);
    db.exec("COMMIT");
    return booking;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// POST /api/bookings - public: create a visitor or society booking against a tee time slot.
bookingsRouter.post("/", (req, res, next) => {
  try {
    const { teeTimeSlotId, type, name, email, phone, partySize } = req.body as {
      teeTimeSlotId?: string;
      type?: "Visitor" | "Society";
      name?: string;
      email?: string;
      phone?: string;
      partySize?: number;
    };

    if (!teeTimeSlotId || !type || !name || !email || !partySize) {
      return res
        .status(400)
        .json({ error: "teeTimeSlotId, type, name, email and partySize are required" });
    }

    const booking = createBooking({
      id: randomUUID(),
      teeTimeSlotId,
      type,
      name,
      email,
      phone,
      partySize,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof NotEnoughAvailabilityError) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

// GET /api/bookings - Admin only: view all bookings.
bookingsRouter.get("/", requireAuth, requireRole("Admin"), (_req, res, next) => {
  try {
    const rows = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

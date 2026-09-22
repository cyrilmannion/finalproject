import { randomUUID } from "node:crypto";
import { Router } from "express";
import { db } from "../db/index.js";
import { type AuthedRequest, optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";

export const bookingsRouter = Router();

class SlotUnavailableError extends Error {}
class PartySizeTooLargeError extends Error {}

interface CreateBookingParams {
  id: string;
  teeTimeSlotId: string;
  type: string;
  name: string;
  email: string;
  phone?: string;
  partySize: number;
  createdAt: string;
  userId: string | null;
}

// A tee time is claimed entirely by one booking (one group per slot, matching how club
// tee sheets actually work), rather than being partially filled by party size. Wrapped in
// a manual transaction so two people can't both claim the same slot at once.
function createBooking(params: CreateBookingParams) {
  db.exec("BEGIN");
  try {
    const slot = db
      .prepare("SELECT capacity, available FROM tee_time_slots WHERE id = ?")
      .get(params.teeTimeSlotId) as { capacity: number; available: number } | undefined;

    if (!slot || slot.available <= 0) {
      throw new SlotUnavailableError("This tee time is no longer available");
    }
    if (params.partySize > slot.capacity) {
      throw new PartySizeTooLargeError(`This tee time allows a maximum of ${slot.capacity} players`);
    }

    db.prepare(
      `INSERT INTO bookings (id, tee_time_slot_id, type, name, email, phone, party_size, created_at, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      params.id,
      params.teeTimeSlotId,
      params.type,
      params.name,
      params.email,
      params.phone ?? null,
      params.partySize,
      params.createdAt,
      params.userId
    );

    // Whole slot consumed by this one booking, regardless of party size.
    db.prepare("UPDATE tee_time_slots SET available = 0 WHERE id = ?").run(params.teeTimeSlotId);

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(params.id);
    db.exec("COMMIT");
    return booking;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// POST /api/bookings - public: create a visitor or society booking against a tee time slot.
// optionalAuth: if the caller happens to be logged in, the booking is linked to their
// account (so it shows up under "My Bookings") - but an account is never required to book.
bookingsRouter.post("/", optionalAuth, (req: AuthedRequest, res, next) => {
  try {
    const { teeTimeSlotId, type, name, email, phone, partySize } = req.body as {
      teeTimeSlotId?: string;
      type?: "Visitor" | "Society" | "Member";
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
    if (!["Visitor", "Society", "Member"].includes(type)) {
      return res.status(400).json({ error: "type must be Visitor, Society or Member" });
    }
    // A "Member" booking claims to be made by a logged-in club member, so it requires an
    // authenticated caller - unlike Visitor/Society, which stay open to anyone (optionalAuth
    // above). This is enforced here rather than only in the client, since the API is reachable
    // directly (see the optionalAuth vs requireAuth note in README.md).
    if (type === "Member" && !req.user) {
      return res.status(401).json({ error: "You must be logged in to make a Member booking" });
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
      userId: req.user?.sub ?? null,
    });

    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      return res.status(409).json({ error: err.message });
    }
    if (err instanceof PartySizeTooLargeError) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// GET /api/bookings - Admin only: view every booking, joined with its tee-time slot's
// date/time so the admin view shows what the booking is actually for.
bookingsRouter.get("/", requireAuth, requireRole("Admin"), (_req, res, next) => {
  try {
    const rows = db
      .prepare(
        `SELECT b.id, b.type, b.name, b.email, b.phone,
                b.party_size AS partySize, b.created_at AS createdAt,
                s.date, s.time
         FROM bookings b
         JOIN tee_time_slots s ON s.id = b.tee_time_slot_id
         ORDER BY s.date, s.time`
      )
      .all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/mine - any authenticated user: view only their own bookings
// (those made while logged in - see optionalAuth above).
bookingsRouter.get("/mine", requireAuth, (req: AuthedRequest, res, next) => {
  try {
    const rows = db
      .prepare(
        `SELECT b.id, b.type, b.name, b.email, b.phone,
                b.party_size AS partySize, b.created_at AS createdAt,
                s.date, s.time
         FROM bookings b
         JOIN tee_time_slots s ON s.id = b.tee_time_slot_id
         WHERE b.user_id = ?
         ORDER BY s.date, s.time`
      )
      .all(req.user!.sub);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

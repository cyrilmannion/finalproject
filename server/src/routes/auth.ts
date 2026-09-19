import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

export const authRouter = Router();

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: "Admin" | "Member";
  name: string;
}

function issueToken(user: { id: string; email: string; role: "Admin" | "Member" }) {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"];
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn }
  );
}

// POST /api/auth/login - issues a JWT on successful login (Admin or Member).
// Try the seeded Admin user: admin@stepaside.local / Admin123!
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = db
      .prepare("SELECT id, email, password_hash, role, name FROM users WHERE email = ?")
      .get(email) as UserRow | undefined;

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = issueToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register - self-service sign-up. Always creates a Member account -
// Admin accounts are provisioned separately (seeded), never assignable by the registrant,
// so nobody can grant themselves admin access through this endpoint.
authRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare(
      `INSERT INTO users (id, email, password_hash, role, created_at, name) VALUES (?, ?, ?, 'Member', ?, ?)`
    ).run(id, email, passwordHash, new Date().toISOString(), name);

    const user = { id, email, role: "Member" as const, name };
    const token = issueToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

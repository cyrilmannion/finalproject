import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

export const authRouter = Router();

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: "Admin" | "Member";
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
      .prepare("SELECT id, email, password_hash, role FROM users WHERE email = ?")
      .get(email) as UserRow | undefined;

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// TODO (bonus): POST /register for self-service Member sign-up, per the Research folder's
// "bonus" suggestion of user registration with role assignment.

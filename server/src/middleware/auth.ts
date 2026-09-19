import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  user?: { sub: string; email: string; role: "Admin" | "Member" };
}

// Verifies the Bearer JWT on the request. Mirrors the JWT-authentication pattern
// from the Research folder's Secure .NET 8 Web API for Books assignment.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthedRequest["user"];
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Restricts an already-authenticated request to a specific role (e.g. "Admin").
export function requireRole(role: "Admin" | "Member") {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: `Requires ${role} role` });
    }
    next();
  };
}

// Like requireAuth, but never rejects the request - a missing or invalid token just means
// req.user stays undefined (anonymous). Used on public routes that behave differently when
// the caller happens to be logged in (e.g. linking a booking to the account that made it),
// without forcing every visitor to have an account first.
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const token = header.slice("Bearer ".length);
      req.user = jwt.verify(token, process.env.JWT_SECRET as string) as AuthedRequest["user"];
    } catch {
      // Invalid/expired token on an optional route - proceed as anonymous rather than failing.
    }
  }
  next();
}

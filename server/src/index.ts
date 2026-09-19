import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import "./db/seed.js"; // applies schema + seeds sample data on startup (imports db/index.ts)
import { authRouter } from "./routes/auth.js";
import { bookingsRouter } from "./routes/bookings.js";
import { teeTimesRouter } from "./routes/teeTimes.js";
import { weatherRouter } from "./routes/weather.js";

const app = express();

// Sets HSTS, X-Frame-Options, X-Content-Type-Options and a Content-Security-Policy
// in one go. This closes the exact gap identified in the scoring pipeline's
// security check (Section 3.1 of the interim report) - the original Stepaside
// site had none of these, which is what capped its Security sub-score at 25
// (HTTPS-only baseline, nothing else). CSP is scoped to 'self' throughout since
// everything the client loads - bundled JS/CSS, the hero video and poster,
// fonts - is served from this same origin; there are no third-party embeds to
// widen the policy for (contrast with Luttrellstown's widget/pixel-heavy page,
// Section 3.3). styleSrc allows 'unsafe-inline' because react-bootstrap
// components render some inline style="" attributes directly - that's a
// narrower, lower-risk allowance than permitting inline/eval'd scripts, which
// stay disallowed.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        mediaSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    // Only meaningful once served over HTTPS (the eventual AWS deployment) -
    // harmless to send over local HTTP dev in the meantime, browsers just ignore it.
    hsts: { maxAge: 15552000, includeSubDomains: true },
  })
);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/tee-times", teeTimesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/weather", weatherRouter);

// Centralised error handler: anything passed to next(err) lands here as a clean 500
// instead of hanging the request or crashing the process.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Stepaside API listening on http://localhost:${port}`);
});

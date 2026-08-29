import "dotenv/config";
import cors from "cors";
import express from "express";
import "./db/seed.js"; // applies schema + seeds sample data on startup (imports db/index.ts)
import { authRouter } from "./routes/auth.js";
import { bookingsRouter } from "./routes/bookings.js";
import { teeTimesRouter } from "./routes/teeTimes.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/tee-times", teeTimesRouter);
app.use("/api/bookings", bookingsRouter);

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

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { query } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import noteRoutes from "./routes/note.routes.js";
import { AppError } from "./utils/AppError.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
      return callback(new AppError("Origin is not allowed", 403));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

const health = async (req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", service: "cloudnotes-api", database: "ok" });
  } catch {
    res.status(503).json({ status: "error", service: "cloudnotes-api", database: "unavailable" });
  }
};

app.get("/health", health);
app.get("/api/health", health);

app.use("/api/notes", noteRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

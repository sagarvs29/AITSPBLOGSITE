import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { apiLimiter } from "./middleware/rateLimit.js";

const app = express();

// Trust the first proxy (Railway/Heroku/Render add X-Forwarded-* headers)
// This is required so express-rate-limit can correctly read client IPs behind a proxy
// and to avoid ERR_ERL_UNEXPECTED_X_FORWARDED_FOR when X-Forwarded-For is present.
app.set("trust proxy", 1);

// ================================
// CORS MUST COME FIRST (IMPORTANT)
// ================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://efficient-nourishment-production.up.railway.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Explicitly answer preflight
app.options("*", cors());

// ================================
// Security & core middleware
// ================================
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

// ================================
// Health checks
// ================================
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/ready", (req, res) => res.json({ status: "ready" }));

// ================================
// API routes (rate limit AFTER CORS)
// ================================
app.use("/api", apiLimiter, router);

// ================================
// 404 & error handlers
// ================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

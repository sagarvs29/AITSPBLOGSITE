import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimit.js";

const app = express();

// ================================
// Security & core middleware
// ================================
app.use(helmet());

// ✅ FIXED CORS CONFIG (IMPORTANT)
const allowedOrigins = [
  "http://localhost:5173",
  "https://efficient-nourishment-production.up.railway.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`),
        false
      );
    },
    credentials: true,
  })
);

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
// API routes
// ================================
app.use("/api", apiLimiter, router);

// ================================
// 404 & error handlers
// ================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

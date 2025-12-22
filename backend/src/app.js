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
// Strict allowlist for production
// ================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://mindful-clarity-production.up.railway.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin or non-browser requests without Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Explicitly answer preflight with same options
app.options("*", cors(corsOptions));

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

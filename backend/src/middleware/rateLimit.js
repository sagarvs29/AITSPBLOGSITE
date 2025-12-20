import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // dev-friendly
  standardHeaders: true,
  legacyHeaders: false,
});

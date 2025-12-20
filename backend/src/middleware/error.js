import { ZodError } from "zod";

export function notFoundHandler(req, res, next) {
  res.status(404).json({ success: false, message: "Not Found" });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error("Error:", err);
  // Zod validation
  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, message: "Validation error", details: err.flatten() });
  }
  // Mongoose duplicate key
  if (err?.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate key", details: err.keyValue });
  }
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || "Server error" });
}

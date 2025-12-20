import { Router } from "express";
import { register, login, verifyOtp, forgotPassword, me } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, requestResetSchema } from "../validators/auth.validation.js";
import { requireAuth, requireActive } from "../middleware/auth.js";
import { z } from "zod";

const r = Router();

// Inline schemas for new endpoints (or move to validators file)
const verifySchema = z.object({ body: z.object({ email: z.string().email(), otp: z.string().length(6) }) });

r.post("/register", validate(registerSchema), register);
r.post("/verify-otp", validate(verifySchema), verifyOtp);
r.post("/login", validate(loginSchema), login);
r.get("/me", requireAuth, requireActive, me);

// Updated forgot password route (replaces reset/request)
r.post("/forgot-password", validate(requestResetSchema), forgotPassword);

// Legacy routes for backward compatibility if needed, or remove
// r.post("/reset/request", validate(requestResetSchema), requestReset);
// r.post("/reset/confirm", validate(confirmResetSchema), confirmReset);

export default r;

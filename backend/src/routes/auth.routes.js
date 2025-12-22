import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validation.js";
import { requireAuth, requireActive } from "../middleware/auth.js";

const r = Router();

// Inline schemas for new endpoints (or move to validators file)
r.post("/register", validate(registerSchema), register);
r.post("/login", validate(loginSchema), login);
r.get("/me", requireAuth, requireActive, me);

// Legacy routes for backward compatibility if needed, or remove
// r.post("/reset/request", validate(requestResetSchema), requestReset);
// r.post("/reset/confirm", validate(confirmResetSchema), confirmReset);

export default r;

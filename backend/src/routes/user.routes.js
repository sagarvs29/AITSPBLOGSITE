import { Router } from "express";
import { getMe, updateProfile, listMembers, suspendUser, deleteUser, addConnection, removeConnection, listConnections, getUserPublic } from "../controllers/user.controller.js";
import { requireAuth, requireActive, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateProfileSchema, directoryQuerySchema } from "../validators/user.validation.js";

const r = Router();
r.get("/me", requireAuth, getMe);
r.put("/me", requireAuth, requireActive, validate(updateProfileSchema), updateProfile);
r.get("/directory", validate(directoryQuerySchema), listMembers);
r.get("/connections", requireAuth, requireActive, listConnections);
r.get("/:id", requireAuth, getUserPublic);

// connections
r.post("/:id/connect", requireAuth, requireActive, addConnection);
r.delete("/:id/connect", requireAuth, requireActive, removeConnection);

// admin actions on users (also exposed under /admin)
r.post("/:id/suspend", requireAuth, requireAdmin, suspendUser);
r.delete("/:id", requireAuth, requireAdmin, deleteUser);

export default r;

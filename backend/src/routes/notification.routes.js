import { Router } from "express";
import { listNotifications } from "../controllers/notification.controller.js";
import { requireAuth, requireActive } from "../middleware/auth.js";

const r = Router();
r.get("/", requireAuth, requireActive, listNotifications);

export default r;

import { Router } from "express";
import { stats, listUsers, listPostsAdmin } from "../controllers/admin.controller.js";
import { adminDeletePost } from "../controllers/post.controller.js";
import { suspendUser, deleteUser, getUserByIdAdmin } from "../controllers/user.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listUsersQuerySchema, listPostsAdminQuerySchema, getUserParamsSchema } from "../validators/admin.validation.js";

const r = Router();
r.get("/stats", requireAuth, requireAdmin, stats);
r.get("/users", requireAuth, requireAdmin, validate(listUsersQuerySchema), listUsers);
r.get("/users/:id", requireAuth, requireAdmin, validate(getUserParamsSchema), getUserByIdAdmin);
r.get("/posts", requireAuth, requireAdmin, validate(listPostsAdminQuerySchema), listPostsAdmin);
r.delete("/posts/:id", requireAuth, requireAdmin, adminDeletePost);
r.post("/users/:id/suspend", requireAuth, requireAdmin, suspendUser);
r.delete("/users/:id", requireAuth, requireAdmin, deleteUser);
export default r;

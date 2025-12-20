import { Router } from "express";
import { listPosts, getPost, createDraft, updatePost, deletePost, submitForApproval, approvePublish } from "../controllers/post.controller.js";
import { requireAuth, requireActive, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createPostSchema, updatePostSchema, listPostsQuerySchema } from "../validators/post.validation.js";

const r = Router();
r.get("/", validate(listPostsQuerySchema), listPosts);
r.get("/:id", getPost);
r.post("/", requireAuth, requireActive, validate(createPostSchema), createDraft);
r.put("/:id", requireAuth, requireActive, validate(updatePostSchema), updatePost);
r.post("/:id/submit", requireAuth, requireActive, submitForApproval);
r.post("/:id/approve", requireAuth, requireAdmin, approvePublish);
r.delete("/:id", requireAuth, requireActive, deletePost);
export default r;

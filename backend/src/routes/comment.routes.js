import { Router } from "express";
import { addComment, deleteOwnComment, hideComment, listComments } from "../controllers/comment.controller.js";
import { requireAuth, requireActive, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { addCommentSchema, listCommentsQuerySchema } from "../validators/post.validation.js";

const r = Router();
r.get("/", validate(listCommentsQuerySchema), listComments);
r.post("/", requireAuth, requireActive, validate(addCommentSchema), addComment);
r.delete("/:id", requireAuth, requireActive, deleteOwnComment);
r.post("/:id/hide", requireAuth, requireAdmin, hideComment);
export default r;

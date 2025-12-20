import Comment from "../models/Comment.js";
import { ok, created } from "../utils/response.js";

export async function addComment(req, res, next) {
  try {
    const { postId, content } = req.body || {};
    const c = await Comment.create({ postId, content, authorId: req.user._id, status: "VISIBLE" });
    return created(res, { id: c._id }, "Comment added");
  } catch (e) { next(e); }
}

export async function deleteOwnComment(req, res, next) {
  try {
    const { id } = req.params;
    const c = await Comment.findOne({ _id: id, authorId: req.user._id });
    if (!c) return res.status(404).json({ error: "Not found" });
    await c.deleteOne();
    return ok(res, { deleted: true });
  } catch (e) { next(e); }
}

export async function hideComment(req, res, next) {
  try {
    const { id } = req.params;
    const c = await Comment.findById(id);
    if (!c) return res.status(404).json({ error: "Not found" });
    c.status = "HIDDEN";
    await c.save();
    return ok(res, { hidden: true });
  } catch (e) { next(e); }
}

export async function listComments(req, res, next) {
  try {
    const { postId, page = 1, limit = 10 } = req.query || {};
    const pg = Number(page), lm = Number(limit);
    const filter = { postId, status: "VISIBLE" };
    const [items, total] = await Promise.all([
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      Comment.countDocuments(filter),
    ]);
    return ok(res, { items, page: pg, limit: lm, total, pages: Math.ceil(total / lm) });
  } catch (e) { next(e); }
}

import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { ok } from "../utils/response.js";

export async function stats(req, res, next) {
  try {
    const [totalMembers, totalPostsAll, publishedPosts, totalComments] = await Promise.all([
      User.countDocuments({ role: { $ne: "ADMIN" } }),
      Post.countDocuments({ status: { $ne: "DELETED" } }),
      Post.countDocuments({ status: "PUBLISHED" }),
      Comment.countDocuments(),
    ]);
    return ok(res, { totalMembers, totalPosts: totalPostsAll, publishedPosts, comments: totalComments });
  } catch (e) { next(e); }
}

export async function listUsers(req, res, next) {
  try {
    const { q = "", status, page = 1, limit = 10 } = req.query || {};
    const filter = { role: { $ne: "ADMIN" } };
    if (status) filter.status = status;
    if (q?.trim()) {
      const rx = { $regex: q.trim(), $options: "i" };
      filter.$or = [{ email: rx }, { "profile.name": rx }];
    }
    const pg = Number(page), lm = Number(limit);
    const [items, total] = await Promise.all([
      User.find(filter)
        .select("email role status profile createdAt")
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      User.countDocuments(filter),
    ]);
    return ok(res, { items, page: pg, limit: lm, total, pages: Math.ceil(total / lm) });
  } catch (e) { next(e); }
}

export async function listPostsAdmin(req, res, next) {
  try {
    const { q = "", status, author, page = 1, limit = 10, tag } = req.query || {};
    const filter = {};
    if (status) filter.status = status; // e.g., PENDING for moderation
    if (author) filter.authorId = author;
    if (tag) filter.tags = tag;
    if (q?.trim()) {
      const rx = { $regex: q.trim(), $options: "i" };
      filter.$or = [{ title: rx }, { content: rx }];
    }
    const pg = Number(page), lm = Number(limit);
    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      Post.countDocuments(filter),
    ]);
    return ok(res, { items, page: pg, limit: lm, total, pages: Math.ceil(total / lm) });
  } catch (e) { next(e); }
}

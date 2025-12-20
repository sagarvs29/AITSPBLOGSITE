import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { ok, created } from "../utils/response.js";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createDraft(req, res, next) {
  try {
    if (String(req.user.role).toUpperCase() === "ADMIN") {
      return res.status(400).json({ error: "Admins cannot create posts" });
    }
    const { title, content, tags } = req.body || {};
    const slug = slugify(title);
    const post = await Post.create({ authorId: req.user._id, title, slug, content, tags: tags || [], status: "DRAFT" });
    return created(res, { id: post._id, slug: post.slug }, "Draft created");
  } catch (e) { next(e); }
}

export async function submitForApproval(req, res, next) {
  try {
    if (String(req.user.role).toUpperCase() === "ADMIN") {
      return res.status(400).json({ error: "Admins cannot submit posts" });
    }
    const { id } = req.params;
    const post = await Post.findOne({ _id: id, authorId: req.user._id });
    if (!post) return res.status(404).json({ error: "Not found" });
    post.status = "PENDING";
    await post.save();
    return ok(res, { submitted: true }, "Post submitted for approval");
  } catch (e) { next(e); }
}

export async function approvePublish(req, res, next) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Not found" });
    post.status = "PUBLISHED";
    post.publishedAt = new Date();
    await post.save();
    return ok(res, { published: true }, "Post published");
  } catch (e) { next(e); }
}

export async function listPosts(req, res, next) {
  try {
    const { q = "", status = "PUBLISHED", author, page = 1, limit = 10, tag } = req.query || {};
    const filter = {};
    if (status) filter.status = status;
    if (author) filter.authorId = author;
    if (tag) filter.tags = tag;
    if (q?.trim()) {
      const rx = { $regex: q.trim(), $options: "i" };
      filter.$or = [{ title: rx }, { content: rx }];
    }
    const pg = Number(page), lm = Number(limit);
    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      Post.countDocuments(filter),
    ]);
    return ok(res, { items, page: pg, limit: lm, total, pages: Math.ceil(total / lm) });
  } catch (e) { next(e); }
}

export async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status === "DELETED") return res.status(404).json({ error: "Not found" });
    return ok(res, post);
  } catch (e) { next(e); }
}

export async function updatePost(req, res, next) {
  try {
    if (String(req.user.role).toUpperCase() === "ADMIN") {
      return res.status(400).json({ error: "Admins cannot modify posts" });
    }
    const { id } = req.params;
    const post = await Post.findOne({ _id: id, authorId: req.user._id });
    if (!post) return res.status(404).json({ error: "Not found" });
    post.title = req.body.title ?? post.title;
    if (req.body.title) post.slug = slugify(req.body.title);
    post.content = req.body.content ?? post.content;
    if (Array.isArray(req.body.tags)) post.tags = req.body.tags;
    await post.save();
    return ok(res, { updated: true });
  } catch (e) { next(e); }
}

export async function deletePost(req, res, next) {
  try {
    if (String(req.user.role).toUpperCase() === "ADMIN") {
      return res.status(400).json({ error: "Admins cannot delete posts" });
    }
    const { id } = req.params;
    const post = await Post.findOne({ _id: id, authorId: req.user._id });
    if (!post) return res.status(404).json({ error: "Not found" });
    post.status = "DELETED";
    await post.save();
    return ok(res, { deleted: true });
  } catch (e) { next(e); }
}

// Admin-only delete: remove any post regardless of author
export async function adminDeletePost(req, res, next) {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || "").trim();
    if (!reason) return res.status(400).json({ error: "Delete reason is required" });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Not found" });
    post.status = "DELETED";
    await post.save();
    // Notify the author
    await Notification.create({
      userId: post.authorId,
      type: "POST_DELETED",
      postId: post._id,
      reason,
      message: `Your post '${post.title}' was deleted by an admin. Reason: ${reason}`,
    });
    return ok(res, { deleted: true });
  } catch (e) { next(e); }
}

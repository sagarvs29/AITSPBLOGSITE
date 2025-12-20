import User from "../models/User.js";
import Post from "../models/Post.js";
import { ok } from "../utils/response.js";

export async function getMe(req, res, next) {
  try {
    const u = req.user;
    return ok(res, { id: u._id, email: u.email, role: u.role, status: u.status, profile: u.profile });
  } catch (e) { next(e); }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, photoUrl, bio } = req.body || {};
    let { visibility } = req.body || {};
    // Back-compat: map boolean `visible` to PUBLIC/PRIVATE
    if (typeof req.body?.visible === "boolean" && !visibility) {
      visibility = req.body.visible ? "PUBLIC" : "PRIVATE";
    }
    if (visibility) visibility = String(visibility).toUpperCase();
    req.user.profile = {
      name: name ?? req.user.profile.name,
      photoUrl: photoUrl ?? req.user.profile.photoUrl,
      bio: bio ?? req.user.profile.bio,
      visibility: visibility ?? req.user.profile.visibility,
    };
    await req.user.save();
    return ok(res, { updated: true });
  } catch (e) { next(e); }
}

export async function listMembers(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const filter = { "profile.visibility": "PUBLIC", role: { $ne: "ADMIN" } };
    if (q) filter.$or = [
      { "profile.name": { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { "profile.bio": { $regex: q, $options: "i" } },
    ];
    const [items, total] = await Promise.all([
      User.find(filter)
        .select("profile email createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    return ok(res, { items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
}

export async function suspendUser(req, res, next) {
  try {
    const { id } = req.params;
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ error: "User not found" });
    // Prevent suspending admins or self
    const isAdminTarget = String(u.role).toUpperCase() === "ADMIN";
    const isSelf = req.user && String(req.user._id) === String(id);
    if (isAdminTarget || isSelf) {
      return res.status(400).json({ error: "Operation not allowed" });
    }
    u.status = "SUSPENDED";
    await u.save();
    res.json({ ok: true });
  } catch (e) { next(e); }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ error: "User not found" });
    // Prevent deleting admins or self
    const isAdminTarget = String(u.role).toUpperCase() === "ADMIN";
    const isSelf = req.user && String(req.user._id) === String(id);
    if (isAdminTarget || isSelf) {
      return res.status(400).json({ error: "Operation not allowed" });
    }
    // Soft-delete all posts authored by this user so they disappear everywhere
    await Post.updateMany({ authorId: id }, { $set: { status: "DELETED" } });
    // Finally remove the user document
    await User.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// Admin: get user details by id
export async function getUserByIdAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const u = await User.findById(id).lean();
    if (!u) return res.status(404).json({ error: "User not found" });
    return ok(res, {
      id: u._id,
      email: u.email,
      role: u.role,
      status: u.status,
      profile: u.profile,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    });
  } catch (e) { next(e); }
}

// Connections: add
export async function addConnection(req, res, next) {
  try {
    const { id } = req.params; // user to connect to
    if (String(id) === String(req.user._id)) return res.status(400).json({ error: "Cannot connect to yourself" });
    const other = await User.findById(id);
    if (!other) return res.status(404).json({ error: "User not found" });
    if (String(other.role).toUpperCase() === "ADMIN") return res.status(400).json({ error: "Cannot connect to admin accounts" });
    const me = req.user;
    const exists = (me.connections || []).some((x) => String(x) === String(id));
    if (!exists) {
      me.connections.push(other._id);
      await me.save();
    }
    return ok(res, { connected: true });
  } catch (e) { next(e); }
}

// Connections: remove
export async function removeConnection(req, res, next) {
  try {
    const { id } = req.params; // user to disconnect
    const me = req.user;
    me.connections = (me.connections || []).filter((x) => String(x) !== String(id));
    await me.save();
    return ok(res, { removed: true });
  } catch (e) { next(e); }
}

// Connections: list
export async function listConnections(req, res, next) {
  try {
    const ids = (req.user.connections || []).map((x) => String(x));
    if (ids.length === 0) return ok(res, { items: [], total: 0 });
    const items = await User.find({ _id: { $in: ids } })
      .select("profile email status createdAt")
      .lean();
    return ok(res, { items, total: items.length });
  } catch (e) { next(e); }
}

// Public profile view with visibility rules
export async function getUserPublic(req, res, next) {
  try {
    const { id } = req.params;
    const u = await User.findById(id).lean();
    if (!u) return res.status(404).json({ error: "User not found" });
    if (String(u.role).toUpperCase() === "ADMIN") return res.status(404).json({ error: "User not found" });
    const isOwner = req.user && String(req.user._id) === String(id);
    const isAdmin = req.user && String(req.user.role).toUpperCase() === "ADMIN";
    const isConnection = req.user && (req.user.connections || []).some((x) => String(x) === String(id));
    const vis = String(u.profile?.visibility || "PUBLIC").toUpperCase();
    const allowed = isAdmin || isOwner || vis === "PUBLIC" || (vis === "CONNECTIONS" && isConnection);
    if (!allowed) return res.status(403).json({ error: "Not allowed" });
    return ok(res, {
      id: u._id,
      email: u.email,
      role: u.role,
      status: u.status,
      profile: u.profile,
      createdAt: u.createdAt,
    });
  } catch (e) { next(e); }
}

import Notification from "../models/Notification.js";
import { ok } from "../utils/response.js";

export async function listNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query || {};
    const pg = Number(page), lm = Number(limit);
    const [items, total] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      Notification.countDocuments({ userId: req.user._id }),
    ]);
    return ok(res, { items, page: pg, limit: lm, total, pages: Math.ceil(total / lm) });
  } catch (e) { next(e); }
}

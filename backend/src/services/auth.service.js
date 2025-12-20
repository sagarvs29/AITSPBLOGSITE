import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password || "", hash || "");
}

export function signAccessToken(payload, options = {}) {
  const opts = { expiresIn: "7d", ...options };
  return jwt.sign(payload, env.jwtSecret, opts);
}

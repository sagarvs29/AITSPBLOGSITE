import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { ok, error } from "../utils/response.js";

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return error(res, 400, "Email and password required");

    let user = await User.findOne({ email });
    if (user && user.isVerified) return error(res, 409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);

    if (user && !user.isVerified) {
      // Update existing unverified user and mark verified
      user.passwordHash = passwordHash;
      user.profile.name = name || user.profile.name;
      user.isVerified = true;
      await user.save();
    } else if (!user) {
      // Create new verified user (no email verification required)
      user = await User.create({
        email,
        passwordHash,
        profile: { name: name || "" },
        isVerified: true,
      });
    }

    const token = jwt.sign({ uid: user._id, role: user.role }, env.jwtSecret, { expiresIn: "7d" });
    return ok(res, { token, user }, "Account created");
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return error(res, 401, "Invalid credentials");

    // Since we removed email verification, allow login if password matches
    const isValid = await bcrypt.compare(password || "", user.passwordHash);
    if (!isValid) return error(res, 401, "Invalid credentials");

    const token = jwt.sign({ uid: user._id, role: user.role }, env.jwtSecret, { expiresIn: "7d" });
    return ok(res, { token }, "Logged in");
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try {
    const user = req.user;
    return ok(res, {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (e) { next(e); }
}

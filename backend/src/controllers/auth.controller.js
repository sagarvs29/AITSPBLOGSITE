import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { ok, created, error } from "../utils/response.js";
import { sendOtpEmail, sendTempPasswordEmail } from "../services/mail.service.js";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return error(res, 400, "Email and password required");

    let user = await User.findOne({ email });
    if (user && user.isVerified) return error(res, 409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user && !user.isVerified) {
      // Update existing unverified user
      user.passwordHash = passwordHash;
      user.profile.name = name || user.profile.name;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        email,
        passwordHash,
        profile: { name: name || "" },
        isVerified: false,
        otp,
        otpExpires,
      });
    }

    await sendOtpEmail(email, otp);
    return ok(res, { email }, "Verification code sent to email");
  } catch (e) { next(e); }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return error(res, 404, "User not found");
    if (user.isVerified) return error(res, 400, "User already verified");
    
    if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
      return error(res, 400, "Invalid or expired OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ uid: user._id, role: user.role }, env.jwtSecret, { expiresIn: "7d" });
    return ok(res, { token, user }, "Account verified");
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return error(res, 401, "Invalid credentials");

    if (!user.isVerified) return error(res, 403, "Account not verified");

    const isValid = await bcrypt.compare(password || "", user.passwordHash);
    if (!isValid) return error(res, 401, "Invalid credentials");

    const token = jwt.sign({ uid: user._id, role: user.role }, env.jwtSecret, { expiresIn: "7d" });
    return ok(res, { token }, "Logged in");
  } catch (e) { next(e); }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return ok(res, { sent: true }, "If email exists, password sent");

    const tempPassword = crypto.randomBytes(4).toString("hex");
    user.passwordHash = await bcrypt.hash(tempPassword, 10);
    await user.save();

    await sendTempPasswordEmail(email, tempPassword);
    return ok(res, { sent: true }, "Temporary password sent");
  } catch (e) { next(e); }
}

// Alias for backward compatibility if needed
export const requestReset = forgotPassword;
export const confirmReset = async (req, res) => res.status(410).json({message: "Use login with temp password"});

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

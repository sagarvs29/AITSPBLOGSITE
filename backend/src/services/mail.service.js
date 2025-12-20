import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Configure Gmail Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("[MAIL SETUP ERROR] Cannot connect to SMTP server:", error);
    console.error("Check your .env file. EMAIL_USER present:", !!env.smtp.user, "EMAIL_PASS present:", !!env.smtp.pass);
  } else {
    console.log("[MAIL] Server is ready to take our messages");
  }
});

export async function sendOtpEmail(to, otp) {
  // ALWAYS log OTP to console in development for easy testing
  console.log(`[DEV ONLY] OTP for ${to}: ${otp}`);

  if (!env.smtp.user || !env.smtp.pass) {
    console.warn("[MAIL] Skipping email send: EMAIL_USER or EMAIL_PASS is missing in .env");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Community App" <${env.smtp.user}>`,
      to,
      subject: "Verify your account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verification Code</h2>
          <p>Your code is: <strong style="font-size: 24px; color: #4CAF50;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
    console.log(`[MAIL] OTP sent to ${to}`);
  } catch (error) {
    console.error("[MAIL ERROR]", error);
    // Don't throw in dev if credentials are missing, just log
    if (env.node === 'production') throw new Error("Failed to send OTP email");
  }
}

export async function sendTempPasswordEmail(to, tempPassword) {
  // ALWAYS log Temp Password to console in development
  console.log(`[DEV ONLY] Temp Password for ${to}: ${tempPassword}`);

  if (!env.smtp.user || !env.smtp.pass) {
    console.warn("[MAIL] Skipping email send: SMTP_USER or SMTP_PASS is missing in .env");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Community App" <${env.smtp.user}>`,
      to,
      subject: "Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset</h2>
          <p>Your temporary password is: <strong>${tempPassword}</strong></p>
          <p>Please log in and change your password immediately.</p>
        </div>
      `,
    });
    console.log(`[MAIL] Temp password sent to ${to}`);
  } catch (error) {
    console.error("[MAIL ERROR]", error);
    if (env.node === 'production') throw new Error("Failed to send password email");
  }
}

// Legacy support (optional)
export const sendResetEmail = sendTempPasswordEmail;

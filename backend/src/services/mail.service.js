import { Resend } from "resend";
import { env } from "../config/env.js";

// Initialize Resend ONLY if API key exists
const resend = env.resend?.apiKey
  ? new Resend(env.resend.apiKey)
  : null;

// ================= COMMON EMAIL SENDER =================
async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn("[MAIL] Resend not initialized (missing API key)");
    return;
  }

  try {
    await resend.emails.send({
      from: env.mail.from || "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    console.log(`[MAIL] Email sent to ${to}`);
  } catch (error) {
    console.error("[MAIL ERROR]", error);
    if (env.node === "production") {
      throw new Error("Failed to send email");
    }
  }
}

// ================= OTP EMAIL =================
export async function sendOtpEmail(to, otp) {
  // DEV log (always helpful)
  console.log(`[DEV ONLY] OTP for ${to}: ${otp}`);

  await sendEmail({
    to,
    subject: "Verify your account",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verification Code</h2>
        <p>Your code is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">
          ${otp}
        </p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

// ================= TEMP PASSWORD EMAIL =================
export async function sendTempPasswordEmail(to, tempPassword) {
  // DEV log
  console.log(`[DEV ONLY] Temp Password for ${to}: ${tempPassword}`);

  await sendEmail({
    to,
    subject: "Password Reset",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset</h2>
        <p>Your temporary password is:</p>
        <p style="font-size: 20px; font-weight: bold;">
          ${tempPassword}
        </p>
        <p>Please log in and change your password immediately.</p>
      </div>
    `,
  });
}

// ================= LEGACY SUPPORT =================
export const sendResetEmail = sendTempPasswordEmail;

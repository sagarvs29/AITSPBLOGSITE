import dotenv from "dotenv";
dotenv.config();

export const env = {
  node: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET || "changeme",
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 60),
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // 🔹 Resend email configuration
  resend: {
    apiKey: process.env.RESEND_API_KEY,
  },

  mail: {
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
  },
};

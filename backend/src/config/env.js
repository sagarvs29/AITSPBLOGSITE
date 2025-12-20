import dotenv from "dotenv";
dotenv.config();

export const env = {
  node: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET || "changeme",
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 60),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.FROM_EMAIL || "no-reply@example.com"
  }
};

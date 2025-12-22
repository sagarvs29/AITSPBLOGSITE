import dotenv from "dotenv";
dotenv.config();

export const env = {
  node: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET || "changeme",
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 60),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  // NOTE: Email functionality removed for Railway deployment. Keep env footprint minimal.
};

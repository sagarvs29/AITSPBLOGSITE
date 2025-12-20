import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectMongo() {
  if (!env.mongoUrl) throw new Error("MONGO_URL not set");
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUrl);
  console.log("MongoDB connected");
}

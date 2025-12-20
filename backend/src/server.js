import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectMongo } from "./config/mongo.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

try {
  await connectMongo();
} catch (err) {
  console.error("[WARN] Mongo connection failed:", err?.message || err);
  console.error("[WARN] Server will start without DB. Set MONGO_URL in .env and ensure MongoDB is running.");
}

const server = createServer(app);
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

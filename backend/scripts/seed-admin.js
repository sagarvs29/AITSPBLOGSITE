import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import User from "../src/models/User.js";
import { hashPassword } from "../src/services/auth.service.js";

async function main() {
	if (!env.mongoUrl) {
		console.error("Missing MONGO_URL in environment.");
		process.exit(1);
	}

	await mongoose.connect(env.mongoUrl, { autoIndex: true });
	console.log("MongoDB connected (seed)");

	const email = process.env.ADMIN_EMAIL || "admin@example.com";
	const password = process.env.ADMIN_PASSWORD || "secret123";
	const name = process.env.ADMIN_NAME || "Admin";

	const passwordHash = await hashPassword(password);

	const existing = await User.findOne({ email });
	if (existing) {
		existing.role = "ADMIN";
		existing.status = "ACTIVE";
		existing.profile = { ...(existing.profile || {}), name };
		existing.isVerified = true; // ensure admin can log in
		existing.otp = undefined;
		existing.otpExpires = undefined;
		// Only reset password if ADMIN_FORCE_RESET_PASSWORD=true
		if (String(process.env.ADMIN_FORCE_RESET_PASSWORD).toLowerCase() === "true") {
			existing.passwordHash = passwordHash;
		}
		await existing.save();
		console.log(`Updated existing admin: ${email}`);
	} else {
		await User.create({
			email,
			passwordHash,
			role: "ADMIN",
			status: "ACTIVE",
			isVerified: true,
			profile: { name, visibility: "PUBLIC" },
		});
		console.log(`Created admin: ${email}`);
	}

	console.log("\nLogin with:");
	console.log(`  Email:    ${email}`);
	console.log(`  Password: ${password}`);

	await mongoose.disconnect();
	console.log("MongoDB disconnected (seed)");
}

main().catch(async (err) => {
	console.error(err);
	try { await mongoose.disconnect(); } catch {}
	process.exit(1);
});

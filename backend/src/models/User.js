import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
    
    // OTP & Verification
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    profile: {
      name: { type: String, default: "" },
      photoUrl: { type: String, default: "" },
      bio: { type: String, default: "" },
      visibility: { type: String, enum: ["PUBLIC", "PRIVATE", "CONNECTIONS"], default: "PUBLIC" }
    },
    // Simple connections list: who can view if visibility = CONNECTIONS
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

// Text index for member directory search on name and bio
UserSchema.index({ "profile.name": "text", "profile.bio": "text" });

export default mongoose.model("User", UserSchema);

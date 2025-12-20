import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["POST_DELETED"], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    reason: { type: String, default: "" },
    message: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);

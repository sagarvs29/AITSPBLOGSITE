import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["DRAFT", "PENDING", "PUBLISHED", "DELETED"], default: "DRAFT" },
    publishedAt: { type: Date },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.model("Post", PostSchema);

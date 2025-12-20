import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["VISIBLE", "HIDDEN"], default: "VISIBLE" }
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);

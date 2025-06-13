import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationName: { type: String, required: true },
  isDM: { type: Boolean, required: true },
  members: [{ type: String, required: true }],
  lastUser: { type: String, default: "" },
  lastMessage: { type: String, default: "" },
  lastUpdated: { type: Number, default: Date.now },
});

messageSchema.index({ lastUpdated: -1 });

export default mongoose.model("Conversation", messageSchema);

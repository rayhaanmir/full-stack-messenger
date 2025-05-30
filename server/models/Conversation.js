import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  isDM: { type: Boolean, required: true },
  members: [{ type: String, required: true }],
  lastMessage: { type: String, default: "Start the conversation!" },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("Conversation", messageSchema);

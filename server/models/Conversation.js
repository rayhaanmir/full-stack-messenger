import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  isGroup: { type: Boolean, required: true },
  participants: [{ type: String, required: true }],
  lastMessage: { type: String, default: "Start the conversation!" },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);

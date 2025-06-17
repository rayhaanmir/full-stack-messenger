import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  mentions: [{ type: String, required: true }],
  text: { type: String, required: true },
  timestamp: { type: Number, required: true },
  conversationId: {
    type: mongoose.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
});

messageSchema.index({ conversationId: 1, timestamp: -1 });

export default mongoose.model("Message", messageSchema);

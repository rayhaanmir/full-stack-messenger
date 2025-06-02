import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  mentions: [{ type: String, default: [] }],
  text: { type: String, required: true },
  timestamp: { type: Number, default: Date.now },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
});

messageSchema.index({ conversationId: 1, timestamp: -1 });

export default mongoose.model("Message", messageSchema);

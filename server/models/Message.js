import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receivers: [{ type: String, required: true }],
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatId: { type: String, required: true },
});

export default mongoose.model("Message", messageSchema);

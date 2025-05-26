import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  userId: { type: String, default: "guest" },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);

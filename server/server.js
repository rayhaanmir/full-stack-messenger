import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import User from "./models/User.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = createServer(app);

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error(err);
}

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.30:5173"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.post("/api/create-user", async (req, res) => {
  const { userId } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid userId" });
  }

  const existing = await User.findOne({ userId });
  if (existing) {
    return res.status(409).json({ error: "Username taken" });
  }

  await User.create({ userId });
  return res.status(201).json({ message: "User created" });
});

app.get("/api/conversations/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await Conversation.find({
      members: userId,
    }).sort({ lastUpdated: -1 });
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/messages", async (req, res) => {
  const conversationId = req.query.conversationId;
  const limit = parseInt(req.query.limit);
  const before = req.query.before;
  try {
    let messages;
    if (before) {
      messages = await Message.find({
        conversationId: conversationId,
        timestamp: { $lt: before },
      })
        .sort({ timestamp: -1 })
        .limit(limit);
    } else {
      messages = await Message.find({
        conversationId: conversationId,
      })
        .sort({ timestamp: -1 })
        .limit(limit);
    }
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

io.on("connection", async (socket) => {
  console.log(`a user has connected from the socket "${socket.id}"`);

  socket.on("custom-event", (msg) => {
    console.clear();
    process.stdout.write(msg); // No newline
  });

  socket.on("validate-username", async (name, callback) => {
    const userExists = await User.findOne({ userId: name });
    if (userExists) {
      socket.join(name);
    }
    callback(!!userExists);
  });

  socket.on("join-conversation", (conversationId) =>
    socket.join(conversationId)
  );

  socket.on(
    "send-message",
    async (sender, mentions, text, conversationId, messageSent) => {
      try {
        const msg = await Message.create({
          sender,
          mentions,
          text,
          conversationId,
        });
        console.log(`Saved message "${msg.id}"`);
        io.to(conversationId).emit("receive-message", msg);
        console.log(`Sent message "${msg.id}"`);
        const conversation = await Conversation.findOneAndUpdate(
          { _id: conversationId },
          { lastUpdated: Date.now(), lastUser: sender, lastMessage: text }
        );
        for (const user of conversation.members) {
          console.log(`Updating ${user}'s conversations`);
          io.to(user).emit(
            "receive-conversation-update",
            conversationId,
            sender,
            text
          );
        }
        console.log(`Sent conversation update "${conversationId}"`);
        messageSent(true);
      } catch (e) {
        console.error(e);
        messageSent(false);
      }
    }
  );

  socket.on(
    "create-conversation",
    async (chatId, isDM, members, conversationCreated) => {
      try {
        const conversation = await Conversation.create({
          chatId,
          isDM,
          members,
        });
        console.log(`Saved conversation "${conversation.id}"`);
        for (const user of members) {
          console.log(`Sending to ${user}...`);
          io.to(user).emit("receive-conversation", conversation);
        }
        console.log(`Sent conversation "${conversation.id}"`);
        conversationCreated(true);
      } catch (e) {
        console.error(e);
        conversationCreated(false);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`user disconnected from "${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("server running at http://192.168.1.30:3000");
});

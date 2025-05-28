import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import User from "./models/User.js";
import Message from "./models/Message.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = createServer(app);

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("MongoDB error:", err);
}

const io = new Server(server, {
  cors: { origin: "http://192.168.1.30:5173", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

app.get("/", (res) => {
  res.status(403).send("GET requests to / are not allowed\n");
});

// app.post("/api/create-user", async (req, res) => {
//   const { userId } = req.body;

//   if (!userId || typeof userId !== "string") {
//     return res.status(400).json({ error: "Invalid userId" });
//   }

//   const existing = await User.findOne({ userId });
//   if (existing) {
//     return res.status(409).json({ error: "Username taken" });
//   }

//   await User.create({ userId });
//   return res.status(201).json({ message: "User created" });
// });

io.on("connection", async (socket) => {
  console.log(`a user has connected from the socket "${socket.id}"`);

  socket.on("custom-event", (msg) => {
    console.clear();
    process.stdout.write(msg); // No newline
  });

  socket.on("validate-username", async (name, callback) => {
    const userExists = await User.findOne({ userId: name });
    callback(!!userExists);
  });

  socket.on(
    "send-message",
    async (sender, receivers, text, chatId, messageSent) => {
      try {
        const msg = await Message.create({
          sender,
          receivers,
          text,
          chatId,
        });
        console.log(`Saved message "${msg.id}"`);
        messageSent(true);
      } catch (e) {
        console.error(e);
        messageSent(false);
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

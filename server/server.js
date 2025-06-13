import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import User from "./models/User.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import RefreshToken from "./models/RefreshToken.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import ms from "ms";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
const server = createServer(app);
const host = process.env.SERVER_IP;
const port = parseInt(process.env.SERVER_PORT);

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error(err);
}

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user || !(await user.isValidPassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const accessToken = generateAccessToken({ username });
    const refreshToken = jwt.sign(
      { username },
      process.env.REFRESH_TOKEN_SECRET
    );
    await RefreshToken.findOneAndUpdate(
      { username },
      { tokenHash: refreshToken },
      { upsert: true }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      maxAge: ms("2w"),
    });
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    await RefreshToken.findOneAndDelete({ username: decoded.username });
  } catch (err) {
    // TODO log suspicious logout
    return;
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
  });

  res.sendStatus(204);
});

app.get("/api/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const token = await RefreshToken.findOne({ username: decoded.username });
    if (!bcrypt.compare(refreshToken, token.tokenHash)) {
      return res.status(403).json({ error: "Invalid token" });
    }

    const accessToken = generateAccessToken({ username: decoded.username });
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: "Invalid token" });
  }
});

app.post("/api/create-user", async (req, res) => {
  const { username, passwordHash } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "Username taken" });
  }

  if (!passwordHash || typeof passwordHash !== "string") {
    return res.status(400).json({ error: "Invalid password" });
  }

  if (passwordHash.length < 8) {
    return res
      .status(400)
      .json({ error: "Password too short (<8 characters)" });
  }

  await User.create({ username, passwordHash });
  return res.status(201).json({ message: "User created" });
});

app.get("/api/conversations", authenticateToken, async (req, res) => {
  const username = req.user.username;
  try {
    const conversations = await Conversation.find({
      members: username,
    }).sort({ lastUpdated: -1 });
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/messages", authenticateToken, async (req, res) => {
  const conversationId = req.query.conversationId;
  const limit = parseInt(req.query.limit);
  const before = parseInt(req.query.before);
  const username = req.user.username;

  const conversation = await Conversation.findOne({ _id: conversationId });
  if (!conversation) {
    return res.status(404).send("Conversation not found");
  }
  if (!conversation.members.includes(username))
    return res.status(403).send("Forbidden");
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

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.accessToken;
  if (!token) return next(new Error("Error: No token provided"));
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return next(new Error("Access token expired or invalid"));
    socket.user = user;
    next();
  });
});

io.on("connection", async (socket) => {
  console.log(`a user has connected from the socket "${socket.id}"`);

  socket.emit("user-info", socket.user.username);

  socket.on(
    "join-user-room",
    async () => await socket.join(socket.user.username)
  );

  socket.on(
    "leave-user-room",
    async () => await socket.leave(socket.user.username)
  );

  socket.on(
    "join-conversation",
    async (conversationId) => await socket.join(conversationId)
  );

  socket.on("validate-username", async (username, callback) => {
    const userExists = await User.findOne({ username });
    callback(!!userExists);
  });

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
        io.to(conversation.members).emit(
          "receive-conversation-update",
          conversationId,
          sender,
          text
        );
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
    async (conversationName, isDM, members, conversationCreated) => {
      try {
        const conversation = await Conversation.create({
          conversationName,
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

server.listen(port, host, () => {
  console.log(`server running at http://${host}:${port}`);
});

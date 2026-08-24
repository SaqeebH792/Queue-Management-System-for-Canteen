import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import { app } from "./app.js";
import { connectDB } from "./db/index.js";

import http from "http";
import { Server } from "socket.io";
import { setSocketIO } from "./socket.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

setSocketIO(io);

io.on("connection", socket => {
  console.log("User Connected:", socket.id);

  socket.on("join", userId => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server Running on PORT: ${PORT}`);
    });
  })
  .catch(error => {
    console.log("Database connection Failed:", error);
  });

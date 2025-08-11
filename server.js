const express = require("express");
const next = require("next");
const http = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("✅ WebSocket connected");

    // join i specific video room

    socket.on("join-video", (videoId) => {
      socket.join(videoId);
      console.log(`User joined video room : ${videoId}`);
    });

    socket.on("like-video", async ({ videoId, userId }) => {
      const { likeCount, isLiked } = await toggleLike(videoId, userId);
      io.on(videoId).emit("video-like", { videoId, likeCount, isLiked });
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
    });
  });

  // Pass socket.io instance to req for API access (optional)
  expressApp.use((req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
});

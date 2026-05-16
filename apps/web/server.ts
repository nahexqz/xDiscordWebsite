// apps/web/server.ts
// Custom Next.js server with Socket.io for realtime features
// Run with: npx tsx server.ts (in development) or node dist/server.js (production)

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Track online users: Map<socketId, { userId, discordId, username }>
const onlineUsers = new Map<string, { userId: string; username: string; discordId: string }>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User comes online
    socket.on("user:online", (data: { userId: string; username: string; discordId: string }) => {
      onlineUsers.set(socket.id, data);
      // Broadcast updated online count
      io.emit("stats:online", { count: onlineUsers.size });
      console.log(`User online: ${data.username} (${onlineUsers.size} total)`);
    });

    // User joins a room (e.g. ticket room)
    socket.on("room:join", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // User leaves a room
    socket.on("room:leave", (roomId: string) => {
      socket.leave(roomId);
    });

    // Ticket reply (realtime update)
    socket.on("ticket:reply", (data: { ticketId: string; message: string; isAdmin: boolean; username: string }) => {
      io.to(`ticket:${data.ticketId}`).emit("ticket:new_reply", {
        ...data,
        createdAt: new Date().toISOString(),
      });
    });

    // Admin notification broadcast
    socket.on("admin:notify", (data: { type: string; message: string }) => {
      io.emit("notification", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      io.emit("stats:online", { count: onlineUsers.size });
      console.log(`Socket disconnected: ${socket.id} (${onlineUsers.size} total online)`);
    });
  });

  // Expose io instance for use in API routes via global
  (global as any).io = io;

  httpServer.listen(port, () => {
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`✅ Socket.io listening on /api/socket`);
  });
});

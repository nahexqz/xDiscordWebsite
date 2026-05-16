"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth-store";

let socketInstance: Socket | null = null;

export function useSocket() {
  const { user } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || "", {
        path: "/api/socket",
        transports: ["websocket", "polling"],
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionAttempts: 10,
      });
    }

    socketRef.current = socketInstance;
    const socket = socketRef.current;

    socket.on("connect", () => {
      setConnected(true);
      if (user) {
        socket.emit("user:online", {
          userId: user.id,
          username: user.username,
          discordId: user.discordId,
        });
      }
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("stats:online", ({ count }: { count: number }) => setOnlineCount(count));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stats:online");
    };
  }, [user]);

  const joinRoom = (roomId: string) => socketRef.current?.emit("room:join", roomId);
  const leaveRoom = (roomId: string) => socketRef.current?.emit("room:leave", roomId);
  const emit = (event: string, data: any) => socketRef.current?.emit(event, data);
  const on = (event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  };

  return { socket: socketRef.current, connected, onlineCount, joinRoom, leaveRoom, emit, on };
}

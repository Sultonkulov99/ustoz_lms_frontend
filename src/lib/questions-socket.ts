"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";

export function useQuestionsSocket(courseId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!courseId || typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(`${SOCKET_URL}/questions`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("joinCourseRoom", { courseId });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.emit("leaveCourseRoom", { courseId });
      socket.disconnect();
    };
  }, [courseId]);

  return { socket: socketRef.current, connected };
}
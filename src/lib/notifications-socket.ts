"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";

export interface RawNotification {
  id: number;
  type: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export function useNotificationSocket(onNotification: (n: RawNotification) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  // Callback har renderda o'zgarishi mumkin — eng so'nggisini ref orqali ushlab turamiz,
  // shunda socket qayta ulanib ketmaydi (useEffect dependency'siga qo'shmaymiz).
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("notification", (notif: RawNotification) => {
      callbackRef.current(notif);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connected };
}
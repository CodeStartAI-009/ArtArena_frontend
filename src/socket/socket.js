// src/socket/socket.js
import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

    if (!SOCKET_URL) {
      console.error(
        "❌ REACT_APP_SOCKET_URL is NOT defined. " +
        "Set it in Vercel → Project → Settings → Environment Variables."
      );
    }

    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true,
    });
  }

  return socket;
}

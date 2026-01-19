// src/socket/socket.js
import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:5090", {
      transports: ["websocket"],
      autoConnect: false, // 🔒 IMPORTANT
      withCredentials: true,
    });
  }
  return socket;
}

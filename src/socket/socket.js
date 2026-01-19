// src/socket/socket.js
import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io("https://art-arena-frontend-krr6.vercel.app/", {
      transports: ["websocket"],
      autoConnect: false, // 🔒 IMPORTANT
      withCredentials: true,
    });
  }
  return socket;
}

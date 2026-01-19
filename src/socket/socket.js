// src/socket/socket.js
import { io } from "socket.io-client";

let socket;

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5090";

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

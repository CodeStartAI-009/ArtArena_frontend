import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

if (!SOCKET_URL) {
  console.error(
    "❌ REACT_APP_SOCKET_URL is NOT defined. Check .env file."
  );
}

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
  withCredentials: true,
});

export const getSocket = () => socket;

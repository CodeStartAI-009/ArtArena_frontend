import { io } from "socket.io-client";

/* =========================
   SOCKET CONFIG
========================= */
const SOCKET_URL =  "https://artarena-backend.onrender.com";

if (!SOCKET_URL) {
  console.error(
    "❌ REACT_APP_SOCKET_URL is NOT defined. Check .env or Vercel Environment Variables."
  );
}

/* =========================
   SINGLETON SOCKET
========================= */
let socket = null;

/**
 * ✅ Singleton Socket.IO client
 * - Lazy initialized
 * - Shared across app
 * - Safe with React StrictMode
 * - Auth handled externally (AuthContext)
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,          // AuthContext controls connect
      withCredentials: true,

      // Reconnection strategy
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
    });
  }

  return socket;
}

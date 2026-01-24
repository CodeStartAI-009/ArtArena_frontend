import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSocket } from "../socket/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const socket = getSocket();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const userRef = useRef(null);
  const hasAuthedRef = useRef(false); // 🔑 prevents authReady resets

  /* =========================
     LOAD OR CREATE GUEST (ONCE)
  ========================== */
  useEffect(() => {
    let id = localStorage.getItem("guest_id");
    let name = localStorage.getItem("guest_name");

    if (!id || !name) {
      id = crypto.randomUUID();
      name = `Guest_${Math.floor(Math.random() * 1_000_000)}`;

      localStorage.setItem("guest_id", id);
      localStorage.setItem("guest_name", name);
    }

    const guest = {
      id,
      username: name,
      isGuest: true,
    };

    userRef.current = guest;
    setUser(guest);
  }, []);

  /* =========================
     SOCKET CONNECT + AUTH (STABLE)
  ========================== */
  useEffect(() => {
    if (!userRef.current) return;

    const handleConnect = () => {
      console.log("🔐 AUTH sent:", userRef.current.id);

      socket.emit("AUTH", {
        userId: userRef.current.id,
        username: userRef.current.username,
      });
    };

    const handleAuthSuccess = () => {
      if (hasAuthedRef.current) return;

      console.log("✅ AUTH READY");
      hasAuthedRef.current = true;
      setAuthReady(true);
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", handleConnect);
    socket.on("AUTH_SUCCESS", handleAuthSuccess);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("AUTH_SUCCESS", handleAuthSuccess);
    };
  }, [socket]);

  return (
    <AuthContext.Provider value={{ user, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};

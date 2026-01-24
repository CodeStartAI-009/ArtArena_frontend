import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSocket } from "../socket/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const socket = getSocket();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const userRef = useRef(null);

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
     SOCKET CONNECT + AUTH (EVERY CONNECT)
  ========================== */
  useEffect(() => {
    if (!userRef.current) return;
  
    const handleConnect = () => {
      setAuthReady(false);
  
      console.log("🔐 AUTH sent:", userRef.current.id);
  
      socket.emit("AUTH", {
        userId: userRef.current.id,
        username: userRef.current.username,
      });
    };
  
    const handleAuthSuccess = () => {
      console.log("✅ AUTH READY");
      setAuthReady(true);
    };
  
    const handleDisconnect = () => {
      setAuthReady(false);
    };
  
    if (!socket.connected) {
      socket.connect();
    }
  
    socket.on("connect", handleConnect);
    socket.on("AUTH_SUCCESS", handleAuthSuccess);
    socket.on("disconnect", handleDisconnect);
  
    return () => {
      socket.off("connect", handleConnect);
      socket.off("AUTH_SUCCESS", handleAuthSuccess);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);
  

  return (
    <AuthContext.Provider value={{ user, setUser, authReady }}>
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

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSocket } from "../socket/socket";
import { guestLogin, getMe } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const socket = getSocket();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const socketAuthedRef = useRef(false);

  /* =========================
     LOAD USER (TOKEN → GUEST)
  ========================== */
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("artarena_token");

      // 🔐 Logged-in user
      if (token && token !== "undefined") {
        try {
          const res = await getMe();
          setUser(res.data.user);
          return;
        } catch {
          localStorage.removeItem("artarena_token");
          localStorage.removeItem("guest_id");
        }
      }

      // 👤 Guest user
      try {
        const guestId = localStorage.getItem("guest_id");
        const res = await guestLogin(guestId);

        setUser(res.data.user);
        localStorage.setItem("artarena_token", res.data.token);
        localStorage.setItem("guest_id", res.data.user._id);
      } catch (err) {
        console.error("Guest login failed", err);
      }
    };

    init();
  }, []);

  /* =========================
     SOCKET AUTH (DB ID ONLY)
  ========================== */
  useEffect(() => {
    if (!user?._id) return;
    if (socketAuthedRef.current) return;

    socketAuthedRef.current = true;

    if (!socket.connected) socket.connect();

    socket.emit("AUTH", { userId: user._id });

    socket.on("AUTH_SUCCESS", () => {
      console.log("✅ SOCKET AUTH READY:", user._id);
      setAuthReady(true);
    });

    return () => socket.off("AUTH_SUCCESS");
  }, [user, socket]);

  return (
    <AuthContext.Provider value={{ user, setUser, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

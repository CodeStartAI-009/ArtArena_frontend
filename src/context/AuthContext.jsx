import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSocket } from "../socket/socket";
import { guestLogin, getMe } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const socket = getSocket();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const authSentRef = useRef(false);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("artarena_token");

      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
          return;
        } catch {
          localStorage.clear();
        }
      }

      const guestId = localStorage.getItem("guest_id");
      const res = await guestLogin(guestId);

      setUser(res.data.user);
      localStorage.setItem("artarena_token", res.data.token);
      localStorage.setItem("guest_id", res.data.user._id);
    };

    init();
  }, []);

  /* ================= SOCKET AUTH (ONCE) ================= */
  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    if (authSentRef.current) return;
    authSentRef.current = true;

    socket.emit("AUTH", { userId: user._id });

    socket.once("AUTH_SUCCESS", () => {
      console.log("🔐 AUTH READY:", user._id);
      setAuthReady(true);
    });

    socket.on("disconnect", () => {
      authSentRef.current = false;
      setAuthReady(false);
    });

    return () => {
      socket.off("AUTH_SUCCESS");
    };
  }, [user?._id, socket]);

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

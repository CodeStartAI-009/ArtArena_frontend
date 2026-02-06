// src/hooks/useAutoAuth.js
import { useEffect, useRef } from "react";
import { guestLogin, getMe } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function useAutoAuth() {
  const ranRef = useRef(false);
  const { setUser } = useAuth(); // ❌ remove setAuthReady

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      const token = localStorage.getItem("artarena_token");
      const guestId = localStorage.getItem("guest_id");

      // 🔐 token exists → validate
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

      // 👤 no token → guest login
      try {
        const res = await guestLogin(guestId);
        const { user, token: newToken } = res.data;

        setUser(user);
        localStorage.setItem("artarena_token", newToken);
        localStorage.setItem("guest_id", user._id);
      } catch (err) {
        console.error("Guest login failed", err);
      }
    };

    run();
  }, [setUser]);
}

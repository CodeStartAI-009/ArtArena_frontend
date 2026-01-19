import { useEffect, useRef } from "react";
import { guestLogin, getMe } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function useAutoAuth() {
  const { setUser } = useAuth();

  // 🔒 Prevent double execution in React 18 Strict Mode
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const init = async () => {
      const token = localStorage.getItem("artarena_token");

      /* =========================
         TRY TOKEN LOGIN
      ========================= */
      if (token && token !== "undefined") {
        try {
          const res = await getMe();
          setUser(res.data.user);
          return;
        } catch (err) {
          console.warn("Stored token invalid, clearing…");
          localStorage.removeItem("artarena_token");
          localStorage.removeItem("guest_id");
        }
      }

      /* =========================
         GUEST LOGIN
      ========================= */
      try {
        const storedGuestId = localStorage.getItem("guest_id");

        // ⚠️ Do NOT blindly trust old guest IDs
        const guestId =
          storedGuestId && storedGuestId.length === 24
            ? storedGuestId
            : null;

        const res = await guestLogin(guestId);

        setUser(res.data.user);
        localStorage.setItem("artarena_token", res.data.token);
        localStorage.setItem("guest_id", res.data.user._id);
      } catch (err) {
        console.error("Guest auth failed", err);
      }
    };

    init();
  }, [setUser]);
}

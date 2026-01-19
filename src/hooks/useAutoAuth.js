import { useEffect } from "react";
import { guestLogin, getMe } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function useAutoAuth() {
  const { setUser } = useAuth();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("artarena_token");

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

      try {
        const guestId = localStorage.getItem("guest_id");
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

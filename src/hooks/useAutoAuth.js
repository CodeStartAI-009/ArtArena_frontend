// src/hooks/useAutoAuth.js
import { useEffect, useRef } from "react";
import { getMe } from "../api/auth.api";

export default function useAutoAuth() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      const token = localStorage.getItem("artarena_token");

      if (!token || token === "undefined") return;

      try {
        // Validate token ONLY
        await getMe();
      } catch (err) {
        console.warn("Stored token invalid, clearing…");
        localStorage.removeItem("artarena_token");
        localStorage.removeItem("guest_id");
      }
    };

    run();
  }, []);
}

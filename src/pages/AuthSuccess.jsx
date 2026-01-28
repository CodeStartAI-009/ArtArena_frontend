import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../socket/socket";

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return navigate("/");

    // 🔥 REPLACE GUEST STATE
    localStorage.setItem("artarena_token", token);
    localStorage.removeItem("guest_id");

    // 🔄 Force socket re-auth
    const socket = getSocket();
    socket.disconnect();
    socket.connect();

    navigate("/", { replace: true });
  }, [navigate]);

  return <div>Signing you in…</div>;
}

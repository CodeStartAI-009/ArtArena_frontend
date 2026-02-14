import "./Lobby.css";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";
import themes from "../Home/themes";

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const socket = getSocket();
  const { authReady, user } = useAuth();

  const [room, setRoom] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const joinedRef = useRef(false);
  const navigatedRef = useRef(false);

  const players = Array.isArray(room?.players) ? room.players : [];
  const maxPlayers = room?.maxPlayers ?? "-";

  /* ================= HOST CHECK ================= */
  const isHost =
    String(room?.hostId) === String(user?._id);

  const isPublic = room?.mode === "Public";

  const canStart =
    !isPublic && // host start only for private rooms
    isHost &&
    players.length >= 2 &&
    room?.status === "lobby";

  const theme =
    themes.find(t => t.id === room?.theme) ||
    themes.find(t => t.id === "classic");

  /* ================= DETECT TOUCH DEVICE ================= */
  useEffect(() => {
    const touch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;
    setIsTouchDevice(touch);
  }, []);

  /* ================= BOTTOM BANNER AD ================= */
  useEffect(() => {
    const container = document.getElementById("lobby-bottom-ad");
    if (!container) return;

    container.innerHTML = "";

    const key = "0b79b01c3ecc8c76d45be1df8477b24f";

    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? 320 : 728;
    const height = isMobile ? 50 : 90;

    const timer = setTimeout(() => {
      window.atOptions = {
        key,
        format: "iframe",
        height,
        width,
        params: {}
      };

      const script = document.createElement("script");
      script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
      script.async = true;

      container.appendChild(script);
    }, 200);

    return () => {
      clearTimeout(timer);
      container.innerHTML = "";
    };
  }, []);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!authReady || !user) return;

    const handleLobbyUpdate = (roomState) => {
      setRoom(roomState);

      if (
        roomState.status === "playing" &&
        !navigatedRef.current
      ) {
        navigatedRef.current = true;
        navigate(`/game/${roomState.code}`);
      }
    };

    const handleGameStarted = ({ code }) => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      navigate(`/game/${code}`);
    };

    socket.on("LOBBY_UPDATE", handleLobbyUpdate);
    socket.on("GAME_STARTED", handleGameStarted);

    const joinLobby = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      socket.emit("LOBBY_JOIN", { code });
    };

    if (socket.connected) {
      joinLobby();
    } else {
      socket.once("connect", joinLobby);
    }

    return () => {
      socket.off("LOBBY_UPDATE", handleLobbyUpdate);
      socket.off("GAME_STARTED", handleGameStarted);
      socket.off("connect", joinLobby);
    };
  }, [authReady, user, socket, code, navigate]);

  /* ================= DESKTOP START (SPACE) ================= */
  useEffect(() => {
    if (!canStart || isTouchDevice) return;

    const onKeyDown = (e) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      socket.emit("START_GAME", { code });
    };

    window.addEventListener("keydown", onKeyDown);
    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, [canStart, code, socket, isTouchDevice]);

  /* ================= MOBILE START (TAP) ================= */
  const handleTapStart = () => {
    if (!canStart || !isTouchDevice) return;
    socket.emit("START_GAME", { code });
  };

  /* ================= LOADING ================= */
  if (!room) {
    return (
      <div className="lobby-loading">
        Connecting to lobby…
      </div>
    );
  }

  /* ================= FOOTER MESSAGE ================= */
  const footerMessage =
  isPublic
    ? "Waiting for players..."
    : isHost && players.length >= 2
      ? isTouchDevice
        ? "Tap anywhere to start"
        : "Press SPACE to start the game"
      : "Waiting for players...";


  /* ================= UI ================= */
  return (
    <div
      className="lobby-root"
      tabIndex={0}
      onClick={handleTapStart}
      style={{
        backgroundImage: `url(${theme.image})`,
        cursor:
          canStart && isTouchDevice ? "pointer" : "default",
      }}
    >
      {/* ================= BOTTOM AD ================= */}
      <div className="lobby-bottom-ad">
        <div id="lobby-bottom-ad"></div>
      </div>

      <div className="lobby-title">
        <span className="title-left">
          {theme.name} Arena
        </span>
        <span className="title-right">
          {room.mode}
        </span>
      </div>

      <div className="players-panel">
        <h3>
          Players ({players.length}/{maxPlayers})
        </h3>

        {players.map((p, i) => (
          <div key={p.id} className="player-row">
            <span className="player-index">
              {i + 1}
            </span>
            <span className="player-name">
              {p.username}
              {!p.connected && " (offline)"}
            </span>
          </div>
        ))}
      </div>

      <div className="lobby-footer">
        {footerMessage}
      </div>
    </div>
  );
}

import "./Lobby.css";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";
import themes from "../Home/themes";

const COUNTDOWN_SECONDS = 10;

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const socket = getSocket();
  const { authReady, user } = useAuth();

  const [room, setRoom] = useState(null);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const joinedRef = useRef(false);
  const navigatedRef = useRef(false);
  const countdownRef = useRef(null);

  const players = Array.isArray(room?.players) ? room.players : [];
  const maxPlayers = room?.maxPlayers ?? "-";

  const isHost = room?.hostId === user?._id;
  const canStart =
    isHost &&
    players.length >= 2 &&
    room?.status === "lobby" &&
    !starting;

  const theme =
    themes.find(t => t.id === room?.theme) ||
    themes.find(t => t.id === "classic");

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!authReady) return;
    if (!socket.connected) return;
  
    const onLobbyUpdate = (roomState) => {
      setRoom(roomState);
  
      if (
        roomState.status === "playing" &&
        !navigatedRef.current
      ) {
        navigatedRef.current = true;
        navigate(`/game/${roomState.code}`);
      }
    };
  
    socket.on("LOBBY_UPDATE", onLobbyUpdate);
  
    // ✅ JOIN ONLY ONCE
    if (!joinedRef.current) {
      joinedRef.current = true;
      socket.emit("LOBBY_JOIN", { code });
    }
  
    return () => {
      socket.off("LOBBY_UPDATE", onLobbyUpdate);
    };
  }, [authReady, socket, code, navigate]);
  

  /* ================= SPACE BAR ================= */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== "Space") return;
      e.preventDefault();

      if (!canStart) return;
      socket.emit("START_GAME", { code });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canStart, code, socket]);

  /* ================= LOADING ================= */
  if (!room) {
    return <div className="lobby-loading">Connecting to lobby…</div>;
  }

  /* ================= UI ================= */
  return (
    <div
      className="lobby-root"
      tabIndex={0}
      style={{ backgroundImage: `url(${theme.image})` }}
    >
      <div className="lobby-title">
        <span className="title-left">{theme.name} Arena</span>
        <span className="title-right">{room.mode}</span>
      </div>

      <div className="players-panel">
        <h3>
          Players ({players.length}/{maxPlayers})
        </h3>

        {players.map((p, i) => (
          <div key={p.id} className="player-row">
            <span className="player-index">{i + 1}</span>
            <span className="player-name">{p.username}</span>
          </div>
        ))}
      </div>

      <div className="lobby-footer">
        {starting ? (
          countdown > 0
            ? <>Game starting in {countdown}s…</>
            : "Starting game…"
        ) : canStart ? (
          "Press SPACE to start the game"
        ) : (
          "Waiting for players…"
        )}
      </div>
    </div>
  );
}

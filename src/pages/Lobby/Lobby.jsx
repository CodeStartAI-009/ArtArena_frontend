import "./Lobby.css";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket/socket";
import { getPlayerIdentity } from "../../utils/getPlayerIdentity";
import themes from "../Home/themes";

const COUNTDOWN_SECONDS = 10;

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();

  const socket = getSocket();
  const player = getPlayerIdentity();

  const [room, setRoom] = useState(null);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const joinedRef = useRef(false);
  const navigatedRef = useRef(false);
  const countdownRef = useRef(null);

  /* ================= SAFE DERIVED ================= */
  const players = Array.isArray(room?.players) ? room.players : [];
  const maxPlayers = room?.maxPlayers ?? "-";

  // Do NOT trust backend room.status for start button
  const canStart = players.length >= 2 && !starting;

  /* ================= THEME ================= */
  const theme =
    themes.find(t => t.id === room?.theme) ||
    themes.find(t => t.id === "classic");

  /* ================= SOCKET SETUP ================= */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    /* ---------- LISTENERS ---------- */

    const onLobbyUpdate = (roomState) => {
      setRoom({
        ...roomState,
        players: Array.isArray(roomState.players)
          ? roomState.players
          : [],
      });

      // 🔥 If user refreshed lobby while game already started
      if (roomState.status === "playing" && !navigatedRef.current) {
        navigatedRef.current = true;
        navigate(`/game/${roomState.code}`);
      }
    };

    const onGameStarting = () => {
      setStarting(true);
      setCountdown(COUNTDOWN_SECONDS);

      clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const onGameStarted = ({ code }) => {
      if (navigatedRef.current) return;

      navigatedRef.current = true;
      clearInterval(countdownRef.current);
      navigate(`/game/${code}`);
    };

    socket.on("LOBBY_UPDATE", onLobbyUpdate);
    socket.on("GAME_STARTING", onGameStarting);
    socket.on("GAME_STARTED", onGameStarted);

    /* ---------- JOIN ONCE ---------- */
    if (!joinedRef.current) {
      joinedRef.current = true;

      socket.emit("INIT_ROOM", { code });

      socket.emit("LOBBY_JOIN", {
        code,
        user: {
          id: player.id,
          username: player.username,
        },
      });
    }

    return () => {
      socket.off("LOBBY_UPDATE", onLobbyUpdate);
      socket.off("GAME_STARTING", onGameStarting);
      socket.off("GAME_STARTED", onGameStarted);
    };
  }, [code, navigate, player.id, player.username, socket]);

  /* ================= SPACE BAR ================= */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== "Space") return;

      e.preventDefault(); // 🔥 CRITICAL

      if (!room || !canStart) return;

      console.log("🟢 SPACE → START_GAME");
      socket.emit("START_GAME", { code });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [room, canStart, code, socket]);

  /* ================= LOADING ================= */
  if (!room) {
    return (
      <div className="lobby-loading">
        Connecting to lobby…
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div
      className="lobby-root"
      tabIndex={0}
      onClick={(e) => e.currentTarget.focus()}
      style={{ backgroundImage: `url(${theme.image})` }}
    >
      {/* TITLE */}
      <div className="lobby-title">
        <span className="title-left">{theme.name} Arena</span>
        <span className="title-right">{room.mode}</span>
      </div>

      {/* PLAYERS */}
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

      {/* FOOTER */}
      <div className="lobby-footer">
        {starting ? (
          countdown > 0 ? (
            <>Game starting in {countdown}s…</>
          ) : (
            "Starting game…"
          )
        ) : canStart ? (
          "Press SPACE to start the game"
        ) : (
          "Waiting for players…"
        )}
      </div>
    </div>
  );
}

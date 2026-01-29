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

  const joinedRef = useRef(false);
  const navigatedRef = useRef(false);

  const players = Array.isArray(room?.players) ? room.players : [];
  const maxPlayers = room?.maxPlayers ?? "-";

  const isHost = room?.hostId === user?._id;
  const canStart =
    isHost &&
    players.length >= 2 &&
    room?.status === "lobby";

  const theme =
    themes.find(t => t.id === room?.theme) ||
    themes.find(t => t.id === "classic");

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!authReady || !socket.connected) return;

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

    const onGameStarted = ({ code }) => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      navigate(`/game/${code}`);
    };

    socket.on("LOBBY_UPDATE", onLobbyUpdate);
    socket.on("GAME_STARTED", onGameStarted);

    if (!joinedRef.current) {
      joinedRef.current = true;
      socket.emit("LOBBY_JOIN", { code });
      socket.emit("LOBBY_SYNC", { code });
    }

    return () => {
      socket.off("LOBBY_UPDATE", onLobbyUpdate);
      socket.off("GAME_STARTED", onGameStarted);
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
        {canStart
          ? "Press SPACE to start the game"
          : "Waiting for players…"}
      </div>
    </div>
  );
}

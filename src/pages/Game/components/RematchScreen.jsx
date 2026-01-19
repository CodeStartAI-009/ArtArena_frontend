import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../../socket/socket";
import { getPlayerIdentity } from "../../../utils/getPlayerIdentity";
import useGameStore from "../store/store";

export default function RematchScreen() {
  const socket = getSocket();
  const navigate = useNavigate();
  const player = getPlayerIdentity();
  const { game, reset } = useGameStore();

  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onRematchUpdate = ({ votes }) => {
      // votes comes as [ [userId, decision], ... ]
      const map = {};
      votes.forEach(([id, decision]) => {
        map[id] = decision;
      });
      setVotes(map);
    };

    const onForceExit = () => {
      reset();
      navigate("/", { replace: true });
    };

    socket.on("REMATCH_UPDATE", onRematchUpdate);
    socket.on("FORCE_EXIT", onForceExit);

    return () => {
      socket.off("REMATCH_UPDATE", onRematchUpdate);
      socket.off("FORCE_EXIT", onForceExit);
    };
  }, [socket, navigate, reset]);

  if (!game) return null;

  /* ================= ACTIONS ================= */
  const sendVote = (decision) => {
    if (submitted) return;

    setSubmitted(true);

    socket.emit("REMATCH_VOTE", {
      code: game.code,
      decision, // "play" | "exit"
    });
  };

  /* ================= UI ================= */
  return (
    <div className="rematch-screen">
      <h2>Game Over</h2>

      <p className="winner-text">
        Winner: <strong>{game.players?.[0]?.username ?? "—"}</strong>
      </p>

      <p>Do you want to play again?</p>

      {!submitted ? (
        <div className="rematch-buttons">
          <button
            className="play-again-btn"
            onClick={() => sendVote("play")}
          >
            Play Again
          </button>

          <button
            className="exit-btn"
            onClick={() => sendVote("exit")}
          >
            Exit
          </button>
        </div>
      ) : (
        <p className="waiting-text">
          Waiting for other players…
        </p>
      )}

      {/* ================= VOTES ================= */}
      <div className="rematch-votes">
        <h4>Votes</h4>

        {Object.keys(votes).length === 0 && (
          <p>No votes yet</p>
        )}

        {Object.entries(votes).map(([userId, decision]) => (
          <div key={userId} className="vote-row">
            <span>
              {userId === player.id ? "You" : userId}
            </span>
            <span
              className={
                decision === "play" ? "vote-play" : "vote-exit"
              }
            >
              {decision}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
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
  const [countdown, setCountdown] = useState(null);

  /* ================= SORT PLAYERS BY SCORE ================= */
  const sortedPlayers = useMemo(() => {
    if (!game?.players) return [];
    return [...game.players].sort((a, b) => b.score - a.score);
  }, [game]);

  const winner = sortedPlayers[0];

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onRematchUpdate = ({ votes }) => {
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

    const onRematchStarted = () => {
      setSubmitted(false);
      setVotes({});
      setCountdown(10); // Start 10 second countdown
    };

    socket.on("REMATCH_UPDATE", onRematchUpdate);
    socket.on("FORCE_EXIT", onForceExit);
    socket.on("REMATCH_STARTED", onRematchStarted);

    return () => {
      socket.off("REMATCH_UPDATE", onRematchUpdate);
      socket.off("FORCE_EXIT", onForceExit);
      socket.off("REMATCH_STARTED", onRematchStarted);
    };
  }, [socket, navigate, reset]);

  /* ================= COUNTDOWN LOGIC ================= */
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      // Countdown finished — let game continue normally
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  if (!game) return null;

  /* ================= ACTIONS ================= */
  const sendVote = (decision) => {
    if (submitted || countdown !== null) return;

    setSubmitted(true);

    socket.emit("REMATCH_VOTE", {
      code: game.code,
      decision, // "play" | "exit"
    });

    if (decision === "exit") {
      reset();
      navigate("/", { replace: true });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="rematch-screen">

      <h2>🏁 Game Over</h2>

      {/* ================= COUNTDOWN ================= */}
      {countdown !== null && (
        <div className="rematch-countdown">
          <h3>🚀 New Match Begins In {countdown}s</h3>
        </div>
      )}

      {/* ================= WINNER ================= */}
      <div className="winner-section">
        <h3>
          Winner:{" "}
          <strong>
            {winner?.username ?? "—"}
          </strong>
        </h3>
        <p>Score: {winner?.score ?? 0}</p>
      </div>

      {/* ================= LEADERBOARD ================= */}
      <div className="leaderboard">
        <h4>Final Scores</h4>

        {sortedPlayers.map((p, index) => (
          <div
            key={p.id}
            className={`leaderboard-row ${
              index === 0 ? "winner-row" : ""
            }`}
          >
            <span>
              #{index + 1}{" "}
              {p.id === player.id ? "(You)" : p.username}
            </span>
            <span>{p.score}</span>
          </div>
        ))}
      </div>

      {/* ================= REMATCH QUESTION ================= */}
      {countdown === null && (
        <div className="rematch-section">
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
        </div>
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
                decision === "play"
                  ? "vote-play"
                  : "vote-exit"
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
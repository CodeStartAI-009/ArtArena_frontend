import WordMask from "./WordMask";
import { useAuth } from "../../../context/AuthContext";

export default function TopBar({
  round,
  wordLength,
  revealedLetters,
}) {
  /* ================= AUTH ================= */
  const { user } = useAuth();

  return (
    <div className="top-bar">
      {/* ================= LEFT ================= */}
      <div className="top-bar-left">
        <span className="round-label">
          Round {round}
        </span>
      </div>

      {/* ================= CENTER ================= */}
      <div className="top-bar-center">
        <WordMask
          wordLength={wordLength ?? 0}
          revealedLetters={revealedLetters ?? []}
        />
      </div>

      {/* ================= RIGHT ================= */}
      <div className="top-bar-right">
        <div className="currency">
          <span className="coin-icon">🪙</span>
          <span className="coin-value">
            {user?.coins ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

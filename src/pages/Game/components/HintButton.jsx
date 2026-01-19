import { useState, useMemo } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import { getPlayerIdentity } from "../../../utils/getPlayerIdentity";

const HINT_COST = 5;

export default function HintButton() {
  const socket = getSocket();
  const player = getPlayerIdentity();
  const { game, isDrawer } = useGameStore();

  const [loading, setLoading] = useState(false);

  /* =========================
     HARD GUARDS
  ========================== */
  if (!game) return null;
  if (isDrawer) return null;
  if (!game.guessingAllowed) return null;
  if (!Array.isArray(game.players)) return null;
  if (!game.currentWord) return null;

  const me = game.players.find((p) => p.id === player.id);
  if (!me) return null;

  const gems = Number(me.gems ?? 0);
  const revealed = Array.isArray(game.revealedLetters)
    ? game.revealedLetters
    : [];

  /* =========================
     DERIVED STATE
  ========================== */
  const allRevealed = revealed.length >= game.currentWord.length;
  const canAfford = gems >= HINT_COST;
  const disabled = loading || !canAfford || allRevealed;

  /* =========================
     ACTION
  ========================== */
  const requestHint = () => {
    if (disabled) return;

    setLoading(true);

    socket.emit("REQUEST_HINT", {
      code: game.code,
    });

    // Server will respond via HINT_REVEALED or GAME_STATE
    setTimeout(() => setLoading(false), 500);
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <button
      className="hint-button"
      onClick={requestHint}
      disabled={disabled}
      title={
        allRevealed
          ? "All letters revealed"
          : canAfford
          ? `Reveal one letter for ${HINT_COST} gems`
          : "Not enough gems"
      }
    >
      Hint ({HINT_COST})
    </button>
  );
}

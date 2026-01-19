import { useState, useCallback } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";

export default function GuessInput({ roomCode }) {
  const socket = getSocket();

  const [guess, setGuess] = useState("");

  const { game, isDrawer } = useGameStore();

  const guessingAllowed = Boolean(game?.guessingAllowed);
  const canGuess = guessingAllowed && !isDrawer && Boolean(roomCode);

  const submit = useCallback(() => {
    if (!canGuess) return;

    const trimmed = guess.trim();
    if (!trimmed) return;

    socket.emit("GUESS", {
      code: roomCode,
      guess: trimmed,
    });

    setGuess("");
  }, [guess, canGuess, roomCode, socket]);

  return (
    <input
      className="guess-input"
      type="text"
      value={guess}
      disabled={!canGuess}
      onChange={(e) => setGuess(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submit();
        }
      }}
      placeholder={
        !guessingAllowed
          ? "Waiting for drawer to start guessing…"
          : isDrawer
          ? "You are the drawer"
          : "Type your guess and press Enter…"
      }
      autoComplete="off"
      spellCheck={false}
    />
  );
}

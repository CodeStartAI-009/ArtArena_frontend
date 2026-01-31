// src/pages/Game/components/Timer.jsx

import { useEffect, useState } from "react";
import useGameStore from "../store/store";

export default function Timer() {
  const { game } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(0);

  /* ================= RESET TIMER ================= */
  useEffect(() => {
    if (!game) return;

    const {
      round,
      mode,
      guessingAllowed,
      timer,
      hasDrawn,
    } = game;

    let duration = 0;

    /* ---------- WORD SELECTION ---------- */
    if (!guessingAllowed && !hasDrawn) {
      duration = 10;
    }

    /* ---------- DRAWING PHASE ---------- */
    else if (!guessingAllowed && hasDrawn) {
      duration = mode === "Quick" ? timer : 15;
    }

    /* ---------- GUESSING PHASE ---------- */
    else if (guessingAllowed) {
      duration = mode === "Quick" ? timer : 30;
    }

    setTimeLeft(duration);
  }, [
    game?.round,
    game?.mode,
    game?.guessingAllowed,
    game?.hasDrawn,
    game?.timer,
  ]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft(t => Math.max(t - 1, 0));
    }, 1000);

    return () => clearInterval(id);
  }, [timeLeft]);

  /* ================= RENDER ================= */
  if (!game) return null;

  return (
    <div className="timer">
      ⏱️ {timeLeft}
    </div>
  );
}

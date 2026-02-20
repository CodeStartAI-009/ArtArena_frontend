import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import { getPlayerIdentity } from "../../../utils/getPlayerIdentity";

const WORD_SELECT_TIME = 10; // seconds

export default function WordChoice({ roomCode }) {
  const socket = getSocket();
  const player = getPlayerIdentity();
  const { wordChoices, clearWordChoices } = useGameStore();

  const [timeLeft, setTimeLeft] = useState(WORD_SELECT_TIME);
  const timerRef = useRef(null);
  const selectedRef = useRef(false);

  /* =========================
     START TIMER ON MOUNT
  ========================= */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     SELECT WORD
  ========================= */
  const selectWord = (word) => {
    if (selectedRef.current) return;
    selectedRef.current = true;

    clearInterval(timerRef.current);

    socket.emit("SELECT_WORD", {
      code: roomCode,
      word,
      userId: player.id,
    });

    clearWordChoices();
  };

  /* =========================
     TIMEOUT HANDLER
     (let backend end turn)
  ========================= */
  const handleTimeout = () => {
    if (selectedRef.current) return;
    selectedRef.current = true;

    // ✅ Do NOT auto-pick word
    // Backend already has wordSelectTimer
    clearWordChoices();
  };

  if (!wordChoices?.length) return null;

  return (
     
      <div className="word-choice-overlay">
        <div className="word-choice-container">
    
          <div className="word-choice-header">
            <h3>Choose a word</h3>
            <span className={`word-timer ${timeLeft <= 3 ? "danger" : ""}`}>
              ⏱ {timeLeft}s
            </span>
          </div>
    
          <div className="word-choice-buttons">
            {wordChoices.map(word => (
              <button
                key={word}
                onClick={() => selectWord(word)}
                disabled={timeLeft <= 0}
              >
                {word}
              </button>
            ))}
          </div>
    
        </div>
      </div>
    
  );
}

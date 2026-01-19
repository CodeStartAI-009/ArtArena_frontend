// frontend/pages/Game/classic/ClassicTimer.jsx
import useGameStore from "../../../store/useGameStore";

export default function ClassicTimer() {
  const { round, isDrawer } = useGameStore();

  return (
    <div className="game-root">
      <h2>Classic – Timer Mode</h2>

      {isDrawer ? (
        <p>You are drawing: <b>{round.word}</b></p>
      ) : (
        <p>Guess the word!</p>
      )}

      <div className="timer">
        Time Left: {round?.remaining}s
      </div>
    </div>
  );
}

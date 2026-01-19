// frontend/pages/Game/classic/ClassicScore.jsx
import useGameStore from "../../../store/useGameStore";

export default function ClassicScore() {
  const { round } = useGameStore();

  const maskedWord = round.word
    .split("")
    .map((c, i) =>
      round.revealedLetters.find(r => r.index === i)
        ? c
        : "_"
    )
    .join(" ");

  return (
    <div className="game-root">
      <h2>Classic – Score Mode</h2>
      <div className="word">{maskedWord}</div>
    </div>
  );
}

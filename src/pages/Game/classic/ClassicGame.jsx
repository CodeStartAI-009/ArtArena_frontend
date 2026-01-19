import useGameStore from "../store/store";

import TopBar from "../components/TopBar";
import PlayerList from "../components/PlayerList";
import DrawingCanvas from "../components/DrawingCanvas";
import GuessInput from "../components/GuessInput";
import WordMask from "../components/WordMask";
import StartGuessingButton from "../components/StartGuessingButton";
import WordChoice from "../components/WordChoice";
 

export default function ClassicGame() {
  const { game, isDrawer, wordChoices } = useGameStore();

  if (!game) return null;

  const guessingAllowed = game.guessingAllowed === true;

  return (
    <div className="game-root">
      {/* ================= TOP ================= */}
      <TopBar round={game.round} />

      {/* ================= PLAYERS ================= */}
      <PlayerList players={game.players} />

      {/* ================= WORD MASK ================= */}
      <WordMask
        wordLength={game.wordLength ?? 0}
        revealedLetters={game.revealedLetters ?? []}
      />

      {/* ================= CANVAS ================= */}
      <DrawingCanvas roomCode={game.code} />

      {/* ================= DRAWER CONTROLS ================= */}
      {isDrawer && wordChoices.length > 0 && (
        <WordChoice roomCode={game.code} />
      )}

      {isDrawer &&
        !guessingAllowed &&
        wordChoices.length === 0 && (
          <StartGuessingButton roomCode={game.code} />
        )}

      {/* ================= GUESSER CONTROLS ================= */}
      {!isDrawer && guessingAllowed && (
  <>
    <GuessInput roomCode={game.code} />
  </>
)}
    </div>
  );
}

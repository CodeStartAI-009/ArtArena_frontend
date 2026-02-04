import useGameStore from "../store/store";

import TopBar from "../components/TopBar";
import PlayerList from "../components/PlayerList";
import DrawingCanvas from "../components/DrawingCanvas";
import GuessInput from "../components/GuessInput";
import StartGuessingButton from "../components/StartGuessingButton";
import WordChoice from "../components/WordChoice";

export default function ClassicGame({ boardImage }) {
  const { game, isDrawer, wordChoices } = useGameStore();

  if (!game) return null;

  const guessingAllowed = game.guessingAllowed === true;

  return (
    <div className="game-screen">
      {/* ================= TOP BAR (WITH WORD MASK) ================= */}
      <TopBar
  round={game.round}
  wordLength={game.wordLength}
  revealedLetters={game.revealedLetters}
  coins={game.me?.coins}
/>


      {/* ================= PLAYER LIST ================= */}
      <PlayerList players={game.players} />

      {/* ================= DRAWING BOARD ================= */}
      <DrawingCanvas
        roomCode={game.code}
        boardImage={boardImage}
      />

      {/* ================= DRAWER CONTROLS ================= */}
      {isDrawer && wordChoices.length > 0 && (
        <WordChoice roomCode={game.code} />
      )}

      {isDrawer && !guessingAllowed && wordChoices.length === 0 && (
        <StartGuessingButton roomCode={game.code} />
      )}

      {/* ================= GUESSER CONTROLS ================= */}
      {!isDrawer && guessingAllowed && (
        <GuessInput roomCode={game.code} />
      )}
    </div>
  );
}

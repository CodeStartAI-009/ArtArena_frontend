// src/pages/Game/classic/ClassicGame.jsx

import useGameStore from "../store/store";

import TopBar from "../components/TopBar";
import PlayerList from "../components/PlayerList";
import DrawingCanvas from "../components/DrawingCanvas";
import GuessInput from "../components/GuessInput";
import WordMask from "../components/WordMask";
import StartGuessingButton from "../components/StartGuessingButton";
import WordChoice from "../components/WordChoice";
import Timer from "../components/Timer";

export default function ClassicGame({ boardImage }) {
  const { game, isDrawer, wordChoices } = useGameStore();

  // Safety guard
  if (!game) return null;

  const guessingAllowed = game.guessingAllowed === true;

  return (
    <div className="game-screen">
      {/* ================= TOP BAR ================= */}
      <TopBar round={game.round} />

      {/* ================= TIMER ================= */}
      <Timer />

      {/* ================= PLAYER LIST ================= */}
      <PlayerList players={game.players} />

      {/* ================= WORD MASK ================= */}
      <WordMask
        wordLength={game.wordLength ?? 0}
        revealedLetters={game.revealedLetters ?? []}
      />

      {/* ================= DRAWING BOARD ================= */}
      <DrawingCanvas
        roomCode={game.code}
        boardImage={boardImage}
      />

      {/* ================= DRAWER CONTROLS ================= */}
      {isDrawer && wordChoices?.length > 0 && (
        <WordChoice roomCode={game.code} />
      )}

      {isDrawer && !guessingAllowed && (!wordChoices || wordChoices.length === 0) && (
        <StartGuessingButton roomCode={game.code} />
      )}

      {/* ================= GUESSER CONTROLS ================= */}
      {!isDrawer && guessingAllowed && (
        <GuessInput roomCode={game.code} />
      )}
    </div>
  );
}

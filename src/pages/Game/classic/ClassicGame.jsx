import { useEffect } from "react";
import useGameStore from "../store/store";

import TopBar from "../components/TopBar";
import PlayerList from "../components/PlayerList";
import DrawingCanvas from "../components/DrawingCanvas";
import GuessInput from "../components/GuessInput";
import StartGuessingButton from "../components/StartGuessingButton";
import WordChoice from "../components/WordChoice";

export default function ClassicGame({ boardImage }) {
  const { game, isDrawer, wordChoices } = useGameStore();

  /* ================= BOTTOM LEFT AD ================= */
  useEffect(() => {
    const container = document.getElementById("classic-bottom-ad");
    if (!container) return;

    container.innerHTML = "";

    const key = "48bea9e4f3c5420f375a4a869b63e6a5";

    window.atOptions = {
      key,
      format: "iframe",
      height: 50,
      width: 320,
      params: {}
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
    script.async = true;

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  if (!game) return null;

  const guessingAllowed = game.guessingAllowed === true;

  return (
    <div className="game-screen">
      {/* ================= TOP BAR ================= */}
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

      {/* ================= BOTTOM AD ================= */}
      <div className="classic-bottom-ad">
        <div id="classic-bottom-ad"></div>
      </div>
    </div>
  );
}

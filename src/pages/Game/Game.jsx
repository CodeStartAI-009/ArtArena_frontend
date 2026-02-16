import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket/socket";
import useGameStore from "./store/store";
import { useAuth } from "../../context/AuthContext";
import themes from "../Home/themes";

import ClassicGame from "./classic/ClassicGame";
import QuickGame from "./Quick/QuickGame";
import KidsGame from "./Kids/KidsGame";
import DrawingGame from "./together/DrawingGame";
import OpenCanvasGame from "./together/OpenCanvasGame";
import RematchScreen from "./components/RematchScreen";

export default function Game() {
  const { code } = useParams();
  const navigate = useNavigate();
  const socket = getSocket();
  const { user, authReady } = useAuth();

  const {
    game,
    setGame,
    setIsDrawer,
    setWordChoices,
    reset,
    patchGame,
  } = useGameStore();

  const [showRematch, setShowRematch] = useState(false);

  const joinedRef = useRef(false);
  const exitingRef = useRef(false);

  useEffect(() => {
    if (!authReady || !user?._id) return;

    const userId = String(user._id);

    const onGameState = (state) => {
      if (!state) return;
      setGame({ ...state, selfId: userId });
      setIsDrawer(String(state.drawerId) === userId);
    };

    const onRoundStart = ({ round, drawerId }) => {
      useGameStore.getState().patchGame({
        round,
        drawerId,
        guessingAllowed: false,
        currentWord: null,
        wordLength: 0,
        selfId: userId,
      });

      setIsDrawer(String(drawerId) === userId);
    };

    const onTurnEnd = () => {
      useGameStore.getState().patchGame({
        guessingAllowed: false,
        currentWord: null,
      });
    };

    const onClearCanvas = () => {
      useGameStore.getState().patchGame({ drawing: [] });
    };

    const onGuessingStarted = () => {
      useGameStore.getState().patchGame({ guessingAllowed: true });
    };

    const onGameEnded = (data) => {
      if (typeof window.sdk !== "undefined" && window.sdk.showAd) {
        window.sdk.showAd();
      }
    
      patchGame({
        winner: data?.winner,
        players: data?.players,
      });
    
      const rematchAllowedModes = ["Classic", "Kids", "Together"];
    
      const shouldShowRematch =
        data?.type === "private" &&
        rematchAllowedModes.includes(data?.mode);
    
      if (shouldShowRematch) {
        setShowRematch(true);
        return;
      }
    
      exitingRef.current = true;
    
      setTimeout(() => {
        reset();
        navigate("/", { replace: true });
      }, 1000);
    };
    

    const onRematchStarted = () => {
      setShowRematch(false);
    };

    const onForceExit = () => {
      exitingRef.current = true;
      joinedRef.current = false;
      setShowRematch(false);
      reset();
      navigate("/", { replace: true });
    };

    socket.on("GAME_STATE", onGameState);
    socket.on("ROUND_START", onRoundStart);
    socket.on("TURN_END", onTurnEnd);
    socket.on("CLEAR_CANVAS", onClearCanvas);
    socket.on("WORD_CHOICES", setWordChoices);
    socket.on("GUESSING_STARTED", onGuessingStarted);
    socket.on("GAME_ENDED", onGameEnded);
    socket.on("REMATCH_STARTED", onRematchStarted);
    socket.on("FORCE_EXIT", onForceExit);

    if (!joinedRef.current) {
      joinedRef.current = true;
      socket.emit("GAME_JOIN", { code, userId });
    }

    return () => {
      socket.off("GAME_STATE", onGameState);
      socket.off("ROUND_START", onRoundStart);
      socket.off("TURN_END", onTurnEnd);
      socket.off("CLEAR_CANVAS", onClearCanvas);
      socket.off("WORD_CHOICES", setWordChoices);
      socket.off("GUESSING_STARTED", onGuessingStarted);
      socket.off("GAME_ENDED", onGameEnded);
      socket.off("REMATCH_STARTED", onRematchStarted);
      socket.off("FORCE_EXIT", onForceExit);
    };
  }, [
    authReady,
    user?._id,
    code,
    socket,
    navigate,
    reset,
    setGame,
    setIsDrawer,
    setWordChoices,
    patchGame,
    game?.type,
    game?.mode,
  ]);

  if (!game) {
    return <div className="game-loading">Loading game…</div>;
  }

  const theme =
    themes.find((t) => t.id === game.theme) ||
    themes.find((t) => t.id === "classic");

  const pageBackground = theme.image;
  const boardBackground = theme.board;

  return (
    <div
      className="game-root"
      style={{ backgroundImage: `url(${pageBackground})` }}
    >
      <div className="game-overlay" />

      {!showRematch && (
        <>
          {game.mode === "Classic" && (
            <ClassicGame boardImage={boardBackground} />
          )}
          {game.mode === "Quick" && (
            <QuickGame boardImage={boardBackground} />
          )}
          {game.mode === "Kids" && (
            <KidsGame boardImage={boardBackground} />
          )}
          {game.mode === "Together" &&
            (game.gameplay === "Drawing"
              ? <DrawingGame boardImage={boardBackground} />
              : <OpenCanvasGame boardImage={boardBackground} />)}
        </>
      )}

      {showRematch && (
        <div className="rematch-overlay">
          <RematchScreen />
        </div>
      )}
    </div>
  );
}

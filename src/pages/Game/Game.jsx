import { useEffect, useRef } from "react";
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
  } = useGameStore();

  const joinedRef = useRef(false);
  const exitingRef = useRef(false);
  const historyLockedRef = useRef(false);

  /* ================= SOCKET SETUP ================= */
  useEffect(() => {
    if (!authReady || !user?._id) return;

    const userId = String(user._id);

    /* ---------- GAME STATE ---------- */
    const onGameState = (state) => {
      if (!state) return;

      setGame({
        ...state,
        selfId: userId,
      });

      setIsDrawer(String(state.drawerId) === userId);
    };

    /* ---------- ROUND START ---------- */
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

    /* ---------- GAME ENDED → GO HOME ---------- */
    const onGameEnded = () => {
      exitingRef.current = true;

      reset();
      navigate("/", { replace: true });
    };

    const onForceExit = () => {
      exitingRef.current = true;
      joinedRef.current = false;

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
    socket.on("FORCE_EXIT", onForceExit);

    /* ---------- JOIN GAME (ONCE) ---------- */
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
  ]);

  /* ================= BLOCK BACK BUTTON ================= */
  useEffect(() => {
    if (historyLockedRef.current) return;
    historyLockedRef.current = true;

    const handlePopState = () => {
      if (exitingRef.current) return;

      if (window.confirm("Exit the game?")) {
        exitingRef.current = true;
        socket.emit("GAME_EXIT", { code });
        reset();
        navigate("/", { replace: true });
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [code, navigate, socket, reset]);

  /* ================= TAB CLOSE WARNING ================= */
  useEffect(() => {
    const warn = (e) => {
      if (!exitingRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  /* ================= LOADING ================= */
  if (!game) {
    return <div className="game-loading">Loading game…</div>;
  }

  /* ================= THEME ================= */
  const theme =
    themes.find(t => t.id === game.theme) ||
    themes.find(t => t.id === "classic");

  /* ================= RENDER ================= */
  return (
    <div
      className="game-root"
      style={{ backgroundImage: `url(${theme.image})` }}
    >
      <div className="game-overlay" />

      {(() => {
        switch (game.mode) {
          case "Classic":
            return <ClassicGame />;
          case "Quick":
            return <QuickGame />;
          case "Kids":
            return <KidsGame />;
          case "Together":
            return game.gameplay === "Drawing"
              ? <DrawingGame />
              : <OpenCanvasGame />;
          default:
            return <div>Unknown game mode</div>;
        }
      })()}
    </div>
  );
}

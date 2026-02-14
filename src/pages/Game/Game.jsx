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
    patchGame,
  } = useGameStore();

  const joinedRef = useRef(false);
  const exitingRef = useRef(false);
  const historyLockedRef = useRef(false);

  /* ================= SMALL BOTTOM-LEFT BANNER AD ================= */
  useEffect(() => {
    const container = document.getElementById("game-bottom-ad");
    if (!container) return;

    if (container.children.length > 0) return;

    window.atOptions = {
      key: "48bea9e4f3c5420f375a4a869b63e6a5",
      format: "iframe",
      height: 50,
      width: 320,
      params: {}
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/48bea9e4f3c5420f375a4a869b63e6a5/invoke.js";
    script.async = true;

    container.appendChild(script);
  }, []);

  /* ================= GAME MONETIZE PAUSE/RESUME ================= */
  useEffect(() => {
    const pauseGame = () => {
      patchGame({ guessingAllowed: false, adPaused: true });
    };

    const resumeGame = () => {
      patchGame({ adPaused: false });
    };

    window.addEventListener("GM_PAUSE", pauseGame);
    window.addEventListener("GM_RESUME", resumeGame);

    return () => {
      window.removeEventListener("GM_PAUSE", pauseGame);
      window.removeEventListener("GM_RESUME", resumeGame);
    };
  }, [patchGame]);

  /* ================= SOCKET SETUP ================= */
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

    const onGameEnded = () => {
      if (typeof window.sdk !== "undefined" && window.sdk.showAd) {
        window.sdk.showAd();
      }

      exitingRef.current = true;

      setTimeout(() => {
        reset();
        navigate("/", { replace: true });
      }, 1000);
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

  const theme =
    themes.find((t) => t.id === game.theme) ||
    themes.find((t) => t.id === "classic");

  const pageBackground = theme.image;
  const boardBackground = theme.board;

  /* ================= RENDER ================= */
  return (
    <div
      className="game-root"
      style={{ backgroundImage: `url(${pageBackground})` }}
    >
      <div className="game-overlay" />

      {(() => {
        switch (game.mode) {
          case "Classic":
            return <ClassicGame boardImage={boardBackground} />;
          case "Quick":
            return <QuickGame boardImage={boardBackground} />;
          case "Kids":
            return <KidsGame boardImage={boardBackground} />;
          case "Together":
            return game.gameplay === "Drawing"
              ? <DrawingGame boardImage={boardBackground} />
              : <OpenCanvasGame boardImage={boardBackground} />;
          default:
            return <div>Unknown game mode</div>;
        }
      })()}

      {/* ================= BOTTOM LEFT AD ================= */}
      <div className="game-bottom-ad">
        <div id="game-bottom-ad"></div>
      </div>
    </div>
  );
}

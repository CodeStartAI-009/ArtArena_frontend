import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket/socket";
import useGameStore from "./store/store";
import { getPlayerIdentity } from "../../utils/getPlayerIdentity";

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
  const player = getPlayerIdentity();

  const {
    game,
    setGame,
    setIsDrawer,
    setWordChoices,
    clearWordChoices,
    reset,
  } = useGameStore();

  const joinedRef = useRef(false);
  const exitingRef = useRef(false);
  const historyLockedRef = useRef(false);
  const authSentRef = useRef(false);

  /* ================= SOCKET SETUP ================= */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    if (!authSentRef.current && player?.id) {
      authSentRef.current = true;
      socket.emit("AUTH", { userId: player.id });
    }

    const onGameState = (state) => {
      if (!state) return;
      setGame(state);
      setIsDrawer(state.drawerId === player.id);
    };

    const onWordChoices = (choices) => {
      setWordChoices(Array.isArray(choices) ? choices : []);
    };

    const onWordSelected = ({ wordLength }) => {
      clearWordChoices();
      useGameStore.getState().patchGame({ wordLength });
    };

    const onGuessingStarted = () => {
      useGameStore.getState().patchGame({
        guessingAllowed: true,
      });
    };

    const onGameEnded = ({ winner, players }) => {
      useGameStore.getState().patchGame({
        status: "ended",
        winner,
        players,
        rematch: {
          active: true,
          votes: [],
        },
      });
    };

    const onForceExit = () => {
      reset();
      navigate("/", { replace: true });
    };

    socket.on("GAME_STATE", onGameState);
    socket.on("WORD_CHOICES", onWordChoices);
    socket.on("WORD_SELECTED", onWordSelected);
    socket.on("GUESSING_STARTED", onGuessingStarted);
    socket.on("GAME_ENDED", onGameEnded);
    socket.on("FORCE_EXIT", onForceExit);

    if (!joinedRef.current && player?.id) {
      joinedRef.current = true;
      socket.emit("GAME_JOIN", {
        code,
        userId: player.id,
      });
    }

    return () => {
      socket.off("GAME_STATE", onGameState);
      socket.off("WORD_CHOICES", onWordChoices);
      socket.off("WORD_SELECTED", onWordSelected);
      socket.off("GUESSING_STARTED", onGuessingStarted);
      socket.off("GAME_ENDED", onGameEnded);
      socket.off("FORCE_EXIT", onForceExit);
    };
  }, [
    code,
    socket,
    player?.id,
    navigate,
    reset,
    setGame,
    setIsDrawer,
    setWordChoices,
    clearWordChoices,
  ]);

  /* ================= BLOCK BACK ================= */
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

  /* ================= TAB CLOSE ================= */
  useEffect(() => {
    const warn = (e) => {
      if (!exitingRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, []);

  if (!game) {
    return <div className="game-loading">Loading game…</div>;
  }

  if (game.status === "ended" && game.rematch?.active) {
    return <RematchScreen />;
  }

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
}

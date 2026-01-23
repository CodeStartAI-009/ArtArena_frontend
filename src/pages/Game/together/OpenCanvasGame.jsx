import { useEffect, useRef } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import "../Game.css";

export default function OpenCanvasGame() {
  const socket = getSocket();
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const { game } = useGameStore();

  /* =========================
     SAFE READY FLAG
  ========================== */
  const isReady =
    !!game &&
    !!game.selfId &&
    Array.isArray(game.players) &&
    game.players.length >= 2;

  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 400;

  /* =========================
     RECEIVE DRAW EVENTS
  ========================== */
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    const onDraw = ({ x, y, prevX, prevY }) => {
      if (prevX == null || prevY == null) return;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    socket.on("DRAW", onDraw);
    return () => socket.off("DRAW", onDraw);
  }, [socket]);

  /* =========================
     HELPERS
  ========================== */
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  /* =========================
     MOUSE EVENTS
  ========================== */
  const onMouseDown = (e) => {
    if (!isReady) return;

    drawingRef.current = true;
    lastPointRef.current = getPos(e);
  };

  const onMouseMove = (e) => {
    if (!drawingRef.current || !isReady) return;

    const { x, y } = getPos(e);
    const prev = lastPointRef.current;
    if (!prev) return;

    socket.emit("DRAW", {
      code: game.code,
      x,
      y,
      prevX: prev.x,
      prevY: prev.y,
    });

    lastPointRef.current = { x, y };
  };

  const onMouseUp = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  /* =========================
     RENDER
  ========================== */
  if (!isReady) {
    return (
      <div className="game-loading">
        Waiting for players…
      </div>
    );
  }

  return (
    <div className="game-root">
      <h2 className="together-title">Together Mode – Open Canvas</h2>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="drawing-canvas"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />

      <p className="together-hint">
        Draw freely together — no sides, no limits
      </p>
    </div>
  );
}

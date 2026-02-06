// src/pages/Game/together/DrawingGame.jsx

import { useRef, useEffect } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import "../Game.css";

export default function DrawingGame({ boardImage }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  const socket = getSocket();
  const { game } = useGameStore();

  const roomCode = game?.code;

  /* =========================
     SAFE FLAGS
  ========================== */
  const isReady =
    !!game &&
    !!game.selfId &&
    Array.isArray(game.players) &&
    game.players.length === 2;

  const isLeftPlayer =
    isReady && game.players[0]?.id === game.selfId;

  /* =========================
     CANVAS SETUP (RETINA SAFE)
  ========================== */
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = canvas?.parentElement;
    if (!canvas || !wrapper) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = wrapper.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    ctxRef.current = ctx;
  };

  /* =========================
     SOCKET + INIT (WITH SYNC)
  ========================== */
  useEffect(() => {
    if (!roomCode) return;

    setupCanvas();
    window.addEventListener("resize", setupCanvas);

    const drawStroke = ({ x, y, prevX, prevY }) => {
      const ctx = ctxRef.current;
      if (!ctx || prevX == null || prevY == null) return;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const clearCanvas = () => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const syncDrawing = (strokes = []) => {
      clearCanvas();
      strokes.forEach(drawStroke);
    };

    socket.on("DRAW", drawStroke);
    socket.on("DRAW_SYNC", syncDrawing);
    socket.on("CLEAR_CANVAS", clearCanvas);

    // 🔑 Restore drawing on reload
    socket.emit("REQUEST_DRAW_SYNC", { code: roomCode });

    return () => {
      window.removeEventListener("resize", setupCanvas);
      socket.off("DRAW", drawStroke);
      socket.off("DRAW_SYNC", syncDrawing);
      socket.off("CLEAR_CANVAS", clearCanvas);
    };
  }, [socket, roomCode]);

  /* =========================
     HELPERS
  ========================== */
  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0];

    return {
      x: (t ? t.clientX : e.clientX) - rect.left,
      y: (t ? t.clientY : e.clientY) - rect.top,
    };
  };

  const canDrawHere = (x) => {
    if (!isReady) return false;

    const mid =
      canvasRef.current.width /
      (window.devicePixelRatio || 1) /
      2;

    return isLeftPlayer ? x <= mid : x >= mid;
  };

  /* =========================
     DRAW EVENTS
  ========================== */
  const startDrawing = (e) => {
    if (!isReady) return;
    e.preventDefault();

    const point = getPoint(e);
    if (!canDrawHere(point.x)) return;

    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !isReady) return;
    e.preventDefault();

    const point = getPoint(e);
    if (!canDrawHere(point.x)) return;

    const prev = lastPointRef.current;
    if (!prev) return;

    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    socket.emit("DRAW", {
      code: roomCode,
      x: point.x,
      y: point.y,
      prevX: prev.x,
      prevY: prev.y,
    });

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  /* =========================
     LOADING UI
  ========================== */
  if (!isReady) {
    return <div className="game-loading">Waiting for players…</div>;
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <>
      {/* 👇 PLAYER INSTRUCTIONS */}
      <div className="together-instructions">
        <h3>Together Drawing Mode</h3>
        <ul>
          <li>
            {isLeftPlayer
              ? "You can draw only on the LEFT side of the canvas."
              : "You can draw only on the RIGHT side of the canvas."}
          </li>
          <li>Work together to complete the drawing.</li>
          <li>Your drawing is synced live.</li>
        </ul>
      </div>

      {/* 👇 CANVAS */}
      <div
        className="canvas-wrapper"
        style={{
          backgroundImage: boardImage
            ? `url(${boardImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Visual center divider */}
        <div className="canvas-divider" />
      </div>
    </>
  );
}

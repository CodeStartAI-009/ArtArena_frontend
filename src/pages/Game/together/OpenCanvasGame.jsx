// src/pages/Game/together/OpenCanvasGame.jsx

import { useRef, useEffect } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import "../Game.css";

export default function OpenCanvasGame({ boardImage }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  const socket = getSocket();
  const { game } = useGameStore();

  const roomCode = game?.code;

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

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    ctxRef.current = ctx;
  };

  /* =========================
     SOCKET + INIT
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

    socket.on("DRAW", drawStroke);
    socket.on("CLEAR_CANVAS", clearCanvas);

    return () => {
      window.removeEventListener("resize", setupCanvas);
      socket.off("DRAW", drawStroke);
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

  /* =========================
     DRAW EVENTS (EVERYONE)
  ========================== */
  const startDrawing = (e) => {
    if (!game) return;
    e.preventDefault();

    isDrawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !game) return;
    e.preventDefault();

    const point = getPoint(e);
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
     LOADING UI (SAFE)
  ========================== */
  if (!game) {
    return (
      <div className="game-loading">
        Waiting for players…
      </div>
    );
  }

  /* =========================
     RENDER
  ========================== */
  return (
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
    </div>
  );
}

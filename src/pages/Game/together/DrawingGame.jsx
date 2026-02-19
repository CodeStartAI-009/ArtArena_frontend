import { useRef, useEffect, useState } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import "../Game.css";

export default function DrawingGame({ boardImage }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  const [color, setColor] = useState("#000000");
  const [tool, setTool] = useState("draw");

  const socket = getSocket();
  const { game } = useGameStore();
  const roomCode = game?.code;

  const word = game?.currentWord;

  /* ================= SAFE FLAGS ================= */
  const isReady =
    !!game &&
    !!game.selfId &&
    Array.isArray(game.players) &&
    game.players.length === 2;

  const isLeftPlayer =
    isReady && game.players[0]?.id === game.selfId;

  /* ================= CANVAS SETUP ================= */
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

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctxRef.current = ctx;
  };

  /* ================= SOCKET + SYNC ================= */
  useEffect(() => {
    if (!roomCode) return;

    setupCanvas();
    window.addEventListener("resize", setupCanvas);

    const drawStroke = ({ x, y, prevX, prevY, color, tool }) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.save();

      if (tool === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 24;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color || "#000";
        ctx.lineWidth = 3;
      }

      ctx.beginPath();
      ctx.moveTo(prevX * width, prevY * height);
      ctx.lineTo(x * width, y * height);
      ctx.stroke();
      ctx.restore();
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
  }, [roomCode, socket]);

  /* ================= NORMALIZED POINT ================= */
  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const t = e.touches?.[0];

    return {
      x: ((t ? t.clientX : e.clientX) - rect.left) / rect.width,
      y: ((t ? t.clientY : e.clientY) - rect.top) / rect.height,
    };
  };

  /* ================= SIDE LIMIT ================= */
  const canDrawHere = (normalizedX) => {
    if (!isReady) return false;
    return isLeftPlayer
      ? normalizedX <= 0.5
      : normalizedX >= 0.5;
  };

  /* ================= DRAW EVENTS ================= */
  const startDrawing = (e) => {
    if (!isReady) return;
    e.preventDefault();

    const point = getPoint(e);
    if (!point || !canDrawHere(point.x)) return;

    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const draw = (e) => {
    if (!isReady || !isDrawingRef.current) return;
    e.preventDefault();

    const point = getPoint(e);
    const prev = lastPointRef.current;
    if (!point || !prev) return;
    if (!canDrawHere(point.x)) return;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.save();

    if (tool === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 24;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
    }

    ctx.beginPath();
    ctx.moveTo(prev.x * width, prev.y * height);
    ctx.lineTo(point.x * width, point.y * height);
    ctx.stroke();
    ctx.restore();

    socket.emit("DRAW", {
      code: roomCode,
      x: point.x,
      y: point.y,
      prevX: prev.x,
      prevY: prev.y,
      color,
      tool,
    });

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  /* ================= LOADING ================= */
  if (!isReady) {
    return <div className="game-loading">Waiting for players…</div>;
  }

  /* ================= RENDER ================= */
  return (
    <>
      {/* 🔥 WORD DISPLAY */}
      <div className="together-word-box">
        <h2>Draw This:</h2>
        <div className="together-word">
          {word || "Loading word..."}
        </div>
      </div>

      <div className="together-instructions">
        <ul>
          <li>
            {isLeftPlayer
              ? "You draw on LEFT side."
              : "You draw on RIGHT side."}
          </li>
        </ul>
      </div>

      <div className="tool-bar">
        <button
          className={tool === "draw" ? "active" : ""}
          onClick={() => setTool("draw")}
        >
          ✏️ Draw
        </button>
        <button
          className={tool === "erase" ? "active" : ""}
          onClick={() => setTool("erase")}
        >
          🧽 Erase
        </button>
      </div>

      {tool === "draw" && (
        <div className="color-picker">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      )}

      <div
        className="canvas-wrapper"
        style={{
          backgroundImage: boardImage
            ? `url(${boardImage})`
            : "none",
          backgroundSize: "cover",
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
        <div className="canvas-divider" />
      </div>
    </>
  );
}

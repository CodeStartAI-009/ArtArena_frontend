import { useRef, useEffect, useState } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";

export default function DrawingCanvas({ roomCode, boardImage }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  const [tool, setTool] = useState("draw"); // "draw" | "erase"

  const socket = getSocket();
  const { isDrawer } = useGameStore();

  /* ================= CANVAS SETUP (RETINA SAFE) ================= */
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
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000";

    ctxRef.current = ctx;
  };

  /* ================= SOCKET + INIT ================= */
  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);

    const drawStroke = ({ x, y, prevX, prevY, tool }) => {
      const ctx = ctxRef.current;
      if (!ctx || prevX == null || prevY == null) return;

      ctx.save();

      if (tool === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 18;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000";
      }

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.restore();
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

    socket.emit("REQUEST_DRAW_SYNC", { code: roomCode });

    return () => {
      window.removeEventListener("resize", setupCanvas);
      socket.off("DRAW", drawStroke);
      socket.off("DRAW_SYNC", syncDrawing);
      socket.off("CLEAR_CANVAS", clearCanvas);
    };
  }, [socket, roomCode]);

  /* ================= HELPERS ================= */
  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0];

    return {
      x: (t ? t.clientX : e.clientX) - rect.left,
      y: (t ? t.clientY : e.clientY) - rect.top,
    };
  };

  /* ================= DRAW EVENTS ================= */
  const startDrawing = (e) => {
    if (!isDrawer) return;
    e.preventDefault();

    isDrawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const draw = (e) => {
    if (!isDrawer || !isDrawingRef.current) return;
    e.preventDefault();

    const point = getPoint(e);
    const prev = lastPointRef.current;
    if (!prev) return;

    const ctx = ctxRef.current;
    ctx.save();

    if (tool === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 18;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000";
    }

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.restore();

    socket.emit("DRAW", {
      code: roomCode,
      x: point.x,
      y: point.y,
      prevX: prev.x,
      prevY: prev.y,
      tool, // 🔑 send tool type
    });

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* TOOLBAR */}
      {isDrawer && (
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
      )}

      <div
        className="canvas-wrapper"
        style={{
          backgroundImage: `url(${boardImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <canvas
          ref={canvasRef}
          className={`drawing-canvas ${!isDrawer ? "disabled" : ""}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </>
  );
}

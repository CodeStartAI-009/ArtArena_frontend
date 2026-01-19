import { useRef, useEffect } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";

export default function DrawingCanvas({ roomCode }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  const socket = getSocket();
  const { isDrawer } = useGameStore();

  /* ================= INIT CANVAS + SOCKET ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctxRef.current = ctx;

    const drawStroke = ({ x, y, prevX, prevY }) => {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const clearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const syncDrawing = (strokes = []) => {
      clearCanvas();
      strokes.forEach(drawStroke);
    };

    socket.on("DRAW", drawStroke);
    socket.on("DRAW_SYNC", syncDrawing);
    socket.on("CLEAR_CANVAS", clearCanvas);

    // 🔥 restore drawing on reload / reconnect
    socket.emit("REQUEST_DRAW_SYNC", { code: roomCode });

    return () => {
      socket.off("DRAW", drawStroke);
      socket.off("DRAW_SYNC", syncDrawing);
      socket.off("CLEAR_CANVAS", clearCanvas);
    };
  }, [socket, roomCode]);

  /* ================= HELPERS ================= */
  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  /* ================= DRAW EVENTS ================= */
  const onMouseDown = (e) => {
    if (!isDrawer) return;
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const onMouseMove = (e) => {
    if (!isDrawer || !isDrawingRef.current) return;

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

  /* ================= RENDER ================= */
  return (
    <div className="canvas-wrapper">
      {isDrawer && (
        <div className="canvas-tools">
          <button onClick={() => socket.emit("UNDO", { code: roomCode })}>
            Undo
          </button>
          <button onClick={() => socket.emit("REDO", { code: roomCode })}>
            Redo
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className={`drawing-canvas ${!isDrawer ? "disabled" : ""}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}

import { useRef, useEffect } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";

export default function DrawingCanvas({ roomCode, boardImage }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  const socket = getSocket();
  const { isDrawer } = useGameStore();

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = canvas?.parentElement;
    if (!canvas || !wrapper) return;

    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctxRef.current = ctx;
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawStroke = ({ x, y, prevX, prevY }) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;
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
      window.removeEventListener("resize", resizeCanvas);
      socket.off("DRAW", drawStroke);
      socket.off("DRAW_SYNC", syncDrawing);
      socket.off("CLEAR_CANVAS", clearCanvas);
    };
  }, [socket, roomCode]);

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0];
    return {
      x: (t ? t.clientX : e.clientX) - rect.left,
      y: (t ? t.clientY : e.clientY) - rect.top,
    };
  };

  const startDrawing = (e) => {
    if (!isDrawer) return;
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const draw = (e) => {
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

  return (
    <div
      className="canvas-wrapper"
      style={{ backgroundImage: `url(${boardImage})` }}
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
  );
}

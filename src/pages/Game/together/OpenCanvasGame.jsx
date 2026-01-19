import { useEffect, useRef } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import "../Game.css";

export default function OpenCanvasGame() {
  const socket = getSocket();
  const canvasRef = useRef(null);
  const prevPoint = useRef(null);
  const { game } = useGameStore();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const onDraw = ({ x, y, prevX, prevY }) => {
      if (!prevX || !prevY) return;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    socket.on("DRAW", onDraw);
    return () => socket.off("DRAW", onDraw);
  }, [socket]);

  const handleDraw = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socket.emit("DRAW", {
      code: game.code,
      x,
      y,
      prevX: prevPoint.current?.x,
      prevY: prevPoint.current?.y,
    });

    prevPoint.current = { x, y };
  };

  const stopDrawing = () => {
    prevPoint.current = null;
  };

  return (
    <div className="game-root">
      <h2 className="together-title">Together Mode – Open Canvas</h2>

      <canvas
        ref={canvasRef}
        width={900}
        height={500}
        className="drawing-canvas"
        onMouseMove={handleDraw}
        onMouseLeave={stopDrawing}
        onMouseUp={stopDrawing}
      />

      <p className="together-hint">
        Draw anything together — no rules, no words
      </p>
    </div>
  );
}

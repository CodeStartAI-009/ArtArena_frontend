import { useEffect, useRef } from "react";
import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import "../Game.css";

export default function DrawingGame() {
  const socket = getSocket();
  const canvasRef = useRef(null);
  const { game } = useGameStore();

  const isLeftPlayer = game.players[0]?.id === game.selfId;

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const onDraw = ({ x, y, prevX, prevY }) => {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#000";
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
    });
  };

  return (
    <div className="game-root">
      <h2 className="together-title">Together Mode – Drawing</h2>

      <div className="split-info">
        {isLeftPlayer
          ? "You draw the LEFT side"
          : "You draw the RIGHT side"}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="drawing-canvas"
        onMouseMove={handleDraw}
      />

      <p className="together-hint">
        Collaborate and complete the template together
      </p>
    </div>
  );
}

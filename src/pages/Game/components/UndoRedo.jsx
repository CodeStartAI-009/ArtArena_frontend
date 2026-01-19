import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";

export default function UndoRedo({ roomCode }) {
  const socket = getSocket();
  const { isDrawer } = useGameStore();

  if (!isDrawer) return null;

  return (
    <div className="undo-redo">
      <button
        onClick={() => socket.emit("UNDO", { code: roomCode })}
      >
        Undo
      </button>

      <button
        onClick={() => socket.emit("REDO", { code: roomCode })}
      >
        Redo
      </button>
    </div>
  );
}

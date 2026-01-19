import { getSocket } from "../../../socket/socket";

export default function StartGuessingButton({ roomCode }) {
  const socket = getSocket();

  const startGuessing = () => {
    socket.emit("ALLOW_GUESSING", { code: roomCode });
  };

  return (
    <button className="start-guessing-btn" onClick={startGuessing}>
      Allow Guessing
    </button>
  );
}

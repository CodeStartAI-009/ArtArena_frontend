import { getSocket } from "../../../socket/socket";
import useGameStore from "../store/store";
import { getPlayerIdentity } from "../../../utils/getPlayerIdentity";

export default function WordChoice({ roomCode }) {
  const socket = getSocket();
  const player = getPlayerIdentity();
  const { wordChoices, clearWordChoices } = useGameStore();

  const selectWord = (word) => {
    socket.emit("SELECT_WORD", {
      code: roomCode,
      word,
      userId: player.id,
    });
    clearWordChoices();
  };

  return (
    <div className="word-choice">
      <h3>Choose a word</h3>
      {wordChoices.map(w => (
        <button key={w} onClick={() => selectWord(w)}>
          {w}
        </button>
      ))}
    </div>
  );
}

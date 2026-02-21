import "./Lobby.css";
import { FaTimes, FaCopy } from "react-icons/fa";

export default function RoomCodeModal({ code, onClose }) {
  const copy = () => {
    const link = `${window.location.origin}/?room=${code}`;
    const text = `🎨 Join my Art Arena room!\n\nClick here: ${link}\n\nRoom Code: ${code}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="create-backdrop">
      <div className="create-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Room Code</h2>

        <div
          style={{
            fontSize: "28px",
            fontWeight: 900,
            letterSpacing: "4px",
            textAlign: "center",
            margin: "20px 0",
          }}
        >
          {code}
        </div>

        <button className="play-btn" onClick={copy}>
          <FaCopy /> Copy Code
        </button>
      </div>
    </div>
  );
}

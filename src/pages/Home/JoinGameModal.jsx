import "./JoinGameModal.css";
import { useState } from "react";
import { FaTimes, FaDoorOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../api/room.api";

export default function JoinGameModal({ onClose }) {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomId.trim() || loading) return;

    try {
      setLoading(true);
      await joinRoom(roomId.toUpperCase());
      navigate(`/lobby/${roomId.toUpperCase()}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-backdrop">
      <div className="join-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Join Private Game</h2>
        <p className="subtitle">
          Enter a Room ID shared by your friend
        </p>

        <input
          className="room-input"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button className="join-btn" onClick={handleJoin}>
          <FaDoorOpen /> {loading ? "Joining..." : "Join Game"}
        </button>
      </div>
    </div>
  );
}

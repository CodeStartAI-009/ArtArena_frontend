import "./JoinGameModal.css";
import { useState, useEffect } from "react";
import { FaTimes, FaDoorOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../api/room.api";

export default function JoinGameModal({ onClose, defaultRoomId = "" }) {
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ================= PREFILL SUPPORT ================= */
  useEffect(() => {
    if (defaultRoomId) {
      setRoomId(defaultRoomId.toUpperCase());
    }
  }, [defaultRoomId]);

  /* ================= JOIN HANDLER ================= */
  const handleJoin = async () => {
    const trimmed = roomId.trim().toUpperCase();

    if (!trimmed || loading) return;

    try {
      setLoading(true);

      await joinRoom(trimmed);

      // Navigate only after successful join
      navigate(`/lobby/${trimmed}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ENTER KEY SUPPORT ================= */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleJoin();
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
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          maxLength={8}
        />

        <button
          className="join-btn"
          onClick={handleJoin}
          disabled={loading}
        >
          <FaDoorOpen />
          {loading ? " Joining..." : " Join Game 5🪙"}
        </button>
      </div>
    </div>
  );
}
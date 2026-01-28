import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { emailSignup } from "../../api/auth.api";
import { getSocket } from "../../socket/socket";
import "./AuthModal.css";

export default function AuthModal({ onClose }) {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     GOOGLE LOGIN
  ========================== */
  const handleGoogle = () => {
    const guestId = localStorage.getItem("guest_id") || "";
    window.location.href =
      `http://localhost:5090/auth/google?guestId=${guestId}`;
  };

  /* =========================
     EMAIL SIGNUP / LOGIN
  ========================== */
  const handleEmail = async () => {
    if (!email || !username) {
      setError("Email and username required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const guestId = localStorage.getItem("guest_id");

      const res = await emailSignup(
        { email, username },
        guestId
      );

      /* =========================
         🔥 HARD RESET AUTH STATE
      ========================== */

      // 1️⃣ Replace token with REAL user token
      localStorage.setItem("artarena_token", res.data.token);

      // 2️⃣ Remove guest identity forever
      localStorage.removeItem("guest_id");

      // 3️⃣ Update React auth state
      setUser(res.data.user);

      // 4️⃣ FORCE socket re-auth with DB user ID
      const socket = getSocket();
      socket.disconnect();
      socket.connect();
      socket.emit("AUTH", {
        userId: res.data.user._id, // ✅ ONLY DB ID
      });

      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal">
        <h2>
          Sign up & Get <span>Coins</span>
        </h2>

        <button
          className="google-btn"
          onClick={handleGoogle}
          disabled={loading}
        >
          Continue with Google
        </button>

        <div className="divider">OR</div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        {error && (
          <p className="auth-error">{error}</p>
        )}

        <button
          onClick={handleEmail}
          disabled={loading}
        >
          {loading ? "Processing..." : "Continue with Email"}
        </button>

        <button
          className="cancel-btn"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

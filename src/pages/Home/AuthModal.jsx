import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { emailSignup } from "../../api/auth.api";
import "./AuthModal.css";

export default function AuthModal({ onClose }) {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = () => {
    const guestId = localStorage.getItem("guest_id") || "";
    window.location.href =
      `http://localhost:5090/auth/google?guestId=${guestId}`;
  };

  const handleEmailSignup = async () => {
    if (!email || !username) {
      setError("Email and username required");
      return;
    }

    try {
      setLoading(true);
      const guestId = localStorage.getItem("guest_id");

      const res = await emailSignup({ email, username }, guestId);

      localStorage.setItem("artarena_token", res.data.token);
      localStorage.removeItem("guest_id"); // 🔥 IMPORTANT

      setUser(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal">
        <h2>Sign up & Get <span>200 Coins</span></h2>

        <button className="google-btn" onClick={handleGoogle}>
          Continue with Google
        </button>

        <div className="divider">OR</div>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <button onClick={handleEmailSignup} disabled={loading}>
          {loading ? "Creating..." : "Continue with Email"}
        </button>

        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

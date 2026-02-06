import "./Home.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "./AuthModal";
import CreateGameModal from "./CreateGameModal";
import JoinGameModal from "./JoinGameModal";
import { getSocket } from "../../socket/socket";

/* ASSETS */
import companyLogo from "../../assets/logo/company.jpeg";
import coinIcon from "../../assets/icons/coins.png";
import gemIcon from "../../assets/icons/gem.png";
import avatarLogo from "../../assets/logo/logo.png";

/* ICONS */
import {
  FaPlay,
  FaLock,
  FaPaintBrush,
  FaCog,
  FaDiscord,
  FaExpand,
  FaUserCircle,
} from "react-icons/fa";

export default function Home() {
  const { user, setUser, authReady } = useAuth();
  const navigate = useNavigate();
  const socket = getSocket();

  const [showHowTo, setShowHowTo] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [socketReady, setSocketReady] = useState(socket.connected);

  const [showReferral, setShowReferral] = useState(false); // ✅ NEW

  const playLockRef = useRef(false);

  /* ================= REFERRAL ================= */
  const referralLink = user?.referralCode
    ? `${window.location.origin}/?ref=${user.referralCode}`
    : null;

  const copyReferral = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
    setShowReferral(false); // auto close
  };

  /* ================= FULLSCREEN ================= */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    const onConnect = () => setSocketReady(true);
    const onDisconnect = () => setSocketReady(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  /* ================= ECONOMY UPDATES ================= */
  useEffect(() => {
    if (!user?._id) return;

    const onUserUpdated = ({ users }) => {
      const updated = users?.find(u => u.id === user._id);
      if (!updated) return;

      setUser(prev => ({
        ...prev,
        xp: updated.xp,
        level: updated.level,
        coins: updated.coins,
        gems: updated.gems,
      }));
    };

    socket.on("USER_UPDATED", onUserUpdated);
    return () => socket.off("USER_UPDATED", onUserUpdated);
  }, [socket, user?._id, setUser]);

  /* ================= PLAY ================= */
  const handlePlayPublic = () => {
    if (!authReady || !socket.connected) return;
    if (playLockRef.current) return;

    playLockRef.current = true;
    socket.emit("PLAY_PUBLIC");

    socket.once("MATCH_FOUND", ({ code }) => {
      playLockRef.current = false;
      navigate(`/lobby/${code}`);
    });
  };

  if (!user) return null;
  const playDisabled = !authReady || !socketReady;

  return (
    <div
      className="home-root"
      onClick={() => setShowReferral(false)} // click outside closes popup
    >

      {/* ================= TOP RIGHT ================= */}
      <div
        className="top-right-actions"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="top-action-btn shop"
          onClick={() => navigate("/store")}
        >
          🏪 Shop
        </button>

        <button
          className="top-action-btn free"
          onClick={() => setShowReferral(prev => !prev)}
        >
          🎁 Free <span className="badge">1</span>
        </button>
      </div>

      {/* 🔗 REFERRAL POPUP */}
       
      {referralLink && showReferral && (
  <div
    className="referral-floating"
    onClick={e => e.stopPropagation()}
  >
    {/* 🔹 ACTUAL CARD */}
    <div className="referral-box">
      <div className="referral-title">
        🎁 Invite friends & earn <b>100 coins</b>
      </div>

      <div className="referral-link">
        <input value={referralLink} readOnly />
        <button onClick={copyReferral}>Copy</button>
      </div>

      {user.isGuest && (
        <div className="referral-note">
          Sign up later to keep rewards permanently
        </div>
      )}
    </div>
  </div>
)}


      {/* ================= LEVEL ================= */}
      <div className="level-section">
        <div className="level-badge">Lv {user.level}</div>
        <div className="xp-wrapper">
          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{ width: `${Math.min((user.xp / 100) * 100, 100)}%` }}
            />
          </div>
          <span className="xp-text">{user.xp} / 100 XP</span>
        </div>
      </div>

      {/* ================= LEFT PANEL ================= */}
      <div className="left-panel">
        <div className="economy-box clickable" onClick={() => navigate("/store")}>
          <div className="currency">
            <img src={coinIcon} alt="Coins" />
            <span>{user.coins}</span>
          </div>
          <div className="currency">
            <img src={gemIcon} alt="Gems" />
            <span>{user.gems ?? 0}</span>
          </div>
        </div>

        <div className="user-box">
          <div className="username">
            {user.isGuest ? "Guest Player" : user.username}
          </div>

          <button className="menu-btn secondary" disabled>
            <FaPaintBrush /> Customize <FaLock />
          </button>

          {user.isGuest && (
            <button
              className="menu-btn primary"
              onClick={() => setShowAuthModal(true)}
            >
              <FaUserCircle /> Sign up & Get 200 Coins
            </button>
          )}
        </div>
      </div>

      {/* ================= CENTER ================= */}
      <div className="center-area">
        <div className="avatar-preview">
          <img src={avatarLogo} alt="Avatar" />
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="bottom-actions">
        <button
          className="play-main-btn"
          disabled={playDisabled}
          onClick={handlePlayPublic}
        >
          <FaPlay />
          {playDisabled ? " CONNECTING..." : " PLAY"}
        </button>

        <div className="sub-actions">
          <button onClick={() => setShowCreateModal(true)}>Create</button>
          <button onClick={() => setShowJoinModal(true)}>Join</button>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="home-footer">
        <div className="policy-content">
          <div className="policy-links">
            <Link to="/features">Features</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>

        <div className="footer-icons">
          <button onClick={() => setShowHowTo(true)}><FaCog /></button>
          <button onClick={() => window.open("https://discord.gg/artarena")}><FaDiscord /></button>
          <button onClick={toggleFullscreen}><FaExpand /></button>
          <img src={companyLogo} alt="Logo" />
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {showHowTo && (
        <div className="howto-backdrop" onClick={() => setShowHowTo(false)}>
          <div className="howto-modal" onClick={e => e.stopPropagation()}>
            <button className="howto-close" onClick={() => setShowHowTo(false)}>✕</button>
            <h2>How to Play</h2>
            <ol>
              <li>Click <b>PLAY</b> to join a public match.</li>
              <li>One player draws, others guess.</li>
              <li>Correct guesses earn XP & coins.</li>
              <li>Create private rooms with friends.</li>
            </ol>
          </div>
        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showCreateModal && <CreateGameModal onClose={() => setShowCreateModal(false)} />}
      {showJoinModal && <JoinGameModal onClose={() => setShowJoinModal(false)} />}
    </div>
  );
}

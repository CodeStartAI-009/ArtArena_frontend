import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  FaGlobe,
  FaCog,
  FaDiscord,
  FaExpand,
  FaUserCircle,
} from "react-icons/fa";

export default function Home() {
  const { user, setUser, authReady } = useAuth();
  const navigate = useNavigate();
  const socket = getSocket();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [socketReady, setSocketReady] = useState(socket.connected);

  /* =========================
     SOCKET STATUS TRACKING
  ========================== */
  useEffect(() => {
    const onConnect = () => setSocketReady(true);
    const onDisconnect = () => setSocketReady(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  /* =========================
     LIVE ECONOMY UPDATES
  ========================== */
  useEffect(() => {
    if (!user?.id) return;

    const onUserUpdated = ({ users }) => {
      if (!Array.isArray(users)) return;
      const updated = users.find(u => u.id === user.id);
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
  }, [socket, user?.id, setUser]);

  /* =========================
     PUBLIC PLAY
  ========================== */
  const handlePlayPublic = () => {
    if (!authReady) {
      console.warn("⏳ AUTH not ready");
      return;
    }

    if (!socket.connected) {
      console.warn("⛔ Socket not connected");
      return;
    }

    console.log("🎮 PLAY_PUBLIC sent");
    socket.emit("PLAY_PUBLIC");

    socket.once("MATCH_FOUND", ({ code }) => {
      console.log("✅ MATCH_FOUND:", code);
      navigate(`/lobby/${code}`);
    });
  };

  if (!user) return null;

  const playDisabled = !authReady || !socketReady;

  return (
    <div className="home-root">

      {/* LEVEL */}
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

      {/* LEFT PANEL */}
      <div className="left-panel">
        <div
          className="economy-box clickable"
          onClick={() => navigate("/store")}
        >
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

      {/* CENTER */}
      <div className="center-area">
        <div className="avatar-preview">
          <img src={avatarLogo} alt="Avatar" />
        </div>
      </div>

      {/* ACTIONS */}
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

      {/* FOOTER */}
      <div className="home-footer">
        <div className="footer-left">
          <span>Privacy</span>
          <span>T&C</span>
        </div>

        <div className="footer-icons">
          <button><FaGlobe /></button>
          <button><FaCog /></button>
          <button onClick={() => window.open("https://discord.gg/artarena")}>
            <FaDiscord />
          </button>
          <button onClick={() => document.documentElement.requestFullscreen()}>
            <FaExpand />
          </button>
          <img
            src={companyLogo}
            alt="Studio Logo"
            style={{ height: "28px", marginLeft: "8px" }}
          />
        </div>
      </div>

      {/* MODALS */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showCreateModal && <CreateGameModal onClose={() => setShowCreateModal(false)} />}
      {showJoinModal && <JoinGameModal onClose={() => setShowJoinModal(false)} />}
    </div>
  );
}

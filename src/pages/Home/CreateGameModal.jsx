import "./CreateGameModal.css";
import { useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaQuestionCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ThemeSelectorModal from "./ThemeSelector";
import themes from "./themes";
import { createRoom } from "../../api/room.api";

/* ================= CONSTANTS ================= */
const MODES = ["Classic", "Quick", "Kids", "Together"];
const GAMEPLAY_CLASSIC = ["Score", "Timer"];
const GAMEPLAY_TOGETHER = ["Drawing", "Open-canvas"];
const TIMERS = ["20 sec", "30 sec", "40 sec"];
const SCORES = [5, 10, 15, 30];
const ROUNDS = [2, 5, 8, 10, 15];
const MAX_PLAYERS = [2, 3, 4, 6, 8];

export default function CreateGameModal({ onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /* ================= STATE ================= */
  const [mode, setMode] = useState(0);
  const [gameplay, setGameplay] = useState(0);
  const [timer, setTimer] = useState(1);
  const [score, setScore] = useState(1);
  const [rounds, setRounds] = useState(1);
  const [players, setPlayers] = useState(2);

  const [theme, setTheme] = useState("random");
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  /* ================= DERIVED ================= */
  const selectedMode = MODES[mode];
  const isQuick = selectedMode === "Quick";
  const isKids = selectedMode === "Kids";
  const isTogether = selectedMode === "Together";

  const gameplayOptions = isTogether
    ? GAMEPLAY_TOGETHER
    : GAMEPLAY_CLASSIC;

  const selectedGameplay = gameplayOptions[gameplay];

  const themeName =
    themes.find(t => t.id === theme)?.name || "Random";

  const cycle = (list, index, dir) =>
    (index + dir + list.length) % list.length;

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const payload = {
        mode: selectedMode,
        gameplay: selectedGameplay,
        timer:
          selectedGameplay === "Timer" || isQuick
            ? TIMERS[timer]
            : null,
        score:
          selectedGameplay === "Score" && !isQuick
            ? SCORES[score]
            : null,
        totalRounds:
          isKids || isTogether ? null : ROUNDS[rounds],
        maxPlayers: isTogether ? 2 : MAX_PLAYERS[players],
        theme,
        isPrivate: true,
      };

      const res = await createRoom(payload);

      // ✅ CORRECT: extract code
      const code = res.data.room.code;

      // ✅ ONLY navigate
      navigate(`/lobby/${code}`);

      onClose();
    } catch (err) {
      console.error("❌ Failed to create room", err);
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="create-backdrop">
        <div className="create-modal">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>

          <h2>Create Private Game</h2>
          <p className="subtitle">Private games do NOT award XP</p>

          {/* MODE */}
          <Row
            label={
              <>
                Mode
                <FaQuestionCircle
                  className="info-icon"
                  onClick={() => setShowInfo(!showInfo)}
                />
              </>
            }
            value={selectedMode}
            onLeft={() => setMode(cycle(MODES, mode, -1))}
            onRight={() => setMode(cycle(MODES, mode, 1))}
          />

          {showInfo && (
            <div className="mode-info">
              {selectedMode === "Classic" && "Score or Timer based play"}
              {selectedMode === "Quick" && "Fast timer-based rounds"}
              {selectedMode === "Kids" && "Simple mode, 2 players"}
              {selectedMode === "Together" &&
                "Two-player collaborative drawing"}
            </div>
          )}

          {/* GAMEPLAY */}
          {(isTogether || (!isQuick && !isKids)) && (
            <Row
              label="Gameplay"
              value={selectedGameplay}
              onLeft={() =>
                setGameplay(cycle(gameplayOptions, gameplay, -1))
              }
              onRight={() =>
                setGameplay(cycle(gameplayOptions, gameplay, 1))
              }
            />
          )}

          {/* TIMER */}
          {(selectedGameplay === "Timer" || isQuick) && !isTogether && (
            <Row
              label="Round Timer"
              value={TIMERS[timer]}
              onLeft={() => setTimer(cycle(TIMERS, timer, -1))}
              onRight={() => setTimer(cycle(TIMERS, timer, 1))}
            />
          )}

          {/* SCORE */}
          {selectedGameplay === "Score" && !isQuick && !isKids && (
            <Row
              label="Max Score"
              value={SCORES[score]}
              onLeft={() => setScore(cycle(SCORES, score, -1))}
              onRight={() => setScore(cycle(SCORES, score, 1))}
            />
          )}

          {/* ROUNDS */}
          {!isKids && !isTogether && (
            <Row
              label="Total Rounds"
              value={ROUNDS[rounds]}
              onLeft={() => setRounds(cycle(ROUNDS, rounds, -1))}
              onRight={() => setRounds(cycle(ROUNDS, rounds, 1))}
            />
          )}

          {/* MAX PLAYERS */}
          <Row
            label="Max Players"
            value={isTogether || isKids ? 2 : MAX_PLAYERS[players]}
            onLeft={() =>
              !isTogether &&
              !isKids &&
              setPlayers(cycle(MAX_PLAYERS, players, -1))
            }
            onRight={() =>
              !isTogether &&
              !isKids &&
              setPlayers(cycle(MAX_PLAYERS, players, 1))
            }
          />

          {/* THEME */}
          <div className="row">
            <span className="row-label">Arena</span>
            <div
              className="row-control clickable"
              onClick={() => setShowThemeModal(true)}
            >
              <span>{themeName}</span>
            </div>
          </div>

          <button className="play-btn" onClick={handleCreate}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {showThemeModal && (
        <ThemeSelectorModal
          value={theme}
          onSelect={setTheme}
          onClose={() => setShowThemeModal(false)}
        />
      )}
    </>
  );
}

/* ================= ROW ================= */
function Row({ label, value, onLeft, onRight }) {
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      <div className="row-control">
        <button onClick={onLeft}>
          <FaChevronLeft />
        </button>
        <span>{value}</span>
        <button onClick={onRight}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}

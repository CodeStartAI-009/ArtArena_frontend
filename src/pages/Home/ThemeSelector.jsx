// src/pages/Home/ThemeSelectorModal.jsx
import "./CreateGameModal.css";
import themes from "./themes";
import { FaTimes } from "react-icons/fa";

export default function ThemeSelectorModal({ value, onSelect, onClose }) {
  return (
    <div className="create-backdrop">
      <div className="create-modal theme-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Select Arena</h2>

        <div className="theme-grid">
          {themes.map(theme => (
            <div
              key={theme.id}
              className={`theme-card ${
                value === theme.id ? "selected" : ""
              }`}
              onClick={() => {
                onSelect(theme.id);
                onClose();
              }}
            >
              <img src={theme.image} alt={theme.name} />
              <span>{theme.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

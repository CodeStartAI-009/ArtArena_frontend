import "./Store.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  COIN_PACKS,
  BUNDLES,
  CURSORS,
} from "./data";

import { FaArrowLeft } from "react-icons/fa";

export default function Store() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("coins");

  if (!user) return null;

  return (
    <div className="store-root">

      {/* HEADER */}
      <div className="store-header">
        <button onClick={() => navigate("/")}>
          <FaArrowLeft />
        </button>
        <h1>Store</h1>
        <div className="balances">
          <span>🪙 {user.coins}</span>
          <span>💎 {user.gems || 0}</span>
        </div>
      </div>

      {/* TABS */}
      <div className="store-tabs">
        {["coins", "bundles", "customize", "free"].map(t => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="store-grid">

        {/* COINS USING GEMS */}
        {tab === "coins" &&
          COIN_PACKS.map(p => (
            <Card
              key={p.id}
              title={`${p.coins} Coins`}
              price={`${p.gems} Gems`}
            />
          ))}

        {/* BUNDLES USING COINS */}
        {tab === "bundles" &&
          BUNDLES.map(b => (
            <Card
              key={b.id}
              title={b.name}
              subtitle={`${b.coins} Coins`}
              price={`${b.priceCoins} Coins`}
            />
          ))}

        {/* CUSTOM CURSORS */}
        {tab === "customize" &&
          CURSORS.map(c => (
            <Card
              key={c.id}
              title={c.name}
              price={c.gems === 0 ? "Free" : `${c.gems} Gems`}
            />
          ))}

        {/* FREE */}
        {tab === "free" && (
          <>
            <Card title="Spin Wheel" price="Free" />
            <Card title="Watch Ad" price="+20 Gems" />
          </>
        )}

      </div>
    </div>
  );
}

/* ================= CARD ================= */

function Card({ title, subtitle, price, value }) {
  return (
    <div className="store-card">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {value && <span className="value">{value}</span>}
      <button>{price}</button>
    </div>
  );
}

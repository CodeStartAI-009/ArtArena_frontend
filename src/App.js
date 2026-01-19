import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Splash from "./pages/Splash/Splash";
import Home from "./pages/Home/Home";
import Store from "./pages/market/Store";
import Lobby from "./pages/Lobby/Lobby";
import Game from "./pages/Game/Game";
import { useAuth } from "./context/AuthContext";
import useAutoAuth from "./hooks/useAutoAuth";

export default function App() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // 🔐 auto auth (guest / token)
  useAutoAuth();

  // ⏳ hide splash once auth resolved
  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <Splash />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby/:code" element={<Lobby />} />
      <Route path="/game/:code" element={<Game />} />
      <Route path="/Store" element={<Store />} />

    </Routes>
  );
}

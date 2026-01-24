import { Routes, Route } from "react-router-dom";

import Splash from "./pages/Splash/Splash";
import Home from "./pages/Home/Home";
import Store from "./pages/market/Store";
import Lobby from "./pages/Lobby/Lobby";
import Game from "./pages/Game/Game";

import { useAuth } from "./context/AuthContext";
import useAutoAuth from "./hooks/useAutoAuth";

export default function App() {
  const { user, authReady } = useAuth();

  // 🔐 auto auth (guest / token)
  useAutoAuth();

  // ⛔ DO NOT RENDER APP UNTIL AUTH IS FULLY READY
  if (!user || !authReady) {
    return <Splash />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby/:code" element={<Lobby />} />
      <Route path="/game/:code" element={<Game />} />
      <Route path="/store" element={<Store />} />
    </Routes>
  );
}

import { Routes, Route } from "react-router-dom";

import Splash from "./pages/Splash/Splash";
import Home from "./pages/Home/Home";
import Store from "./pages/market/Store";
import Lobby from "./pages/Lobby/Lobby";
import Game from "./pages/Game/Game";
import Features from "./pages/Home/Features";
import Faq from "./pages/Home/Faq";
import Terms from "./pages/Home/Terms";
import Privacy from "./pages/Home/Privacy";
import AuthSuccess from "./pages/AuthSuccess";
import { useAuth } from "./context/AuthContext";
import useAutoAuth from "./hooks/useAutoAuth";
import AdSenseLoader from "./AdSense";
export default function App() {
  const { user, authReady } = useAuth();

  // 🔐 auto auth (guest / token)
  useAutoAuth();

  // ⛔ DO NOT RENDER APP UNTIL AUTH IS FULLY READY
  if (!user || !authReady) {
    return <Splash />;
  }

  return (
    <>
    <AdSenseLoader />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby/:code" element={<Lobby />} />
      <Route path="/game/:code" element={<Game />} />
      <Route path="/store" element={<Store />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/features" element={<Features />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

    </Routes>
    </>
  );
}

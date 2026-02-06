import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

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
  const { authReady } = useAuth();
  const location = useLocation();

  /* ================= CAPTURE REFERRAL CODE ================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref) {
      // store ONLY once per session
      if (!sessionStorage.getItem("referralCode")) {
        sessionStorage.setItem("referralCode", ref);
      }
    }
  }, [location.search]);

  /* ================= AUTO AUTH (guest / token) ================= */
  useAutoAuth();

  /* ================= SPLASH ================= */
  if (!authReady) {
    return <Splash />;
  }

  return (
    <>
      {/* Load AdSense ONCE globally */}
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

        {/* fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

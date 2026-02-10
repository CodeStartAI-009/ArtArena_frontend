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
import RequireLandscape from "./RequireLandscape";

import { useAuth } from "./context/AuthContext";
import useAutoAuth from "./hooks/useAutoAuth";
import AdSenseLoader from "./AdSense";

export default function App() {
  const { authReady } = useAuth();
  const location = useLocation();

  /* ================= CAPTURE REFERRAL CODE (RUN FIRST) ================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref && !sessionStorage.getItem("referralCode")) {
      sessionStorage.setItem("referralCode", ref);
    }
  }, [location.search]);

  /* ================= DISABLE RIGHT CLICK / INSPECT (DETERRENT) ================= */
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();

    const disableKeys = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableKeys);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeys);
    };
  }, []);

  /* ================= AUTO AUTH (guest / token) ================= */
  useAutoAuth();

  /* ================= SPLASH ================= */
  if (!authReady) {
    return <Splash />;
  }

  return (
    <>
      {/* ✅ Load AdSense ONCE globally */}
      <AdSenseLoader />

      {/* ✅ LANDSCAPE REQUIRED FOR ENTIRE APP */}
      <RequireLandscape>
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
      </RequireLandscape>
    </>
  );
}

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

const API_URL = "https://artarena-backend.onrender.com";

export default function App() {
  const { authReady } = useAuth();
  const location = useLocation();

  /* ======================================================
     1️⃣ CAPTURE REFERRAL CODE
  ====================================================== */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref && !sessionStorage.getItem("referralCode")) {
      sessionStorage.setItem("referralCode", ref);
    }
  }, [location.search]);

  /* ======================================================
     2️⃣ BASIC DEVTOOLS BLOCK (UI LEVEL ONLY)
  ====================================================== */
  useEffect(() => {
    const blockKeys = (e) => {
      if (e.key === "F12") e.preventDefault();

      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === "I" || e.key === "J" || e.key === "C")
      ) {
        e.preventDefault();
      }

      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
      }
    };

    const blockRightClick = (e) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", blockKeys);
    document.addEventListener("contextmenu", blockRightClick);

    return () => {
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("contextmenu", blockRightClick);
    };
  }, []);

  /* ======================================================
     3️⃣ WAKE BACKEND (RENDER COLD START FIX)
  ====================================================== */
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(() => console.log("Backend ready"))
      .catch(() => console.log("Backend waking up..."));
  }, []);

  /* ======================================================
     4️⃣ AUTO AUTH
  ====================================================== */
  useAutoAuth();

  /* ======================================================
     5️⃣ GOOGLE ANALYTICS PAGE TRACKING (SPA SAFE)
  ====================================================== */
  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);

  /* ======================================================
     6️⃣ SPLASH WHILE AUTH INITIALIZING
  ====================================================== */
  if (!authReady) {
    return <Splash />;
  }

  /* ======================================================
     7️⃣ MAIN ROUTES
  ====================================================== */
  return (
    <RequireLandscape>
      <Routes>
        <Route path="/join/:code" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:code" element={<Lobby />} />
        <Route path="/game/:code" element={<Game />} />
        <Route path="/store" element={<Store />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/features" element={<Features />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/s" element={<Splash />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </RequireLandscape>
  );
}
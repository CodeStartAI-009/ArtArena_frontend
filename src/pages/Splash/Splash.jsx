// src/pages/Splash/Splash.jsx
import { useEffect } from "react";
import "./Splash.css";

import titleLogo from "../../assets/logo/logo.png";
import loaderIcon from "../../assets/icons/image-loader.png";
import companyLogo from "../../assets/logo/company.jpeg";

export default function Splash() {

  useEffect(() => {
    const container = document.getElementById("right-ad-container");
    if (!container) return;

    // Clear old content (important for SPA)
    container.innerHTML = "";

    const key = "629768cab9ae71c8053dc803e3186ffe";

    const loadAd = () => {
      window.atOptions = {
        key,
        format: "iframe",
        height: 600,
        width: 160,
        params: {}
      };

      const script = document.createElement("script");
      script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
      script.async = true;

      container.appendChild(script);
    };

    const timer = setTimeout(loadAd, 150);

    return () => {
      clearTimeout(timer);
      container.innerHTML = "";
    };

  }, []);

  return (
    <div className="splash-root">

      {/* LEFT SIDE AD */}
      <div className="side-ad left-ad">
        <div id="left-ad-container"></div>
      </div>

      {/* CENTER CONTENT */}
      <div className="splash-center">
        <img
          src={titleLogo}
          alt="Art Arena"
          className="splash-title"
        />

        <div className="splash-buttons">
          <a
            href="https://discord.gg/5rPSTx7n"
            target="_blank"
            rel="noreferrer"
            aria-label="Join Discord"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png"
              alt="Discord"
              className="discord-icon"
            />
          </a>
        </div>
      </div>

      {/* RIGHT SIDE AD */}
      <div className="side-ad right-ad">
        <div id="right-ad-container"></div>
      </div>

      {/* BOTTOM LEFT LOADING */}
      <div className="splash-bottom-left">
        <img
          src={loaderIcon}
          alt="Loading"
          className="art-loader"
        />
        <span>Loading...</span>
      </div>

      {/* BOTTOM RIGHT LOGO */}
      <div className="splash-bottom-right">
        <img
          src={companyLogo}
          alt="Studio Logo"
        />
      </div>

    </div>
  );
}
// src/pages/Splash/Splash.jsx
import { useEffect } from "react";
import "./Splash.css";

import titleLogo from "../../assets/logo/logo.png";
import loaderIcon from "../../assets/icons/image-loader.png";
import companyLogo from "../../assets/logo/company.jpeg";

export default function Splash() {

  useEffect(() => {
    const loadAd = (containerId, key) => {
      if (!document.getElementById(containerId)) return;

      window.atOptions = {
        key: key,
        format: "iframe",
        height: 600,
        width: 160,
        params: {}
      };

      const script = document.createElement("script");
      script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
      script.async = true;

      document.getElementById(containerId).appendChild(script);
    };

    // LEFT + RIGHT ads
    loadAd("left-ad-container", "629768cab9ae71c8053dc803e3186ffe");
    loadAd("right-ad-container", "629768cab9ae71c8053dc803e3186ffe");

  }, []);

  const handlePlayStoreClick = () => {
    // Optional
  };

  return (
    <div className="splash-root">

      {/* LEFT SIDE AD */}
      <div className="side-ad left-ad">
        <div id="left-ad-container"></div>
      </div>

      {/* CENTER CONTENT (UNCHANGED LOOK) */}
      <div className="splash-center">
        <img
          src={titleLogo}
          alt="Art Arena"
          className="splash-title"
        />

        <div className="splash-buttons">
          <button
            type="button"
            onClick={handlePlayStoreClick}
            className="store-link-btn"
            aria-label="Google Play (Coming Soon)"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play (Coming Soon)"
              className="store-btn"
            />
          </button>

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

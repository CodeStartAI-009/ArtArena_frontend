// src/pages/Splash/Splash.jsx
import "./Splash.css";

// IMPORT ASSETS
import titleLogo from "../../assets/logo/logo.png";
import loaderIcon from "../../assets/icons/image-loader.png";
import companyLogo from "../../assets/logo/company.jpeg";

export default function Splash() {
  const handlePlayStoreClick = () => {
    // Optional: show toast or alert
    // alert("Android app coming soon!");
  };

  return (
    <div className="splash-root">
      {/* CENTER CONTENT */}
      <div className="splash-center">
        {/* TITLE */}
        <img
          src={titleLogo}
          alt="Art Arena"
          className="splash-title"
        />

        {/* BUTTONS */}
        <div className="splash-buttons">
          {/* GOOGLE PLAY (COMING SOON) */}
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

          {/* DISCORD (REAL LINK) */}
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

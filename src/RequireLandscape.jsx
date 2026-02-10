import { useEffect, useState } from "react";

export default function RequireLandscape({ children }) {
  const [isLandscape, setIsLandscape] = useState(true);

  const checkOrientation = () => {
    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isMobile) {
      setIsLandscape(true);
      return;
    }

    setIsLandscape(window.innerWidth > window.innerHeight);
  };

  useEffect(() => {
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (!isLandscape) {
    return (
      <div style={overlayStyle}>
        <div style={boxStyle}>
          <h2>🔄 Rotate Your Phone</h2>
          <p>This game works only in landscape mode.</p>
        </div>
      </div>
    );
  }

  return children;
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "#000",
  color: "#fff",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const boxStyle = {
  textAlign: "center",
  padding: "20px",
  borderRadius: "12px",
};

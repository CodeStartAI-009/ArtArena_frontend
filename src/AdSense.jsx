import { useEffect } from "react";

export default function AdSenseLoader() {
  useEffect(() => {
    if (window.adsbygoogle) return;

    const script = document.createElement("script");
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  return null;
}

"use client";

import Script from "next/script";
import { useEffect } from "react";

export function InfobipScript() {
  useEffect(() => {
    // Add a global flag to track script loading
    window.__infobipScriptLoaded = false;

    // Fallback script loading if Next.js Script component fails
    if (!document.querySelector('script[src*="infobip.rtc.js"]')) {
      const script = document.createElement("script");
      script.src = "https://rtc.cdn.infobip.com/2/latest/infobip.rtc.js";
      script.async = true;
      script.onload = () => {
        console.log("Infobip WebRTC SDK loaded successfully (fallback)");
        window.__infobipScriptLoaded = true;
      };
      script.onerror = (e) => {
        console.error("Failed to load Infobip WebRTC SDK (fallback):", e);
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <Script
      src="https://rtc.cdn.infobip.com/2/latest/infobip.rtc.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log("Infobip WebRTC SDK loaded successfully");
        window.__infobipScriptLoaded = true;
      }}
      onError={(e) => {
        console.error("Failed to load Infobip WebRTC SDK:", e);
      }}
    />
  );
}

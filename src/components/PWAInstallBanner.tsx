"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, X } from "lucide-react";

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android / Desktop Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show the helper banner after a small delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-[#0e1014] border border-[#3ecf8e]/20 rounded-xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 flex items-center justify-center text-[#3ecf8e] shrink-0">
          <Download className="w-5 h-5 animate-bounce" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-white">Install TOV Studio</h4>
          <p className="text-[10px] text-text-secondary leading-tight">
            {isIOS
              ? "Tap Share (bottom bar) then 'Add to Home Screen'"
              : "Add to your mobile home screen for a native app experience."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-[#3ecf8e] text-black text-[10px] font-bold rounded-lg cursor-pointer hover:bg-[#3ecf8e]/80 transition-colors whitespace-nowrap"
          >
            Install
          </button>
        )}
        {isIOS && (
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary shrink-0">
            <Share className="w-4 h-4" />
          </div>
        )}
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default PWAInstallBanner;

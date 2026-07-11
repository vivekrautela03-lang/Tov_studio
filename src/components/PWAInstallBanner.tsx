"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, X, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

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
      }, 3000);
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
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-[#0e1014] border border-[#3ecf8e]/20 rounded-xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 flex items-center justify-center text-[#3ecf8e] shrink-0">
            <Download className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white">Install TOV Studio</h4>
            <p className="text-[10px] text-text-secondary leading-tight">
              {isIOS
                ? "Tap here to see how to add this app to your home screen."
                : "Add to your mobile home screen for a native app experience."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isIOS ? (
            <button
              onClick={() => setShowIOSInstructions(true)}
              className="px-3 py-1.5 bg-[#3ecf8e] text-black text-[10px] font-bold rounded-lg cursor-pointer hover:bg-[#3ecf8e]/80 transition-colors whitespace-nowrap"
            >
              How to Install
            </button>
          ) : (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-[#3ecf8e] text-black text-[10px] font-bold rounded-lg cursor-pointer hover:bg-[#3ecf8e]/80 transition-colors whitespace-nowrap"
            >
              Install
            </button>
          )}
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1014] border border-[#3ecf8e]/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-[#3ecf8e]" />
                <span>iOS Home Screen Setup</span>
              </h4>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-text-secondary">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#3ecf8e] shrink-0 text-[10px]">
                  1
                </div>
                <p className="leading-relaxed">
                  Open this website in <strong>Safari</strong> on your iPhone or iPad.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#3ecf8e] shrink-0 text-[10px]">
                  2
                </div>
                <div className="space-y-1">
                  <p className="leading-relaxed">
                    Tap the <strong>Share</strong> button in Safari's bottom toolbar.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px]">
                    <Share className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span className="text-white">Share Icon</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#3ecf8e] shrink-0 text-[10px]">
                  3
                </div>
                <div className="space-y-1">
                  <p className="leading-relaxed">
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px]">
                    <PlusSquare className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span className="text-white">Add to Home Screen</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#3ecf8e] shrink-0 text-[10px]">
                  4
                </div>
                <p className="leading-relaxed">
                  Tap <strong>Add</strong> in the top right corner of the screen to complete installation.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full h-9 bg-[#3ecf8e] text-black font-bold text-xs rounded-lg cursor-pointer hover:bg-[#3ecf8e]/80"
            >
              Got It
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
export default PWAInstallBanner;

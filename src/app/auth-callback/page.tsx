"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Securing workspace session...");

  useEffect(() => {
    // 1. Check if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("Session verified. Redirecting to workspace...");
        router.push("/");
      }
    });

    // 2. Listen for auth state changes (fired when oauth code is exchanged client-side)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setStatus("Redirecting to dashboard console...");
        router.push("/");
      }
    });

    // 3. Setup a fallback timeout if exchange takes too long
    const timeout = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 select-none">
      {/* Immersive Brand Loading Spinner */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-white animate-spin" />
        <svg viewBox="0 0 100 100" className="w-10 h-10 text-white animate-pulse" fill="currentColor">
          {/* Tilted Serif O */}
          <g transform="rotate(-14 46 54)">
            <path d="M 46,24 C 29,24 19,37 19,54 C 19,71 29,84 46,84 C 63,84 73,71 73,54 C 73,37 63,24 46,24 Z M 46,29 C 58,29 67,40 67,54 C 67,68 58,79 46,79 C 34,79 25,68 25,54 C 25,40 34,29 46,29 Z" />
          </g>
          {/* Serif T */}
          <path d="M 22,30 H 70 V 35 H 65 V 37 H 51 V 73 H 57 V 78 H 35 V 73 H 41 V 37 H 27 V 35 H 22 Z" />
          {/* Serif V */}
          <path d="M 58,48 L 72,78 H 75 L 89,48 H 84 L 74,72 L 63,48 Z" />
        </svg>
      </div>
      <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.25em] animate-pulse mt-2">
        {status}
      </p>
    </div>
  );
}

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
          <ellipse cx="48" cy="52" rx="30" ry="24" transform="rotate(-15 48 52)" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M22 30 h52 M48 30 v48 M38 78 h20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M60 50 L75 80 L90 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.25em] animate-pulse mt-2">
        {status}
      </p>
    </div>
  );
}

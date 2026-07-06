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
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center gap-4 select-none">
      {/* Immersive Neon Loading Spinner */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 animate-spin opacity-80" />
        <div className="w-11 h-11 rounded-lg bg-[#121212] z-10 flex items-center justify-center font-extrabold text-white text-xs">
          TOV
        </div>
      </div>
      <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest animate-pulse mt-2">
        {status}
      </p>
    </div>
  );
}

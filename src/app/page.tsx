"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { GlobalSearch } from "@/components/GlobalSearch";
import { cn } from "@/components/ui/button";
import { AuthView } from "@/components/views/AuthView";
import { BrainCircuit } from "lucide-react";

// Views
import { DashboardView } from "@/components/views/DashboardView";
import { ProjectsView } from "@/components/views/ProjectsView";
import { ScriptsView } from "@/components/views/ScriptsView";
import { StoryboardView } from "@/components/views/StoryboardView";
import { ShotPlannerView } from "@/components/views/ShotPlannerView";
import { CalendarView } from "@/components/views/CalendarView";
import { CrewView } from "@/components/views/CrewView";
import { CastView } from "@/components/views/CastView";
import { FilesView } from "@/components/views/FilesView";
import { AIStudioView } from "@/components/views/AIStudioView";
import { SettingsView } from "@/components/views/SettingsView";
import { CallSheetView } from "@/components/views/CallSheetView";

export default function Home() {
  const { activeView, sidebarCollapsed, setMemberRole, setActiveView, fetchWorkspaceData } = useProjectStore();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubstate, setAuthSubstate] = useState<"signin" | "signup" | "forgot" | "reset" | "verify">("signin");

  // Set up auth state change listener and check session
  useEffect(() => {
    // Parse recovery links and Google Calendar sync redirects
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && (hash.includes("type=recovery") || hash.includes("recovery"))) {
        setAuthSubstate("reset");
      } else if (hash && hash.includes("access_token") && !hash.includes("type=signup") && !hash.includes("type=invite")) {
        // Google Calendar OAuth redirect
        setActiveView("calendar");
      }
    }

    // 1. Check current session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchWorkspaceData();
        } else {
          setMemberRole("");
        }
      })
      .catch((err) => {
        console.error("Supabase session check failed:", err);
      })
      .finally(() => {
        setAuthLoading(false);
      });

    // 2. Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        fetchWorkspaceData();
      } else {
        setMemberRole("");
      }
      if (event === "PASSWORD_RECOVERY") {
        setAuthSubstate("reset");
      }
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Global Realtime Database Synchronization Channel
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel("global-tov-realtime")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        fetchWorkspaceData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user, fetchWorkspaceData]);

  // Map active view names to component nodes
  const renderViewContent = () => {
    switch (activeView) {
      case "projects":
        return <ProjectsView />;
      case "scripts":
        return <ScriptsView />;
      case "storyboards":
        return <StoryboardView />;
      case "shot-planner":
        return <ShotPlannerView />;
      case "calendar":
        return <CalendarView />;
      case "call-sheets":
        return <CallSheetView />;
      case "crew":
        return <CrewView />;
      case "cast":
        return <CastView />;
      case "files":
        return <FilesView />;
      case "ai-support":
        return <AIStudioView />;
      case "settings":
        return <SettingsView />;
      case "dashboard":
      default:
        return <DashboardView />;
    }
  };

  // 3. Loading Overlay Gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 select-none p-6">
        {/* Monogram Logo */}
        <div className="animate-pulse flex flex-col items-center text-center space-y-6">
          <svg viewBox="0 0 100 100" className="w-28 h-28 text-white" fill="currentColor">
            {/* Tilted Serif O */}
            <g transform="rotate(-14 46 54)">
              <path d="M 46,24 C 29,24 19,37 19,54 C 19,71 29,84 46,84 C 63,84 73,71 73,54 C 73,37 63,24 46,24 Z M 46,29 C 58,29 67,40 67,54 C 67,68 58,79 46,79 C 34,79 25,68 25,54 C 25,40 34,29 46,29 Z" />
            </g>
            {/* Serif T */}
            <path d="M 22,30 H 70 V 35 H 65 V 37 H 51 V 73 H 57 V 78 H 35 V 73 H 41 V 37 H 27 V 35 H 22 Z" />
            {/* Serif V */}
            <path d="M 58,48 L 72,78 H 75 L 89,48 H 84 L 74,72 L 63,48 Z" />
          </svg>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              {/* Horizontal Filmstrip Icon */}
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <rect x="2" y="4" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="1.5" />
                <line x1="16" y1="4" x2="16" y2="20" stroke="currentColor" strokeWidth="1.5" />
                <rect x="4" y="6" width="2" height="2" rx="0.5" />
                <rect x="4" y="11" width="2" height="2" rx="0.5" />
                <rect x="4" y="16" width="2" height="2" rx="0.5" />
                <rect x="18" y="6" width="2" height="2" rx="0.5" />
                <rect x="18" y="11" width="2" height="2" rx="0.5" />
                <rect x="18" y="16" width="2" height="2" rx="0.5" />
              </svg>
              <span className="text-lg font-black tracking-wider text-white uppercase font-sans">
                THE OLDVERSE
              </span>
            </div>
            <span className="text-[9px] text-white/60 tracking-[0.35em] uppercase font-mono font-bold mt-1.5">
              PRODUCTIONS
            </span>
          </div>

          <div className="pt-2 text-xs tracking-widest text-[#38bdf8] font-mono space-y-1">
            <p>Create. Collaborate.</p>
            <p>Bring Stories to Life.</p>
          </div>
        </div>

        <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.25em] animate-pulse mt-8">
          Initializing OS Session Shield...
        </p>
      </div>
    );
  }

  // 4. Redirect Gate: Show Auth portal if unauthenticated
  if (!session) {
    return <AuthView initialState={authSubstate} />;
  }

  // 5. Authenticated State: Mount Dashboard Sidebar Shell
  return (
    <div className="min-h-screen bg-[#121212] text-white flex">
      {/* Sidebar - Collapsible */}
      <Sidebar />

      {/* Main Panel Content Container */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 pl-0",
          sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        {/* Top Header Navigation */}
        <Header />

        {/* Dynamic Inner Panel View Viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {renderViewContent()}
        </main>
      </div>

      {/* Cmd+K Global Search Command Palette */}
      <GlobalSearch />
    </div>
  );
}

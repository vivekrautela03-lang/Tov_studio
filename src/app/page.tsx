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
            <ellipse cx="48" cy="52" rx="30" ry="24" transform="rotate(-15 48 52)" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M22 30 h52 M48 30 v48 M38 78 h20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M60 50 L75 80 L90 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
              <span className="text-lg font-black tracking-wider text-white uppercase font-sans">
                THE OLDVERSE
              </span>
            </div>
            <span className="text-[9px] text-[#A37E58] tracking-[0.35em] uppercase font-mono font-bold mt-1.5">
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

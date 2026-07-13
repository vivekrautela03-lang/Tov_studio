"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import { Header } from "@/components/Header";
import { GlobalSearch } from "@/components/GlobalSearch";
import { cn } from "@/components/ui/button";
import { AuthView } from "@/components/views/AuthView";
import { BrainCircuit } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { NotificationsView } from "@/components/views/NotificationsView";
import { ProfileView } from "@/components/views/ProfileView";
import { EquipmentView } from "@/components/views/EquipmentView";
import { initializePushNotifications } from "@/utils/pushNotifications";

// Views
import { DashboardView } from "@/components/views/DashboardView";
import { ProjectsView } from "@/components/views/ProjectsView";
import { ScriptsView } from "@/components/views/ScriptsView";
import { StoryboardView } from "@/components/views/StoryboardView";
import { ShotPlannerView } from "@/components/views/ShotPlannerView";
import { CalendarView } from "@/components/views/CalendarView";
import { CrewView } from "@/components/views/CrewView";
import { CastView } from "@/components/views/CastView";
import { TeamView } from "@/components/views/TeamView";
import { ChatView } from "@/components/views/ChatView";
import { InboxView } from "@/components/views/InboxView";
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

    initializePushNotifications(session.user.id);

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
      case "cast":
        return <CastView />;
      case "team":
      case "crew":
        return <TeamView />;
      case "chat":
        return <ChatView />;
      case "inbox":
        return <InboxView />;
      case "files":
        return <FilesView />;
      case "equipment":
        return <EquipmentView />;
      case "notifications":
        return <NotificationsView />;
      case "profile":
        return <ProfileView />;
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
        {/* Official Brand Logo */}
        <div className="animate-pulse flex flex-col items-center text-center space-y-6">
          <img
            src="/logo.png"
            alt="The Oldverse Productions"
            className="w-[280px] h-auto object-contain shrink-0"
          />
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

  const isFullScreenView = activeView === "chat" || activeView === "ai-support";

  // 5. Authenticated State: Mount Dashboard Shell with Top/Bottom Navigation
  return (
    <div className={`min-h-screen bg-[#121212] text-white flex flex-col ${isFullScreenView ? "" : "pb-24"}`}>
      {/* Top Header Navigation */}
      {!isFullScreenView && <Header />}

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col min-w-0 animate-fade-in">
        {/* Dynamic Inner Panel View Viewport */}
        <main className={`flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full ${isFullScreenView ? "p-0 h-screen" : "p-4 md:p-8"}`}>
          {renderViewContent()}
        </main>
      </div>

      {/* Fixed Bottom Navigation (Always Visible) */}
      {!isFullScreenView && <BottomNav />}

      {/* Cmd+K Global Search Command Palette */}
      <GlobalSearch />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { GlobalSearch } from "@/components/GlobalSearch";
import { cn } from "@/components/ui/button";
import { AuthView } from "@/components/views/AuthView";
import { RoleSelectionView } from "@/components/views/RoleSelectionView";
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
import { EquipmentView } from "@/components/views/EquipmentView";
import { FilesView } from "@/components/views/FilesView";
import { MarketingView } from "@/components/views/MarketingView";
import { AIStudioView } from "@/components/views/AIStudioView";
import { SettingsView } from "@/components/views/SettingsView";
import { AttendanceView } from "@/components/views/AttendanceView";

export default function Home() {
  const { activeView, sidebarCollapsed, setMemberRole, setActiveView, fetchWorkspaceData } = useProjectStore();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubstate, setAuthSubstate] = useState<"signin" | "signup" | "forgot" | "reset" | "verify">("signin");
  const [roleSelected, setRoleSelected] = useState<boolean>(false);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (data) {
        setMemberRole(data.role);
        if (data.role) {
          setRoleSelected(true);
        }
      }
    } catch (err) {
      console.error("Error loading user profile role:", err);
    }
  };

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
          fetchUserRole(session.user.id);
          fetchWorkspaceData();
        } else {
          setRoleSelected(false);
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
        fetchUserRole(session.user.id);
        fetchWorkspaceData();
      } else {
        setRoleSelected(false);
        setMemberRole("");
      }
      if (event === "PASSWORD_RECOVERY") {
        setAuthSubstate("reset");
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      case "crew":
        return <CrewView />;
      case "cast":
        return <CastView />;
      case "attendance":
        return <AttendanceView />;
      case "equipment":
        return <EquipmentView />;
      case "files":
        return <FilesView />;
      case "marketing":
        return <MarketingView />;
      case "ai-studio":
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
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 font-extrabold text-black flex items-center justify-center animate-bounce">
          TOV
        </div>
        <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest animate-pulse">
          Initializing OS Session Shield...
        </p>
      </div>
    );
  }

  // 4. Redirect Gate: Show Auth portal if unauthenticated
  if (!session) {
    return <AuthView initialState={authSubstate} />;
  }

  // 4.5 Role Selection Gate: Prompt new users or allow testing clearances
  if (!roleSelected) {
    return (
      <RoleSelectionView
        userId={session.user.id}
        onComplete={() => setRoleSelected(true)}
      />
    );
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

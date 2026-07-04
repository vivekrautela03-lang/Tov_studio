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
import { EquipmentView } from "@/components/views/EquipmentView";
import { FilesView } from "@/components/views/FilesView";
import { FinanceView } from "@/components/views/FinanceView";
import { MarketingView } from "@/components/views/MarketingView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { AIStudioView } from "@/components/views/AIStudioView";
import { SettingsView } from "@/components/views/SettingsView";

export default function Home() {
  const { activeView, sidebarCollapsed } = useProjectStore();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Set up auth state change listener
  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
      case "equipment":
        return <EquipmentView />;
      case "files":
        return <FilesView />;
      case "finance":
        return <FinanceView />;
      case "marketing":
        return <MarketingView />;
      case "analytics":
        return <AnalyticsView />;
      case "ai-studio":
        return <AIStudioView />;
      case "settings":
        return <SettingsView />;
      case "dashboard":
      default:
        return <DashboardView />;
    }
  };

  // 1. Loading State Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center gap-4 text-white">
        <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
        <span className="text-xs font-mono text-text-secondary tracking-widest uppercase">
          Initializing TOV Studio OS...
        </span>
      </div>
    );
  }

  // 2. Unauthenticated State: Mount Login/Signup Screen
  if (!session) {
    return <AuthView />;
  }

  // 3. Authenticated State: Mount Dashboard Sidebar Shell
  return (
    <div className="min-h-screen bg-[#121212] text-white flex">
      {/* Sidebar - Collapsible */}
      <Sidebar />

      {/* Main Panel Content Container */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-64"
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

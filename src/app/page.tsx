"use client";

import React from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { GlobalSearch } from "@/components/GlobalSearch";
import { cn } from "@/components/ui/button";

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

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex">
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

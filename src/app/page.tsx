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
import { MarketingView } from "@/components/views/MarketingView";
import { AIStudioView } from "@/components/views/AIStudioView";
import { SettingsView } from "@/components/views/SettingsView";
import { AttendanceView } from "@/components/views/AttendanceView";
import { CallSheetView } from "@/components/views/CallSheetView";

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
      case "call-sheets":
        return <CallSheetView />;
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

  const [selectedRole, setSelectedRole] = useState("Crew");
  const [savingRole, setSavingRole] = useState(false);

  const handleConfirmRole = async () => {
    if (!session?.user) return;
    setSavingRole(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", session.user.id);
      
      if (error) throw error;
      setMemberRole(selectedRole);
      setRoleSelected(true);
    } catch (err: any) {
      console.error("Error setting role:", err);
      alert(err.message || "Failed to set role");
    } finally {
      setSavingRole(false);
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

  // 4.5 Post-Auth Role Selection Gate (primarily for Google logins)
  if (!roleSelected) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(62,207,142,0.08),rgba(255,255,255,0))]" />
        
        <div className="w-full max-w-md bg-[#18181B] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 z-10 shadow-2xl relative">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 font-extrabold text-black text-lg shadow-lg shadow-primary/10">
              TOV
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white mt-4">
              Select Studio Role
            </h2>
            <p className="text-xs text-text-secondary">
              Choose your primary role to configure your personalized dashboard workspace.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                Workspace Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={savingRole}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Owner">Studio Owner / Admin</option>
                <option value="Producer">Producer</option>
                <option value="Director">Director</option>
                <option value="Cinematographer (DOP)">Cinematographer (DOP)</option>
                <option value="Editor">Editor</option>
                <option value="Actor">Actor / Talent</option>
                <option value="Crew">Crew Member</option>
              </select>
            </div>

            <button
              onClick={handleConfirmRole}
              disabled={savingRole}
              className="w-full text-xs font-bold py-2.5 h-10 rounded-lg cursor-pointer bg-gradient-to-r from-primary to-emerald-400 text-black flex items-center justify-center gap-2 mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {savingRole ? "Configuring Workspace..." : "Confirm & Enter Dashboard"}
            </button>
          </div>
        </div>
      </div>
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

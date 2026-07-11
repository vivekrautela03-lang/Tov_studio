"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeft, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// Subviews
import { ScriptsView } from "./ScriptsView";
import { StoryboardView } from "./StoryboardView";
import { ShotPlannerView } from "./ShotPlannerView";
import { CrewView } from "./CrewView";
import { CastView } from "./CastView";
import { FilesView } from "./FilesView";
import { CalendarView } from "./CalendarView";
import { CallSheetView } from "./CallSheetView";
import { ChatView } from "./ChatView";
import { EquipmentView } from "./EquipmentView";

interface ProjectDetailsViewProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
  projectId,
  onBack
}) => {
  const { projects } = useProjectStore();
  const project = projects.find((p) => p.id === projectId) || projects[0];

  const getDbProductionId = (projId: string) => {
    if (projId === "proj-1") return "d3b07384-d113-4ec6-a558-7e289bf449f1";
    if (projId === "proj-2") return "44b6c33c-35cd-43ff-90a6-c956b7cdb10d";
    if (projId === "proj-3") return "5c84a861-26be-45a2-9ad6-2ea8fb60a5ad";
    return projId;
  };

  const tabs = [
    "Overview",
    "Team",
    "Cast",
    "Messages",
    "Files",
    "Script",
    "Storyboard",
    "Tasks",
    "Calendar",
    "Equipment",
    "Locations",
    "Budget",
    "Schedule",
    "Settings"
  ];

  const [activeTab, setActiveTab] = useState("Overview");
  const [memberRole, setMemberRole] = useState<string>("Crew");

  // Load user role for this production to enable RBAC
  useEffect(() => {
    const fetchMemberRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Query production_members first
        const { data: pmData } = await supabase
          .from("production_members")
          .select("role")
          .eq("production_id", getDbProductionId(projectId))
          .eq("user_id", user.id)
          .single();

        if (pmData) {
          setMemberRole(pmData.role);
        } else {
          // Fallback to global profile role
          const { data: pData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (pData) {
            setMemberRole(pData.role);
          }
        }
      } catch (err) {
        console.error("Error fetching member role:", err);
      }
    };

    fetchMemberRole();
  }, [projectId]);

  // Render content based on selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Team":
        return <CrewView projectScope={projectId} />;
      case "Cast":
        return <CastView projectScope={projectId} />;
      case "Messages":
        return <ChatView />;
      case "Files":
        return <FilesView projectScope={projectId} />;
      case "Script":
        return <ScriptsView projectScope={projectId} />;
      case "Storyboard":
        return <StoryboardView projectScope={projectId} />;
      case "Tasks":
        return <ShotPlannerView projectScope={projectId} />;
      case "Calendar":
        return <CalendarView projectScope={projectId} />;
      case "Equipment":
        return <EquipmentView projectScope={projectId} />;
      case "Locations":
        return renderLocationsTab();
      case "Budget":
        return renderBudgetTab();
      case "Schedule":
        return <CallSheetView projectScope={projectId} />;
      case "Settings":
        return renderSettingsTab();
      case "Overview":
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/5 bg-neutral-900/40 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Logline & Vision</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {project.tagline}
              </p>
              <div className="border-t border-white/5 pt-4 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Director</span>
                  <div className="text-white font-medium mt-1">{project.director}</div>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Production Location</span>
                  <div className="text-white font-medium mt-1">{project.location}</div>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Active Workspace Role</span>
                  <div className="text-primary font-bold mt-1 uppercase tracking-wider">{memberRole}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/5 bg-neutral-900/40 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campaign Details</h3>
              <div className="space-y-3 border-b border-white/5 pb-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Release Date</span>
                  <span className="text-white font-medium">{project.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Current Stage</span>
                  <span className="text-primary font-bold">{project.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderLocationsTab = () => {
    const locations = [
      { name: "Neo-Tokyo Alleyways Set", type: "Studio Stage 4", address: "Tokyo, Koto City, Aomi 2-chome", status: "Active" },
      { name: "Shibuya Crossing Cyber Overlay", type: "On-Location Permits", address: "Tokyo, Shibuya Crossing", status: "Permit Approved" },
      { name: "Rainforest Soundstage B", type: "Indoor Soundstage", address: "London, Pinewood Studios", status: "Booked" }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-xs">
        {locations.map((loc, idx) => (
          <Card key={idx} className="border-white/5 bg-neutral-900/40 backdrop-blur-md">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold text-white">{loc.name}</h4>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-text-secondary font-medium">
                  {loc.type}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">{loc.address}</p>
              <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                <span className="text-text-secondary">Status</span>
                <span className="text-success font-medium">{loc.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderBudgetTab = () => {
    return (
      <Card className="animate-fade-in border-white/5 bg-neutral-900/40 backdrop-blur-md text-xs">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Production Budget</h3>
              <p className="text-[10px] text-text-secondary">Overview of overall budget distribution & expenditures</p>
            </div>
            <span className="text-sm font-black text-primary">{project.budget}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-black/30 border border-white/5 rounded-lg space-y-1">
              <span className="text-[10px] text-text-secondary uppercase">Pre-Production</span>
              <div className="text-base font-bold text-white">$250,000</div>
              <div className="text-[9px] text-[#3ecf8e]">100% Spent</div>
            </div>
            <div className="p-4 bg-black/30 border border-white/5 rounded-lg space-y-1">
              <span className="text-[10px] text-text-secondary uppercase">Principal Photography</span>
              <div className="text-base font-bold text-white">$900,000</div>
              <div className="text-[9px] text-[#3ecf8e]">45% Spent</div>
            </div>
            <div className="p-4 bg-black/30 border border-white/5 rounded-lg space-y-1">
              <span className="text-[10px] text-text-secondary uppercase">Post-Production</span>
              <div className="text-base font-bold text-white">$350,000</div>
              <div className="text-[9px] text-text-secondary font-medium">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSettingsTab = () => {
    return (
      <Card className="animate-fade-in border-white/5 bg-neutral-900/40 backdrop-blur-md text-xs">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-text-secondary mb-1">Production Title</label>
              <input
                type="text"
                defaultValue={project.title}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-secondary mb-1">Director</label>
              <input
                type="text"
                defaultValue={project.director}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-secondary mb-1">Base Location</label>
              <input
                type="text"
                defaultValue={project.location}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-secondary mb-1">Deadline Date</label>
              <input
                type="date"
                defaultValue={project.deadline}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-3">
            <Button variant="primary" size="sm" onClick={() => alert("Workspace settings saved successfully!")}>
              Save Workspace Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Back Header & Cinematic banner */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-white cursor-pointer transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Productions</span>
        </button>

        {/* Project Header Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {project.title}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase tracking-wider">
                {project.status}
              </span>
            </div>
            <p className="text-xs text-text-secondary max-w-2xl">{project.tagline}</p>
          </div>
        </div>
      </div>

      {/* Horizontal Sub tabs */}
      <div className="w-full overflow-x-auto scrollbar-none border-b border-white/5 flex items-center gap-1 py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-2 text-xs font-bold text-left cursor-pointer transition-all shrink-0 select-none text-text-secondary hover:text-white"
            >
              {isActive && (
                <motion.div
                  layoutId="activeWorkspaceTab"
                  className="absolute inset-0 bg-white/5 rounded-md"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={isActive ? "text-[#22d3ee] font-extrabold" : "text-text-secondary"}>
                {tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Mount Area */}
      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
};
export default ProjectDetailsView;

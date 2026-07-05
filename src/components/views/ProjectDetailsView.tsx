"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeft, Film, Calendar, DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

// Subviews
import { ScriptsView } from "./ScriptsView";
import { StoryboardView } from "./StoryboardView";
import { ShotPlannerView } from "./ShotPlannerView";
import { CrewView } from "./CrewView";
import { CastView } from "./CastView";
import { EquipmentView } from "./EquipmentView";
import { FilesView } from "./FilesView";
import { FinanceView } from "./FinanceView";
import { MarketingView } from "./MarketingView";

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
    "Script",
    "Storyboard",
    "Schedule",
    "Crew",
    "Cast",
    "Equipment",
    "Locations",
    "Files",
    "Budget",
    "Marketing",
    "Release"
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

  // Filter tabs dynamically based on user role permissions
  const filteredTabs = tabs.filter((tab) => {
    if (memberRole === "Client") {
      return ["Overview", "Storyboard", "Files", "Release"].includes(tab);
    }
    if (memberRole === "Crew") {
      return tab !== "Budget" && tab !== "Marketing";
    }
    // Only Owners and Producers can see financial Budget ledgers
    if (tab === "Budget") {
      return ["Owner", "Producer"].includes(memberRole);
    }
    return true;
  });

  // Ensure active tab fallback if filtered out by role change
  useEffect(() => {
    if (!filteredTabs.includes(activeTab)) {
      setActiveTab("Overview");
    }
  }, [memberRole]);

  // Render content based on selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Script":
        return <ScriptsView projectScope={projectId} />;
      case "Storyboard":
        return <StoryboardView projectScope={projectId} />;
      case "Schedule":
        return <ShotPlannerView projectScope={projectId} />;
      case "Crew":
        return <CrewView projectScope={projectId} />;
      case "Cast":
        return <CastView projectScope={projectId} />;
      case "Equipment":
        return <EquipmentView projectScope={projectId} />;
      case "Files":
        return <FilesView projectScope={projectId} />;
      case "Budget":
        return <FinanceView projectScope={projectId} />;
      case "Marketing":
        return <MarketingView projectScope={projectId} />;
      case "Locations":
        return renderLocationsTab();
      case "Release":
        return renderReleaseTab();
      case "Overview":
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Logline & Vision</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {project.tagline}
              </p>
              <div className="border-t border-white/5 pt-4 grid grid-cols-3 gap-4 text-xs">
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
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Campaign Details</h3>
              <div className="space-y-3 text-xs border-b border-white/5 pb-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {locations.map((loc, idx) => (
          <Card key={idx}>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-white">{loc.name}</h4>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-text-secondary font-medium">
                  {loc.type}
                </span>
              </div>
              <p className="text-xs text-text-secondary">{loc.address}</p>
              <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs">
                <span className="text-text-secondary">Status</span>
                <span className="text-success font-medium">{loc.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderReleaseTab = () => {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-base font-bold text-white">Release & Distribution Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-xs text-text-secondary uppercase">Teaser Cut</span>
              <div className="text-base font-bold text-white mt-1">Oct 01, 2026</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-xs text-text-secondary uppercase">Trailer Lock</span>
              <div className="text-base font-bold text-white mt-1">Nov 12, 2026</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-xs text-text-secondary uppercase">Festival Premier</span>
              <div className="text-base font-bold text-white mt-1">Dec 01, 2026</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-xs text-text-secondary uppercase">Theatrical Release</span>
              <div className="text-base font-bold text-white mt-1">Dec 15, 2026</div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Distribution Partners</h4>
            <p className="text-xs text-text-secondary">
              A24 (Domestic Sales Agent) • Universal Pictures (International Distribution) • Netflix (Subscription Video-on-Demand Streaming Window).
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
        {filteredTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-2 text-xs font-medium text-left cursor-pointer transition-all shrink-0 select-none text-text-secondary hover:text-white"
            >
              {isActive && (
                <motion.div
                  layoutId="activeWorkspaceTab"
                  className="absolute inset-0 bg-white/5 rounded-md"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={isActive ? "text-primary font-semibold" : "text-text-secondary"}>
                {tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Mount Area */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
export default ProjectDetailsView;

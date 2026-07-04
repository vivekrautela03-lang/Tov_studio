"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
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
                  <span className="text-[10px] text-text-secondary uppercase">Est. Release</span>
                  <div className="text-white font-medium mt-1">{project.deadline}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-5 space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Shoot Details</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-text-secondary">First Unit Call</span>
                    <span className="text-white font-semibold">Tomorrow 18:00</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-text-secondary">Atmospherics</span>
                    <span className="text-warning">Heavy Haze, H2O Rain</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Focus Sync</span>
                    <span className="text-white">Active (RED LiveGrade)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Finance Breakdown</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-text-secondary">Total Budget</span>
                    <span className="text-white font-bold">{project.budget}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-text-secondary">Spent (Est.)</span>
                    <span className="text-white font-semibold">${(project.spentVal / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Committed Funds</span>
                    <span className="text-success font-semibold">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-card to-primary/5 border-primary/10">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-1 text-[10px] text-primary uppercase font-mono font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Continuity Engine</span>
              </div>
              <h4 className="text-xs font-bold text-white">Active Continuity Warning</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                "Plasma Blaster prop in Scene 1 (Sunset street) requires blue luminescent batteries. Verify with Prop Master Marcus V. to prevent tone mismatched color grades with VFX renders."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Project Timeline</h4>
              <div className="space-y-3 text-xs border-l border-white/5 pl-3 py-1">
                <div className="relative">
                  <div className="absolute -left-[16.5px] top-1 w-2.5 h-2.5 rounded-full bg-success ring-4 ring-success/15" />
                  <span className="text-success font-medium">Pre-Production Done</span>
                  <p className="text-[10px] text-text-secondary mt-0.5">Finished casting and screenplay lock.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[16.5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
                  <span className="text-white font-medium">Production (Active)</span>
                  <p className="text-[10px] text-text-secondary mt-0.5">Currently filming Scene 1 blocks.</p>
                </div>
                <div className="relative opacity-50">
                  <div className="absolute -left-[16.5px] top-1 w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="text-text-secondary">Post-Production</span>
                  <p className="text-[10px] text-text-secondary mt-0.5">Scheduled to start October 15.</p>
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
      { name: "Neo-Tokyo Alleyways", address: "Backlot Stage 4, Tokyo Studios", status: "Permits Approved", type: "Outdoor" },
      { name: "Apartment 404 Room Set", address: "Soundstage B, Culver City", status: "Rigs Under Construction", type: "Indoor" },
      { name: "Cyber City Corporate Lobby", address: "Plaza Towers, Shinjuku", status: "Pending Insurance Lock", type: "Location" }
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
        {tabs.map((tab) => {
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

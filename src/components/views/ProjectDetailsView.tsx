"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeft, Clock, Plus, Trash2, MapPin } from "lucide-react";
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
import { StoryboardScriptView } from "./StoryboardScriptView";

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
    "Storyboard & Script",
    "Team Allocation",
    "Cast Allocation",
    "Locations",
    "Calendar & Weather",
    "Schedule"
  ];

  const [activeTab, setActiveTab] = useState("Overview");
  const [memberRole, setMemberRole] = useState<string>("Crew");

  // Locations CRUD State
  const [locations, setLocations] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const [isAddLocOpen, setIsAddLocOpen] = useState(false);
  const [newLoc, setNewLoc] = useState({
    name: "",
    type: "Indoor Soundstage",
    address: "",
    notes: "",
    photoUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
    status: "Active"
  });

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setLocLoading(true);
      const { data, error } = await supabase
        .from("production_locations")
        .select("*")
        .eq("project_id", projectId);
      if (data) setLocations(data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [projectId]);

  // Handle Add Location
  const handleAddLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.name.trim() || !newLoc.address.trim()) return;

    try {
      const { error } = await supabase
        .from("production_locations")
        .insert({
          project_id: projectId,
          name: newLoc.name.trim(),
          type: newLoc.type,
          address: newLoc.address.trim(),
          notes: newLoc.notes.trim(),
          photo_url: newLoc.photoUrl,
          status: newLoc.status
        });
      if (error) throw error;
      fetchLocations();
      setIsAddLocOpen(false);
      setNewLoc({
        name: "",
        type: "Indoor Soundstage",
        address: "",
        notes: "",
        photoUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
        status: "Active"
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Delete Location
  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      const { error } = await supabase
        .from("production_locations")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchLocations();
    } catch (err: any) {
      alert(err.message);
    }
  };

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
      case "Storyboard & Script":
        return <StoryboardScriptView projectScope={projectId} />;
      case "Team Allocation":
        return <CrewView projectScope={projectId} />;
      case "Cast Allocation":
        return <CastView projectScope={projectId} />;
      case "Locations":
        return renderLocationsTab();
      case "Calendar & Weather":
        return <CalendarView projectScope={projectId} />;
      case "Schedule":
        return <CallSheetView projectScope={projectId} />;
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
    return (
      <div className="space-y-6 animate-fade-in text-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filming Locations</h3>
            <p className="text-[10px] text-text-secondary">Manage filming sets, permits, and indoor/outdoor staging venues.</p>
          </div>
          <Button
            onClick={() => setIsAddLocOpen(true)}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Location</span>
          </Button>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-10 bg-[#121212]/30 border border-dashed border-white/10 rounded-2xl">
            <span className="text-2xl">📍</span>
            <p className="text-[10px] font-bold text-text-secondary uppercase mt-2">No locations recorded</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <Card key={loc.id} className="border-white/5 bg-neutral-900/40 backdrop-blur-md overflow-hidden flex flex-col justify-between hover:border-[#22d3ee]/20 transition-all duration-200">
                <div className="relative h-32">
                  <img src={loc.photo_url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80"} className="w-full h-full object-cover" alt="" />
                  <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-primary border border-primary/20 backdrop-blur-md">
                    {loc.type}
                  </span>
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white truncate">{loc.name}</h4>
                    <p className="text-[10px] text-text-secondary font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#22d3ee] shrink-0" />
                      <span className="truncate">{loc.address}</span>
                    </p>
                  </div>

                  {loc.notes && (
                    <p className="text-[10.5px] text-text-secondary leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
                      {loc.notes}
                    </p>
                  )}

                  <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#22d3ee]">{loc.status}</span>
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="p-1.5 rounded bg-danger/10 hover:bg-danger text-danger hover:text-white transition-colors cursor-pointer"
                      title="Delete Location"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Location Modal */}
        {isAddLocOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="w-[420px] max-w-full bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Add Filming Location</span>
                <button
                  onClick={() => setIsAddLocOpen(false)}
                  className="p-1 rounded bg-white/5 text-text-secondary hover:text-white cursor-pointer"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleAddLocationSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Location Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neo-Tokyo Stage 4"
                    value={newLoc.name}
                    onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">Venue Type</label>
                    <select
                      value={newLoc.type}
                      onChange={(e) => setNewLoc({ ...newLoc, type: e.target.value })}
                      className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                    >
                      <option value="Indoor Soundstage">Indoor Soundstage</option>
                      <option value="Outdoor Permits">Outdoor Permits</option>
                      <option value="Public Space">Public Space</option>
                      <option value="Studio Stage">Studio Stage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">Permit Status</label>
                    <select
                      value={newLoc.status}
                      onChange={(e) => setNewLoc({ ...newLoc, status: e.target.value })}
                      className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                    >
                      <option value="Active">Active</option>
                      <option value="Permit Approved">Permit Approved</option>
                      <option value="Booked">Booked</option>
                      <option value="Pending Approval">Pending Approval</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Full Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Address, city, country..."
                    value={newLoc.address}
                    onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={newLoc.photoUrl}
                    onChange={(e) => setNewLoc({ ...newLoc, photoUrl: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Staging Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Special details (lighting rigging, power limits)..."
                    value={newLoc.notes}
                    onChange={(e) => setNewLoc({ ...newLoc, notes: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddLocOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Add Location
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
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

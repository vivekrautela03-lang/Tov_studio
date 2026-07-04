"use client";

import React, { useState } from "react";
import { useProjectStore, ShotPlan } from "@/store/useProjectStore";
import { Plus, CheckSquare, Clock, MapPin, CloudRain, BrainCircuit, Play, CheckCircle, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ShotPlannerViewProps {
  projectScope?: string;
}

export const ShotPlannerView: React.FC<ShotPlannerViewProps> = ({ projectScope }) => {
  const {
    activeProjectId,
    shotPlans,
    addShotPlan,
    updateShotPlanStatus
  } = useProjectStore();

  const targetProjectId = projectScope || activeProjectId;
  const projectPlans = shotPlans[targetProjectId] || [];

  // Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    scene: "Scene 1: Ext. Street",
    setup: "",
    props: [] as string[],
    crew: [] as string[],
    duration: "2 hours",
    location: "Backlot Stage 4",
    weather: "Indoor" as ShotPlan["weather"],
    status: "Todo" as ShotPlan["status"]
  });

  const [propInput, setPropInput] = useState("");
  const [crewInput, setCrewInput] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.setup.trim()) return;

    addShotPlan(targetProjectId, newPlan);
    setIsAddOpen(false);
    
    // Reset
    setNewPlan({
      scene: "Scene 1: Ext. Street",
      setup: "",
      props: [],
      crew: [],
      duration: "2 hours",
      location: "Backlot Stage 4",
      weather: "Indoor",
      status: "Todo"
    });
    setPropInput("");
    setCrewInput("");
  };

  const addProp = () => {
    if (!propInput.trim()) return;
    setNewPlan({ ...newPlan, props: [...newPlan.props, propInput.trim()] });
    setPropInput("");
  };

  const addCrew = () => {
    if (!crewInput.trim()) return;
    setNewPlan({ ...newPlan, crew: [...newPlan.crew, crewInput.trim()] });
    setCrewInput("");
  };

  const cycleStatus = (planId: string, currentStatus: ShotPlan["status"]) => {
    const statusCycle: Record<ShotPlan["status"], ShotPlan["status"]> = {
      Todo: "In Progress",
      "In Progress": "Completed",
      Completed: "Delayed",
      Delayed: "Todo"
    };
    updateShotPlanStatus(targetProjectId, planId, statusCycle[currentStatus]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* AI Optimization Alert Banner */}
      <Card className="border-[#3B82F6]/20 bg-gradient-to-r from-card to-[#3B82F6]/5">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <BrainCircuit className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                AI Optimization Suggestions
              </h4>
              <p className="text-[11px] text-text-secondary leading-relaxed max-w-xl">
                "Ext. Neon Alley scene has an 'Outdoor - Rain Contingency' tag. Based on Sunday weather forecasts (80% precipitation at 22:00), I recommend prioritizing Scene 1A Steadicam walk between 18:00 and 21:00, then moving all crew to Stage 4 (Indoor Apartment) to prevent equipment exposure."
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="text-xs shrink-0 cursor-pointer">
            Apply AI Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Header controls */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-white">Production Shot Planner</h3>
          <span className="text-[10px] text-text-secondary mt-0.5 block">
            Sequence checklist and camera setups
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Setup Plan</span>
        </Button>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-white/5 pl-6 ml-4 space-y-6 py-2">
        {projectPlans.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-secondary">
            No camera setups or scene blocks scheduled yet.
          </div>
        ) : (
          projectPlans.map((plan, idx) => {
            return (
              <div key={plan.id} className="relative group">
                
                {/* Timeline Dot Indicator */}
                <button
                  onClick={() => cycleStatus(plan.id, plan.status)}
                  className={`absolute -left-[35px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer border transition-all ${
                    plan.status === "Completed" ? "bg-success border-success text-black ring-4 ring-success/15" :
                    plan.status === "In Progress" ? "bg-primary border-primary text-white ring-4 ring-primary/15" :
                    plan.status === "Delayed" ? "bg-danger border-danger text-white ring-4 ring-danger/15" :
                    "bg-[#09090B] border-white/10 text-transparent hover:border-primary"
                  }`}
                >
                  {plan.status === "Completed" && <CheckCircle className="w-3.5 h-3.5" />}
                  {plan.status === "In Progress" && <Play className="w-2.5 h-2.5 translate-x-px" />}
                  {plan.status === "Delayed" && <span className="text-[8px] font-bold">!</span>}
                </button>

                {/* Planner Content Card */}
                <Card className="hover:border-white/10 transition-colors">
                  <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                          {plan.scene}
                        </span>
                        <span className="text-[10px] font-mono text-text-secondary flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {plan.location}
                        </span>
                        <span className={`text-[9px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded ${
                          plan.weather === "Indoor" ? "bg-white/5 text-text-secondary" : "bg-warning/20 text-warning"
                        }`}>
                          <CloudRain className="w-3 h-3" /> {plan.weather}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">
                        {plan.setup}
                      </h4>

                      {/* Props & Crew Lists */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-text-secondary pt-1.5">
                        {plan.props.length > 0 && (
                          <div>
                            <span className="font-semibold text-white/50">Props: </span>
                            <span>{plan.props.join(", ")}</span>
                          </div>
                        )}
                        {plan.crew.length > 0 && (
                          <div>
                            <span className="font-semibold text-white/50">Crew: </span>
                            <span>{plan.crew.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-white/5 md:border-none pt-3 md:pt-0 shrink-0">
                      <span className="text-xs text-text-secondary font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {plan.duration}
                      </span>
                      <button
                        onClick={() => cycleStatus(plan.id, plan.status)}
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded cursor-pointer transition-colors ${
                          plan.status === "Completed" ? "bg-success/20 text-success" :
                          plan.status === "In Progress" ? "bg-primary/20 text-primary" :
                          plan.status === "Delayed" ? "bg-danger/20 text-danger" :
                          "bg-white/5 text-text-secondary"
                        }`}
                      >
                        {plan.status}
                      </button>
                    </div>
                  </CardContent>
                </Card>

              </div>
            );
          })
        )}
      </div>

      {/* ADD SETUP PLAN DIALOG */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Camera Setup Plan"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Scene Tag</label>
              <select
                value={newPlan.scene}
                onChange={(e) => setNewPlan({ ...newPlan, scene: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              >
                <option value="Scene 1: Ext. Street">Scene 1: Ext. Street</option>
                <option value="Scene 2: Apartment Racks">Scene 2: Apartment Racks</option>
                <option value="Scene 3: Office Encounter">Scene 3: Office Encounter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Weather Dependency</label>
              <select
                value={newPlan.weather}
                onChange={(e) => setNewPlan({ ...newPlan, weather: e.target.value as ShotPlan["weather"] })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              >
                <option value="Indoor">Indoor (No Dependency)</option>
                <option value="Outdoor - Sun">Outdoor - Daylight Sun</option>
                <option value="Outdoor - Rain Contingency">Outdoor - Rain Contingency</option>
                <option value="Outdoor - Night">Outdoor - Night Lighting</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Camera Setup & Shot Description</label>
            <input
              type="text"
              required
              placeholder="e.g., Steadicam tracking shot following main actor past alleyway vents"
              value={newPlan.setup}
              onChange={(e) => setNewPlan({ ...newPlan, setup: e.target.value })}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Estimated Duration</label>
              <input
                type="text"
                placeholder="e.g., 2.5 hours"
                value={newPlan.duration}
                onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Location Set</label>
              <input
                type="text"
                placeholder="e.g., Backlot Stage 4"
                value={newPlan.location}
                onChange={(e) => setNewPlan({ ...newPlan, location: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Add Props tags */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Required Scene Props</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Synthetic food bowl"
                value={propInput}
                onChange={(e) => setPropInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addProp())}
                className="flex-1 bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addProp}>Add</Button>
            </div>
            {newPlan.props.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {newPlan.props.map((p, i) => (
                  <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white flex items-center gap-1">
                    {p}
                    <button type="button" onClick={() => setNewPlan({ ...newPlan, props: newPlan.props.filter((_, idx) => idx !== i) })} className="hover:text-primary">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add Crew tags */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Assigned On-Set Crew</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Dolly Grip, Gaffer"
                value={crewInput}
                onChange={(e) => setCrewInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCrew())}
                className="flex-1 bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-all"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addCrew}>Add</Button>
            </div>
            {newPlan.crew.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {newPlan.crew.map((c, i) => (
                  <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white flex items-center gap-1">
                    {c}
                    <button type="button" onClick={() => setNewPlan({ ...newPlan, crew: newPlan.crew.filter((_, idx) => idx !== i) })} className="hover:text-primary">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Insert Schedule Setup
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
};
export default ShotPlannerView;

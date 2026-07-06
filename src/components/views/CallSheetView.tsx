"use client";

import React, { useState } from "react";
import { useProjectStore, CallSheet } from "@/store/useProjectStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Calendar, Clock, CloudRain, Trash2, Eye, Sparkles, Printer, FileText } from "lucide-react";
import { motion } from "framer-motion";

export const CallSheetView: React.FC = () => {
  const { activeProjectId, callSheets, addCallSheet, deleteCallSheet, crew, cast } = useProjectStore();

  const projectCallSheets = callSheets[activeProjectId] || [];
  const projectCrew = crew[activeProjectId] || [];
  const projectCast = cast[activeProjectId] || [];

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<CallSheet | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [newSheet, setNewSheet] = useState({
    date: new Date().toISOString().split("T")[0],
    call_time: "07:30 AM",
    weather_notes: "Clear sky conditions. Golden hour estimated at 05:45 PM.",
    instructions: "Scene 1: Neon Alley (Steadicam sequence). Actors report to Makeup by 08:00 AM."
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCallSheet(activeProjectId, {
        date: newSheet.date,
        call_time: newSheet.call_time,
        weather_notes: newSheet.weather_notes.trim(),
        instructions: newSheet.instructions.trim()
      });
      setIsCreateOpen(false);
      setNewSheet({
        date: new Date().toISOString().split("T")[0],
        call_time: "07:30 AM",
        weather_notes: "Clear sky conditions. Golden hour estimated at 05:45 PM.",
        instructions: "Scene 1: Neon Alley (Steadicam sequence). Actors report to Makeup by 08:00 AM."
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sheetId: string) => {
    if (confirm("Are you sure you want to delete this Call Sheet?")) {
      try {
        await deleteCallSheet(activeProjectId, sheetId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Call Sheets</h1>
          <p className="text-text-secondary text-xs mt-1">
            Dispatch call times, weather reports, and instructions to actors and crew.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 cursor-pointer text-xs h-9"
        >
          <Plus className="w-4 h-4 text-black font-bold" />
          <span>Create Call Sheet</span>
        </Button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectCallSheets.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl bg-card">
            No Call Sheets created for this campaign. Click Create Call Sheet to generate.
          </div>
        ) : (
          projectCallSheets.map((sheet) => (
            <Card
              key={sheet.id}
              className="bg-[#111318] border-white/5 hover:border-primary/20 transition-all duration-300 rounded-xl flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                
                {/* Info Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(sheet.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5 pt-1">
                      <Clock className="w-4 h-4 text-text-secondary" />
                      Call Time: {sheet.call_time}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDelete(sheet.id)}
                    className="p-1 hover:bg-danger/10 text-text-secondary hover:text-danger rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Instructions snippet */}
                <div className="space-y-1 text-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-secondary font-mono">Today's Instructions</span>
                  <p className="text-white line-clamp-2 leading-relaxed bg-white/[0.01] border border-white/5 p-2 rounded">
                    {sheet.instructions}
                  </p>
                </div>

                {/* Weather snippet */}
                <div className="space-y-1 text-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-secondary font-mono">Weather Alert</span>
                  <p className="text-text-secondary line-clamp-1 leading-normal flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-primary shrink-0" />
                    {sheet.weather_notes}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-white/5 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSheet(sheet)}
                    className="flex-1 h-8 text-[10px] bg-black/40 border-white/5 hover:border-white/10 text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Sheet</span>
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 1. CREATOR OVERLAY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#171717] border border-white/5 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Call Sheet Creator</span>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Shoot Date</label>
                  <input
                    type="date"
                    required
                    value={newSheet.date}
                    onChange={(e) => setNewSheet({ ...newSheet, date: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Crew Call Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07:30 AM"
                    value={newSheet.call_time}
                    onChange={(e) => setNewSheet({ ...newSheet, call_time: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-text-secondary text-[10px] uppercase font-semibold">Weather Notes & Golden Hour</label>
                <textarea
                  required
                  placeholder="e.g. Clear conditions. Sunset estimated at 05:45 PM."
                  value={newSheet.weather_notes}
                  onChange={(e) => setNewSheet({ ...newSheet, weather_notes: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-text-secondary text-[10px] uppercase font-semibold">Instructions & Blocks</label>
                <textarea
                  required
                  placeholder="Details about today's scenes, rigs, and department directions."
                  value={newSheet.instructions}
                  onChange={(e) => setNewSheet({ ...newSheet, instructions: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 text-xs cursor-pointer h-10 border-white/10 hover:border-white/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1 text-xs cursor-pointer h-10 text-black font-bold"
                >
                  {loading ? "Creating..." : "Dispatch Call Sheet"}
                </Button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* 2. DAILY DETAIL OVERLAY VIEW */}
      {selectedSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden my-8"
          >
            
            {/* Header */}
            <div className="bg-[#171717] px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">DAILY CALL SHEET</h2>
                  <p className="text-[10px] text-text-secondary">TOV Studiobinder Dispatch Format</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  title="Print Call Sheet"
                  className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedSheet(null)}
                  className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-6 text-xs text-text-secondary">
              
              {/* Call Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] uppercase font-mono block">Shoot Date</span>
                  <span className="text-white font-bold text-[13px]">{new Date(selectedSheet.date).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono block">Crew Call time</span>
                  <span className="text-white font-bold text-[13px]">{selectedSheet.call_time}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[9px] uppercase font-mono block">Shooting Location</span>
                  <span className="text-white font-bold text-[13px]">Soundstage B, Backlot Sets</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold tracking-wider font-mono block">Today's Instructions</span>
                <p className="text-white bg-black/40 border border-white/5 p-3.5 rounded-lg leading-relaxed text-[11px] whitespace-pre-line select-text">
                  {selectedSheet.instructions}
                </p>
              </div>

              {/* Weather Alert */}
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold tracking-wider font-mono block">Location Weather Conditions</span>
                <p className="text-text-secondary bg-[#3ecf8e]/5 border border-[#3ecf8e]/20 p-3 rounded-lg leading-relaxed">
                  {selectedSheet.weather_notes}
                </p>
              </div>

              {/* Crew List */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-wider font-mono block">Assigned Crew Status</span>
                <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-mono text-text-secondary uppercase">
                        <th className="p-2.5 pl-4">Name</th>
                        <th className="p-2.5">Clearance / Role</th>
                        <th className="p-2.5 pr-4 text-right">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectCrew.map((c) => (
                        <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01]">
                          <td className="p-2.5 pl-4 text-white font-semibold">{c.name}</td>
                          <td className="p-2.5">{c.role}</td>
                          <td className="p-2.5 pr-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              c.attendance === "Present" ? "bg-success/15 text-success" : "bg-white/5 text-text-secondary"
                            }`}>{c.attendance || "Present"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cast List */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-wider font-mono block">Actors & Characters</span>
                <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-mono text-text-secondary uppercase">
                        <th className="p-2.5 pl-4">Actor</th>
                        <th className="p-2.5">Character</th>
                        <th className="p-2.5 pr-4 text-right">Shoot Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectCast.map((c) => (
                        <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01]">
                          <td className="p-2.5 pl-4 text-white font-semibold">{c.name}</td>
                          <td className="p-2.5">Plays: {c.character}</td>
                          <td className="p-2.5 pr-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              c.attendance === "Present" ? "bg-success/15 text-success" : "bg-white/5 text-text-secondary"
                            }`}>{c.attendance || "Present"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
};
export default CallSheetView;

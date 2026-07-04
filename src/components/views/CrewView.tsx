"use client";

import React, { useState } from "react";
import { useProjectStore, CrewMember } from "@/store/useProjectStore";
import { Search, Plus, Phone, CheckCircle, Clock, AlertTriangle, UserCheck, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CrewViewProps {
  projectScope?: string;
}

export const CrewView: React.FC<CrewViewProps> = ({ projectScope }) => {
  const { activeProjectId, crew, toggleCrewAttendance } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;

  const crewMembers = crew[targetProjectId] || [];
  const [search, setSearch] = useState("");

  const filteredCrew = crewMembers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search and filter header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search crew name, role, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="text-xs text-text-secondary">
          Showing <span className="text-white font-semibold">{filteredCrew.length}</span> crew members
        </div>
      </div>

      {/* Grid of Crew Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrew.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
            No crew members match your search criteria.
          </div>
        ) : (
          filteredCrew.map((c) => {
            return (
              <Card key={c.id} className="border border-white/5 hover:border-white/10 bg-[#111318] flex flex-col justify-between overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  {/* Top section: Avatar & Details */}
                  <div className="flex gap-4 items-start">
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="w-14 h-14 object-cover rounded-full border border-white/10 ring-2 ring-primary/10 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{c.name}</h4>
                      <p className="text-xs text-primary font-medium truncate">{c.role}</p>
                      <span className="text-[10px] text-text-secondary block font-mono">{c.experience}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center justify-between text-[11px] text-text-secondary bg-black/10 p-2 rounded border border-white/5 font-mono">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>
                    <span className="text-white font-semibold">{c.rate}</span>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-text-secondary uppercase font-semibold">Specialization</span>
                    <div className="flex flex-wrap gap-1">
                      {c.skills.map((s, idx) => (
                        <span key={idx} className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-text-secondary border border-white/5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Attendance & Payment Toggles */}
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 text-xs">
                    <div>
                      <span className="text-[9px] text-text-secondary block">Attendance (Click to Cycle)</span>
                      <button
                        onClick={() => toggleCrewAttendance(targetProjectId, c.id)}
                        className={`text-[10px] font-bold uppercase mt-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          c.attendance === "Present" ? "bg-success/20 text-success" :
                          c.attendance === "Late" ? "bg-warning/20 text-warning" :
                          c.attendance === "Off-Duty" ? "bg-white/10 text-text-secondary" :
                          "bg-danger/20 text-danger"
                        }`}
                      >
                        {c.attendance}
                      </button>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-secondary block">Rate / Payment</span>
                      <span className={`text-[10px] font-bold uppercase mt-1.5 px-2 py-0.5 rounded inline-block ${
                        c.paymentStatus === "Paid" ? "bg-success/20 text-success" :
                        c.paymentStatus === "Invoiced" ? "bg-warning/20 text-warning" :
                        "bg-white/10 text-text-secondary"
                      }`}>
                        {c.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Performance slider bar */}
                  <div className="space-y-1.5 border-t border-white/5 pt-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-warning fill-warning" /> Performance Score</span>
                      <span className="text-white font-bold">{c.performance}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${c.performance}%` }} />
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
};
export default CrewView;

"use client";

import React, { useState } from "react";
import { useProjectStore, CrewMember, CastMember } from "@/store/useProjectStore";
import { Check, Clock, X, Moon, Search, Users, Contact, UserCheck, Percent, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UnifiedPerson {
  id: string;
  name: string;
  photo: string;
  role: string; // Crew role or character name
  type: "Crew" | "Cast";
  attendance: "Present" | "Absent" | "Late" | "Off-Duty";
}

export const AttendanceView: React.FC = () => {
  const { activeProjectId, crew, cast, setCrewAttendance, setCastAttendance } = useProjectStore();

  const projectCrew = crew[activeProjectId] || [];
  const projectCast = cast[activeProjectId] || [];

  const [activeTab, setActiveTab] = useState<"all" | "crew" | "cast">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Map crew and cast to unified structure
  const unifiedList: UnifiedPerson[] = [
    ...projectCrew.map((c) => ({
      id: c.id,
      name: c.name,
      photo: c.photo,
      role: c.role,
      type: "Crew" as const,
      attendance: c.attendance || "Present"
    })),
    ...projectCast.map((c) => ({
      id: c.id,
      name: c.name,
      photo: c.photo,
      role: `Plays: ${c.character}`,
      type: "Cast" as const,
      attendance: c.attendance || "Present"
    }))
  ];

  // Statistics calculation
  const totalCount = unifiedList.length;
  const presentCount = unifiedList.filter((p) => p.attendance === "Present").length;
  const lateCount = unifiedList.filter((p) => p.attendance === "Late").length;
  const absentCount = unifiedList.filter((p) => p.attendance === "Absent").length;
  const offDutyCount = unifiedList.filter((p) => p.attendance === "Off-Duty").length;
  
  const attendanceRate = totalCount > 0 
    ? Math.round(((presentCount + lateCount) / totalCount) * 100) 
    : 0;

  // Filtered list
  const filteredList = unifiedList.filter((person) => {
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "crew" && person.type === "Crew") ||
      (activeTab === "cast" && person.type === "Cast");
      
    const matchesSearch = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTab && matchesSearch;
  });

  const handleSetAttendance = async (person: UnifiedPerson, status: "Present" | "Absent" | "Late" | "Off-Duty") => {
    try {
      if (person.type === "Crew") {
        await setCrewAttendance(activeProjectId, person.id, status);
      } else {
        await setCastAttendance(activeProjectId, person.id, status);
      }
    } catch (err) {
      console.error("Failed to update attendance:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.02]">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-primary uppercase font-bold tracking-wider font-mono flex items-center gap-1">
              <Percent className="w-3 h-3" /> Present Rate
            </span>
            <div className="text-xl font-black text-white">{attendanceRate}%</div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-card to-success/[0.02]">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-success uppercase font-bold tracking-wider font-mono flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> On Set (Present)
            </span>
            <div className="text-xl font-black text-white">{presentCount}</div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-card to-warning/[0.02]">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-warning uppercase font-bold tracking-wider font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Delayed (Late)
            </span>
            <div className="text-xl font-black text-white">{lateCount}</div>
          </CardContent>
        </Card>

        <Card className="border-danger/20 bg-gradient-to-br from-card to-danger/[0.02]">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-danger uppercase font-bold tracking-wider font-mono flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Absent
            </span>
            <div className="text-xl font-black text-white">{absentCount}</div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider font-mono flex items-center gap-1">
              <Moon className="w-3.5 h-3.5" /> Off-Duty
            </span>
            <div className="text-xl font-black text-white">{offDutyCount}</div>
          </CardContent>
        </Card>

      </div>

      {/* Toolbar Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        
        {/* Tab Pills */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
              activeTab === "all"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-white/5 border-white/5 text-text-secondary hover:text-white"
            }`}
          >
            All Members ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("crew")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
              activeTab === "crew"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-white/5 border-white/5 text-text-secondary hover:text-white"
            }`}
          >
            Production Crew ({projectCrew.length})
          </button>
          <button
            onClick={() => setActiveTab("cast")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
              activeTab === "cast"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-white/5 border-white/5 text-text-secondary hover:text-white"
            }`}
          >
            Cast & Actors ({projectCast.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search name or clearance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-primary focus:outline-none"
          />
        </div>

      </div>

      {/* Attendance Sheet Card */}
      <Card className="border-white/5">
        <CardContent className="p-0 overflow-x-auto">
          
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] text-text-secondary uppercase font-mono font-bold">
                <th className="p-4 pl-6">Profile & Name</th>
                <th className="p-4">Workspace Clearance</th>
                <th className="p-4">Department</th>
                <th className="p-4">Live Status</th>
                <th className="p-4 pr-6 text-center">Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No crew members or actors match your filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((person) => {
                  return (
                    <tr key={person.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      
                      {/* Name & Avatar */}
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-black border border-white/10 shrink-0">
                          <img
                            src={person.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80"}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-bold text-white block truncate max-w-[150px]">{person.name}</span>
                      </td>

                      {/* Role clearance */}
                      <td className="p-4 text-text-secondary">{person.role}</td>

                      {/* Type Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                          person.type === "Crew"
                            ? "bg-secondary/10 text-secondary border border-secondary/20"
                            : "bg-purple-400/10 text-purple-400 border border-purple-400/20"
                        }`}>
                          {person.type === "Crew" ? <Users className="w-3 h-3" /> : <Contact className="w-3 h-3" />}
                          {person.type}
                        </span>
                      </td>

                      {/* Live Status Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          person.attendance === "Present" ? "bg-success/15 text-success" :
                          person.attendance === "Late" ? "bg-warning/15 text-warning" :
                          person.attendance === "Absent" ? "bg-danger/15 text-danger" :
                          "bg-white/5 text-text-secondary"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            person.attendance === "Present" ? "bg-success animate-pulse" :
                            person.attendance === "Late" ? "bg-warning" :
                            person.attendance === "Absent" ? "bg-danger" :
                            "bg-text-secondary"
                          }`} />
                          {person.attendance}
                        </span>
                      </td>

                      {/* Direct Mark Buttons */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Mark Present */}
                          <button
                            onClick={() => handleSetAttendance(person, "Present")}
                            title="Mark Present"
                            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                              person.attendance === "Present"
                                ? "bg-success/20 border-success/40 text-success"
                                : "bg-black/40 border-white/5 text-text-secondary hover:text-white hover:border-white/10"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          {/* Mark Late */}
                          <button
                            onClick={() => handleSetAttendance(person, "Late")}
                            title="Mark Late"
                            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                              person.attendance === "Late"
                                ? "bg-warning/20 border-warning/40 text-warning"
                                : "bg-black/40 border-white/5 text-text-secondary hover:text-white hover:border-white/10"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Mark Absent */}
                          <button
                            onClick={() => handleSetAttendance(person, "Absent")}
                            title="Mark Absent"
                            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                              person.attendance === "Absent"
                                ? "bg-danger/20 border-danger/40 text-danger"
                                : "bg-black/40 border-white/5 text-text-secondary hover:text-white hover:border-white/10"
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Mark Off-Duty */}
                          <button
                            onClick={() => handleSetAttendance(person, "Off-Duty")}
                            title="Mark Off-Duty"
                            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                              person.attendance === "Off-Duty"
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-black/40 border-white/5 text-text-secondary hover:text-white hover:border-white/10"
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

        </CardContent>
      </Card>

    </div>
  );
};
export default AttendanceView;

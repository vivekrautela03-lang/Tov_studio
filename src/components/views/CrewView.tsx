"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Search,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Globe,
  Info,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Department {
  id: string;
  name: string;
}

interface CrewMember {
  id: string;
  full_name: string;
  department_id: string;
  position: string;
  phone: string;
  email: string;
  college: string;
  availability: 'Available' | 'Busy' | 'Shooting';
  experience: string;
  skills: string[];
  notes: string;
  photo_url: string;
  departments?: Department;
}

interface CrewViewProps {
  projectScope?: string;
}

export const CrewView: React.FC<CrewViewProps> = ({ projectScope }) => {
  const { crewMembers, fetchWorkspaceData } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchCrew = async () => {
    setLoading(true);
    try {
      await fetchWorkspaceData();
    } catch (err) {
      console.error("Error fetching crew:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrew();
  }, []);

  const filteredCrew = crewMembers.filter((c) => {
    const searchLower = search.toLowerCase();
    const deptName = c.departments?.name || "Others";
    return (
      (c.full_name || "").toLowerCase().includes(searchLower) ||
      (c.position || "").toLowerCase().includes(searchLower) ||
      (c.college || "").toLowerCase().includes(searchLower) ||
      (c.phone || "").toLowerCase().includes(searchLower) ||
      (c.email || "").toLowerCase().includes(searchLower) ||
      deptName.toLowerCase().includes(searchLower) ||
      (c.skills || []).some((s: string) => s.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-white select-none">
      
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
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl animate-pulse">
            Loading crew database...
          </div>
        ) : filteredCrew.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
            No crew members match your search criteria.
          </div>
        ) : (
          filteredCrew.map((c) => {
            const avatarPlaceholder = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              c.full_name
            )}&backgroundColor=030712&textColor=ffffff`;
            const deptName = c.departments?.name || "Others";

            return (
              <Card key={c.id} className="border border-white/5 hover:border-white/10 bg-[#09090B] flex flex-col justify-between overflow-hidden group transition-all duration-300">
                <CardContent className="p-5 space-y-4">
                  {/* Top section: Avatar & Details */}
                  <div className="flex gap-4 items-start">
                    <img
                      src={c.photo_url || avatarPlaceholder}
                      alt={c.full_name}
                      className="w-14 h-14 object-cover rounded-full border border-white/10 ring-2 ring-primary/10 shrink-0 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{c.full_name}</h4>
                      <p className="text-xs text-primary font-medium truncate">{c.position || "Crew"}</p>
                      <span className="text-[10px] text-text-secondary block font-mono">{deptName}</span>
                    </div>
                  </div>

                  {/* Contact & Experience details */}
                  <div className="space-y-1.5 text-[11px] text-text-secondary border-t border-white/5 pt-3">
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        <span className="text-white font-mono">{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        <span className="text-white truncate">{c.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">Exp:</span>
                      <span className="text-white">{c.experience || "N/A"}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {c.skills && c.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.skills.map((s: string) => (
                        <span key={s} className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-text-secondary border border-white/5">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes Preview */}
                  {c.notes && (
                    <p className="text-[10px] text-text-secondary italic line-clamp-2 bg-black/20 p-2 rounded border border-white/5">
                      {c.notes}
                    </p>
                  )}

                  {/* Availability Info */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <div>
                      <span className="text-[9px] text-text-secondary block uppercase">College</span>
                      <span className="text-xs text-white font-medium truncate block max-w-[120px]">{c.college}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-secondary block uppercase">Availability</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded inline-block ${
                        c.availability === "Available" ? "bg-green-500/10 text-green-400" :
                        c.availability === "Shooting" ? "bg-primary/20 text-primary" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {c.availability}
                      </span>
                    </div>
                  </div>

                  {/* Actions Suite */}
                  <div className="border-t border-white/5 pt-3 flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedMember(c);
                        setIsDetailOpen(true);
                      }}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[11px] py-1.5 rounded-lg border border-white/10 cursor-pointer"
                    >
                      View Profile
                    </Button>

                    <div className="flex gap-1.5">
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          title="Call"
                          className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 flex items-center justify-center"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          title="Email"
                          className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 flex items-center justify-center"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Detailed Member Profile Modal Overlay */}
      {isDetailOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#09090B] border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Close */}
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Header Banner */}
            <div className="h-28 bg-white/5 border-b border-white/5 flex items-end px-6 pb-4">
              <div className="flex gap-4 items-end translate-y-8">
                <img
                  src={selectedMember.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedMember.full_name)}&backgroundColor=030712&textColor=ffffff`}
                  alt={selectedMember.full_name}
                  className="w-20 h-24 object-cover rounded-xl border-2 border-white ring-4 ring-black"
                />
                <div className="pb-1">
                  <h2 className="text-base font-bold text-white leading-tight">{selectedMember.full_name}</h2>
                  <span className="text-[10px] text-primary font-semibold tracking-wider uppercase block mt-1">
                    {selectedMember.position || "Crew Member"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info Fields */}
            <div className="p-6 pt-12 space-y-5">
              
              {/* College & Availability */}
              <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-[9px] text-text-secondary block uppercase font-mono">College</span>
                  <span className="text-white font-medium">{selectedMember.college || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-secondary block uppercase font-mono">Availability</span>
                  <span className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded inline-block ${
                    selectedMember.availability === "Available" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {selectedMember.availability}
                  </span>
                </div>
              </div>

              {/* Core Details */}
              <div className="space-y-3.5 text-xs text-text-secondary">
                {selectedMember.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-white/40" />
                    <span className="text-white">{selectedMember.phone}</span>
                  </div>
                )}
                {selectedMember.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/40" />
                    <span className="text-white">{selectedMember.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-white/40" />
                  <span>Experience: <strong className="text-white">{selectedMember.experience || "Not listed"}</strong></span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-3">
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div>
                    <span className="text-[9px] text-text-secondary block uppercase font-mono mb-1.5">Specialization & Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.skills.map((s: string) => (
                        <span key={s} className="text-[10px] bg-white/5 border border-white/5 text-white px-2 py-0.5 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Private Director Notes */}
              {selectedMember.notes && (
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg text-xs leading-relaxed text-text-secondary font-sans">
                  <span className="text-[9px] text-text-secondary block uppercase font-mono mb-1">Director Notes</span>
                  {selectedMember.notes}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default CrewView;

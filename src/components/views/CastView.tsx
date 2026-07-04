"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Search, Info, CheckCircle, Clock, AlertTriangle, ShieldCheck, UserMinus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CastViewProps {
  projectScope?: string;
}

export const CastView: React.FC<CastViewProps> = ({ projectScope }) => {
  const { activeProjectId, cast, toggleCastAvailability } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;

  const castMembers = cast[targetProjectId] || [];
  const [search, setSearch] = useState("");

  const filteredCast = castMembers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.character.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search and filter header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search character name or actor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="text-xs text-text-secondary">
          Showing <span className="text-white font-semibold">{filteredCast.length}</span> actors
        </div>
      </div>

      {/* Grid of Cast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCast.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
            No cast members defined.
          </div>
        ) : (
          filteredCast.map((c) => {
            return (
              <Card key={c.id} className="border border-white/5 hover:border-white/10 bg-[#111318] flex flex-col justify-between overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  {/* Top section: Headshot & Character Details */}
                  <div className="flex gap-4 items-start">
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="w-16 h-20 object-cover rounded-md border border-white/10 ring-2 ring-primary/10 shrink-0"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{c.name}</h4>
                      <div>
                        <span className="text-[10px] text-text-secondary block">As Character</span>
                        <p className="text-xs text-primary font-bold truncate">{c.character}</p>
                      </div>
                      <span className="text-[10px] text-white font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 inline-block">
                        Salary: {c.payment}
                      </span>
                    </div>
                  </div>

                  {/* Measurements & Wardrobe */}
                  <div className="space-y-1.5 bg-black/10 p-2.5 rounded border border-white/5 text-[11px] text-text-secondary">
                    <div className="font-mono">
                      <span className="font-semibold text-white/50">Wardrobe sizes: </span>
                      <span className="text-white">{c.measurements}</span>
                    </div>
                    <div className="leading-relaxed">
                      <span className="font-semibold text-white/50">Costume Notes: </span>
                      <span>{c.costumeNotes}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 text-xs">
                    <div>
                      <span className="text-[9px] text-text-secondary block">Availability (Click to Cycle)</span>
                      <button
                        onClick={() => toggleCastAvailability(targetProjectId, c.id)}
                        className={`text-[10px] font-bold uppercase mt-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          c.availability === "On Set" ? "bg-success/20 text-success" :
                          c.availability === "Available" ? "bg-secondary/20 text-secondary" :
                          "bg-white/10 text-text-secondary"
                        }`}
                      >
                        {c.availability}
                      </button>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-secondary block">Contract Deal</span>
                      <span className={`text-[10px] font-bold uppercase mt-1.5 px-2 py-0.5 rounded inline-block ${
                        c.contractStatus === "Signed" ? "bg-success/20 text-success" :
                        c.contractStatus === "In Negotiation" ? "bg-warning/20 text-warning" :
                        "bg-white/10 text-text-secondary"
                      }`}>
                        {c.contractStatus}
                      </span>
                    </div>
                  </div>

                  {/* Audition indicator */}
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-text-secondary font-mono">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-success" /> Casting Auditions</span>
                    <span className="text-success font-semibold">{c.auditionStatus}</span>
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
export default CastView;

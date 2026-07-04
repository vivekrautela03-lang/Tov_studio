"use client";

import React, { useState } from "react";
import { useProjectStore, Equipment } from "@/store/useProjectStore";
import { Search, Camera, BatteryCharging, Wrench, ShieldAlert, MapPin, Tag, Plus, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EquipmentViewProps {
  projectScope?: string;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({ projectScope }) => {
  const { activeProjectId, equipment, updateEquipmentStatus } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;

  const inventory = equipment[targetProjectId] || [];
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const categories = ["All", "Camera", "Lens", "Lighting", "Audio", "Grip", "Power"];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.qrCode.toLowerCase().includes(search.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "All" || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const cycleStatus = (equipId: string, currentStatus: Equipment["status"]) => {
    const cycleMap: Record<Equipment["status"], Equipment["status"]> = {
      Available: "In Use",
      "In Use": "Maintenance",
      Maintenance: "Reserved",
      Reserved: "Available"
    };
    updateEquipmentStatus(targetProjectId, equipId, cycleMap[currentStatus]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search gear name, QR code, or crew..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-primary focus:outline-none"
          />
        </div>
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                selectedCat === cat
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/5 border-white/5 text-text-secondary hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
            No equipment items match the specified filters.
          </div>
        ) : (
          filteredInventory.map((item) => {
            return (
              <Card key={item.id} className="border border-white/5 hover:border-white/10 bg-[#111318] flex flex-col justify-between overflow-hidden">
                
                {/* Photo & QR Code Overlay */}
                <div className="relative h-40 w-full overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent" />
                  
                  {/* QR Badge */}
                  <span className="absolute top-3 left-3 text-[9px] font-mono bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-text-secondary">
                    {item.qrCode}
                  </span>

                  {/* Battery Widget */}
                  {item.battery !== null && (
                    <span className={`absolute top-3 right-3 text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1.5 backdrop-blur-sm border ${
                      item.battery < 20
                        ? "bg-danger/20 text-danger border-danger/30"
                        : "bg-black/80 text-success border-white/10"
                    }`}>
                      <BatteryCharging className="w-3.5 h-3.5" />
                      {item.battery}%
                    </span>
                  )}
                </div>

                {/* Details */}
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-text-secondary uppercase font-semibold">{item.category}</span>
                      <button
                        onClick={() => cycleStatus(item.id, item.status)}
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          item.status === "Available" ? "bg-success/20 text-success" :
                          item.status === "In Use" ? "bg-primary/20 text-primary" :
                          item.status === "Maintenance" ? "bg-danger/20 text-danger" :
                          "bg-white/10 text-text-secondary"
                        }`}
                      >
                        {item.status}
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{item.name}</h4>
                  </div>

                  {/* Allocation Details */}
                  <div className="space-y-1.5 border-t border-white/5 pt-3 text-[11px] text-text-secondary font-mono">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> Location</span>
                      <span className="text-white">{item.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 shrink-0" /> Assigned To</span>
                      <span className="text-white truncate max-w-[120px]">{item.assignedTo || "Unassigned"}</span>
                    </div>
                  </div>

                  {/* Maintenance block */}
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[10px] text-text-secondary font-mono">
                    <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> Maintenance Audit</span>
                    <span className="text-white">{item.maintenanceDate}</span>
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
export default EquipmentView;

"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Shield,
  Film,
  Video,
  User,
  FileCheck,
  Play,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleSelectionViewProps {
  userId: string;
  onComplete: () => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({
  userId,
  onComplete
}) => {
  const { setMemberRole } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roleOptions = [
    {
      name: "Owner",
      label: "Executive Control",
      desc: "Full administrative access. Manage budgets, memberships, storage, and studio settings.",
      icon: Shield,
      color: "text-primary border-primary/20 bg-primary/5"
    },
    {
      name: "Director",
      label: "Creative Direction",
      desc: "Manage screenplay scripts, shot planner schedules, and camera setup configurations.",
      icon: Film,
      color: "text-secondary border-secondary/20 bg-secondary/5"
    },
    {
      name: "Cinematographer (DOP)",
      label: "On-Set Operations",
      desc: "Review lens kits, camera body specifications, and set lighting setup instructions.",
      icon: Video,
      color: "text-warning border-warning/20 bg-warning/5"
    },
    {
      name: "Actor",
      label: "Talent & Cast",
      desc: "Access daily call times, scene scripts, hotel schedules, costume fits, and makeup plans.",
      icon: User,
      color: "text-purple-400 border-purple-400/20 bg-purple-400/5"
    },
    {
      name: "Editor",
      label: "Post-Production",
      desc: "Review locked timelines, sync proxy footage transfers, and VFX plates metadata.",
      icon: FileCheck,
      color: "text-blue-400 border-blue-400/20 bg-blue-400/5"
    },
    {
      name: "Client",
      label: "Review & Approvals",
      desc: "Play approved video packages, check contract deliverables, and submit invoice payments.",
      icon: Play,
      color: "text-pink-400 border-pink-400/20 bg-pink-400/5"
    }
  ];

  const handleSelectRole = async (roleName: string) => {
    setSelectedRole(roleName);
  };

  const handleConfirmRole = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      // 1. Save/Provision profile with selected role in profiles table
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const userEmail = user?.email || "";
      const fullNameVal = user?.user_metadata?.full_name || "New Collaborator";

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: userEmail,
          full_name: fullNameVal,
          role: selectedRole
        });

      if (error) throw error;

      // 2. Sync to local Zustand store
      setMemberRole(selectedRole);

      // 3. Complete gate onboarding
      onComplete();
    } catch (err) {
      console.error("Error setting role:", err);
      alert("Failed to save role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clearance Selection Gate</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            SELECT YOUR WORKSPACE ROLE
          </h1>
          <p className="text-text-secondary text-sm max-w-lg mx-auto leading-relaxed">
            Choose your active department clearance. Your studio dashboard will dynamically adapt to display role-specific tools.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.name;
            return (
              <Card
                key={role.name}
                onClick={() => handleSelectRole(role.name)}
                className={`cursor-pointer transition-all duration-300 border hover:translate-y-[-2px] flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/10"
                    : "border-white/5 bg-card hover:bg-white/[0.01] hover:border-white/10"
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${role.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white tracking-wide">{role.label}</h3>
                    <p className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">{role.name}</p>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1">{role.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleConfirmRole}
            disabled={!selectedRole || loading}
            variant="primary"
            className="w-full max-w-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 py-5 text-sm"
          >
            <span>{loading ? "Configuring Access..." : "Enter Workspace Console"}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Button>
          <span className="text-[10px] text-text-secondary">
            Clearance settings can be modified anytime in profile configuration.
          </span>
        </div>

      </div>
    </div>
  );
};
export default RoleSelectionView;

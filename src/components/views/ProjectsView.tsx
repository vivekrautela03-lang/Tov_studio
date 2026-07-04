"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Plus, Users, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProjectDetailsView } from "./ProjectDetailsView";

export const ProjectsView: React.FC = () => {
  const { projects, activeProjectId, setActiveProjectId } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (selectedProjectId) {
    return (
      <ProjectDetailsView
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Productions Workspace</h1>
          <p className="text-text-secondary text-xs mt-1">
            Manage, schedule, and deliver your creative film campaigns.
          </p>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          return (
            <Card
              key={proj.id}
              onClick={() => {
                setActiveProjectId(proj.id);
                setSelectedProjectId(proj.id);
              }}
              className="group relative cursor-pointer border border-white/5 hover:border-primary/30 bg-[#111318] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Cover Image with gradient overlay */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={proj.coverImage}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/40 to-transparent" />
                <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white font-bold uppercase tracking-wider border border-white/10">
                  {proj.status}
                </span>
              </div>

              {/* Card Body */}
              <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors duration-200">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {proj.tagline}
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono">
                    <span>Progress</span>
                    <span className="text-white font-semibold">{proj.progress}%</span>
                  </div>
                  <Progress value={proj.progress} color="primary" size="sm" />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-[11px] text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span>{proj.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <DollarSign className="w-3.5 h-3.5 text-success/70 shrink-0" />
                    <span className="text-white font-medium">{proj.budget}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-secondary/70 shrink-0" />
                    <span>{proj.crewCount} Crew Members</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform duration-200">
                      Open Workspace <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default ProjectsView;

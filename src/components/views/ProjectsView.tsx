"use client";

import React, { useState } from "react";
import { useProjectStore, Project } from "@/store/useProjectStore";
import { Plus, Users, Calendar, DollarSign, ArrowRight, X, Sparkles, Trash2, Edit2, UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ProjectDetailsView } from "./ProjectDetailsView";

export const ProjectsView: React.FC = () => {
  const { projects, activeProjectId, setActiveProjectId, addProject, deleteProject, updateProject } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleDeleteProject = async (projectId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the production workspace "${title}"? This will permanently delete all associated scripts, storyboards, schedules, files, and equipment logs.`)) return;
    try {
      await deleteProject(projectId);
      alert(`Workspace "${title}" has been deleted.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    }
  };

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [newProject, setNewProject] = useState({
    title: "",
    tagline: "",
    budgetVal: 2500000,
    status: "Pre-Production" as Project["status"],
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    director: "",
    location: "Studio Stage 4"
  });

  const [editProjectData, setEditProjectData] = useState({
    id: "",
    title: "",
    tagline: "",
    budgetVal: 2500000,
    status: "Pre-Production" as Project["status"],
    deadline: "",
    coverImage: "",
    director: "",
    location: ""
  });

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditProjectData((prev) => ({ ...prev, coverImage: reader.result as string }));
      } else {
        setNewProject((prev) => ({ ...prev, coverImage: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditProjectData({
      id: proj.id,
      title: proj.title,
      tagline: proj.tagline,
      budgetVal: proj.budgetVal || 2500000,
      status: proj.status,
      deadline: proj.deadline || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      coverImage: proj.coverImage || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
      director: proj.director || "Director Name",
      location: proj.location || "Studio Stage 4"
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjectData.title.trim()) return;

    setLoading(true);
    try {
      const budgetVal = Number(editProjectData.budgetVal) || 2500000;
      await updateProject(editProjectData.id, {
        title: editProjectData.title.trim(),
        tagline: editProjectData.tagline.trim(),
        status: editProjectData.status,
        budgetVal: budgetVal,
        deadline: editProjectData.deadline,
        coverImage: editProjectData.coverImage,
        director: editProjectData.director.trim(),
        location: editProjectData.location.trim()
      });
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    setLoading(true);
    try {
      const budgetVal = Number(newProject.budgetVal) || 2500000;
      const budgetText = `$${(budgetVal / 1000000).toFixed(1)}M`;

      await addProject({
        title: newProject.title.trim(),
        tagline: newProject.tagline.trim() || "A premium film production campaign.",
        status: newProject.status,
        budget: budgetText,
        budgetVal: budgetVal,
        spentVal: 0,
        deadline: newProject.deadline,
        coverImage: newProject.coverImage,
        director: newProject.director.trim() || "TBD",
        location: newProject.location || "Studio Stage 4"
      });

      // Reset
      setNewProject({
        title: "",
        tagline: "",
        budgetVal: 2500000,
        status: "Pre-Production",
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
        director: "",
        location: "Studio Stage 4"
      });
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedProjectId) {
    return (
      <ProjectDetailsView
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Productions Workspace</h1>
          <p className="text-text-secondary text-xs mt-1">
            Manage, schedule, and deliver your creative film campaigns.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 cursor-pointer text-xs h-9"
        >
          <Plus className="w-4 h-4 text-black font-bold" />
          <span>Add Project</span>
        </Button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
            No workspaces initialized. Click Add Project to start.
          </div>
        ) : (
          projects.map((proj) => {
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

                  {/* Action Buttons Suite */}
                  <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                    <button
                      onClick={(e) => openEditModal(proj, e)}
                      className="p-1.5 bg-black/60 hover:bg-primary/20 border border-white/10 hover:border-primary/30 text-text-secondary hover:text-primary rounded-lg cursor-pointer transition-all backdrop-blur-md"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(proj.id, proj.title);
                      }}
                      className="p-1.5 bg-black/60 hover:bg-danger/20 border border-white/10 hover:border-danger/30 text-text-secondary hover:text-danger rounded-lg cursor-pointer transition-all backdrop-blur-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                      <span>{proj.crewCount} Crew</span>
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
          })
        )}
      </div>

      {/* Creator Overlay Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#171717] border border-white/5 rounded-xl shadow-2xl overflow-hidden"
          >
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Initialize Workspace</span>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="block text-text-secondary text-[10px] uppercase font-semibold">Production Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Echoes of Silence"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-text-secondary text-[10px] uppercase font-semibold">Tagline / Description</label>
                <textarea
                  placeholder="e.g. A psychological thriller investigating the boundaries of artificial dreams."
                  value={newProject.tagline}
                  onChange={(e) => setNewProject({ ...newProject, tagline: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:border-primary focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-text-secondary text-[10px] uppercase font-semibold">Workspace Cover Image</label>
                <div className="flex items-center gap-3 py-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                  <img
                    src={newProject.coverImage}
                    className="w-16 h-10 object-cover border border-white/10 rounded shrink-0"
                    alt="Cover Preview"
                  />
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverUpload(e, false)}
                      className="hidden"
                      id="project-add-cover"
                    />
                    <label
                      htmlFor="project-add-cover"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-primary" />
                      <span>Upload Cover Image</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Budget Allocation (USD)</label>
                  <input
                    type="number"
                    required
                    value={newProject.budgetVal}
                    onChange={(e) => setNewProject({ ...newProject, budgetVal: Number(e.target.value) })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Target Completion</label>
                  <input
                    type="date"
                    required
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Production Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Project["status"] })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  >
                    <option value="Pre-Production">Pre-Production</option>
                    <option value="Production">Production</option>
                    <option value="Post-Production">Post-Production</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Director</label>
                  <input
                    type="text"
                    placeholder="Director name..."
                    value={newProject.director}
                    onChange={(e) => setNewProject({ ...newProject, director: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
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
                  {loading ? "Creating..." : "Initialize Workspace"}
                </Button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Overlay Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#171717] border border-white/5 rounded-xl shadow-2xl overflow-hidden"
          >
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
                <Edit2 className="w-3.5 h-3.5 text-primary" />
                <span>Configure Workspace</span>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="block text-text-secondary text-[10px] uppercase font-semibold">Production Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Echoes of Silence"
                  value={editProjectData.title}
                  onChange={(e) => setEditProjectData({ ...editProjectData, title: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-text-secondary text-[10px] uppercase font-semibold">Tagline / Description</label>
                <textarea
                  placeholder="e.g. A psychological thriller..."
                  value={editProjectData.tagline}
                  onChange={(e) => setEditProjectData({ ...editProjectData, tagline: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-text-secondary text-[10px] uppercase font-semibold">Workspace Cover Image</label>
                <div className="flex items-center gap-3 py-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                  <img
                    src={editProjectData.coverImage}
                    className="w-16 h-10 object-cover border border-white/10 rounded shrink-0"
                    alt="Cover Preview"
                  />
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverUpload(e, true)}
                      className="hidden"
                      id="project-edit-cover"
                    />
                    <label
                      htmlFor="project-edit-cover"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-primary" />
                      <span>Upload Cover Image</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Budget Allocation (USD)</label>
                  <input
                    type="number"
                    required
                    value={editProjectData.budgetVal}
                    onChange={(e) => setEditProjectData({ ...editProjectData, budgetVal: Number(e.target.value) })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Target Completion</label>
                  <input
                    type="date"
                    required
                    value={editProjectData.deadline}
                    onChange={(e) => setEditProjectData({ ...editProjectData, deadline: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Production Status</label>
                  <select
                    value={editProjectData.status}
                    onChange={(e) => setEditProjectData({ ...editProjectData, status: e.target.value as Project["status"] })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  >
                    <option value="Pre-Production">Pre-Production</option>
                    <option value="Production">Production</option>
                    <option value="Post-Production">Post-Production</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-text-secondary text-[10px] uppercase font-semibold">Director</label>
                  <input
                    type="text"
                    placeholder="Director name..."
                    value={editProjectData.director}
                    onChange={(e) => setEditProjectData({ ...editProjectData, director: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
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
                  {loading ? "Saving..." : "Save Workspace"}
                </Button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
export default ProjectsView;

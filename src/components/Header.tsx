"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore, Project } from "@/store/useProjectStore";
import {
  Search,
  Menu,
  Bell,
  Plus,
  Sparkles,
  ChevronDown,
  LogOut,
  FolderPlus,
  PlusCircle,
  FilePlus2,
  CalendarPlus,
  Check,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export const Header: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    notifications,
    markNotificationRead,
    clearNotifications,
    setSearchOpen,
    addProject,
    setActiveView,
    mobileSidebarOpen,
    setMobileSidebarOpen
  } = useProjectStore();

  // Dropdowns States
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isNotifyDropdownOpen, setIsNotifyDropdownOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async (currentUser: any) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      if (data) setProfile(data);
    } catch (err) {
      console.error("Error loading user profile details:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      fetchProfile(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      fetchProfile(currentUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Dialog State
  const [isNewProjOpen, setIsNewProjOpen] = useState(false);
  const [newProjData, setNewProjData] = useState({
    title: "",
    tagline: "",
    director: "Vivek Roy",
    location: "Studio Stage A",
    budget: "$1.5M",
    budgetVal: 1500000,
    spentVal: 0,
    deadline: "2026-12-31",
    status: "Pre-Production" as Project["status"],
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80"
  });

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjData.title.trim()) return;
    addProject(newProjData);
    setIsNewProjOpen(false);
    // Reset form
    setNewProjData({
      title: "",
      tagline: "",
      director: "Vivek Roy",
      location: "Studio Stage A",
      budget: "$1.5M",
      budgetVal: 1500000,
      spentVal: 0,
      deadline: "2026-12-31",
      status: "Pre-Production",
      coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80"
    });
  };

  const selectProject = (id: string) => {
    setActiveProjectId(id);
    setIsProjectDropdownOpen(false);
  };

  return (
    <>
      <header className="h-[73px] sticky top-0 z-30 bg-[#121212]/85 backdrop-blur-md border-b border-white/5 px-4 md:px-6 flex items-center justify-between">
        
        {/* Left Side: Hamburger (Mobile), Project Switcher, and Search */}
        <div className="flex items-center gap-2.5 md:gap-4">
          
          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer border border-white/5"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          {/* Project Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
                setIsNotifyDropdownOpen(false);
                setIsCreateDropdownOpen(false);
              }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs px-3 py-2 rounded-lg border border-white/5 transition-all duration-200 cursor-pointer"
            >
              <span className="font-semibold">{activeProject?.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase font-bold tracking-wider">
                {activeProject?.status}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-card border border-white/5 rounded-lg shadow-2xl z-50 p-1">
                <div className="px-3 py-2 text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                  Switch Production
                </div>
                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => selectProject(proj.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left cursor-pointer transition-colors duration-150"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{proj.title}</span>
                        <span className="text-[10px] text-text-secondary">{proj.director}</span>
                      </div>
                      {proj.id === activeProjectId && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/5 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsNewProjOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 text-primary text-xs text-left font-medium cursor-pointer transition-colors duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Production...
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Global Search Button (Responsive width) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white p-2.5 sm:px-3 sm:py-2 rounded-lg text-xs border border-white/5 transition-all duration-200 cursor-pointer w-9.5 h-9.5 sm:w-48 text-left justify-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Search everything...</span>
            </div>
            <kbd className="hidden sm:inline text-[9px] bg-neutral-900 border border-white/10 px-1 py-0.5 rounded text-text-secondary font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Side: Quick Action, AI, Notifications, Profile */}
        <div className="flex items-center gap-3">
          
          {/* Quick Create Action */}
          <div className="relative">
            <Button
              onClick={() => {
                setIsCreateDropdownOpen(!isCreateDropdownOpen);
                setIsProjectDropdownOpen(false);
                setIsNotifyDropdownOpen(false);
              }}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Quick Create</span>
            </Button>

            {isCreateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-white/5 rounded-lg shadow-2xl z-50 p-1">
                <button
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    setIsNewProjOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left text-white cursor-pointer transition-colors duration-150"
                >
                  <FolderPlus className="w-4 h-4 text-primary" />
                  <span>New Project</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    setActiveView("scripts");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left text-white cursor-pointer transition-colors duration-150"
                >
                  <FilePlus2 className="w-4 h-4 text-secondary" />
                  <span>New Screenplay Scene</span>
                </button>

                <button
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    setActiveView("calendar");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left text-white cursor-pointer transition-colors duration-150"
                >
                  <CalendarPlus className="w-4 h-4 text-success" />
                  <span>Add Calendar Event</span>
                </button>

                <button
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    setActiveView("ai-support");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-left text-white cursor-pointer transition-colors duration-150"
                >
                  <Sparkles className="w-4 h-4 text-warning animate-pulse" />
                  <span>Generate Call Sheet (AI)</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Assistant Button */}
          <Button
            onClick={() => setActiveView("ai-support")}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 hover:border-primary/50 text-white p-2 sm:px-3 sm:py-1.5"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse shrink-0" />
            <span className="hidden sm:inline">AI Support</span>
          </Button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifyDropdownOpen(!isNotifyDropdownOpen);
                setIsProjectDropdownOpen(false);
                setIsCreateDropdownOpen(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white relative transition-all duration-200 cursor-pointer border border-white/5"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>

            {isNotifyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 max-sm:w-72 bg-card border border-white/5 rounded-lg shadow-2xl z-50 p-1 flex flex-col max-h-[400px]">
                <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Notifications ({unreadCount} new)</span>
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-1 space-y-0.5">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-text-secondary">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`px-3 py-2.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors duration-150 ${
                          !n.read ? "bg-white/[0.01]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-xs font-medium ${!n.read ? "text-white" : "text-text-secondary"}`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] text-text-secondary shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsProjectDropdownOpen(false);
                setIsNotifyDropdownOpen(false);
                setIsCreateDropdownOpen(false);
              }}
              className="flex items-center gap-2 pl-2 border-l border-white/5 cursor-pointer hover:opacity-85 select-none"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-black text-sm ring-2 ring-primary/20">
                  {profile?.full_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                  {profile?.full_name || user?.email?.split("@")[0] || "User"}
                </span>
                <span className="text-[9px] text-text-secondary font-mono">{profile?.role || "Producer"}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-text-secondary hidden lg:inline" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-white/5 rounded-lg shadow-2xl z-50 p-1">
                <div className="px-3 py-2 text-[10px] text-text-secondary border-b border-white/5 break-all">
                  Logged in as:
                  <div className="text-white font-medium mt-0.5">{user?.email || "user@tovstudio.ai"}</div>
                </div>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-danger/10 text-danger text-xs text-left cursor-pointer transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* NEW PROJECT DIALOG */}
      <Dialog
        isOpen={isNewProjOpen}
        onClose={() => setIsNewProjOpen(false)}
        title="Initialize New Production Workspace"
        size="md"
      >
        <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g., The Silent Valley"
              value={newProjData.title}
              onChange={(e) => setNewProjData({ ...newProjData, title: e.target.value })}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Tagline / Logline</label>
            <textarea
              rows={2}
              placeholder="A brief logline or concept summary..."
              value={newProjData.tagline}
              onChange={(e) => setNewProjData({ ...newProjData, tagline: e.target.value })}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Director</label>
              <input
                type="text"
                value={newProjData.director}
                onChange={(e) => setNewProjData({ ...newProjData, director: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Location</label>
              <input
                type="text"
                value={newProjData.location}
                onChange={(e) => setNewProjData({ ...newProjData, location: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Budget</label>
              <input
                type="text"
                value={newProjData.budget}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                  setNewProjData({
                    ...newProjData,
                    budget: e.target.value,
                    budgetVal: val
                  });
                }}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Estimated Release Deadline</label>
              <input
                type="date"
                value={newProjData.deadline}
                onChange={(e) => setNewProjData({ ...newProjData, deadline: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Cover Image (Preset Unsplash Film Category)</label>
            <select
              value={newProjData.coverImage}
              onChange={(e) => setNewProjData({ ...newProjData, coverImage: e.target.value })}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none transition-all"
            >
              <option value="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80">Film Projector / Theater</option>
              <option value="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80">Cyberpunk Neon Alley</option>
              <option value="https://images.unsplash.com/photo-1512495039889-52a3b799c9bc?w=800&q=80">Indie Drama Piano</option>
              <option value="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80">Luxury Supercar Road</option>
              <option value="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80">Vintage Cinema Clapboard</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewProjOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Initialize Workspace
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};
export default Header;

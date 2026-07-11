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
  UserCheck,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { HamburgerMenu } from "./HamburgerMenu";

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
    setMobileSidebarOpen,
    chatChannels,
    fetchChatChannels,
    setActiveChannelId
  } = useProjectStore();

  // Hamburger and Dropdown States
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMessagesDropdownOpen, setIsMessagesDropdownOpen] = useState(false);
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
      if (user) fetchChatChannels();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      fetchProfile(currentUser);
      if (currentUser) fetchChatChannels();
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

  const getChannelDetails = (channel: any) => {
    if (channel.is_group) {
      return {
        title: channel.name || "Group Workspace",
        avatar: channel.avatar_url || null,
        description: channel.description || "Production team workspace chat.",
        isGroup: true
      };
    }

    const otherMember = channel.chat_channel_members?.find(
      (m: any) => m.user_id !== user?.id
    );
    const profile = otherMember?.profiles;

    return {
      title: profile?.full_name || profile?.email || "Direct Message",
      avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || "User")}`,
      description: profile?.bio || "Collaborator",
      isGroup: false,
      userId: profile?.id
    };
  };

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
        
        {/* Left Side: Project Switcher and Search */}
        <div className="flex items-center gap-2.5 md:gap-4">
          
          {/* Project Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
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

         {/* Right Side: Messages, Hamburger Menu */}
        <div className="flex items-center gap-3 relative">
          
          {/* Messages (💬) Tab Link with Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsMessagesDropdownOpen(!isMessagesDropdownOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white relative transition-all duration-200 cursor-pointer border border-white/5"
              title="Messages & Alerts"
            >
              <MessageSquare className="w-4.5 h-4.5 text-[#22d3ee] drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]" />
              {(unreadCount > 0 || chatChannels.some(ch => ch.unread_count > 0)) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>

            {isMessagesDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-white space-y-4">
                
                {/* 1. Direct Messages Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Messages</span>
                    <button
                      onClick={() => {
                        setActiveView("chat");
                        setIsMessagesDropdownOpen(false);
                      }}
                      className="text-[9px] text-[#22d3ee] hover:underline"
                    >
                      Open Messages
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {chatChannels.slice(0, 3).map((ch) => {
                      const details = getChannelDetails(ch);
                      return (
                        <div
                          key={ch.id}
                          onClick={() => {
                            setActiveChannelId(ch.id);
                            setActiveView("chat");
                            setIsMessagesDropdownOpen(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer text-left transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 bg-neutral-800 flex items-center justify-center font-bold text-[#22d3ee] text-[10px]">
                            {details.avatar ? (
                              <img src={details.avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                              details.title.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-white truncate block">{details.title}</span>
                              {ch.unread_count > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              )}
                            </div>
                            <p className="text-[10px] text-text-secondary truncate leading-snug">{details.description}</p>
                          </div>
                        </div>
                      );
                    })}
                    {chatChannels.length === 0 && (
                      <p className="text-[10px] text-text-secondary italic p-2 text-center">No message threads found</p>
                    )}
                  </div>
                </div>

                {/* 2. Notifications Section */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Alerts & Notifications</span>
                    <button
                      onClick={() => {
                        setActiveView("notifications");
                        setIsMessagesDropdownOpen(false);
                      }}
                      className="text-[9px] text-[#22d3ee] hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {notifications.slice(0, 3).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          setActiveView("notifications");
                          setIsMessagesDropdownOpen(false);
                        }}
                        className="p-2 rounded-xl hover:bg-white/5 cursor-pointer text-left transition-colors space-y-0.5"
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[10.5px] font-bold truncate block ${notif.read ? "text-text-secondary" : "text-[#22d3ee]"}`}>
                            {notif.title}
                          </span>
                          <span className="text-[9px] text-text-secondary shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[9.5px] text-text-secondary line-clamp-2 leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-[10px] text-text-secondary italic p-2 text-center">No new notifications</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Hamburger Menu (☰) Trigger */}
          <button
            onClick={() => setIsHamburgerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white relative transition-all duration-200 cursor-pointer border border-white/5"
            title="Open Hub Menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          {/* Profile Avatar trigger */}
          <button
            onClick={() => setActiveView("profile")}
            className="w-9 h-9 rounded-full overflow-hidden border border-white/10 hover:border-[#22d3ee] transition-all duration-200 cursor-pointer shrink-0"
            title="Profile"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-full h-full bg-[#22d3ee] flex items-center justify-center font-bold text-black text-xs">
                {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </button>

        </div>
      </header>

      {/* Slide-out Hamburger Menu overlay drawer */}
      <HamburgerMenu isOpen={isHamburgerOpen} onClose={() => setIsHamburgerOpen(false)} />

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

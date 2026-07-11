"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import {
  X,
  Users,
  Contact,
  FolderOpen,
  Mail,
  Calendar,
  CheckSquare,
  Wrench,
  MapPin,
  Settings,
  Shield,
  Eye,
  Bell,
  Link,
  Languages,
  HelpCircle,
  MessageSquare,
  FileText,
  LogOut,
  Activity,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  const { setActiveView } = useProjectStore();

  // New Timeline Update States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("shoot");
  const [description, setDescription] = useState("");
  const [callTime, setCallTime] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLinkClick = (viewId: string) => {
    setActiveView(viewId);
    onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please fill out the title and description.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("production_timeline_updates")
        .insert({
          title: title.trim(),
          time_label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: description.trim(),
          type,
          meta: type === "shoot" ? { callTime: callTime.trim() || "07:30 AM", location: location.trim() || "Main Stage A" } : {}
        });

      if (error) throw error;

      alert("Production timeline update published successfully!");
      setIsUpdateModalOpen(false);
      setTitle("");
      setDescription("");
      setCallTime("");
      setLocation("");
      onClose(); // Close Hamburger drawer
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-full h-full bg-[#121212]/95 border-l border-white/5 shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-widest">Oldverse Hub</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-6">
          
          {/* WORKSPACE */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-white/5 pb-1">
              Workspace
            </h4>
            <div className="space-y-1">
              
              {/* ADD PRODUCTION UPDATE COMPOSER */}
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#22d3ee] hover:text-white hover:bg-[#22d3ee]/10 border border-[#22d3ee]/20 transition-all text-left cursor-pointer font-bold"
              >
                <Activity className="w-4 h-4 text-[#22d3ee]" />
                <span>Add Timeline Update</span>
              </button>

              <button
                onClick={() => handleLinkClick("team")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Users className="w-4 h-4 text-primary" />
                <span>Team</span>
              </button>
              <button
                onClick={() => handleLinkClick("cast")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Contact className="w-4 h-4 text-cyan-400" />
                <span>Cast</span>
              </button>
              <button
                onClick={() => handleLinkClick("files")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-yellow-400" />
                <span>Files</span>
              </button>
              <button
                onClick={() => handleLinkClick("inbox")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Mail className="w-4 h-4 text-pink-400" />
                <span>Inbox</span>
              </button>
              <button
                onClick={() => handleLinkClick("calendar")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-success" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => handleLinkClick("shot-planner")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-violet-400" />
                <span>Tasks</span>
              </button>
              <button
                onClick={() => handleLinkClick("equipment")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-orange-400" />
                <span>Equipment</span>
              </button>
              <button
                onClick={() => {
                  handleLinkClick("projects");
                  alert("Please select a project to view production locations details.");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-red-400" />
                <span>Locations</span>
              </button>
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-white/5 pb-1">
              Account
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => handleLinkClick("settings")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 text-text-secondary" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => handleLinkClick("settings")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Shield className="w-4 h-4 text-text-secondary" />
                <span>Privacy & Security</span>
              </button>
              <button
                onClick={() => handleLinkClick("settings")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Eye className="w-4 h-4 text-text-secondary" />
                <span>Appearance</span>
              </button>
              <button
                onClick={() => handleLinkClick("settings")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Bell className="w-4 h-4 text-text-secondary" />
                <span>Notification Preferences</span>
              </button>
              <button
                onClick={() => handleLinkClick("settings")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Link className="w-4 h-4 text-text-secondary" />
                <span>Connected Accounts</span>
              </button>
              <button
                onClick={() => handleLinkClick("settings")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Languages className="w-4 h-4 text-text-secondary" />
                <span>Language</span>
              </button>
            </div>
          </div>

          {/* SUPPORT */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-white/5 pb-1">
              Support
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => alert("Welcome to The Oldverse Help Centre! For guidance, contact team@theoldverse.com")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-text-secondary" />
                <span>Help Centre</span>
              </button>
              <button
                onClick={() => alert("Please send your feedback or inquiries directly to support@theoldverse.com")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-text-secondary" />
                <span>Contact Support</span>
              </button>
              <button
                onClick={() => alert("Terms of Service and Privacy Policy details are available on our official website theoldverse.com")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <FileText className="w-4 h-4 text-text-secondary" />
                <span>Terms & Privacy</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-danger hover:bg-danger/10 transition-all text-left cursor-pointer mt-4"
              >
                <LogOut className="w-4 h-4 text-danger" />
                <span>Logout</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. PUBLISH TIMELINE UPDATE MODAL OVERLAY */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-[420px] max-w-full bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">New Timeline Update</span>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded bg-white/5 text-text-secondary hover:text-white cursor-pointer font-bold"
              >
                X
              </button>
            </div>

            <form onSubmit={handlePublishUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Update Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weather Delay, Call Sheet Scene 5"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Update Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                >
                  <option value="shoot">Shoot & Call Time</option>
                  <option value="announcement">Producer Announcement</option>
                  <option value="notes">Director Notes</option>
                  <option value="update">Storyboard & Script Update</option>
                  <option value="reminder">Equipment Reminder</option>
                </select>
              </div>

              {type === "shoot" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">Call Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 07:30 AM"
                      value={callTime}
                      onChange={(e) => setCallTime(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Stage B"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise updates for cast & crew..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#22d3ee] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUpdateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? "Publishing..." : "Publish Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HamburgerMenu;

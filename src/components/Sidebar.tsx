"use client";

import React from "react";
import { useProjectStore } from "@/store/useProjectStore";
import {
  LayoutDashboard,
  Film,
  FileText,
  Image as ImageIcon,
  Clapperboard,
  Calendar,
  Users,
  Contact,
  MessageSquare,
  Mail,
  CheckSquare,
  Camera,
  FolderOpen,
  DollarSign,
  Megaphone,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/components/ui/button";

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen
  } = useProjectStore();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Film },
    { id: "scripts", label: "Scripts", icon: FileText },
    { id: "storyboards", label: "Storyboards", icon: ImageIcon },
    { id: "shot-planner", label: "Shot Planner", icon: Clapperboard },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "call-sheets", label: "Call Sheets", icon: FileText },
    { id: "team", label: "Team", icon: Users },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "inbox", label: "Inbox", icon: Mail },
    { id: "cast", label: "Cast", icon: Contact },
    { id: "files", label: "Files", icon: FolderOpen },
    { id: "ai-support", label: "AI Support", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar aside Container */}
      <aside
        className={cn(
          "h-screen fixed left-0 top-0 bg-card border-r border-white/5 transition-all duration-300 flex flex-col justify-between select-none",
          // Desktop behaviors
          sidebarCollapsed ? "md:w-16" : "md:w-64",
          // Mobile drawer behaviors
          "w-64 z-50 max-md:shadow-2xl",
          mobileSidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}
      >
        {/* Brand Logo & Tagline */}
        <div className="flex border-b border-white/5 p-4 overflow-hidden h-[73px] items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="The Oldverse Productions"
              className="h-[40px] w-auto object-contain shrink-0"
            />
          </div>

          {/* Close button on mobile drawer view */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 bg-white/5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileSidebarOpen(false); // Auto-close drawer on mobile navigate
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer text-left group relative",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.02]"
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r" />
                )}
                
                <IconComponent className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-primary" : "text-text-secondary group-hover:text-white")} />
                
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <span className="truncate">{item.label}</span>
                )}

                {/* Collapsed Tooltip */}
                {sidebarCollapsed && !mobileSidebarOpen && (
                  <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-150 bg-neutral-900 border border-white/10 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle Footer (Desktop only) */}
        <div className="p-2 border-t border-white/5 bg-white/[0.01] hidden md:block">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center justify-between w-full text-xs">
                <span className="text-text-secondary">Collapse Menu</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;

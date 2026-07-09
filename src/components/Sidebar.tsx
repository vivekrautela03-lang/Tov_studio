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
    { id: "crew", label: "Crew", icon: Users },
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
            {/* Monogram Logo */}
            <div className="relative shrink-0 w-8 h-8">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="currentColor">
                {/* Tilted Serif O */}
                <g transform="rotate(-14 46 54)">
                  <path d="M 46,24 C 29,24 19,37 19,54 C 19,71 29,84 46,84 C 63,84 73,71 73,54 C 73,37 63,24 46,24 Z M 46,29 C 58,29 67,40 67,54 C 67,68 58,79 46,79 C 34,79 25,68 25,54 C 25,40 34,29 46,29 Z" />
                </g>
                {/* Serif T */}
                <path d="M 22,30 H 70 V 35 H 65 V 37 H 51 V 73 H 57 V 78 H 35 V 73 H 41 V 37 H 27 V 35 H 22 Z" />
                {/* Serif V */}
                <path d="M 58,48 L 72,78 H 75 L 89,48 H 84 L 74,72 L 63,48 Z" />
              </svg>
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1 leading-none">
                  {/* Horizontal Filmstrip Icon */}
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                    <rect x="2" y="4" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="16" y1="4" x2="16" y2="20" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="4" y="6" width="2" height="2" rx="0.5" />
                    <rect x="4" y="11" width="2" height="2" rx="0.5" />
                    <rect x="4" y="16" width="2" height="2" rx="0.5" />
                    <rect x="18" y="6" width="2" height="2" rx="0.5" />
                    <rect x="18" y="11" width="2" height="2" rx="0.5" />
                    <rect x="18" y="16" width="2" height="2" rx="0.5" />
                  </svg>
                  <span className="text-[12px] font-black tracking-wider text-white uppercase font-sans">
                    THE OLDVERSE
                  </span>
                </div>
                <span className="text-[7.5px] text-white/60 tracking-[0.25em] uppercase font-mono font-bold leading-none mt-1">
                  PRODUCTIONS
                </span>
              </div>
            )}
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

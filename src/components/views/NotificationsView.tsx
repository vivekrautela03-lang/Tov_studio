"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Bell,
  Check,
  Trash2,
  ShieldAlert,
  Sparkles,
  Clock,
  Calendar,
  CheckSquare,
  MessageSquare,
  Search,
  CheckCircle,
  Phone,
  CloudSun,
  User,
  Activity,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useProjectStore();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    { name: "All", count: notifications.length },
    { name: "Messages", count: notifications.filter(n => (n.type as string) === "message").length },
    { name: "Projects", count: notifications.filter(n => (n.type as string) === "project").length },
    { name: "Calls", count: notifications.filter(n => (n.type as string) === "call").length },
    { name: "Weather", count: notifications.filter(n => (n.type as string) === "weather").length },
    { name: "AI", count: notifications.filter(n => (n.type as string) === "ai").length },
    { name: "Account", count: notifications.filter(n => (n.type as string) === "account").length },
    { name: "Updates", count: notifications.filter(n => (n.type as string) === "update").length }
  ];

  const getIcon = (type?: string) => {
    switch (type) {
      case "alert":
      case "error":
        return <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />;
      case "ai":
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case "calendar":
        return <Calendar className="w-4 h-4 text-green-400" />;
      case "task":
        return <CheckSquare className="w-4 h-4 text-cyan-400" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "call":
        return <Phone className="w-4 h-4 text-green-400" />;
      case "weather":
        return <CloudSun className="w-4 h-4 text-orange-400" />;
      case "account":
        return <User className="w-4 h-4 text-purple-400" />;
      case "update":
        return <Activity className="w-4 h-4 text-[#22d3ee]" />;
      default:
        return <Bell className="w-4 h-4 text-[#22d3ee]" />;
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate deleting a single notification from the store
    // In our store, we can use clear or filter. For this UI, we can trigger a state local filter or trigger a delete query
    // Let's filter locally or update store
    const list = useProjectStore.getState().notifications;
    useProjectStore.setState({
      notifications: list.filter((n) => n.id !== id)
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    // 1. Filter Chip Matching
    if (activeFilter !== "All") {
      const typeStr = (n.type as string) || "info";
      if (activeFilter === "Messages" && typeStr !== "message") return false;
      if (activeFilter === "Projects" && typeStr !== "project") return false;
      if (activeFilter === "Calls" && typeStr !== "call") return false;
      if (activeFilter === "Weather" && typeStr !== "weather") return false;
      if (activeFilter === "AI" && typeStr !== "ai") return false;
      if (activeFilter === "Account" && typeStr !== "account") return false;
      if (activeFilter === "Updates" && typeStr !== "update") return false;
    }

    // 2. Search Text Matching
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16 text-white text-xs select-none">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">Notification Center</h2>
          <p className="text-[10px] text-text-secondary mt-0.5">
            Real-time activity log feed
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span>Mark All Read</span>
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearNotifications}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border-white/5 hover:bg-danger/10 hover:border-danger/30 text-white"
            >
              <Trash2 className="w-3.5 h-3.5 text-danger" />
              <span>Clear All</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search notifications, projects, or alerts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-[#22d3ee] focus:outline-none"
        />
      </div>

      {/* Filter Chips Scrollbar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
        {filters.map((f) => (
          <button
            key={f.name}
            onClick={() => setActiveFilter(f.name)}
            className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              activeFilter === f.name
                ? "bg-[#22d3ee] text-black border-[#22d3ee] shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                : "bg-white/5 text-text-secondary border-white/5 hover:border-white/10 hover:text-white"
            }`}
          >
            {f.name} ({f.count})
          </button>
        ))}
      </div>

      {/* Notifications list feed */}
      <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
        <CardContent className="p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <Bell className="w-5 h-5 text-text-secondary" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">All caught up!</h3>
                <p className="text-[10px] text-text-secondary">No matching alerts or notifications found.</p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-xl border flex items-start justify-between gap-4 cursor-pointer transition-all duration-150 relative group ${
                  !n.read 
                    ? "bg-white/[0.02] border-[#22d3ee]/10 hover:border-[#22d3ee]/20" 
                    : "bg-black/20 border-white/5 hover:border-white/10"
                }`}
              >
                {/* Red dot (ONLY red dot for unread, no numbers as requested!) */}
                {!n.read && (
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}

                <div className="flex gap-3 pl-3">
                  <div className="mt-0.5 p-2 rounded bg-white/5 border border-white/5">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold ${!n.read ? "text-[#22d3ee]" : "text-white"}`}>{n.title}</h4>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{n.message}</p>
                    <span className="text-[9px] text-text-secondary/60 font-mono block">{n.time}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(n.id);
                      }}
                      className="p-1 rounded bg-[#3ecf8e]/10 text-[#3ecf8e] hover:bg-[#3ecf8e] hover:text-black transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => handleDeleteNotification(n.id, e)}
                    className="p-1 rounded bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))
          )}
        </CardContent>
      </Card>

    </div>
  );
};
export default NotificationsView;

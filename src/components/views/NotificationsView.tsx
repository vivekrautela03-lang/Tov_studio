"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Bell, Check, Trash2, ShieldAlert, Sparkles, Clock, Calendar, CheckSquare, MessageSquare, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useProjectStore();
  const [preferences, setPreferences] = useState({
    teamInvites: true,
    projectInvites: true,
    messages: true,
    tasks: true,
    calendar: true,
    schedule: true,
    cast: true,
    announcements: true
  });

  // Load preferences from localstorage
  useEffect(() => {
    const saved = localStorage.getItem("tov_notification_prefs");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const togglePreference = (key: keyof typeof preferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    localStorage.setItem("tov_notification_prefs", JSON.stringify(updated));
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case "alert":
        return <ShieldAlert className="w-4 h-4 text-danger animate-pulse" />;
      case "ai":
        return <Sparkles className="w-4 h-4 text-warning" />;
      case "deadline":
        return <Clock className="w-4 h-4 text-primary" />;
      case "calendar":
        return <Calendar className="w-4 h-4 text-success" />;
      case "task":
        return <CheckSquare className="w-4 h-4 text-cyan-400" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-[#22d3ee]" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  // Filter based on toggled preferences
  const filteredNotifications = notifications.filter((n) => {
    const typeStr = n.type as string;
    if (typeStr === "message" && !preferences.messages) return false;
    if (typeStr === "task" && !preferences.tasks) return false;
    if (typeStr === "calendar" && !preferences.calendar) return false;
    // Map other generic ones
    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Notification Center</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            You have {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
        {filteredNotifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearNotifications}
            className="flex items-center gap-1.5 border-white/5 hover:bg-danger/10 hover:border-danger/30 text-white"
          >
            <Trash2 className="w-3.5 h-3.5 text-danger" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
            <CardContent className="p-4 space-y-2">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                    <Bell className="w-6 h-6 text-text-secondary" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">All caught up!</h3>
                    <p className="text-[10px] text-text-secondary">No matching alerts or notifications found.</p>
                  </div>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3.5 rounded-lg border border-white/[0.03] flex items-start justify-between gap-4 cursor-pointer transition-all duration-150 ${
                      !n.read ? "bg-white/[0.02] border-primary/10 hover:border-primary/20" : "bg-black/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 p-2 rounded bg-white/5 border border-white/5">
                        {getIcon(n.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold ${!n.read ? "text-[#22d3ee]" : "text-white"}`}>{n.title}</h4>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-text-secondary/60 block">{n.time}</span>
                      </div>
                    </div>

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
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preferences side panel */}
        <div>
          <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Preferences</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Team Invitations</span>
                  <button onClick={() => togglePreference("teamInvites")} className="text-white hover:text-primary">
                    {preferences.teamInvites ? <ToggleRight className="w-6 h-6 text-[#22d3ee]" /> : <ToggleLeft className="w-6 h-6 text-text-secondary/60" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Project Workspace Invites</span>
                  <button onClick={() => togglePreference("projectInvites")} className="text-white hover:text-primary">
                    {preferences.projectInvites ? <ToggleRight className="w-6 h-6 text-[#22d3ee]" /> : <ToggleLeft className="w-6 h-6 text-text-secondary/60" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Chat Messages</span>
                  <button onClick={() => togglePreference("messages")} className="text-white hover:text-primary">
                    {preferences.messages ? <ToggleRight className="w-6 h-6 text-[#22d3ee]" /> : <ToggleLeft className="w-6 h-6 text-text-secondary/60" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Task Assignments</span>
                  <button onClick={() => togglePreference("tasks")} className="text-white hover:text-primary">
                    {preferences.tasks ? <ToggleRight className="w-6 h-6 text-[#22d3ee]" /> : <ToggleLeft className="w-6 h-6 text-text-secondary/60" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Calendar Reminders</span>
                  <button onClick={() => togglePreference("calendar")} className="text-white hover:text-primary">
                    {preferences.calendar ? <ToggleRight className="w-6 h-6 text-[#22d3ee]" /> : <ToggleLeft className="w-6 h-6 text-text-secondary/60" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Schedule Updates</span>
                  <button onClick={() => togglePreference("schedule")} className="text-white hover:text-primary">
                    {preferences.schedule ? <ToggleRight className="w-6 h-6 text-[#22d3ee]" /> : <ToggleLeft className="w-6 h-6 text-text-secondary/60" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Cast updates</span>
                  <button onClick={() => togglePreference("cast")} className="text-white hover:text-primary">
                    {preferences.cast ? <ToggleRight className="w-6 h-6 text-[#22d3ee]" /> : <ToggleLeft className="w-6 h-6 text-text-secondary/60" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Announcements</span>
                  <button onClick={() => togglePreference("announcements")} className="text-white hover:text-primary">
                    {preferences.announcements ? <ToggleRight className="w-6 h-6 text-[#22d3ee]" /> : <ToggleLeft className="w-6 h-6 text-text-secondary/60" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default NotificationsView;

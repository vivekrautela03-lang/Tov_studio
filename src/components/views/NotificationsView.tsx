"use client";

import React from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Bell, Check, Trash2, ShieldAlert, Sparkles, Clock, Calendar, CheckSquare, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useProjectStore();

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
        return <MessageSquare className="w-4 h-4 text-info" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Notification Center</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            You have {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearNotifications} className="flex items-center gap-1.5 border-white/5 hover:bg-danger/10 hover:border-danger/30 text-white">
            <Trash2 className="w-3.5 h-3.5 text-danger" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
        <CardContent className="p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <Bell className="w-6 h-6 text-text-secondary" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">All caught up!</h3>
                <p className="text-[10px] text-text-secondary">No production alerts or message notifications found.</p>
              </div>
            </div>
          ) : (
            notifications.map((n) => (
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
                      <h4 className={`text-xs font-bold ${!n.read ? "text-cyan-400" : "text-white"}`}>{n.title}</h4>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
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
  );
};

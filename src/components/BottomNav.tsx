"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { Home, Film, Sparkles, Bell, User } from "lucide-react";
import { cn } from "@/components/ui/button";

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView, notifications } = useProjectStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", user.id)
          .single();
        if (data) {
          setAvatarUrl(data.avatar_url);
          setFullName(data.full_name || "");
        }
      } catch (err) {
        console.error("Error loading nav profile:", err);
      }
    };
    loadProfile();

    const channel = supabase
      .channel("nav-profile-listener")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload: any) => {
        if (payload.new) {
          setAvatarUrl(payload.new.avatar_url);
          setFullName(payload.new.full_name || "");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "projects", label: "Projects", icon: Film },
    { id: "ai-support", label: "AI Assistant", icon: Sparkles },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User }
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212]/80 backdrop-blur-lg border-t border-white/5 rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] px-4 py-2 flex items-center justify-around md:justify-center md:gap-16">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 relative cursor-pointer group"
          >
            <div className="relative">
              {tab.id === "profile" ? (
                avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className={cn(
                      "w-5 h-5 rounded-full object-cover transition-all duration-300 ring-2",
                      isActive
                        ? "ring-[#22d3ee] scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                        : "ring-transparent group-hover:ring-white"
                    )}
                    alt=""
                  />
                ) : (
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full bg-[#22d3ee] flex items-center justify-center font-bold text-black text-[9px] transition-all duration-300 ring-2",
                      isActive
                        ? "ring-[#22d3ee] scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                        : "ring-transparent group-hover:ring-white"
                    )}
                  >
                    {fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                )
              ) : (
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive
                      ? "text-[#22d3ee] scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                      : "text-text-secondary group-hover:text-white"
                  )}
                />
              )}
              {tab.id === "notifications" && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-cyan-500 text-[8px] font-black text-black flex items-center justify-center ring-2 ring-neutral-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[9px] font-bold tracking-wider mt-1 transition-all duration-300 uppercase",
                isActive
                  ? "text-[#22d3ee]"
                  : "text-text-secondary/60 group-hover:text-text-secondary"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
export default BottomNav;

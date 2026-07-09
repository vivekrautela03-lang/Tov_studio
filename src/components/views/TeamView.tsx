"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import {
  Search,
  Users,
  Clock,
  Sparkles,
  UserCheck,
  Activity,
  Laptop
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const TeamView: React.FC = () => {
  const { userProfile } = useProjectStore();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let presenceChannel: any;

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      presenceChannel = supabase.channel("online-crew-presence", {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState();
          const activeUsersList = Object.values(state).map((presenceArray: any) => {
            return presenceArray[0];
          });
          setOnlineUsers(activeUsersList);
        })
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel.track({
              id: user.id,
              full_name: userProfile?.full_name || user?.email?.split("@")[0] || "Filmmaker",
              avatar_url: userProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile?.full_name || "User")}`,
              online_at: new Date().toISOString(),
              active_view: useProjectStore.getState().activeView
            });
          }
        });
    };

    setupPresence();

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [userProfile]);

  const filteredUsers = onlineUsers.filter((u) => {
    const searchLower = search.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(searchLower) ||
      (u.active_view || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-white select-none">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5">
            <Users className="w-5.5 h-5.5 text-primary" />
            <span>Active Production Team</span>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          </h2>
          <p className="text-[10px] text-text-secondary mt-1 font-mono uppercase tracking-wider">
            Real-time workspace presence tracking
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-[#09090B] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-400 font-bold">{onlineUsers.length} Active Sessions</span>
        </div>
      </div>

      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search online team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="text-[10px] text-text-secondary font-mono">
          Showing <span className="text-white font-semibold">{filteredUsers.length}</span> crew online
        </div>
      </div>

      {/* Presence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
            No crew members match your search criteria.
          </div>
        ) : (
          filteredUsers.map((user, idx) => {
            const avatarPlaceholder = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              user.full_name || "User"
            )}&backgroundColor=030712&textColor=ffffff`;

            const formatTime = (isoString: string) => {
              if (!isoString) return "Just now";
              try {
                return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch (e) {
                return "Just now";
              }
            };

            return (
              <Card key={user.id || idx} className="border border-white/5 hover:border-white/10 bg-[#09090B] flex flex-col justify-between overflow-hidden group transition-all duration-300">
                <CardContent className="p-5 space-y-4">
                  {/* Top: Avatar & Name */}
                  <div className="flex gap-4 items-start">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar_url || avatarPlaceholder}
                        alt={user.full_name}
                        className="w-12 h-12 object-cover rounded-full border border-white/10"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#09090B] shadow-md animate-pulse" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{user.full_name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Connected: {formatTime(user.online_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active view telemetry */}
                  <div className="border-t border-white/5 pt-3 space-y-2">
                    <span className="text-[9px] text-text-secondary uppercase font-mono tracking-wider block">Current Activity</span>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-2.5 py-1.5 rounded-lg text-xs">
                      <Laptop className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-white truncate capitalize font-mono">
                        Viewing {user.active_view || "Dashboard"}
                      </span>
                    </div>
                  </div>

                  {/* Online Badge status bar */}
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs">
                    <span className="text-text-secondary font-mono">Session State</span>
                    <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1.5 select-none animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Active Online
                    </span>
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
};
export default TeamView;

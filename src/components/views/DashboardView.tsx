"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import {
  Clock,
  ArrowRight,
  Plus,
  Compass,
  Sparkles,
  Calendar,
  AlertTriangle,
  Play
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const DashboardView: React.FC = () => {
  const {
    projects,
    setActiveProjectId,
    setActiveView
  } = useProjectStore();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  // 1. Fetch user profile and all team profiles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch current user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) setUserProfile(profile);

        // Fetch all user profiles for Active Crew list
        const { data: profilesList } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role");
        if (profilesList) setAllProfiles(profilesList);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  // 2. Supabase Real-time Presence Subscription for Online dot tracking
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

  // Production Timeline updates mock database
  const updatesList = [
    {
      title: "Today's Shoot & Call Time",
      time: "07:30 AM",
      desc: "Scene 4 - Neon Alley (Steadicam sequence). Weather forecast indicates clear sky conditions. Golden hour estimated at 05:45 PM.",
      type: "shoot",
      meta: { callTime: "07:30 AM", location: "Stage A, Alleyway set" }
    },
    {
      title: "Producer Announcement",
      time: "10:00 AM",
      desc: "A24 international sales agent agreement finalized. International theatrical distribution confirmed.",
      type: "announcement"
    },
    {
      title: "Director Notes",
      time: "Yesterday",
      desc: "Steadicam sequence needs a slow panning transition to highlight the reflection of neon signage.",
      type: "notes"
    },
    {
      title: "Storyboard & Script Updated",
      time: "2 days ago",
      desc: "Storyboard boards revised and updated for sequence 5 in high resolution.",
      type: "update"
    },
    {
      title: "Equipment Reminder & Weather Update",
      time: "3 days ago",
      desc: "Arri Alexa camera sensor calibration due today. Weather updates show slight wind limits.",
      type: "reminder"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-xs">
      
      {/* 1. ACTIVE MEMBERS: Horizontal scrollable avatars (Instagram Stories style) */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase font-mono tracking-wider font-bold text-white/40">Active Crew</h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {allProfiles.map((p) => {
            const isOnline = onlineUsers.some((u: any) => u.id === p.id);
            return (
              <div key={p.id} className="flex flex-col items-center gap-1.5 shrink-0 text-center select-none group">
                <div className="relative">
                  <div className={`p-[3px] rounded-full ${isOnline ? "bg-gradient-to-tr from-[#22d3ee] to-[#3ecf8e]" : "bg-neutral-800"} ring-1 ring-white/5`}>
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#121212] bg-neutral-900"
                        alt=""
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-bold text-black text-lg border-2 border-[#121212] select-none">
                        {p.full_name?.[0].toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  {/* Status dot presence */}
                  <span className={`absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full ring-2 ring-[#121212] ${isOnline ? "bg-[#3ecf8e]" : "bg-text-secondary/40"}`} />
                </div>
                <span className="text-[10px] font-bold text-text-secondary group-hover:text-white truncate max-w-[80px]">
                  {p.full_name?.split(" ")[0]}
                </span>
              </div>
            );
          })}

          {/* Last circle: Invite Member */}
          <button
            onClick={() => {
              const email = prompt("Enter team member's email to invite to workspace:");
              if (email) {
                alert(`Invite successfully sent to: ${email}`);
              }
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 text-center cursor-pointer select-none group"
          >
            <div className="w-[72px] h-[72px] rounded-full border border-dashed border-white/20 hover:border-[#22d3ee]/50 flex items-center justify-center bg-white/5 group-hover:bg-[#22d3ee]/10 transition-all duration-200">
              <Plus className="w-6 h-6 text-text-secondary group-hover:text-[#22d3ee] transition-colors" />
            </div>
            <span className="text-[10px] font-bold text-text-secondary group-hover:text-[#22d3ee] transition-colors">
              Invite
            </span>
          </button>
        </div>
      </div>

      {/* 2. GREETING */}
      <div className="space-y-1.5 py-2">
        <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
          Welcome Back,<br />
          <span className="text-[#22d3ee] drop-shadow-[0_0_10px_rgba(34,211,238,0.25)]">
            {userProfile?.full_name || "Filmmaker"}
          </span> 👋
        </h1>
        <p className="text-xs text-text-secondary font-medium tracking-wide">Ready to create something amazing today?</p>
      </div>

      {/* 3. ONGOING PROJECTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase font-mono tracking-wider font-bold text-white/40">Ongoing Projects</h3>
          <button onClick={() => setActiveView("projects")} className="text-[10px] font-bold text-[#22d3ee] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {projects.map((proj) => {
            const progress = proj.id === "proj-1" ? 75 : proj.id === "proj-2" ? 45 : 90;
            return (
              <Card key={proj.id} className="w-80 shrink-0 border-white/5 bg-neutral-900/40 backdrop-blur-md overflow-hidden flex flex-col justify-between hover:border-[#22d3ee]/20 transition-all duration-200">
                <div className="relative h-36">
                  <img src={proj.coverImage} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/20 backdrop-blur-md">
                    {proj.status}
                  </span>
                </div>
                
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white leading-none truncate">{proj.title}</h4>
                    <span className="text-[9px] text-text-secondary font-mono">Stage: {proj.status}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-text-secondary">
                      <span>Progress</span>
                      <span className="font-bold text-white">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  
                  {/* Deadline */}
                  <div className="text-[9px] text-text-secondary flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#22d3ee]" />
                    <span>Deadline: {proj.deadline}</span>
                  </div>

                  {/* Recent Activity */}
                  <div className="border-t border-white/5 pt-2.5 space-y-1.5">
                    <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 font-bold block">Recent Activity</span>
                    <p className="text-[9px] text-text-secondary truncate">
                      ⚡ {proj.tagline}
                    </p>
                  </div>
                  
                  {/* Quick Open Button */}
                  <Button
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      setActiveView("projects");
                    }}
                    variant="primary"
                    size="sm"
                    className="w-full text-[10px] font-bold py-1.5"
                  >
                    Open Workspace
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. PRODUCTION UPDATES (Timeline layout of cards) */}
      <div className="space-y-4">
        <h3 className="text-[10px] uppercase font-mono tracking-wider font-bold text-white/40">Production Timeline Updates</h3>
        
        <div className="relative border-l border-white/10 pl-6 ml-2.5 space-y-6">
          {updatesList.map((up, idx) => (
            <div key={idx} className="relative">
              {/* Dot indicator */}
              <span className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-[#121212] border-2 border-[#22d3ee] flex items-center justify-center shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
              </span>
              
              <Card className="border-white/5 bg-neutral-900/40 backdrop-blur-md">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{up.title}</h4>
                    <span className="text-[9px] text-text-secondary font-mono">{up.time}</span>
                  </div>
                  
                  <p className="text-[10.5px] text-text-secondary leading-relaxed">{up.desc}</p>
                  
                  {up.meta && (
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[9px] font-mono border-t border-white/5 text-text-secondary">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 block">Call Time</span>
                        <span className="text-white font-medium">{up.meta.callTime}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 block">Location</span>
                        <span className="text-white font-medium">{up.meta.location}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default DashboardView;

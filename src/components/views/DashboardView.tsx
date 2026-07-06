"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore, CrewMember, CastMember, Equipment, CalendarEvent, ShotPlan } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { cn } from "@/components/ui/button";
import {
  Film,
  Calendar,
  CloudRain,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  Video,
  Battery,
  Wrench,
  Search,
  Sparkles,
  ArrowRight,
  User,
  FileText,
  MapPin,
  CheckSquare,
  Play,
  UploadCloud,
  Settings,
  ChevronRight,
  TrendingUp,
  Activity,
  HardDrive,
  Compass,
  Sunrise,
  Sunset,
  Shield,
  Eye,
  Percent,
  Plus,
  HelpCircle,
  Volume2,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, Reorder } from "framer-motion";

export const DashboardView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    setActiveView,
    crew,
    cast,
    equipment,
    calendarEvents,
    shotPlans,
    memberRole,
    fetchWorkspaceData
  } = useProjectStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Dynamic user data
  const [userName, setUserName] = useState("Collaborator");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("Welcome back");
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // 1. Subscribe to Supabase Realtime Changes
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        fetchWorkspaceData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWorkspaceData]);

  // 2. Fetch User Profile Name & Greetings
  useEffect(() => {
    const loadProfileAndGreetings = async () => {
      // Set time-based greeting
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting("Good Morning");
      else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
      else if (hour >= 17 && hour < 21) setGreeting("Good Evening");
      else setGreeting("Good Night");

      // Fetch name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) {
          setUserName(data.full_name);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        }
      }
    };
    loadProfileAndGreetings();
  }, []);

  // 3. Fetch Live Weather & 3-Day Forecast
  useEffect(() => {
    if (!activeProject) return;

    const fetchWeather = async () => {
      const apiKey = "9b29b35c2107f7bf3ac02422e628111d";
      try {
        let city = "Tokyo";
        const locLower = activeProject.location.toLowerCase();
        if (locLower.includes("london")) city = "London";
        else if (locLower.includes("singapore")) city = "Singapore";
        else if (locLower.includes("tokyo")) city = "Tokyo";
        else if (locLower.includes("backlot")) city = "Los Angeles";

        // Current weather
        const resp = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        if (resp.ok) {
          const data = await resp.json();
          setWeatherData(data);
        }

        // 3-Day Forecast
        const fResp = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (fResp.ok) {
          const fData = await fResp.json();
          const daily = [fData.list[8], fData.list[16], fData.list[24]].filter(Boolean);
          setForecastData(daily);
        }
      } catch (err) {
        console.error("Error loading weather data:", err);
      }
    };
    fetchWeather();
  }, [activeProject?.location]);

  // 4. Fetch Activity Logs & Notifications
  useEffect(() => {
    const fetchSystemLogs = async () => {
      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (logs) setRecentLogs(logs);

      const { data: notices } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (notices) setNotifications(notices);
    };
    fetchSystemLogs();
  }, [activeProjectId]);

  // Empty state rendering
  if (projects.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in py-12 max-w-xl mx-auto">
        <Card className="border-primary/20 bg-gradient-to-b from-card to-primary/[0.02]">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary animate-bounce">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">WELCOME TO TOV STUDIO</h2>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                Initialize your first film campaign workspace to unlock production-grade dashboards, screenplay editors, and real-time attendance roll calls.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => setActiveView("projects")}
                className="mx-auto flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 h-10 px-5"
              >
                <Plus className="w-4 h-4 text-black font-bold" />
                <span>Initialize Workspace</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Derived metrics
  const activeCrew = crew[activeProject.id] || [];
  const presentCrew = activeCrew.filter((c) => c.attendance === "Present" || c.attendance === "Late").length;
  const totalCrew = activeCrew.length;
  const attendanceRate = totalCrew > 0 ? Math.round((presentCrew / totalCrew) * 100) : 0;

  const activeCast = cast[activeProject.id] || [];
  const activeEquip = equipment[activeProject.id] || [];
  const inUseEquip = activeEquip.filter((e) => e.status === "In Use").length;

  const activePlans = shotPlans[activeProject.id] || [];
  const completedShots = activePlans.filter((p) => p.status === "Completed").length;
  const totalShots = activePlans.length;
  const shotProgress = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;

  const activeEvents = calendarEvents[activeProject.id] || [];

  // Weather Recommendations
  const tempVal = weatherData?.main?.temp ? Math.round(weatherData.main.temp) : 22;
  const humidityVal = weatherData?.main?.humidity ? weatherData.main.humidity : 60;
  const windVal = weatherData?.wind?.speed ? weatherData.wind.speed : 5;
  const sunriseVal = weatherData?.sys?.sunrise ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "05:45 AM";
  const sunsetVal = weatherData?.sys?.sunset ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "06:30 PM";

  const isRainy = weatherData?.weather?.[0]?.main?.toLowerCase().includes("rain") || weatherData?.weather?.[0]?.main?.toLowerCase().includes("drizzle");
  const shootRecommendation = isRainy
    ? "⚠️ Warning: Indoor filming recommended due to forecast rain precipitation."
    : tempVal > 35
    ? "⚠️ Warning: Extreme temperature. Schedule hydration blocks for crew."
    : "✓ Recommended: Clear sky conditions. Weather is perfect for outdoor filming.";

  const render3DayForecastSection = () => {
    if (forecastData.length === 0) return null;
    return (
      <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
        <span className="text-[10px] text-text-secondary uppercase font-semibold">3-Day Shooting Forecast</span>
        <div className="grid grid-cols-3 gap-2">
          {forecastData.map((day, idx) => {
            const date = new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
            return (
              <div key={idx} className="bg-white/[0.01] border border-white/5 rounded p-2 text-center text-[10px]">
                <div className="text-text-secondary">{date}</div>
                <div className="text-white font-bold mt-1">{Math.round(day.main.temp)}°C</div>
                <div className="text-primary font-medium mt-0.5">{day.weather[0].main}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Dynamic role-based greeting details
  const greetingSubtitle = 
    memberRole === "Owner" ? "Here is the master control dashboard for your production campaign." :
    memberRole === "Director" ? "Review today's setups, storyboards, and camera plan breakdown." :
    memberRole === "Cinematographer (DOP)" ? "Review lighting rigs, camera bodies, and sunset golden hour." :
    memberRole === "Editor" ? "Check proxys, footage transfers, and render queues." :
    "Welcome to the film set command console.";

  // --- SUB-DASHBOARD VIEWS ---

  // A. Owner & Producer Dashboard
  const renderOwnerDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Budget doughnut chart (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Doughnut Chart */}
            <Card className="bg-[#111318] border-white/5 p-5 flex flex-col justify-between h-72">
              <div>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Budget Allocation</CardTitle>
                <CardDescription className="text-[10px] mt-0.5">Real-time financial status</CardDescription>
              </div>
              <div className="flex items-center justify-center gap-6 py-4">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="45" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="transparent" />
                  <circle cx="56" cy="56" r="45" stroke="#3ecf8e" strokeWidth="12" fill="transparent" 
                    strokeDasharray="282" strokeDashoffset={282 - (282 * 45) / 100} className="transition-all duration-1000" />
                </svg>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-text-secondary">Spent: $1.1M (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="text-text-secondary">Remaining: $1.4M</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] font-bold text-white">
                    Allocated: {activeProject.budget}
                  </div>
                </div>
              </div>
            </Card>

            {/* Campaign Overview list */}
            <Card className="bg-[#111318] border-white/5 p-5 flex flex-col justify-between h-72">
              <div>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Active Projects</CardTitle>
                <CardDescription className="text-[10px] mt-0.5">Productions status logs</CardDescription>
              </div>
              <div className="space-y-3 py-2 flex-1 overflow-y-auto scrollbar-none">
                {projects.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                    <span className={`font-semibold cursor-pointer ${p.id === activeProjectId ? "text-primary" : "text-white"}`}
                      onClick={() => setActiveProjectId(p.id)}>
                      {p.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-text-secondary">{p.status}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Interactive Production Timeline Gantt simulation */}
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Campaign Timeline</CardTitle>
              <CardDescription className="text-[10px] mt-0.5">Film production roadmap milestones</CardDescription>
            </div>
            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-text-secondary uppercase">
                  <span>Pre-Production</span>
                  <span className="text-primary font-bold">100% Completed</span>
                </div>
                <Progress value={100} size="sm" color="primary" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-text-secondary uppercase">
                  <span>Production (Filming)</span>
                  <span className="text-secondary font-bold">{shotProgress}% In Progress</span>
                </div>
                <Progress value={shotProgress} size="sm" color="secondary" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-text-secondary uppercase">
                  <span>Post-Production (VFX & Cuts)</span>
                  <span className="text-text-secondary italic">0% Locked</span>
                </div>
                <Progress value={0} size="sm" color="primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Real-time Logs Feed (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider font-mono">
              <Activity className="w-4 h-4" />
              <span>Real-Time Activity Feed</span>
            </div>
            <div className="space-y-3 flex flex-col max-h-[360px] overflow-y-auto scrollbar-none">
              {recentLogs.length === 0 ? (
                <div className="text-[11px] text-text-secondary italic text-center py-8">
                  No system logs registered. Actions like adding crew or editing scripts will display here.
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="text-xs border-l-2 border-primary/20 pl-3 py-0.5 space-y-1">
                    <p className="text-white leading-normal">{log.message}</p>
                    <span className="text-[9px] text-text-secondary block font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // B. Director, Writer & DOP Dashboard
  const renderDirectorDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Shot Plans and Storyboards list (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Storyboards Panel */}
            <Card className="bg-[#111318] border-white/5 p-5 flex flex-col justify-between h-72">
              <div>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Camera Storyboard</CardTitle>
                <CardDescription className="text-[10px]">Recent sequence preview cards</CardDescription>
              </div>
              <div className="py-2 flex-1 flex gap-3 overflow-x-auto scrollbar-none items-center justify-start">
                {activePlans.length === 0 ? (
                  <div className="text-xs text-text-secondary italic w-full text-center">No shot planners configured.</div>
                ) : (
                  activePlans.map((plan) => (
                    <div key={plan.id} className="w-28 shrink-0 bg-black/40 border border-white/5 rounded-lg p-2 space-y-1">
                      <div className="h-16 w-full rounded bg-white/5 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&q=80" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-white block truncate">{plan.setup}</span>
                      <span className="text-[9px] text-text-secondary block">{plan.location}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* AI Continuity Suggestions */}
            <Card className="bg-[#111318] border-primary/10 border p-5 flex flex-col justify-between h-72">
              <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Continuity breakdown</span>
              </div>
              <div className="space-y-2 py-2 flex-1">
                <h4 className="text-xs font-bold text-white">Outdoor Schedule Warnings</h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  "Neon Alley has a Rain Contingency. Sunday rain probability is 78%. Move Steadicam sequence to Saturday night, or swap with Apartment Racks on Stage 4."
                </p>
              </div>
              <Button variant="primary" onClick={() => setActiveView("shot-planner")} className="w-full text-[10px] h-8">
                Optimize Shooting Plan
              </Button>
            </Card>

          </div>

          {/* Shot planner completion status */}
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Shot Planner Telemetry</CardTitle>
              <CardDescription className="text-[10px] mt-0.5">Filming progress status checklist</CardDescription>
            </div>
            <div className="flex items-center justify-between gap-6 py-2">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Completed Setups</span>
                  <span className="text-white font-bold">{completedShots} of {totalShots}</span>
                </div>
                <Progress value={shotProgress} color="primary" />
              </div>
              <div className="text-center font-mono shrink-0">
                <span className="text-xl font-black text-white">{shotProgress}%</span>
              </div>
            </div>
          </Card>

        </div>

        {/* System notifications feed (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-secondary font-bold uppercase tracking-wider font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>Safety & Production Alerts</span>
            </div>
            <div className="space-y-3 flex flex-col max-h-[360px] overflow-y-auto scrollbar-none">
              {notifications.length === 0 ? (
                <div className="text-[11px] text-text-secondary italic text-center py-8">
                  No alerts currently registered. Safety logs and checklist notifications will display here.
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="text-xs border-l-2 border-secondary/20 pl-3 py-0.5 space-y-1">
                    <p className="text-white font-semibold leading-normal">{n.title}</p>
                    <p className="text-text-secondary text-[11px] leading-normal">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>
    );
  };

  // C. Crew and Actor Dashboard
  const renderCrewActorDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Call time sheet (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Call sheet */}
            <Card className="bg-[#111318] border-white/5 p-5 flex flex-col justify-between h-72">
              <div>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Today's Call Sheet</CardTitle>
                <CardDescription className="text-[10px] mt-0.5">On-set check-in details</CardDescription>
              </div>
              <div className="space-y-2.5 py-2 text-xs">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-text-secondary">Expected Call Time</span>
                  <span className="text-white font-bold">07:30 AM</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-text-secondary">Location Site</span>
                  <span className="text-white font-bold">{activeProject.location}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-text-secondary">Assigned Camera Rig</span>
                  <span className="text-white font-bold">ARRI Steadicam Rig 4</span>
                </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold p-2.5 rounded text-center">
                Attendance Logged: Verified Present on Set
              </div>
            </Card>

            {/* Weather & Sun position */}
            <Card className="bg-[#111318] border-white/5 p-5 flex flex-col justify-between h-72">
              <div>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Sun & Shooting Conditions</CardTitle>
                <CardDescription className="text-[10px] mt-0.5">Golden hour tracking</CardDescription>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 text-[11px] text-text-secondary">
                <div className="bg-white/[0.02] border border-white/5 rounded p-2 space-y-1">
                  <span className="flex items-center gap-1"><Sunrise className="w-3.5 h-3.5 text-primary" /> Sunrise</span>
                  <span className="text-white font-bold block">{sunriseVal}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded p-2 space-y-1">
                  <span className="flex items-center gap-1"><Sunset className="w-3.5 h-3.5 text-secondary" /> Sunset</span>
                  <span className="text-white font-bold block">{sunsetVal}</span>
                </div>
              </div>
              <div className="text-[10px] text-text-secondary font-semibold bg-white/[0.01] border border-white/5 p-2 rounded text-center">
                Golden hour begins approximately 45m before sunset.
              </div>
            </Card>

          </div>

          {/* Checked equipment logs */}
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Assigned Camera & Audio Equipment</CardTitle>
              <CardDescription className="text-[10px] mt-0.5">Live battery and checkout telemetry</CardDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {activeEquip.slice(0, 2).map((eq) => (
                <div key={eq.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-semibold block">{eq.name}</span>
                    <span className="text-[9px] text-text-secondary font-mono">{eq.qrCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-success">
                    <Battery className="w-4 h-4 shrink-0" />
                    <span className="font-bold">{eq.battery}%</span>
                  </div>
                </div>
              ))}
              {activeEquip.length === 0 && (
                <div className="col-span-2 text-[11px] text-text-secondary italic text-center py-4">No equipment checkout logs verified.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Notifications and messages panel (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider font-mono">
              <Users className="w-4 h-4" />
              <span>Crew Directory status</span>
            </div>
            <div className="space-y-3 flex flex-col max-h-[360px] overflow-y-auto scrollbar-none">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Crew Checked-in Today</span>
                <span className="text-white font-bold">{presentCrew} of {totalCrew}</span>
              </div>
              <Progress value={attendanceRate} color="primary" />
              <div className="pt-2 border-t border-white/5 space-y-2">
                {activeCrew.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex justify-between items-center text-[11px]">
                    <span className="text-white">{c.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      c.attendance === "Present" ? "bg-success/15 text-success" : "bg-white/5 text-text-secondary"
                    }`}>{c.attendance}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

      </div>
    );
  };

  // D. Editor & Post-Prod Dashboard
  const renderEditorDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Render timelines (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Proxy & Footage Transfers</CardTitle>
              <CardDescription className="text-[10px] mt-0.5">Telemetry log for post-production team</CardDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/[0.01] border border-white/5 rounded-lg p-4 space-y-1">
                <span className="text-[10px] text-text-secondary uppercase">Proxy sync</span>
                <div className="text-base font-bold text-white">98.2% Completed</div>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-lg p-4 space-y-1">
                <span className="text-[10px] text-text-secondary uppercase">Render queue</span>
                <div className="text-base font-bold text-white">3 jobs queued</div>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-lg p-4 space-y-1">
                <span className="text-[10px] text-text-secondary uppercase">Footage volume</span>
                <div className="text-base font-bold text-white">14.2 TB Logged</div>
              </div>
            </div>
          </Card>
        </div>

        {/* File Vault logs (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider font-mono">
              <HardDrive className="w-4 h-4" />
              <span>DIT Storage Volume</span>
            </div>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">DIT Vault Storage</span>
                <span className="text-white font-bold">1.4 TB / 5.0 TB</span>
              </div>
              <Progress value={28} color="primary" />
            </div>
          </Card>
        </div>

      </div>
    );
  };

  const renderRoleDashboard = () => {
    switch (memberRole) {
      case "Owner":
      case "Producer":
        return renderOwnerDashboard();
      case "Director":
      case "Writer":
        return renderDirectorDashboard();
      case "Cinematographer (DOP)":
      case "Crew":
        return renderCrewActorDashboard();
      case "Editor":
        return renderEditorDashboard();
      default:
        return renderCrewActorDashboard();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Personalized Header greeting */}
      <Card className="border-white/5 bg-gradient-to-r from-card via-card to-primary/[0.01] relative overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">
                {greeting}, {userName} 👋
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold uppercase tracking-wider font-mono">
                {memberRole}
              </span>
            </div>
            <p className="text-xs text-text-secondary max-w-xl">
              {greetingSubtitle}
            </p>
          </div>

          {/* Quick Active Campaign Selector */}
          <div className="flex flex-col gap-1 md:items-end">
            <span className="text-[10px] text-text-secondary font-mono uppercase font-bold tracking-wider">Active Workspace</span>
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 2. Weather conditions widget row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Weather Conditions panel (8 columns) */}
        <div className="md:col-span-8">
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Shooting Location Weather Telemetry ({weatherData?.name || "Tokyo"})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-text-secondary uppercase">OpenWeather live sync</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-text-secondary text-[10px] uppercase">Temperature</span>
                <div className="text-lg font-black text-white">{tempVal}°C</div>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary text-[10px] uppercase">Air Humidity</span>
                <div className="text-lg font-black text-white">{humidityVal}%</div>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary text-[10px] uppercase">Wind velocity</span>
                <div className="text-lg font-black text-white">{windVal} m/s</div>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary text-[10px] uppercase">Conditions</span>
                <div className="text-lg font-black text-primary capitalize">
                  {weatherData?.weather?.[0]?.description || "Clear sky"}
                </div>
              </div>
            </div>

            {/* Outdoor Filming Recommendation Banner */}
            <div className="bg-white/[0.01] border border-white/5 rounded-lg p-3 text-[11px] text-text-secondary">
              {shootRecommendation}
            </div>

            {/* Render 3-Day Forecast */}
            {render3DayForecastSection()}
          </Card>
        </div>

        {/* Quick Actions (4 columns) */}
        <div className="md:col-span-4">
          <Card className="bg-[#111318] border-white/5 p-5 space-y-4 flex flex-col justify-between h-full">
            <div>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Quick Actions</CardTitle>
              <CardDescription className="text-[10px] mt-0.5">Workspace controls</CardDescription>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveView("projects")}
                className="h-9 text-[10px] flex items-center justify-start gap-1.5 bg-black/20 hover:border-primary/40 border-white/5 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Project</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setActiveView("scripts")}
                className="h-9 text-[10px] flex items-center justify-start gap-1.5 bg-black/20 hover:border-primary/40 border-white/5 text-white"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Script</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setActiveView("storyboards")}
                className="h-9 text-[10px] flex items-center justify-start gap-1.5 bg-black/20 hover:border-primary/40 border-white/5 text-white"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Storyboard</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setActiveView("calendar")}
                className="h-9 text-[10px] flex items-center justify-start gap-1.5 bg-black/20 hover:border-primary/40 border-white/5 text-white"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Shoot</span>
              </Button>
            </div>
          </Card>
        </div>

      </div>

      {/* 3. Render Custom Sub-Dashboard Panel based on selected Role */}
      {renderRoleDashboard()}

    </div>
  );
};
export default DashboardView;

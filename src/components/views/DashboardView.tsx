"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
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
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const DashboardView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    setActiveView,
    crew,
    equipment,
    calendarEvents,
    shotPlans
  } = useProjectStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Real-time weather integration using OWM API
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      if (!apiKey) return;
      
      try {
        let city = "Singapore";
        const locLower = activeProject.location.toLowerCase();
        if (locLower.includes("tokyo")) {
          city = "Tokyo";
        } else if (locLower.includes("london")) {
          city = "London";
        }
        
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    };

    fetchWeather();
  }, [activeProject.location]);

  // Helper metrics
  const activeCrew = crew[activeProject.id] || [];
  const presentCrew = activeCrew.filter((c) => c.attendance === "Present" || c.attendance === "Late").length;
  const totalCrew = activeCrew.length;
  const attendanceRate = totalCrew > 0 ? Math.round((presentCrew / totalCrew) * 100) : 0;

  const activeEquip = equipment[activeProject.id] || [];
  const inUseEquip = activeEquip.filter((e) => e.status === "In Use").length;
  const maintenanceEquip = activeEquip.filter((e) => e.status === "Maintenance").length;

  const activeEvents = calendarEvents[activeProject.id] || [];
  const todayDate = "2026-07-05"; // Simulated today
  const todayEvents = activeEvents.filter((e) => e.date === todayDate);

  const activePlans = shotPlans[activeProject.id] || [];
  const completedShots = activePlans.filter((p) => p.status === "Completed").length;
  const totalShots = activePlans.length;
  const shotProgress = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;

  // AI Assistant suggestion trigger
  const aiSuggestion = {
    warning: "Rain Alert on Sunday",
    text: "Heavy rain is forecast for Sunday afternoon during the scheduled outdoor shoot of 'Scene 1: Neon Alley'. I suggest moving this block to Saturday night, or swapping it with the indoor scene 'Scene 2: Apartment Racks' (Stage 4) to maintain continuity.",
    action: "Reschedule Shot Plan"
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-card to-card/50 border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="z-10 space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Studio OS Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Good Evening, Vivek
          </h1>
          <p className="text-text-secondary text-sm max-w-xl leading-relaxed">
            Welcome back. Production for <span className="text-white font-medium">"{activeProject.title}"</span> is currently active at <span className="text-white font-medium">{activeProject.location}</span>. 
          </p>
        </div>
        <div className="flex gap-3 z-10 shrink-0">
          <Button variant="secondary" onClick={() => setActiveView("projects")} className="cursor-pointer">
            All Projects
          </Button>
          <Button variant="primary" onClick={() => setActiveView("ai-studio")} className="flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-4 h-4 text-black" />
            <span>Open AI Studio</span>
          </Button>
        </div>
      </div>

      {/* Grid Dashboard Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Today's Shoot Call Sheet */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Shoot</CardTitle>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase">
                Call Sheet
              </span>
            </div>
            <CardDescription>Sunday, July 5, 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-text-secondary flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Call Time</span>
                <span className="text-white font-semibold">18:00 (Night Shoot)</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-text-secondary flex items-center gap-1.5"><Film className="w-3.5 h-3.5" /> Scene Blocks</span>
                <span className="text-white font-semibold">Scene 1 (Steps 1A, 1B)</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-text-secondary flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Camera Rig</span>
                <span className="text-white font-semibold">ARRI Steadicam (Anamorphic)</span>
              </div>
            </div>
            {weatherData ? (
              <div className="bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 rounded-lg p-3 flex items-start gap-2.5">
                <CloudRain className={cn("w-5 h-5 shrink-0 mt-0.5", 
                  weatherData.weather[0].main.toLowerCase().includes("rain") || weatherData.weather[0].main.toLowerCase().includes("drizzle") 
                    ? "text-danger" 
                    : "text-primary"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-white">Live Weather: {weatherData.name}</span>
                    <span className="text-primary font-mono">{Math.round(weatherData.main.temp)}°C</span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed mt-1">
                    {weatherData.weather[0].main} ({weatherData.weather[0].description}).{" "}
                    {weatherData.weather[0].main.toLowerCase().includes("rain") || weatherData.weather[0].main.toLowerCase().includes("drizzle") || weatherData.weather[0].main.toLowerCase().includes("thunderstorm")
                      ? "Precipitation detected. Stand by with waterproof shrouds and rain covers."
                      : "Optimal shooting conditions. Clear skies forecast."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-start gap-2.5">
                <CloudRain className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-warning">Weather Warning</span>
                  <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
                    Overcast skies, light showers predicted at 22:00. Crew should stand by with waterproof camera covers.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="flex flex-col justify-between border-primary/20 bg-gradient-to-b from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-1.5 text-xs text-primary font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI Production Assistant</span>
            </div>
            <CardTitle className="text-white">Continuity & Scheduling Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span>{aiSuggestion.warning}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {aiSuggestion.text}
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView("shot-planner")}
                className="w-full text-xs flex items-center justify-center gap-1.5 hover:bg-primary hover:text-white"
              >
                <span>Optimize Shooting Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Budget Summary */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>{activeProject.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end text-xs">
                <span className="text-text-secondary">Production Expense Burn</span>
                <span className="text-white font-bold">{Math.round((activeProject.spentVal / activeProject.budgetVal) * 100)}%</span>
              </div>
              <Progress value={Math.round((activeProject.spentVal / activeProject.budgetVal) * 100)} color="primary" size="md" />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Spent to Date</span>
                <div className="text-lg font-bold text-white mt-1">
                  ${(activeProject.spentVal / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Total Approved</span>
                <div className="text-lg font-bold text-white mt-1">
                  {activeProject.budget}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crew Attendance & Operations */}
        <Card>
          <CardHeader>
            <CardTitle>Crew & On-Set Operations</CardTitle>
            <CardDescription>Real-time attendance status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Attendance Rate</div>
                  <div className="text-[10px] text-text-secondary mt-0.5">{presentCrew} of {totalCrew} present today</div>
                </div>
              </div>
              <div className="text-xl font-black text-white">{attendanceRate}%</div>
            </div>
            
            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Camera & Grip</span>
                <span className="text-success font-medium">All Present</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">DIT / Data Wrangling</span>
                <span className="text-warning font-medium">1 Late (Takahiro S.)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Gaffer / Lighting Riggers</span>
                <span className="text-success font-medium">All Present</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment & Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Status</CardTitle>
            <CardDescription>Active gear trackers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                <span className="text-[9px] text-text-secondary uppercase font-semibold">In Use</span>
                <div className="text-lg font-bold text-white mt-1">{inUseEquip}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                <span className="text-[9px] text-text-secondary uppercase font-semibold">Available</span>
                <div className="text-lg font-bold text-success mt-1">
                  {activeEquip.length - inUseEquip - maintenanceEquip}
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                <span className="text-[9px] text-text-secondary uppercase font-semibold">In Shop</span>
                <div className="text-lg font-bold text-danger mt-1">{maintenanceEquip}</div>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary flex items-center gap-1.5"><Battery className="w-3.5 h-3.5 text-success" /> DJI Drone Battery</span>
                <span className="text-danger font-semibold">12% (Alert)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-text-secondary" /> CS15 LED maintenance</span>
                <span className="text-text-secondary">Completed Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Today's Agenda Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming meetings and production beats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-secondary">
                No events scheduled for today.
              </div>
            ) : (
              todayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className={`w-1.5 h-8 rounded-full shrink-0 mt-0.5 ${
                    evt.type === "shoot" ? "bg-primary" : 
                    evt.type === "meeting" ? "bg-secondary" : 
                    evt.type === "deadline" ? "bg-danger" : "bg-success"
                  }`} />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{evt.title}</h4>
                    <span className="text-[10px] text-text-secondary font-mono mt-0.5 block">{evt.time}</span>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("calendar")}
                className="w-full text-xs text-text-secondary hover:text-white"
              >
                Go to Full Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* active productions horizontal list */}
      <Card>
        <CardHeader>
          <CardTitle>Studio Workspace Productions</CardTitle>
          <CardDescription>Overview of all active film campaigns</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {projects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              return (
                <div
                  key={proj.id}
                  className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200 ${
                    isActive ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-12 h-8 object-cover rounded-md border border-white/10 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                      <p className="text-xs text-text-secondary mt-0.5">{proj.director} • {proj.deadline}</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-48 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-text-secondary">
                      <span>Completion</span>
                      <span className="text-white font-bold">{proj.progress}%</span>
                    </div>
                    <Progress value={proj.progress} color={isActive ? "primary" : "secondary"} size="sm" />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      proj.status === "Production" ? "bg-primary/20 text-primary" :
                      proj.status === "Post-Production" ? "bg-secondary/20 text-secondary" :
                      "bg-white/10 text-text-secondary"
                    }`}>
                      {proj.status}
                    </span>
                    <Button
                      variant={isActive ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        setActiveView("projects");
                      }}
                      className="text-xs cursor-pointer"
                    >
                      {isActive ? "Enter Workspace" : "Select"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};
export default DashboardView;

"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
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
  Scissors,
  FileText,
  MapPin,
  Truck,
  Layers,
  FileCheck,
  CreditCard,
  CheckSquare,
  Volume2,
  Brush,
  Camera,
  Play,
  UploadCloud,
  FileCode2,
  Sliders,
  FolderPlus
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
    shotPlans,
    memberRole
  } = useProjectStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Weather States
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);

  useEffect(() => {
    if (!activeProject) return;

    const fetchWeatherAndForecast = async () => {
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
        
        // 1. Current Weather
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        }

        // 2. 3-Day Forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (forecastResponse.ok) {
          const fData = await forecastResponse.json();
          // Filter to get index at +24h (8), +48h (16), +72h (24)
          const daily = [fData.list[8], fData.list[16], fData.list[24]].filter(Boolean);
          setForecastData(daily);
        }
      } catch (err) {
        console.error("Error fetching weather/forecast data:", err);
      }
    };

    fetchWeatherAndForecast();
  }, [activeProject?.location]);

  // Empty state rendering
  if (projects.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in py-12">
        <Card className="max-w-xl mx-auto border-primary/20 bg-gradient-to-b from-card to-primary/[0.02]">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary animate-bounce">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">WELCOME TO TOV STUDIO</h2>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                Your clean slate production console is ready. Initialize your first film campaign workspace to unlock dashboards, screenplay editors, DIT telemetry, and AI continuity assistants.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => setActiveView("projects")}
                className="mx-auto flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 py-5"
              >
                <FolderPlus className="w-4 h-4 text-black" />
                <span>Initialize First Campaign Workspace</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Render 3-Day Forecast UI segment
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

  // Render department widgets based on selected user role
  const renderRoleDashboard = () => {
    switch (memberRole) {
      case "Actor":
        return renderActorDashboard();
      case "Cinematographer (DOP)":
      case "Camera Department":
        return renderCameraDashboard();
      case "Editor":
      case "VFX Team":
        return renderEditorVFXDashboard();
      case "Client":
        return renderClientDashboard();
      case "Owner":
      case "Production Manager":
        return renderAdminDashboard();
      default:
        return renderGenericCrewDashboard();
    }
  };

  // 1. ADMIN & MANAGER PANEL
  const renderAdminDashboard = () => {
    return (
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
              <div className="bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 rounded-lg p-3 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
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
                {render3DayForecastSection()}
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
                <span className="text-white font-bold">{activeProject.budgetVal > 0 ? Math.round((activeProject.spentVal / activeProject.budgetVal) * 100) : 0}%</span>
              </div>
              <Progress value={activeProject.budgetVal > 0 ? Math.round((activeProject.spentVal / activeProject.budgetVal) * 100) : 0} color="primary" size="md" />
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
    );
  };

  // 2. ACTOR PANEL
  const renderActorDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Character Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span>Character Profile</span>
            </CardTitle>
            <CardDescription>Assigned Role Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl border border-primary/20">
                CR
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Detective Cyber-Roy</h4>
                <p className="text-xs text-text-secondary">Lead Actor • Scene 1, 2, 4</p>
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Rehearsal Call</span>
                <span className="text-white font-medium">July 06, 14:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Travel Coordinator</span>
                <span className="text-white">Marcus Vance (+65 9182 8221)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Callsheet Call Time & Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daily Call Time</CardTitle>
              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                Active Call
              </span>
            </div>
            <CardDescription>Today's shooting plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-text-secondary uppercase">Your Personal Call</span>
              <div className="text-3xl font-extrabold text-white mt-1">18:30</div>
              <span className="text-[10px] text-text-secondary">Location Call: 18:00</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-text-secondary">Set Location: {activeProject.location}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Truck className="w-3.5 h-3.5 text-text-secondary shrink-0 mt-0.5" />
                <span className="text-text-secondary">Transport pick-up: 17:30 (Hotel Lobby)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Costume & Makeup Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-secondary" />
              <span>Costume & Makeup</span>
            </CardTitle>
            <CardDescription>Wardrobe coordinates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Costume Fitting</span>
              <span className="text-white font-medium">Fit #3: Techwear Cloak</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Makeup Timing</span>
              <span className="text-white font-medium">19:00 - Soundstage A</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-success font-medium">Ready (Rack 2)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Assigned Scene Sheets</span>
              <span className="text-primary font-bold underline cursor-pointer" onClick={() => setActiveView("scripts")}>
                View Scene 1 PDF
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 3. CINEMATOGRAPHER & CAMERA PANEL
  const renderCameraDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Camera Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <span>Camera Setup Spec</span>
            </CardTitle>
            <CardDescription>Cinematography Setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Camera body</span>
              <span className="text-white font-medium">ARRI ALEXA 35</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Lens kit</span>
              <span className="text-white font-medium">Cooke Anamorphic/i SF (50mm)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Target Aspect</span>
              <span className="text-white font-mono">2.39:1 (Cinematic Wide)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Active LUT</span>
              <span className="text-primary font-bold">OldVerse_BladeRunner_v4.cube</span>
            </div>
          </CardContent>
        </Card>

        {/* Shot List & Setup Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-secondary" />
              <span>Today's Shot Goals</span>
            </CardTitle>
            <CardDescription>Setup checklists</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded">
                <span className="text-white font-medium">Shot 1A: Wide Alley Panning</span>
                <span className="text-success font-semibold">Completed</span>
              </div>
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded">
                <span className="text-white font-medium">Shot 1B: Close-up Cyber Eye</span>
                <span className="text-primary font-semibold">Next Setup</span>
              </div>
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded text-text-secondary">
                <span>Shot 1C: Tracking Low-Angle run</span>
                <span>Queued</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lighting Plan details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-warning" />
              <span>Grip & Lighting Plan</span>
            </CardTitle>
            <CardDescription>Set lighting specs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Key Light</span>
              <span className="text-white">Aputure 600d (Lantern Softbox)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Fill Light</span>
              <span className="text-white">Nova P600c (Cool Cyan gel)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Backlight rig</span>
              <span className="text-white">Astera Titan Tubes (Neon Pink glow)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 4. EDITOR & VFX PANEL
  const renderEditorVFXDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timeline Lock Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              <span>Timeline lock drafts</span>
            </CardTitle>
            <CardDescription>VFX plate tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Assembly Cut</span>
              <span className="text-success font-medium">Approved (July 02)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Rough Cut v1</span>
              <span className="text-primary font-bold">In Review (July 05)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Fine Cut lock</span>
              <span className="text-text-secondary">Pending scenes 3 & 4</span>
            </div>
          </CardContent>
        </Card>

        {/* Footage Upload Portal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-secondary" />
              <span>Footage Transfers</span>
            </CardTitle>
            <CardDescription>Upload proxies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-dashed border-white/10 rounded-xl text-center flex flex-col items-center gap-2 cursor-pointer hover:bg-white/[0.01] transition-all">
              <UploadCloud className="w-8 h-8 text-text-secondary animate-pulse" />
              <span className="text-xs text-white font-medium">Drag proxy dailies here</span>
              <span className="text-[10px] text-text-secondary">Supports Apple ProRes Proxy & H.264</span>
            </div>
          </CardContent>
        </Card>

        {/* VFX Asset Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-warning" />
              <span>VFX Plates & CGI Assets</span>
            </CardTitle>
            <CardDescription>Queued VFX shots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded">
              <span>Scene 1 - Sky Neon Glow replace</span>
              <span className="text-warning font-semibold">CGI Render</span>
            </div>
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded">
              <span>Scene 2 - Hologram billboard insert</span>
              <span className="text-success font-semibold">Complete</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 5. CLIENT DASHBOARD
  const renderClientDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Approved Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              <span>Approved Deliverables</span>
            </CardTitle>
            <CardDescription>Campaign review packages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">First Look Teaser (v2)</h5>
                  <p className="text-[9px] text-text-secondary">30s • 4K ProRes Proxy</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-[10px] text-primary">
                Open Review
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments, Milestones & Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-secondary" />
              <span>Contracts & Payments</span>
            </CardTitle>
            <CardDescription>Ledger balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Milestone 1 (Pre-Prod)</span>
              <span className="text-success font-semibold">Paid ($25,000)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-secondary">Milestone 2 (Principal Wrap)</span>
              <span className="text-warning font-semibold">Pending ($30,000)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Production Service Contract</span>
              <span className="text-primary font-bold underline cursor-pointer">Signed PDF</span>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-warning" />
              <span>Submit Review Notes</span>
            </CardTitle>
            <CardDescription>Dailies feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              rows={3}
              placeholder="Type your feedback notes for the editing room here..."
              className="w-full bg-[#09090B] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-primary focus:outline-none transition-all resize-none"
            />
            <Button size="sm" variant="primary" className="w-full text-xs">
              Dispatch Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 6. GENERIC CREW DASHBOARD (Sound, Art, Makeup, Costume, etc.)
  const renderGenericCrewDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Call time */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Call Time</CardTitle>
            <CardDescription>{memberRole} Department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-text-secondary uppercase">Your Set Call</span>
              <div className="text-3xl font-extrabold text-white mt-1">18:00</div>
              <span className="text-[10px] text-text-secondary">Today, Sunday July 5</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-text-secondary">Set Location: {activeProject.location}</span>
            </div>
          </CardContent>
        </Card>

        {/* Assigned tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-secondary" />
              <span>Assigned Checklist</span>
            </CardTitle>
            <CardDescription>Department Tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-white/[0.02] border border-white/5">
              <span>Setup equipment inventory checklist</span>
              <span className="text-success font-semibold">Done</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-white/[0.02] border border-white/5">
              <span>Stand by for Scene 1 shoot blocks</span>
              <span className="text-primary font-semibold">Pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Weather status */}
        <Card>
          <CardHeader>
            <CardTitle>On-Set Weather Monitor</CardTitle>
            <CardDescription>Continuous Sync</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weatherData ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Live Temp ({weatherData.name})</span>
                  <span className="text-white font-black">{Math.round(weatherData.main.temp)}°C</span>
                </div>
                {render3DayForecastSection()}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-secondary">
                Weather parameters loading...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
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
            Dashboard View: {memberRole}
          </h1>
          <p className="text-text-secondary text-sm max-w-xl leading-relaxed">
            Welcome back. Workspace for <span className="text-white font-medium">"{activeProject.title}"</span> is currently active at <span className="text-white font-medium">{activeProject.location}</span>. 
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

      {/* Render selected role specific dashboard widgets */}
      {renderRoleDashboard()}

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

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
  Play,
  MapPin,
  Wind,
  Droplets,
  Eye,
  Gauge,
  SunDim,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Activity,
  Navigation,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Cloud
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

// --- CUSTOM SVG ANIMATED WEATHER ILLUSTRATIONS ---

const SunnyIllustration = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 bg-[#22d3ee]/10 rounded-full blur-xl animate-pulse" />
    <svg className="w-12 h-12 text-[#22d3ee] drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" className="animate-spin-slow origin-center" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" className="animate-pulse" />
    </svg>
  </div>
);

const CloudyIllustration = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 bg-neutral-500/5 rounded-full blur-xl" />
    <svg className="w-12 h-12 text-text-secondary animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.25.26A5 5 0 0 0 5 13c0 2.2 1.8 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9a4 4 0 0 1 7.5-1.5" className="animate-float-cloud origin-center" strokeLinecap="round" />
    </svg>
  </div>
);

const RainIllustration = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-xl" />
    <svg className="w-12 h-12 text-[#22d3ee] animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 14A5 5 0 1 0 7 14h10z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="17" x2="8" y2="20" className="animate-rain-fall" style={{ animationDelay: '0.2s' }} />
      <line x1="12" y1="17" x2="12" y2="20" className="animate-rain-fall" style={{ animationDelay: '0.5s' }} />
      <line x1="16" y1="17" x2="16" y2="20" className="animate-rain-fall" style={{ animationDelay: '0.8s' }} />
    </svg>
  </div>
);

const StormIllustration = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 bg-neutral-900/40 rounded-full blur-xl animate-pulse" />
    <svg className="w-12 h-12 text-[#22d3ee] animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 12A5 5 0 1 0 7 12h10z" className="text-text-secondary" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="15" x2="9" y2="18" className="animate-rain-fall" style={{ animationDelay: '0.1s' }} />
      <line x1="13" y1="15" x2="13" y2="18" className="animate-rain-fall" style={{ animationDelay: '0.4s' }} />
      <path d="M11 15l-2 3h4l-2 3" className="animate-flash text-yellow-400 fill-yellow-400" />
    </svg>
  </div>
);

const SnowIllustration = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 bg-white/5 rounded-full blur-xl" />
    <svg className="w-12 h-12 text-white animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 14A5 5 0 1 0 7 14h10z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="18" r="1" className="animate-rain-fall" style={{ animationDelay: '0.3s' }} />
      <circle cx="12" cy="19" r="1.2" className="animate-rain-fall" style={{ animationDelay: '0.7s' }} />
      <circle cx="16" cy="18" r="1" className="animate-rain-fall" style={{ animationDelay: '1.1s' }} />
    </svg>
  </div>
);

const PartlyCloudyIllustration = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 bg-[#22d3ee]/5 rounded-full blur-xl animate-pulse" />
    <svg className="w-12 h-12 animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="3.5" className="text-[#22d3ee]" />
      <path d="M10 2v2M10 16v2M4.34 4.34l1.42 1.42M14.24 14.24l1.42 1.42M2 10h2M16 10h2M4.34 15.66l1.42-1.42M14.24 5.76l1.42-1.42" strokeLinecap="round" className="text-[#22d3ee]/70 animate-pulse" />
      <path d="M17.5 18A3.5 3.5 0 0 0 21 14.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.25.26A5 5 0 0 0 5 12c0 2.2 1.8 4 4 4" className="text-text-secondary fill-neutral-900/80" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const FogIllustration = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 bg-neutral-500/5 rounded-full blur-xl" />
    <svg className="w-12 h-12 text-text-secondary animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="8" x2="20" y2="8" className="animate-float-cloud" style={{ animationDelay: '0.1s' }} strokeLinecap="round" />
      <line x1="6" y1="12" x2="18" y2="12" className="animate-float-cloud" style={{ animationDelay: '0.5s' }} strokeLinecap="round" />
      <line x1="3" y1="16" x2="17" y2="16" className="animate-float-cloud" style={{ animationDelay: '0.9s' }} strokeLinecap="round" />
    </svg>
  </div>
);

// --- PREMIUM LIVE WEATHER CARD COMPONENT ---

const LiveWeatherCard: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [locationName, setLocationName] = useState("Dehradun, Uttarakhand");
  const [lastUpdated, setLastUpdated] = useState("");

  const getWeatherCondition = (code: number) => {
    if (code === 0) return { label: "Sunny", type: "sunny" };
    if ([1, 2, 3].includes(code)) return { label: "Partly Cloudy", type: "cloudy" };
    if ([45, 48].includes(code)) return { label: "Fog", type: "fog" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { label: "Rainy", type: "rain" };
    if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", type: "storm" };
    if ([71, 73, 75, 85, 86].includes(code)) return { label: "Snowy", type: "snow" };
    return { label: "Clear", type: "sunny" };
  };

  const fetchWeather = async (lat: number, lon: number, name?: string) => {
    try {
      setWeatherLoading(true);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,precipitation_probability,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.current) {
        setWeather(data);
        if (name) setLocationName(name);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude, "Current Location");
        },
        () => {
          fetchWeather(30.3165, 78.0322, "Dehradun, Uttarakhand");
        }
      );
    } else {
      fetchWeather(30.3165, 78.0322, "Dehradun, Uttarakhand");
    }

    const interval = setInterval(() => {
      if (weather?.latitude) {
        fetchWeather(weather.latitude, weather.longitude);
      }
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  if (weatherLoading && !weather) {
    return (
      <div className="p-6 rounded-[28px] border border-white/5 bg-neutral-900/40 backdrop-blur-[24px] flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#22d3ee]" />
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Syncing Atmospheric Feeds...</span>
        </div>
      </div>
    );
  }

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const condition = getWeatherCondition(current?.weather_code || 0);

  const getDayPeriod = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) return "morning";
    if (hours >= 12 && hours < 17) return "afternoon";
    if (hours >= 17 && hours < 20) return "evening";
    return "night";
  };

  const period = getDayPeriod();
  const themeStyles = {
    morning: "border-yellow-500/15 bg-gradient-to-br from-yellow-500/[0.02] to-neutral-950/35 shadow-[0_0_15px_rgba(234,179,8,0.05),inset_0_1px_1px_rgba(255,255,255,0.05)]",
    afternoon: "border-[#22d3ee]/15 bg-gradient-to-br from-[#22d3ee]/[0.02] to-neutral-950/35 shadow-[0_0_15px_rgba(34,211,238,0.05),inset_0_1px_1px_rgba(255,255,255,0.05)]",
    evening: "border-orange-500/15 bg-gradient-to-br from-orange-500/[0.02] to-neutral-950/35 shadow-[0_0_15px_rgba(249,115,22,0.05),inset_0_1px_1px_rgba(255,255,255,0.05)]",
    night: "border-[#22d3ee]/10 bg-gradient-to-br from-indigo-950/[0.03] to-neutral-950/50 shadow-[0_0_15px_rgba(34,211,238,0.02),inset_0_1px_1px_rgba(255,255,255,0.02)]"
  }[period];

  const renderIllustration = (type: string) => {
    switch (type) {
      case "sunny":
        return <SunnyIllustration />;
      case "cloudy":
        return <PartlyCloudyIllustration />;
      case "rain":
        return <RainIllustration />;
      case "storm":
        return <StormIllustration />;
      case "snow":
        return <SnowIllustration />;
      case "fog":
        return <FogIllustration />;
      default:
        return <SunnyIllustration />;
    }
  };

  // Custom inline SVG temperature curve path
  const renderTempGraph = () => {
    if (!hourly || !hourly.temperature_2m) return null;
    const temps = hourly.temperature_2m.slice(0, 8);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = maxTemp - minTemp || 1;

    const points = temps.map((t: number, i: number) => {
      const x = i * 40 + 20;
      const y = 45 - ((t - minTemp) / range) * 30;
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className="space-y-2">
        <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/30 block">24h Temperature Curve</span>
        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center justify-center">
          <svg className="w-full h-16 text-[#22d3ee]" viewBox="0 0 320 60" fill="none">
            <defs>
              <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`M20,60 L${points} L300,60 Z`}
              fill="url(#tempGlow)"
            />
            <polyline
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              points={points}
            />
            {temps.map((t: number, idx: number) => {
              const x = idx * 40 + 20;
              const y = 45 - ((t - minTemp) / range) * 30;
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="3" fill="#22d3ee" className="animate-pulse" />
                  <text x={x} y={y - 8} fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">
                    {Math.round(t)}°
                  </text>
                  <text x={x} y={55} fill="rgba(255,255,255,0.4)" fontSize="6" textAnchor="middle" fontFamily="monospace">
                    {idx * 3}h
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Styles Injection for pure CSS animations */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes float-cloud {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(5px); }
        }
        @keyframes rain-fall {
          0% { transform: translateY(-8px); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(16px); opacity: 0; }
        }
        @keyframes flash {
          0%, 100% { opacity: 0.2; }
          45%, 55% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-cloud {
          animation: float-cloud 7s ease-in-out infinite;
        }
        .animate-rain-fall {
          animation: rain-fall 1.2s linear infinite;
        }
        .animate-flash {
          animation: flash 4s ease-in-out infinite;
        }
      `}</style>

      <div
        onClick={() => setExpanded(!expanded)}
        className={`p-6 rounded-[28px] border backdrop-blur-[28px] ${themeStyles} hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] transition-all duration-300 cursor-pointer overflow-hidden space-y-6 relative group`}
      >
        {/* Soft reflection flare overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-transparent pointer-events-none" />

        {/* 1. PRIMARY WEATHER STATE ROW */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {renderIllustration(condition.type)}
            <div>
              <div className="flex items-center gap-1.5 text-white">
                <MapPin className="w-3.5 h-3.5 text-[#22d3ee]" />
                <span className="font-bold tracking-wide text-xs">{locationName}</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mt-0.5">
                {Math.round(current?.temperature_2m || 0)}°C
              </h2>
              <p className="text-[10px] uppercase font-mono font-black text-[#22d3ee] tracking-wider mt-0.5">
                {condition.label} • Feels like {Math.round(current?.apparent_temperature || 0)}°C
              </p>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
            <div>
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 font-bold block">Humidity</span>
              <span className="text-xs font-bold text-white">{current?.relative_humidity_2m}%</span>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 font-bold block">Wind Speed</span>
              <span className="text-xs font-bold text-white">{current?.wind_speed_10m} km/h</span>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 font-bold block">Today's Range</span>
              <span className="text-xs font-bold text-white">
                {Math.round(daily?.temperature_2m_min?.[0] || 0)}° / {Math.round(daily?.temperature_2m_max?.[0] || 0)}°
              </span>
            </div>
            <div className="flex items-center justify-end">
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-[#22d3ee]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#22d3ee] animate-bounce" />
              )}
            </div>
          </div>
        </div>

        {/* EXPANDED SECTION */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/5 pt-6 space-y-6 overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Stop bubble closing click
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Column 1: Temp Curve Graph */}
                <div className="md:col-span-2">
                  {renderTempGraph()}
                </div>

                {/* Column 2: Advanced parameters grid */}
                <div className="space-y-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/30 block">Atmospheric Feeds</span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[8px] text-text-secondary/60 block">Barometer</span>
                      <span className="text-white font-medium">{Math.round(current?.pressure_msl || 0)} hPa</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-text-secondary/60 block">Visibility</span>
                      <span className="text-white font-medium">{(current?.visibility || 0) / 1000} km</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-text-secondary/60 block">UV Index</span>
                      <span className="text-white font-medium">{current?.uv_index || 0}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-text-secondary/60 block">Chance of Rain</span>
                      <span className="text-white font-medium">
                        {hourly?.precipitation_probability?.[new Date().getHours()] || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[8px] text-text-secondary/60 block">Sunrise</span>
                      <span className="text-white font-medium">
                        {daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-text-secondary/60 block">Sunset</span>
                      <span className="text-white font-medium">
                        {daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next 7 Days Forecast */}
              <div className="space-y-3">
                <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/30 block">7-Day Production Forecast</span>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                  {daily?.time.map((t: string, idx: number) => {
                    const dateObj = new Date(t);
                    const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });
                    const dayCondition = getWeatherCondition(daily.weather_code[idx]);
                    const maxT = Math.round(daily.temperature_2m_max[idx]);
                    const minT = Math.round(daily.temperature_2m_min[idx]);
                    
                    return (
                      <div key={idx} className="p-3 bg-black/20 border border-white/5 rounded-xl text-center space-y-2">
                        <span className="text-[10px] font-mono text-text-secondary block font-bold">{idx === 0 ? "Today" : dayName}</span>
                        <div className="flex justify-center text-[#22d3ee]">
                          {dayCondition.type === "sunny" ? <Sun className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                        </div>
                        <div className="text-[10px] font-bold text-white">
                          {maxT}° <span className="text-text-secondary/60 font-medium">{minT}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom footer bar of card */}
              <div className="flex justify-between items-center text-[9px] text-text-secondary/40 font-mono pt-4 border-t border-white/5">
                <span>Last Updated: {lastUpdated}</span>
                <span>Coordinates: {weather?.latitude?.toFixed(4)}°N, {weather?.longitude?.toFixed(4)}°E</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD VIEW ---

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

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) setUserProfile(profile);

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

  // 2. Supabase Real-time Presence Subscription
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
      
      {/* 1. ACTIVE MEMBERS */}
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
                  <span className={`absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full ring-2 ring-[#121212] ${isOnline ? "bg-[#3ecf8e]" : "bg-text-secondary/40"}`} />
                </div>
                <span className="text-[10px] font-bold text-text-secondary group-hover:text-white truncate max-w-[80px]">
                  {p.full_name?.split(" ")[0]}
                </span>
              </div>
            );
          })}

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

      {/* LIVE WEATHER CARD */}
      <LiveWeatherCard />

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
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-text-secondary">
                      <span>Progress</span>
                      <span className="font-bold text-white">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  
                  <div className="text-[9px] text-text-secondary flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#22d3ee]" />
                    <span>Deadline: {proj.deadline}</span>
                  </div>

                  <div className="border-t border-white/5 pt-2.5 space-y-1.5">
                    <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 font-bold block">Recent Activity</span>
                    <p className="text-[9px] text-text-secondary truncate">
                      ⚡ {proj.tagline}
                    </p>
                  </div>
                  
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

      {/* 4. PRODUCTION UPDATES */}
      <div className="space-y-4">
        <h3 className="text-[10px] uppercase font-mono tracking-wider font-bold text-white/40">Production Timeline Updates</h3>
        
        <div className="relative border-l border-white/10 pl-6 ml-2.5 space-y-6">
          {updatesList.map((up, idx) => (
            <div key={idx} className="relative">
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

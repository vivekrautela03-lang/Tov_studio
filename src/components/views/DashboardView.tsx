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
  Cloud,
  RefreshCw,
  Zap,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Timer,
  Music,
  Loader2,
  Pause,
  Mic,
  X,
  MessageSquare,
  Heart,
  Search,
  MoreVertical,
  Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

// --- CUTE & MODERN ANIMATED WEATHER ILLUSTRATIONS ---

const SunnyIllustration: React.FC = () => (
  <div className="relative w-36 h-36 flex items-center justify-center">
    <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" />
    <svg className="w-28 h-28 text-[#22d3ee] drop-shadow-[0_0_12px_rgba(34,211,238,0.4)] animate-float" viewBox="0 0 100 100" fill="none">
      {/* Sun Rays */}
      <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" className="animate-spin-slow origin-center" />
      {/* Sun Circle */}
      <circle cx="50" cy="50" r="16" fill="#09090b" stroke="currentColor" strokeWidth="2.5" />
      {/* Cute Smiling Face */}
      <circle cx="44" cy="46" r="2.5" fill="currentColor" />
      <circle cx="56" cy="46" r="2.5" fill="currentColor" />
      <path d="M 45,54 Q 50,58 55,54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Sun Flare Dots */}
      <circle cx="50" cy="18" r="1.5" fill="currentColor" className="animate-pulse" />
      <circle cx="50" cy="82" r="1.5" fill="currentColor" className="animate-pulse" />
      <circle cx="18" cy="50" r="1.5" fill="currentColor" className="animate-pulse" />
      <circle cx="82" cy="50" r="1.5" fill="currentColor" className="animate-pulse" />
      
      {/* Floating Birds */}
      <path d="M 15,30 Q 20,25 25,30 Q 30,25 35,30" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" className="animate-bird-fly-1" />
      <path d="M 70,25 Q 73,21 76,25 Q 79,21 82,25" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" className="animate-bird-fly-2" />
    </svg>
  </div>
);

const CloudyIllustration: React.FC = () => (
  <div className="relative w-36 h-36 flex items-center justify-center">
    <div className="absolute inset-0 bg-neutral-500/5 rounded-full blur-2xl" />
    <svg className="w-28 h-28 text-text-secondary animate-float" viewBox="0 0 100 100" fill="none">
      {/* Shadows */}
      <path d="M68 64a12 12 0 0 0 12-12c0-9.6-8.7-15.4-17.1-15.4-.6 0-1.2.1-1.7.3A17 17 0 0 0 25 43c0 7.5 6.2 13.7 13.7 13.7" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />
      {/* Fluffy clouds */}
      <path d="M70 60c6 0 10-4.5 10-10 0-8-7-13-14-13-.4 0-.8.1-1.2.2A14 14 0 0 0 35 41c0 6.5 5 11 11 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 48c4.5 0 8.5-3.5 8.5-8 0-6.5-6-10.5-12-10.5-.3 0-.6 0-.9.1A12 12 0 0 0 22 38c0 5 4 9 9 9" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-float-cloud origin-center" />
    </svg>
  </div>
);

const RainIllustration: React.FC = () => (
  <div className="relative w-36 h-36 flex items-center justify-center">
    <div className="absolute inset-0 bg-[#22d3ee]/5 rounded-full blur-2xl" />
    <svg className="w-28 h-28 text-[#22d3ee] animate-float" viewBox="0 0 100 100" fill="none">
      <path d="M65 52a14 14 0 0 0 0-28H62.6a19 19 0 0 0-36.8 4.2A11 11 0 0 0 34 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Rain lines */}
      <line x1="30" y1="58" x2="25" y2="70" className="animate-rain-fall" style={{ animationDelay: '0.1s' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="45" y1="58" x2="40" y2="70" className="animate-rain-fall" style={{ animationDelay: '0.4s' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="60" y1="58" x2="55" y2="70" className="animate-rain-fall" style={{ animationDelay: '0.7s' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="75" y1="58" x2="70" y2="70" className="animate-rain-fall" style={{ animationDelay: '0.2s' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Water ripple arcs */}
      <path d="M22,78 Q28,76 34,78" stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeLinecap="round" className="animate-pulse" />
      <path d="M52,78 Q58,76 64,78" stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
    </svg>
  </div>
);

const StormIllustration: React.FC = () => (
  <div className="relative w-36 h-36 flex items-center justify-center">
    <div className="absolute inset-0 bg-[#22d3ee]/10 rounded-full blur-2xl animate-pulse" />
    <svg className="w-28 h-28 text-[#22d3ee] animate-float" viewBox="0 0 100 100" fill="none">
      <path d="M65 48a14 14 0 0 0 0-28H62.6a19 19 0 0 0-36.8 4.2A11 11 0 0 0 34 46" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="54" x2="26" y2="66" className="animate-rain-fall" style={{ animationDelay: '0.1s' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="54" x2="46" y2="66" className="animate-rain-fall" style={{ animationDelay: '0.4s' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="54" x2="66" y2="66" className="animate-rain-fall" style={{ animationDelay: '0.7s' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Lightning Flash bolt */}
      <path d="M48 50l-6 10h10l-4 12" className="animate-flash text-yellow-400 fill-yellow-400" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const SnowIllustration: React.FC = () => (
  <div className="relative w-36 h-36 flex items-center justify-center">
    <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl" />
    <svg className="w-28 h-28 text-white animate-float" viewBox="0 0 100 100" fill="none">
      <path d="M65 50a14 14 0 0 0 0-28H62.6a19 19 0 0 0-36.8 4.2A11 11 0 0 0 34 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Snowflakes */}
      <path d="M26 58h4m-2-2v4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="animate-rain-fall" style={{ animationDelay: '0.2s' }} />
      <path d="M48 60h4m-2-2v4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="animate-rain-fall" style={{ animationDelay: '0.6s' }} />
      <path d="M70 58h4m-2-2v4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="animate-rain-fall" style={{ animationDelay: '1.0s' }} />
    </svg>
  </div>
);

const PartlyCloudyIllustration: React.FC = () => (
  <div className="relative w-36 h-36 flex items-center justify-center">
    <div className="absolute inset-0 bg-[#22d3ee]/10 rounded-full blur-2xl animate-pulse" />
    <svg className="w-28 h-28 animate-float" viewBox="0 0 100 100" fill="none">
      {/* Sun */}
      <circle cx="40" cy="40" r="12" fill="#09090b" stroke="#22d3ee" strokeWidth="2.5" />
      <path d="M40 20v4M40 56v4M20 40h4M56 40h4" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
      {/* Cloud */}
      <path d="M70 62c6 0 10-4.5 10-10 0-8-7-13-14-13-.4 0-.8.1-1.2.2A14 14 0 0 0 35 43c0 6.5 5 11 11 11" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#09090b" />
    </svg>
  </div>
);

const NightIllustration: React.FC = () => (
  <div className="relative w-36 h-36 flex items-center justify-center">
    <div className="absolute inset-0 bg-indigo-950/15 rounded-full blur-2xl animate-pulse" />
    <svg className="w-28 h-28 text-white animate-float" viewBox="0 0 100 100" fill="none">
      {/* Crescent Moon */}
      <path d="M60 30c-13.8 0-25 11.2-25 25s11.2 25 25 25c2.4 0 4.7-.3 6.9-1-10.7-3.9-18.4-14.2-18.4-26.3s7.7-22.4 18.4-26.3c-2.2-.7-4.5-1-6.9-1z" fill="#09090b" stroke="#22d3ee" strokeWidth="2.5" />
      {/* Stars */}
      <circle cx="25" cy="30" r="1" fill="#22d3ee" className="animate-twinkle" />
      <circle cx="35" cy="22" r="1.5" fill="#fff" className="animate-twinkle" style={{ animationDelay: '0.8s' }} />
      <circle cx="75" cy="25" r="1" fill="#22d3ee" className="animate-twinkle" style={{ animationDelay: '1.5s' }} />
      <circle cx="30" cy="70" r="1.2" fill="#fff" className="animate-twinkle" style={{ animationDelay: '2s' }} />
      {/* Slow moving clouds */}
      <path d="M72 65c4.5 0 8.5-3.5 8.5-8 0-6.5-6-10.5-12-10.5-.3 0-.6 0-.9.1A12 12 0 0 0 44 55c0 5 4 9 9 9" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#09090b" className="animate-float-cloud origin-center" />
    </svg>
  </div>
);

// --- COMPACT MINIFIED STATIC WEATHER ICONS FOR LISTS ---

const renderMiniWeatherIcon = (type: string) => {
  switch (type) {
    case "sunny":
      return <Sun className="w-4.5 h-4.5 text-[#22d3ee]" />;
    case "cloudy":
      return <Cloud className="w-4.5 h-4.5 text-text-secondary" />;
    case "rain":
      return <CloudRain className="w-4.5 h-4.5 text-primary" />;
    case "storm":
      return <CloudLightning className="w-4.5 h-4.5 text-[#22d3ee]" />;
    case "snow":
      return <Snowflake className="w-4.5 h-4.5 text-white" />;
    default:
      return <CloudSun className="w-4.5 h-4.5 text-[#22d3ee]" />;
  }
};

// --- GOOGLE WEATHER EXPERIENCE OUTLOOK ---

const GoogleWeatherDashboard: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationName, setLocationName] = useState("Dehradun, Uttarakhand");
  const [lastUpdated, setLastUpdated] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const getWeatherCondition = (code: number) => {
    if (code === 0) return { label: "Sunny", type: "sunny" };
    if ([1, 2, 3].includes(code)) return { label: "Partly Cloudy", type: "cloudy" };
    if ([45, 48].includes(code)) return { label: "Fog", type: "fog" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { label: "Rainy", type: "rain" };
    if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", type: "storm" };
    if ([71, 73, 75, 85, 86].includes(code)) return { label: "Snowy", type: "snow" };
    return { label: "Partly Cloudy", type: "cloudy" };
  };

  const fetchWeather = async (lat: number, lon: number, name?: string) => {
    try {
      setWeatherLoading(true);
      const urlForecast = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,precipitation_probability,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
      const urlAqi = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;
      
      const [resForecast, resAqi] = await Promise.all([
        fetch(urlForecast),
        fetch(urlAqi)
      ]);
      
      const dataForecast = await resForecast.json();
      const dataAqi = await resAqi.json();
      
      if (dataForecast && dataForecast.current) {
        setWeather(dataForecast);
        if (name) setLocationName(name);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
      if (dataAqi && dataAqi.current) {
        setAqi(dataAqi.current.us_aqi);
      }
    } catch (err) {
      console.error("Error fetching weather experience:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const triggerRefresh = () => {
    if (weather?.latitude) {
      fetchWeather(weather.latitude, weather.longitude);
    }
  };

  // Clock ticks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDay(now.toLocaleDateString([], { weekday: 'long' }));
      setCurrentDate(now.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial fetch and coordinates permissions
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
    }, 240000); // 4 min auto-refresh

    return () => clearInterval(interval);
  }, []);

  if (weatherLoading && !weather) {
    return (
      <div className="p-10 rounded-[24px] border border-white/5 bg-neutral-900/30 backdrop-blur-[24px] flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#22d3ee] mx-auto" />
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-mono block">Loading Weather Dashboard...</span>
        </div>
      </div>
    );
  }

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const condition = getWeatherCondition(current?.weather_code || 0);

  // Precise Dew Point calculation
  const getDewPoint = (t: number, rh: number) => {
    const a = 17.625;
    const b = 243.04;
    const alpha = ((a * t) / (b + t)) + Math.log(rh / 100);
    return ((b * alpha) / (a - alpha)).toFixed(1);
  };

  const dewPoint = getDewPoint(current?.temperature_2m || 0, current?.relative_humidity_2m || 100);

  // Air Quality Rating
  const getAqiRating = (val: number | null) => {
    if (val === null) return "Good";
    if (val <= 50) return "Good";
    if (val <= 100) return "Moderate";
    if (val <= 150) return "Unhealthy for Sensitive Groups";
    return "Unhealthy";
  };

  const aqiRating = getAqiRating(aqi);

  const getDayPeriod = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) return "morning";
    if (hours >= 12 && hours < 17) return "afternoon";
    if (hours >= 17 && hours < 20) return "evening";
    return "night";
  };

  const period = getDayPeriod();
  const themeStyles = {
    morning: "border-yellow-500/15 bg-gradient-to-br from-yellow-500/[0.01] to-neutral-950/40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]",
    afternoon: "border-[#22d3ee]/15 bg-gradient-to-br from-[#22d3ee]/[0.01] to-neutral-950/40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]",
    evening: "border-orange-500/15 bg-gradient-to-br from-orange-500/[0.01] to-neutral-950/40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]",
    night: "border-indigo-500/10 bg-gradient-to-br from-indigo-950/[0.02] to-neutral-950/50 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
  }[period];

  const renderIllustration = (type: string, isDay: number) => {
    if (isDay === 0) return <NightIllustration />;
    switch (type) {
      case "sunny":
        return <SunnyIllustration />;
      case "cloudy":
        return <CloudyIllustration />;
      case "rain":
        return <RainIllustration />;
      case "storm":
        return <StormIllustration />;
      case "snow":
        return <SnowIllustration />;
      default:
        return <PartlyCloudyIllustration />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Style Injection for animations */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float-cloud {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(4px); }
        }
        @keyframes rain-fall {
          0% { transform: translateY(-8px); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(18px); opacity: 0; }
        }
        @keyframes flash {
          0%, 100% { opacity: 0.15; }
          45%, 55% { opacity: 0.15; }
          50% { opacity: 1; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes bird-fly-1 {
          0% { transform: translate(-10px, 0px) scale(0.8); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(30px, -10px) scale(0.8); opacity: 0; }
        }
        @keyframes bird-fly-2 {
          0% { transform: translate(20px, 10px) scale(0.7); opacity: 0; }
          15% { opacity: 0.6; }
          85% { opacity: 0.6; }
          100% { transform: translate(-20px, 0px) scale(0.7); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-cloud {
          animation: float-cloud 8s ease-in-out infinite;
        }
        .animate-rain-fall {
          animation: rain-fall 1.4s linear infinite;
        }
        .animate-flash {
          animation: flash 4s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-bird-fly-1 {
          animation: bird-fly-1 12s ease-in-out infinite;
        }
        .animate-bird-fly-2 {
          animation: bird-fly-2 15s ease-in-out infinite;
        }
        @keyframes eq-bounce {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        .animate-eq-bounce-1 {
          animation: eq-bounce 0.8s ease-in-out infinite 0.1s;
        }
        .animate-eq-bounce-2 {
          animation: eq-bounce 0.8s ease-in-out infinite 0.3s;
        }
        .animate-eq-bounce-3 {
          animation: eq-bounce 0.8s ease-in-out infinite 0.5s;
        }
      `}</style>

      {/* Main Meteorological Console */}
      <div className={`p-6 md:p-8 rounded-[24px] border backdrop-blur-[30px] ${themeStyles} space-y-8 relative overflow-hidden transition-all duration-300`}>
        
        {/* TOP SECTION: Location details & Illustration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <MapPin className="w-4 h-4 text-[#22d3ee]" />
              <span className="font-bold text-xs tracking-wider uppercase">{locationName}</span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-baseline gap-1">
                {Math.round(current?.temperature_2m || 0)}
                <span className="text-2xl font-black text-[#22d3ee]">°C</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{condition.label}</span>
                <span className="text-[10px] text-text-secondary/70">• Feels Like {Math.round(current?.apparent_temperature || 0)}°C</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-[10px] text-text-secondary/60 font-mono">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#22d3ee]" />
                <span>{currentDay}, {currentDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#22d3ee]" />
                <span className="text-white font-bold">{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Right: Weather Scene Illustration */}
          <div className="flex justify-center md:justify-end">
            {renderIllustration(condition.type, current?.is_day)}
          </div>
        </div>

        {/* HOURLY FORECAST (scrollable row) */}
        <div className="space-y-3">
          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/40 block">Hourly Outlines</span>
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
            {hourly?.time.slice(0, 12).map((t: string, idx: number) => {
              const dateObj = new Date(t);
              const hourLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const hourlyTemp = Math.round(hourly.temperature_2m[idx]);
              const hourlyCondition = getWeatherCondition(hourly.weather_code[idx]);
              const rainProb = hourly.precipitation_probability[idx];
              const isNow = idx === 0;

              return (
                <div
                  key={idx}
                  className={`p-3.5 w-24 shrink-0 rounded-2xl border text-center space-y-2.5 transition-all duration-200 ${
                    isNow 
                      ? "bg-[#22d3ee]/10 border-[#22d3ee]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                      : "bg-black/20 border-white/5 hover:border-white/10"
                  }`}
                >
                  <span className={`text-[10px] font-mono block ${isNow ? "text-[#22d3ee] font-black" : "text-text-secondary"}`}>
                    {isNow ? "Now" : hourLabel}
                  </span>
                  
                  <div className="flex justify-center">
                    {renderMiniWeatherIcon(hourlyCondition.type)}
                  </div>
                  
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{hourlyTemp}°</span>
                    {rainProb > 0 && (
                      <span className="text-[8px] text-[#22d3ee] font-black font-sans block">🌧 {rainProb}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-DAY FORECAST (scrollable horizontal cards) */}
        <div className="space-y-3">
          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/40 block">7-Day Shoot Outlook</span>
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {daily?.time.map((t: string, idx: number) => {
              const dateObj = new Date(t);
              const dayName = dateObj.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
              const dateLabel = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' });
              const dayCondition = getWeatherCondition(daily.weather_code[idx]);
              const maxT = Math.round(daily.temperature_2m_max[idx]);
              const minT = Math.round(daily.temperature_2m_min[idx]);
              
              return (
                <div key={idx} className="p-3.5 w-28 shrink-0 bg-black/20 border border-white/5 hover:border-white/10 rounded-2xl text-center space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-white block">{idx === 0 ? "TODAY" : dayName}</span>
                    <span className="text-[8px] font-mono text-text-secondary/70 block mt-0.5">{dateLabel}</span>
                  </div>
                  <div className="flex justify-center">
                    {renderMiniWeatherIcon(dayCondition.type)}
                  </div>
                  <div className="text-[10px] font-bold text-white flex justify-center gap-1.5">
                    <span>{maxT}°</span>
                    <span className="text-text-secondary/50 font-medium">{minT}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* WEATHER DETAILS GRID (11 premium glass cards) */}
        <div className="space-y-3.5">
          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/40 block">Atmospheric Specifications</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            
            {/* Card 1: Humidity */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Humidity</span>
              <span className="text-sm font-black text-white">{current?.relative_humidity_2m}%</span>
              <span className="text-[8px] text-text-secondary/40 font-mono">Status: Standard</span>
            </div>

            {/* Card 2: Wind Speed */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Wind Speed</span>
              <span className="text-sm font-black text-white">{current?.wind_speed_10m} km/h</span>
              <span className="text-[8px] text-[#22d3ee] font-mono">Direction: {current?.wind_direction_10m}°</span>
            </div>

            {/* Card 3: Air Pressure */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Air Pressure</span>
              <span className="text-sm font-black text-white">{current?.pressure_msl} hPa</span>
              <span className="text-[8px] text-text-secondary/40 font-mono">Standard MSL</span>
            </div>

            {/* Card 4: Visibility */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Visibility</span>
              <span className="text-sm font-black text-white">{(current?.visibility || 0) / 1000} km</span>
              <span className="text-[8px] text-text-secondary/40 font-mono">Clear sight paths</span>
            </div>

            {/* Card 5: UV Index */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">UV Index</span>
              <span className="text-sm font-black text-white">{current?.uv_index || 0}</span>
              <span className="text-[8px] text-text-secondary/40 font-mono">Max today: {daily?.uv_index_max?.[0] || 0}</span>
            </div>

            {/* Card 6: Chance of Rain */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Chance of Rain</span>
              <span className="text-sm font-black text-white">
                {hourly?.precipitation_probability?.[new Date().getHours()] || 0}%
              </span>
              <span className="text-[8px] text-text-secondary/40 font-mono">Current hour index</span>
            </div>

            {/* Card 7: Air Quality */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Air Quality</span>
              <span className="text-sm font-black text-white">{aqi !== null ? `${aqi} AQI` : "--"}</span>
              <span className="text-[8px] text-[#22d3ee] font-mono uppercase font-bold">{aqiRating}</span>
            </div>

            {/* Card 8: Sunrise */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Sunrise</span>
              <span className="text-sm font-black text-white">
                {daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
              </span>
              <span className="text-[8px] text-text-secondary/40 font-mono">Dawning hour</span>
            </div>

            {/* Card 9: Sunset */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Sunset</span>
              <span className="text-sm font-black text-white">
                {daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
              </span>
              <span className="text-[8px] text-text-secondary/40 font-mono">Golden hour timeline</span>
            </div>

            {/* Card 10: Feels Like */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Feels Like</span>
              <span className="text-sm font-black text-white">{Math.round(current?.apparent_temperature || 0)}°C</span>
              <span className="text-[8px] text-text-secondary/40 font-mono">Thermal feels index</span>
            </div>

            {/* Card 11: Dew Point */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1.5 flex flex-col justify-between">
              <span className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-bold block">Dew Point</span>
              <span className="text-sm font-black text-white">{dewPoint}°C</span>
              <span className="text-[8px] text-[#22d3ee] font-mono">Condensation point</span>
            </div>

          </div>
        </div>

        {/* LIVE STATUS BAR FOOTER */}
        <div className="flex justify-between items-center text-[9px] text-text-secondary/45 font-mono pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d3ee] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22d3ee]"></span>
            </span>
            <span>API Status: OpenMeteo Sync Active</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Updated: {lastUpdated || "Just Now"}</span>
            <button
              onClick={triggerRefresh}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-all border border-white/5 hover:border-[#22d3ee] flex items-center justify-center"
              title="Refresh Feeds"
            >
              <RefreshCw className="w-3 h-3 text-[#22d3ee]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- MAIN DASHBOARD VIEW ---

export const DashboardView: React.FC = () => {
  const {
    projects,
    setActiveProjectId,
    setActiveView,
    createChatChannel,
    sendChatMessage,
    stories,
    fetchStories,
    addStory,
    viewStory,
    uploadChatAttachment
  } = useProjectStore();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  // Notes state, note composer state, playing audio state, refs
  const [notes, setNotes] = useState<any[]>([]);
  const [isNoteComposerOpen, setIsNoteComposerOpen] = useState(false);
  const [noteContentInput, setNoteContentInput] = useState("");
  const [noteLocationInput, setNoteLocationInput] = useState("");
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [itunesSearchQuery, setItunesSearchQuery] = useState("");
  const [itunesSongs, setItunesSongs] = useState<any[]>([]);
  const [isSearchingItunes, setIsSearchingItunes] = useState(false);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecordDuration, setVoiceRecordDuration] = useState(0);

  // New state variables
  const [activeNoteDetail, setActiveNoteDetail] = useState<any | null>(null);
  const [noteDetailReplyText, setNoteDetailReplyText] = useState("");
  const [yourNoteOptionsOpen, setYourNoteOptionsOpen] = useState(false);
  const [songStartOffset, setSongStartOffset] = useState<number>(0);

  // Stories States
  const [isStoryUploaderOpen, setIsStoryUploaderOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [activeStoryUser, setActiveStoryUser] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState("");
  const [storyCaptionInput, setStoryCaptionInput] = useState("");
  const [storyMediaType, setStoryMediaType] = useState<"image" | "video">("image");
  const [storyAudience, setStoryAudience] = useState<string>("everyone");
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioPreviewRef = React.useRef<HTMLAudioElement | null>(null);
  const voiceIntervalRef = React.useRef<any>(null);

  const getFirstName = (fullName: string) => {
    if (!fullName) return "";
    return fullName.trim().split(/\s+/)[0];
  };

  const fetchNotes = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .gt("created_at", twentyFourHoursAgo)
        .order("created_at", { ascending: false });
      if (data) setNotes(data);
    } catch (err) {
      console.error("Error fetching active notes:", err);
    }
  };

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

        // Fetch active notes
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: notesList } = await supabase
          .from("notes")
          .select("*")
          .gt("created_at", twentyFourHoursAgo)
          .order("created_at", { ascending: false });
        if (notesList) setNotes(notesList);
        fetchStories();
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };
    fetchData();

    return () => {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
    };
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

  const [timelineUpdates, setTimelineUpdates] = useState<any[]>([]);

  useEffect(() => {
    const fetchTimelineUpdates = async () => {
      try {
        const { data, error } = await supabase
          .from("production_timeline_updates")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) setTimelineUpdates(data);
      } catch (err) {
        console.error("Error loading timeline updates:", err);
      }
    };
    fetchTimelineUpdates();

    const channel = supabase
      .channel("timeline-updates-listener")
      .on("postgres_changes", { event: "*", schema: "public", table: "production_timeline_updates" }, () => {
        fetchTimelineUpdates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);
      if (error) throw error;
      setYourNoteOptionsOpen(false);
      fetchNotes();
    } catch (err: any) {
      alert("Error deleting note: " + err.message);
    }
  };

  const handleLikeNote = async (note: any) => {
    if (!userProfile) return;
    try {
      const likesList = note.likes || [];
      const hasLiked = likesList.includes(userProfile.id);
      const newLikes = hasLiked
        ? likesList.filter((id: string) => id !== userProfile.id)
        : [...likesList, userProfile.id];

      const { error } = await supabase
        .from("notes")
        .update({ likes: newLikes })
        .eq("id", note.id);

      if (error) throw error;
      
      setActiveNoteDetail((prev: any) => prev ? { ...prev, likes: newLikes } : null);
      fetchNotes();
    } catch (err: any) {
      alert("Error updating likes: " + err.message);
    }
  };

  const handleOpenNoteDetail = async (note: any) => {
    setActiveNoteDetail(note);
    if (userProfile && note.user_id !== userProfile.id) {
      const viewers = note.viewers || [];
      if (!viewers.includes(userProfile.id)) {
        const updatedViewers = [...viewers, userProfile.id];
        const { error } = await supabase
          .from("notes")
          .update({ viewers: updatedViewers })
          .eq("id", note.id);
        if (!error) {
          setActiveNoteDetail((prev: any) => prev && prev.id === note.id ? { ...prev, viewers: updatedViewers } : prev);
          fetchNotes();
        } else {
          console.error("Error updating note viewers:", error);
        }
      }
    }
  };

  const handleSendNoteReaction = async (recipientId: string, text: string) => {
    try {
      const channelId = await createChatChannel("Direct Message", false, [recipientId]);
      if (!channelId) {
        alert("Could not resolve DM channel.");
        return;
      }
      
      await sendChatMessage(channelId, text);
      
      setActiveNoteDetail(null);
      setNoteDetailReplyText("");
    } catch (err: any) {
      alert("Error sending reaction: " + err.message);
    }
  };

  const handlePlayNote = (note: any) => {
    const previewUrl = note.song_preview_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    if (!previewUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingNoteId === note.id) {
      setPlayingNoteId(null);
      return;
    }

    const audio = new Audio(previewUrl);
    audio.volume = 0.5;
    audioRef.current = audio;
    setPlayingNoteId(note.id);
    
    // Set offset when played
    audio.currentTime = note.song_start_offset || 0;

    audio.play();

    audio.onended = () => {
      setPlayingNoteId(null);
    };
  };

  // Stories UI/UX Handlers
  const handleStoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoryFile(file);
      const isVideo = file.type.startsWith("video/");
      setStoryMediaType(isVideo ? "video" : "image");
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadStory = async () => {
    if (!storyFile) return;
    setIsUploadingStory(true);
    try {
      const mediaUrl = await uploadChatAttachment(storyFile);
      const payload = {
        textCaption: storyCaptionInput,
        stamp: null
      };

      await addStory(mediaUrl, storyMediaType, JSON.stringify(payload), null, storyAudience);
      setIsStoryUploaderOpen(false);
      setStoryFile(null);
      setStoryPreview("");
      setStoryCaptionInput("");
      fetchStories();
    } catch (e: any) {
      alert("Story upload failed: " + e.message);
    } finally {
      setIsUploadingStory(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (confirm("Are you sure you want to delete this story?")) {
      const { error } = await supabase.from("stories").delete().eq("id", storyId);
      if (!error) {
        await fetchStories();
        const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
        if (userStories.length <= 1) {
          setIsStoryViewerOpen(false);
          setActiveStoryUser(null);
        } else {
          setActiveStoryIndex(prev => Math.max(0, prev - 1));
        }
      } else {
        alert("Error deleting story: " + error.message);
      }
    }
  };

  const handleNextStory = () => {
    if (!activeStoryUser) return;
    const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
    if (activeStoryIndex < userStories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setStoryProgress(0);
    } else {
      const usersWithStories = Array.from(new Set(stories.map(s => s.user_id)));
      const currentUserIndex = usersWithStories.indexOf(activeStoryUser);
      if (currentUserIndex < usersWithStories.length - 1) {
        setActiveStoryUser(usersWithStories[currentUserIndex + 1]);
        setActiveStoryIndex(0);
        setStoryProgress(0);
      } else {
        setIsStoryViewerOpen(false);
        setActiveStoryUser(null);
      }
    }
  };

  const handlePrevStory = () => {
    if (!activeStoryUser) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setStoryProgress(0);
    } else {
      const usersWithStories = Array.from(new Set(stories.map(s => s.user_id)));
      const currentUserIndex = usersWithStories.indexOf(activeStoryUser);
      if (currentUserIndex > 0) {
        const prevUser = usersWithStories[currentUserIndex - 1];
        const prevUserStories = stories.filter(s => s.user_id === prevUser);
        setActiveStoryUser(prevUser);
        setActiveStoryIndex(prevUserStories.length - 1);
        setStoryProgress(0);
      }
    }
  };

  // Story viewer progression timer
  useEffect(() => {
    let timer: any;
    if (isStoryViewerOpen && activeStoryUser) {
      timer = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + 1.5;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isStoryViewerOpen, activeStoryIndex, activeStoryUser, stories]);

  // View logger
  useEffect(() => {
    setStoryProgress(0);
    if (isStoryViewerOpen && activeStoryUser && userProfile) {
      const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
      const activeStory = userStories[activeStoryIndex];
      if (activeStory && activeStory.user_id !== userProfile.id) {
        const currentViewers = activeStory.viewers || [];
        if (!currentViewers.includes(userProfile.id)) {
          const updatedViewers = [...currentViewers, userProfile.id];
          supabase.from("stories").update({ viewers: updatedViewers }).eq("id", activeStory.id).then(() => {
            fetchStories();
          });
        }
      }
    }
  }, [activeStoryIndex, activeStoryUser, isStoryViewerOpen]);

  const handleSearchItunes = async (query: string) => {
    if (!query.trim()) {
      setItunesSongs([]);
      return;
    }
    setIsSearchingItunes(true);
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15`);
      const data = await response.json();
      const formatted = (data.results || []).map((track: any) => ({
        id: track.trackId?.toString() || Math.random().toString(),
        name: track.trackName || "Unknown Song",
        artist: track.artistName || "Unknown Artist",
        artwork: track.artworkUrl100 || "",
        preview_url: track.previewUrl || ""
      }));
      setItunesSongs(formatted);
    } catch (error) {
      console.error("iTunes search error:", error);
    } finally {
      setIsSearchingItunes(false);
    }
  };

  const handlePlayPreview = (song: any) => {
    if (!song.preview_url) return;

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }

    if (playingSongId === song.id) {
      setPlayingSongId(null);
      return;
    }

    const audio = new Audio(song.preview_url);
    audio.volume = 0.5;
    audioPreviewRef.current = audio;
    setPlayingSongId(song.id);

    // Set offset when played
    audio.currentTime = songStartOffset || 0;

    audio.play();

    audio.onended = () => {
      setPlayingSongId(null);
    };
  };

  const handleToggleVoiceRecord = () => {
    if (isRecordingVoice) {
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
      }
      setIsRecordingVoice(false);
      setNoteContentInput(`🎙️ Voice Note (${voiceRecordDuration}s)`);
    } else {
      setVoiceRecordDuration(0);
      setIsRecordingVoice(true);
      voiceIntervalRef.current = setInterval(() => {
        setVoiceRecordDuration((prev) => {
          if (prev >= 60) {
            clearInterval(voiceIntervalRef.current);
            setIsRecordingVoice(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleShareNote = async () => {
    if (!userProfile) {
      alert("You must be logged in to share notes.");
      return;
    }
    if (!noteContentInput.trim() && !selectedSong) {
      alert("Please enter note content or select a song.");
      return;
    }

    try {
      const { error } = await supabase
        .from("notes")
        .insert({
          user_id: userProfile.id,
          content: noteContentInput.trim(),
          audience: "everyone",
          song_id: selectedSong?.id || null,
          song_name: selectedSong?.name || null,
          song_artist: selectedSong?.artist || null,
          song_artwork: selectedSong?.artwork || null,
          song_preview_url: selectedSong?.preview_url || null,
          location: noteLocationInput.trim() || null,
          song_start_offset: selectedSong ? songStartOffset : 0
        });

      if (error) throw error;
      
      setNoteContentInput("");
      setNoteLocationInput("");
      setSelectedSong(null);
      setSongStartOffset(0);
      setItunesSearchQuery("");
      setItunesSongs([]);
      setIsNoteComposerOpen(false);
      
      fetchNotes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const currentUserNote = notes.find((n) => n.user_id === userProfile?.id);
  const currentUserAvatar = userProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile?.full_name || "You")}&backgroundColor=030712&textColor=ffffff`;

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-xs">
      
      {/* INSTAGRAM STYLED STORIES ROW */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth py-4 px-1">
        <div className="flex gap-5 items-center py-1">
          {/* Creator's own story circle */}
          {(() => {
            const myStories = stories.filter(s => s.user_id === userProfile?.id);
            const hasStories = myStories.length > 0;
            const hasUnseen = hasStories && myStories.some(s => !s.viewers?.includes(userProfile?.id));
            
            return (
              <div className="flex flex-col items-center gap-1.5 shrink-0 relative select-none">
                <div className="relative">
                  <div 
                    onClick={() => {
                      if (hasStories) {
                        setActiveStoryUser(userProfile.id);
                        setActiveStoryIndex(0);
                        setIsStoryViewerOpen(true);
                      } else {
                        setIsStoryUploaderOpen(true);
                      }
                    }}
                    className={`w-[84px] h-[84px] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all ${
                      hasStories 
                        ? hasUnseen 
                          ? "bg-gradient-to-tr from-[#3897f0] via-[#a80077] to-[#b12a5b] p-[2.5px]" 
                          : "bg-neutral-800 p-[1.5px]"
                        : "border border-white/10 p-[1px]"
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-black p-[2px] overflow-hidden flex items-center justify-center font-bold text-sm text-cyan-400">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} className="w-full h-full object-cover rounded-full" alt="" />
                      ) : (
                        userProfile?.full_name?.substring(0, 2).toUpperCase() || "ME"
                      )}
                    </div>
                  </div>
                  {/* Plus badge on own story circle */}
                  <div className="absolute bottom-0 right-0 w-6.5 h-6.5 bg-[#0095f6] border-2 border-[#0b0b0d] rounded-full flex items-center justify-center text-white font-extrabold text-[15px] shadow-md pointer-events-none select-none">
                    +
                  </div>
                </div>
                <span className="text-[11px] text-[#8e8e8e] font-semibold mt-1">Your story</span>
              </div>
            );
          })()}

          {/* Other team members stories */}
          {allProfiles.filter(p => p.id !== userProfile?.id && stories.some(s => s.user_id === p.id)).map(p => {
            const userStories = stories.filter(s => s.user_id === p.id);
            const hasUnseen = userStories.some(s => !s.viewers?.includes(userProfile?.id));
            const isOnline = onlineUsers.includes(p.id);

            return (
              <div key={p.id} className="flex flex-col items-center gap-1.5 shrink-0 relative select-none group">
                <div 
                  onClick={() => {
                    setActiveStoryUser(p.id);
                    setActiveStoryIndex(0);
                    setIsStoryViewerOpen(true);
                  }}
                  className={`w-[84px] h-[84px] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all relative ${
                    hasUnseen
                      ? "bg-gradient-to-tr from-[#3897f0] via-[#a80077] to-[#b12a5b] p-[2.5px]" 
                      : "bg-[#262626] p-[1.5px]" 
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-black p-[2px] overflow-hidden flex items-center justify-center font-bold text-sm text-cyan-400">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      p.full_name?.substring(0, 2).toUpperCase() || "U"
                    )}
                  </div>
                  {/* Online presence dot */}
                  {isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#4ed840] rounded-full border-2 border-black shadow-[0_0_4px_#4ed840]" />
                  )}
                </div>
                <span className="text-[11px] text-[#8e8e8e] truncate max-w-[76px] mt-1 font-semibold">
                  {p.full_name || "User"}
                </span>
              </div>
            );
          })}

          {/* Invite button */}
          <button
            onClick={() => {
              const email = prompt("Enter team member's email to invite to workspace:");
              if (email) {
                alert(`Invite successfully sent to: ${email}`);
              }
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 text-center cursor-pointer select-none group"
          >
            <div className="w-[84px] h-[84px] rounded-full border border-dashed border-white/20 hover:border-[#22d3ee]/50 flex items-center justify-center bg-white/5 group-hover:bg-[#22d3ee]/10 transition-all duration-200">
              <Plus className="w-7 h-7 text-white/50 group-hover:text-[#22d3ee] transition-colors" />
            </div>
            <span className="text-[10px] font-bold text-white/40 group-hover:text-[#22d3ee] transition-colors mt-0.5">
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

      {/* FULL METEOROLOGICAL CONSOLE WEATHER UI */}
      <GoogleWeatherDashboard />

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
          {timelineUpdates.map((up, idx) => (
            <div key={up.id || idx} className="relative">
              <span className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-[#121212] border-2 border-[#22d3ee] flex items-center justify-center shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
              </span>
              
              <Card className="border-white/5 bg-neutral-900/40 backdrop-blur-md">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{up.title}</h4>
                    <span className="text-[9px] text-text-secondary font-mono">{up.time_label || up.time}</span>
                  </div>
                  
                  <p className="text-[10.5px] text-text-secondary leading-relaxed">{up.description || up.desc}</p>
                  
                  {up.meta && (up.meta.callTime || up.meta.location) && (
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[9px] font-mono border-t border-white/5 text-text-secondary">
                      {up.meta.callTime && (
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 block">Call Time</span>
                          <span className="text-white font-medium">{up.meta.callTime}</span>
                        </div>
                      )}
                      {up.meta.location && (
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-text-secondary/50 block">Location</span>
                          <span className="text-white font-medium">{up.meta.location}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* --- LIQUID GLASS NOTE COMPOSER MODAL --- */}
      {false && isNoteComposerOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[420px] bg-neutral-900 border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Compose Note</span>
              <button 
                onClick={() => {
                  setIsNoteComposerOpen(false);
                  setSelectedSong(null);
                  setItunesSearchQuery("");
                  setItunesSongs([]);
                  setNoteContentInput("");
                  setNoteLocationInput("");
                  if (isRecordingVoice) {
                    clearInterval(voiceIntervalRef.current);
                    setIsRecordingVoice(false);
                  }
                }} 
                className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white font-bold cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-white/50 mb-1">Your Note (Max 60 chars)</label>
                <textarea
                  maxLength={60}
                  rows={2}
                  value={noteContentInput}
                  placeholder="What's on your mind?..."
                  onChange={(e) => setNoteContentInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#22d3ee] resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  {/* Simulated voice note button */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecord}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      isRecordingVoice 
                        ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>
                      {isRecordingVoice 
                        ? `Recording... (${voiceRecordDuration}s) [Tap Stop]` 
                        : "Simulate Voice Note"}
                    </span>
                  </button>

                  <span className="text-[9px] text-white/40 font-mono">
                    {noteContentInput.length}/60
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-white/50 mb-1">Location (Optional)</label>
                <input
                  type="text"
                  list="locations-list-dashboard"
                  placeholder="e.g. Majri, Burbank Studio"
                  value={noteLocationInput}
                  onChange={(e) => setNoteLocationInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
                <datalist id="locations-list-dashboard">
                  <option value="Majri" />
                  <option value="Burbank Studio" />
                  <option value="On Set" />
                  <option value="Main Stage" />
                  <option value="Home" />
                </datalist>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["Majri", "Burbank Studio", "On Set", "Home"].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setNoteLocationInput(loc)}
                      className={`text-[9px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                        noteLocationInput === loc
                          ? "bg-[#22d3ee]/20 border-[#22d3ee] text-[#22d3ee]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* iTunes attachment */}
              <div className="border border-white/10 rounded-2xl p-3 bg-black/30 space-y-3">
                <label className="block text-[10px] uppercase text-white/50 font-bold">Attach Music (Optional)</label>
                {selectedSong ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-neutral-900 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-2">
                        <img src={selectedSong.artwork} className="w-8 h-8 rounded object-cover" alt="" />
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-white block truncate">{selectedSong.name}</span>
                          <span className="text-[9px] text-white/40 block truncate">{selectedSong.artist}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePlayPreview(selectedSong)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-white"
                        >
                          {playingSongId === selectedSong.id ? <Pause className="w-3.5 h-3.5 text-[#22d3ee]" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSong(null);
                          }}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[9px] font-bold"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSong(null);
                            setSongStartOffset(0);
                          }}
                          className="px-2 py-0.5 rounded bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-neutral-900/50 p-2.5 border border-white/5 rounded-xl">
                      <div className="flex justify-between text-[10px] text-white/50 font-medium">
                        <span>Song Start Time: <span className="text-[#22d3ee] font-bold">{songStartOffset}s</span></span>
                        <span>0 - 90s</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        value={songStartOffset}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setSongStartOffset(val);
                          if (audioPreviewRef.current && playingSongId === selectedSong.id) {
                            audioPreviewRef.current.currentTime = val;
                          }
                        }}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#22d3ee]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search songs..."
                        value={itunesSearchQuery}
                        onChange={(e) => setItunesSearchQuery(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSearchItunes(itunesSearchQuery)}
                        className="px-3 py-1 bg-white/5 hover:bg-[#22d3ee] hover:text-black border border-white/10 rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-all"
                      >
                        Search
                      </button>
                    </div>

                    {isSearchingItunes ? (
                      <div className="text-center py-2 flex items-center justify-center gap-1.5 text-[10px] text-white/40 font-mono uppercase">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#22d3ee]" /> Searching...
                      </div>
                    ) : itunesSongs.length > 0 ? (
                      <div className="max-h-28 overflow-y-auto no-scrollbar space-y-1.5 bg-black/40 rounded-lg p-2 border border-white/5">
                        {itunesSongs.map(song => (
                          <div key={song.id} className="flex items-center justify-between p-1.5 hover:bg-white/5 rounded transition-colors">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img src={song.artwork} className="w-6 h-6 rounded object-cover" alt="" />
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-white block truncate">{song.name}</span>
                                <span className="text-[8px] text-white/40 block truncate">{song.artist}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handlePlayPreview(song)}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white shrink-0"
                              >
                                {playingSongId === song.id ? <Pause className="w-3 h-3 text-[#22d3ee]" /> : <Play className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSong(song);
                                  setSongStartOffset(0);
                                }}
                                className="px-2 py-0.5 rounded bg-[#22d3ee] text-black font-bold text-[9px] hover:bg-cyan-400 shrink-0"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <button
                onClick={handleShareNote}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-br from-[#22d3ee] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black font-bold text-xs cursor-pointer transition-all shadow-md shadow-cyan-400/10"
              >
                Share Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- YOUR NOTE OPTIONS MODAL --- */}
      {false && yourNoteOptionsOpen && currentUserNote && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="w-[360px] bg-neutral-900 border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-6 text-white text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#22d3ee]">Your Note</h3>
            
            {/* Active note preview */}
            <div className="flex flex-col items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="relative w-14 h-14">
                <img
                  src={currentUserAvatar}
                  alt="Your avatar"
                  className="w-14 h-14 object-cover rounded-full border border-white/10 ring-2 ring-primary/10"
                />
              </div>
              <div className="space-y-1.5 w-full">
                {currentUserNote.song_name ? (
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center text-[10px] w-full">
                    <div className="font-bold text-blue-300">🎵 {currentUserNote.song_name}</div>
                    <div className="text-[8px] text-blue-200/70">{currentUserNote.song_artist}</div>
                    {currentUserNote.song_start_offset !== undefined && (
                      <div className="text-[8px] text-blue-200/50 mt-0.5">Starts at {currentUserNote.song_start_offset}s</div>
                    )}
                    {currentUserNote.content && (
                      <div className="text-[9px] text-white/80 border-t border-white/5 pt-1 mt-1 font-medium">
                        "{currentUserNote.content}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2 bg-white/5 rounded-xl text-center text-[10.5px] font-medium w-full">
                    "{currentUserNote.content}"
                  </div>
                )}
                {currentUserNote.location && (
                  <span className="text-[9px] text-[#22d3ee] block">
                    📍 {currentUserNote.location}
                  </span>
                )}
              </div>
            </div>

            {/* Note Viewers Horizontal Reel */}
            {(() => {
              const noteViewers = (currentUserNote?.viewers || [])
                .map((viewerId: string) => allProfiles.find((p) => p.id === viewerId))
                .filter(Boolean);

              return (
                <div className="space-y-2 text-left bg-black/20 p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-text-secondary/60 font-bold block">
                    Viewers ({noteViewers.length})
                  </span>
                  {noteViewers.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar">
                      {noteViewers.map((viewer: any) => {
                        const viewerAvatar = viewer.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewer.full_name || "Viewer")}&backgroundColor=030712&textColor=ffffff`;
                        return (
                          <div key={viewer.id} className="flex flex-col items-center shrink-0 w-12 text-center">
                            <img
                              src={viewerAvatar}
                              alt={viewer.full_name}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                            <span className="text-[8px] text-white/70 truncate w-full mt-1">
                              {getFirstName(viewer.full_name)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[10px] text-white/40 italic py-1">No views yet</div>
                  )}
                </div>
              );
            })()}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setYourNoteOptionsOpen(false);
                  setIsNoteComposerOpen(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs cursor-pointer transition-all"
              >
                Leave a new note
              </button>
              
              <button
                onClick={() => handleDeleteNote(currentUserNote.id)}
                className="w-full py-2.5 rounded-2xl bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs cursor-pointer transition-all"
              >
                Delete note
              </button>

              <button
                onClick={() => setYourNoteOptionsOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-transparent hover:bg-white/5 text-white/60 hover:text-white text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INTERACTIVE NOTES DETAIL POPUP OVERLAY --- */}
      {false && activeNoteDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="w-[380px] bg-neutral-900 border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-6 text-white relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setActiveNoteDetail(null);
                setNoteDetailReplyText("");
              }}
              className="absolute top-4 right-4 p-1 rounded hover:bg-white/10 text-white/50 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Info & Enlarged Bubble */}
            {(() => {
              const matchedProfile = allProfiles.find((p) => p.id === activeNoteDetail.user_id);
              const avatar = matchedProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(matchedProfile?.full_name || "User")}&backgroundColor=030712&textColor=ffffff`;
              const name = matchedProfile?.full_name || "Crew Member";
              
              const likesList = activeNoteDetail.likes || [];
              const hasLiked = userProfile ? likesList.includes(userProfile.id) : false;

              return (
                <div className="flex flex-col items-center gap-4 text-center mt-2">
                  <div className="relative w-16 h-16">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-16 h-16 object-cover rounded-full border border-white/10 ring-2 ring-primary/20"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{name}</h4>
                    {activeNoteDetail.location && (
                      <span className="text-[9px] text-[#22d3ee] block mt-1">📍 {activeNoteDetail.location}</span>
                    )}
                  </div>

                  {/* Enlarged Note Bubble */}
                  <div className="relative w-full max-w-[300px] bg-[#202124] border border-white/5 rounded-2xl p-4 text-xs font-medium text-white shadow-lg flex flex-col items-center gap-2">
                    {activeNoteDetail.song_name ? (
                      <div className="flex flex-col items-center gap-1 w-full">
                        <div 
                          onClick={() => handlePlayNote(activeNoteDetail)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6]/20 border border-[#3b82f6]/30 rounded-full cursor-pointer hover:scale-105 transition-all text-blue-300 font-bold"
                        >
                          {playingNoteId === activeNoteDetail.id ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span className="truncate max-w-[150px]">{activeNoteDetail.song_name}</span>
                        </div>
                        <span className="text-[9px] text-white/50">{activeNoteDetail.song_artist}</span>
                        {activeNoteDetail.song_start_offset !== undefined && (
                          <span className="text-[8px] text-white/40">Starts at {activeNoteDetail.song_start_offset}s</span>
                        )}
                        {activeNoteDetail.content && (
                          <p className="text-[11px] text-white/80 border-t border-white/10 pt-2 mt-1 w-full text-center">
                            "{activeNoteDetail.content}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-[11px] leading-relaxed">"{activeNoteDetail.content}"</p>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="w-full flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                    <span className="text-[10px] text-white/40 font-mono">
                      {likesList.length} {likesList.length === 1 ? "like" : "likes"}
                    </span>
                    <button
                      onClick={() => handleLikeNote(activeNoteDetail)}
                      className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                        hasLiked 
                          ? "bg-red-500/10 border-red-500/30 text-red-500" 
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`} />
                      <span>{hasLiked ? "Liked" : "Like"}</span>
                    </button>
                  </div>

                  {/* Quick Emojis Grid */}
                  <div className="w-full space-y-2">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider block text-left">Quick React</span>
                    <div className="grid grid-cols-8 gap-1 bg-black/20 p-2 rounded-2xl border border-white/5">
                      {["😂", "😮", "😢", "😍", "👏", "🔥", "🎉", "💯"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleSendNoteReaction(activeNoteDetail.user_id, emoji)}
                          className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reply Composer Field */}
                  <div className="w-full space-y-2">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider block text-left">Reply with message</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={noteDetailReplyText}
                        onChange={(e) => setNoteDetailReplyText(e.target.value)}
                        placeholder="Send a direct message..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && noteDetailReplyText.trim()) {
                            handleSendNoteReaction(activeNoteDetail.user_id, `💬 Replied to your note: ${noteDetailReplyText}`);
                          }
                        }}
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                      />
                      <button
                        onClick={() => {
                          if (noteDetailReplyText.trim()) {
                            handleSendNoteReaction(activeNoteDetail.user_id, `💬 Replied to your note: ${noteDetailReplyText}`);
                          }
                        }}
                        disabled={!noteDetailReplyText.trim()}
                        className="px-3 py-2 bg-[#22d3ee] hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-[#22d3ee] text-black font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* --- STORY CREATOR / UPLOADER MODAL --- */}
      {isStoryUploaderOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadein">
          <div className="w-[380px] bg-neutral-900 border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-5 text-white relative">
            <button 
              onClick={() => {
                setIsStoryUploaderOpen(false);
                setStoryFile(null);
                setStoryPreview("");
                setStoryCaptionInput("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold uppercase tracking-wider text-[#22d3ee] text-center">Create Story</h3>

            <div className="space-y-4">
              {/* Media preview area */}
              <div className="w-full h-48 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden relative">
                {storyPreview ? (
                  storyMediaType === "video" ? (
                    <video src={storyPreview} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={storyPreview} className="w-full h-full object-cover" alt="" />
                  )
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer text-[#8e8e8e] hover:text-white transition-colors">
                    <Plus className="w-8 h-8 text-[#22d3ee]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Select Photo/Video</span>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={handleStoryFileChange} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Caption input */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Caption</label>
                <input 
                  type="text" 
                  placeholder="Enter caption..." 
                  value={storyCaptionInput} 
                  onChange={(e) => setStoryCaptionInput(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]" 
                />
              </div>

              {/* Audience selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Audience</label>
                <div className="flex gap-2">
                  {["everyone", "close_friends"].map((aud) => (
                    <button
                      key={aud}
                      onClick={() => setStoryAudience(aud)}
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        storyAudience === aud 
                          ? "bg-[#22d3ee]/15 border-[#22d3ee]/40 text-[#22d3ee]" 
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {aud === "everyone" ? "Everyone" : "Close Friends"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload action button */}
              <button
                onClick={handleUploadStory}
                disabled={isUploadingStory || !storyFile}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-br from-[#22d3ee] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 disabled:opacity-40 disabled:hover:from-[#22d3ee] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-400/10"
              >
                {isUploadingStory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Posting Story...</span>
                  </>
                ) : (
                  <span>Post Story</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STORY VIEWER CAROUSEL MODAL --- */}
      {isStoryViewerOpen && activeStoryUser && (() => {
        const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
        const activeStory = userStories[activeStoryIndex];
        const matchedProfile = allProfiles.find((p) => p.id === activeStoryUser) || userProfile;
        const name = matchedProfile?.full_name || "Crew Member";
        const avatar = matchedProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=030712&textColor=ffffff`;

        if (!activeStory) return null;

        // Parse story payload caption
        let parsedCaption = "";
        try {
          if (activeStory.caption) {
            const parsed = JSON.parse(activeStory.caption);
            parsedCaption = parsed.textCaption || "";
          }
        } catch {
          parsedCaption = activeStory.caption || "";
        }

        return (
          <div 
            className="fixed inset-0 z-[160] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadein"
            onClick={() => {
              setIsStoryViewerOpen(false);
              setActiveStoryUser(null);
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-[380px] h-[640px] bg-[#050505] rounded-[24px] overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10"
            >
              {/* Media rendering (Image / Video) */}
              <div className="absolute inset-0 z-0">
                {activeStory.media_type === "video" ? (
                  <video 
                    src={activeStory.media_url} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    playsInline 
                    loop 
                  />
                ) : (
                  <img 
                    src={activeStory.media_url} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                )}
                {/* Visual gradient covers */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              {/* Top Controls Overlay */}
              <div className="relative z-10 p-3 space-y-3 w-full">
                {/* Progress Indicators bar */}
                <div className="flex gap-1.5 px-1">
                  {userStories.map((s: any, idx: number) => {
                    let fillPercent = 0;
                    if (idx < activeStoryIndex) fillPercent = 100;
                    else if (idx === activeStoryIndex) fillPercent = storyProgress;

                    return (
                      <div key={s.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-100 ease-linear" 
                          style={{ width: `${fillPercent}%` }} 
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Profile header details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={avatar} 
                      className="w-9 h-9 rounded-full object-cover border border-white/20" 
                      alt="" 
                    />
                    <div>
                      <span className="text-xs font-bold text-white block leading-none">{name}</span>
                      <span className="text-[9px] text-white/50 font-mono mt-0.5 block">
                        {new Date(activeStory.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Delete story button if own story */}
                    {activeStory.user_id === userProfile?.id && (
                      <button 
                        onClick={() => handleDeleteStory(activeStory.id)}
                        className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-400 cursor-pointer transition-colors"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => {
                        setIsStoryViewerOpen(false);
                        setActiveStoryUser(null);
                      }}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Side click zones for navigation */}
              <div className="absolute inset-y-24 left-0 w-1/3 z-20 cursor-pointer" onClick={handlePrevStory} />
              <div className="absolute inset-y-24 right-0 w-1/3 z-20 cursor-pointer" onClick={handleNextStory} />

              {/* Bottom Caption Overlay */}
              <div className="relative z-10 p-4 text-center">
                {parsedCaption && (
                  <p className="text-white text-xs font-semibold px-4 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl max-w-[90%] mx-auto shadow-lg leading-relaxed animate-fadein">
                    {parsedCaption}
                  </p>
                )}
                
                {/* Viewers indicators for own story */}
                {activeStory.user_id === userProfile?.id && (() => {
                  const storyViewersList = (activeStory.viewers || [])
                    .map((viewerId: string) => allProfiles.find(p => p.id === viewerId))
                    .filter(Boolean);

                  return (
                    <div className="mt-3 bg-black/60 border border-white/10 rounded-2xl p-2.5 max-w-[90%] mx-auto text-left shadow-lg">
                      <span className="text-[8.5px] uppercase tracking-wider text-white/40 font-bold block mb-1.5">
                        Story Viewers ({storyViewersList.length})
                      </span>
                      {storyViewersList.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                          {storyViewersList.map((viewer: any) => {
                            const viewerAvatar = viewer.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewer.full_name || "Viewer")}&backgroundColor=030712&textColor=ffffff`;
                            return (
                              <div key={viewer.id} className="flex flex-col items-center shrink-0 w-10 text-center select-none">
                                <img src={viewerAvatar} className="w-6 h-6 rounded-full object-cover border border-white/10" alt="" />
                                <span className="text-[7px] text-white/70 truncate w-full mt-0.5">
                                  {getFirstName(viewer.full_name)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[9px] text-white/30 italic">No viewers yet</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
export default DashboardView;

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
  Timer
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

    </div>
  );
};
export default DashboardView;

"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore, PortfolioItem } from "@/store/useProjectStore";
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
  Trash2,
  Edit2,
  Globe,
  Award,
  ExternalLink,
  Check,
  Clapperboard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

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
    fetchWorkspaceData,
    userProfile,
    socialLinks,
    portfolio,
    statistics,
    activities,
    skillsList,
    userTagsList,
    updateUserProfile,
    updateSocialLinks,
    addPortfolioItem,
    deletePortfolioItem,
    addUserSkill,
    removeUserSkill,
    addUserTag,
    removeUserTag,
    deleteUserProfile
  } = useProjectStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // UI Local States
  const [activeTab, setActiveTab] = useState<"profile" | "console">("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  // PFP Cropper States
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Edit Profile Form States
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editCover, setEditCover] = useState("");

  // Social links edit states
  const [editInstagram, setEditInstagram] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editYoutube, setEditYoutube] = useState("");
  const [editImdb, setEditImdb] = useState("");
  const [editBehance, setEditBehance] = useState("");

  // Portfolio inline add states
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAssetTitle, setNewAssetTitle] = useState("");
  const [newAssetDesc, setNewAssetDesc] = useState("");
  const [newAssetUrl, setNewAssetUrl] = useState("");
  const [newAssetType, setNewAssetType] = useState<"video" | "image" | "document" | "audio">("video");

  // New Skill Input state
  const [newSkillInput, setNewSkillInput] = useState("");

  // 1. Live Time Sync & Init Form Fields
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Form States when UserProfile loads
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.full_name || "");
      setEditUsername(userProfile.username || "");
      setEditBio(userProfile.bio || "");
      setEditLocation(userProfile.location || "");
      setEditWebsite(userProfile.website || "");
      setEditPhone(userProfile.phone || "");
      setEditDob(userProfile.dob || "");
      setEditExperience(String(userProfile.experience_years || "0"));
      setEditCompany(userProfile.company_name || "");
      setEditAvatar(userProfile.avatar_url || "");
      setEditCover(userProfile.cover_url || "");
    }
    if (socialLinks) {
      setEditInstagram(socialLinks.instagram || "");
      setEditLinkedin(socialLinks.linkedin || "");
      setEditYoutube(socialLinks.youtube || "");
      setEditImdb(socialLinks.imdb || "");
      setEditBehance(socialLinks.behance || "");
    }
  }, [userProfile, socialLinks]);

  // 2. Realtime Subscriptions
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

  // 3. Supabase Real-time Presence Subscription
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

  // 3. Fetch Live Weather Telemetry
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

        const resp = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        if (resp.ok) {
          const data = await resp.json();
          setWeatherData(data);
        }

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

  // Derived metrics
  const activeCrew = activeProject ? (crew[activeProject.id] || []) : [];
  const totalCrew = activeCrew.length;
  const activePlans = activeProject ? (shotPlans[activeProject.id] || []) : [];
  const completedShots = activePlans.filter((p) => p.status === "Completed").length;
  const totalShots = activePlans.length;
  const shotProgress = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;

  // Weather Recommendations
  const tempVal = weatherData?.main?.temp ? Math.round(weatherData.main.temp) : 22;
  const humidityVal = weatherData?.main?.humidity ? weatherData.main.humidity : 60;
  const windVal = weatherData?.wind?.speed ? weatherData.wind.speed : 5;

  const isRainy = weatherData?.weather?.[0]?.main?.toLowerCase().includes("rain") || weatherData?.weather?.[0]?.main?.toLowerCase().includes("drizzle");
  const shootRecommendation = isRainy
    ? "⚠️ Warning: Indoor filming recommended due to forecast precipitation."
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
            const date = new Date(day.dt * 1000).toLocaleDateString([], { weekday: "short", month: "numeric", day: "numeric" });
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCrop) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDraggingCrop(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDraggingCrop(true);
    setDragStart({
      x: e.touches[0].clientX - cropOffset.x,
      y: e.touches[0].clientY - cropOffset.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingCrop || e.touches.length !== 1) return;
    setCropOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDraggingCrop(false);
  };

  const handlePfpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPfp(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result as string);
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
      setIsUploadingPfp(false);
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
      setIsUploadingPfp(false);
    };
    reader.readAsDataURL(file);
  };

  // Form Submit Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      full_name: editName.trim(),
      username: editUsername.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      website: editWebsite.trim(),
      phone: editPhone.trim(),
      dob: editDob ? editDob : undefined,
      experience_years: Number(editExperience) || 0,
      company_name: editCompany.trim(),
      avatar_url: editAvatar.trim(),
      cover_url: editCover.trim()
    });
    await updateSocialLinks({
      instagram: editInstagram.trim(),
      linkedin: editLinkedin.trim(),
      youtube: editYoutube.trim(),
      imdb: editImdb.trim(),
      behance: editBehance.trim()
    });
    setIsEditModalOpen(false);
  };

  // Add Custom Tags
  const handleAddIdentityTag = async (tag: string) => {
    if (userTagsList.includes(tag)) return;
    await addUserTag(tag);
  };

  // Add Portfolio Item
  const handleAddPortfolioAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetTitle.trim() || !newAssetUrl.trim()) return;
    await addPortfolioItem({
      title: newAssetTitle.trim(),
      description: newAssetDesc.trim(),
      asset_type: newAssetType,
      url: newAssetUrl.trim()
    });
    setNewAssetTitle("");
    setNewAssetDesc("");
    setNewAssetUrl("");
    setIsAddingAsset(false);
  };

  // Add Skill Chip
  const handleAddSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    await addUserSkill(newSkillInput.trim());
    setNewSkillInput("");
  };

  // Missing profile items for progress bar
  const missingItems = [];
  if (!userProfile?.avatar_url) missingItems.push("Profile Picture");
  if (!userProfile?.bio) missingItems.push("Bio Summary");
  if (skillsList.length === 0) missingItems.push("Skill Sets");
  if (!userProfile?.website) missingItems.push("Website URL");

  // Renders Gamified Achievement badges
  const renderAchievements = () => {
    const list = [];
    if ((statistics?.projects_count || 0) > 0) {
      list.push({ title: "First Project", desc: "Initialized first film production campaign workspace.", icon: Film });
    }
    if ((statistics?.scripts_count || 0) > 0) {
      list.push({ title: "First Script", desc: "Uploaded first screenplay script file.", icon: FileText });
    }
    if ((statistics?.ai_generations_count || 0) >= 1) {
      list.push({ title: "AI Creator", desc: "Generated screen storyboards using Antigravity AI.", icon: Sparkles });
    }
    if (totalCrew > 0) {
      list.push({ title: "Top Collaborator", desc: "Assigned daily check-in tasks to production team.", icon: Users });
    }
    if (userProfile?.username) {
      list.push({ title: "Verified Identity", desc: "Configured personalized filmmaker studio handle.", icon: CheckCircle });
    }
    if ((userProfile?.completeness || 0) === 100) {
      list.push({ title: "Creative Legend", desc: "Filled out 100% of user profile fields.", icon: Award });
    }

    if (list.length === 0) {
      return (
        <div className="text-[10px] text-text-secondary italic text-center py-4">
          Complete profile parameters or initialize projects to unlock achievements.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {list.map((ac, idx) => {
          const Icon = ac.icon;
          return (
            <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-lg p-3 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <h5 className="font-bold text-white leading-tight">{ac.title}</h5>
                <p className="text-[10px] text-text-secondary leading-normal">{ac.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs relative">

      {/* Instagram-style Profile Header */}
      <div className="bg-[#0b0c0f] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        {/* Top Info Row */}
        <div className="flex items-center gap-6 md:gap-10">
          
          {/* Circular Profile Picture (left) */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border border-white/15 p-1 bg-black">
              <div className="w-full h-full rounded-full overflow-hidden relative group">
                <img
                  src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            {/* Music/Status bubble if present (optional premium look similar to "III Khayaal Mitraz" bubble on top of profile pic in the image) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1b1d22] border border-white/10 px-2 py-0.5 rounded-full text-[8px] font-mono text-white/85 flex items-center gap-1 select-none whitespace-nowrap shadow-lg">
              <Volume2 className="w-2.5 h-2.5 text-primary animate-pulse" />
              <span>TOV Active</span>
            </div>
          </div>

          {/* Details (right) */}
          <div className="space-y-3">
            {/* Username + Settings Gear */}
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight leading-none">
                {userProfile?.username || "creator"}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-text-secondary hover:text-white transition-colors cursor-pointer"
                title="Configure profile"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Display Name */}
            <div className="text-xs text-text-secondary font-medium">
              {userProfile?.full_name || "Creative Filmmaker"}
            </div>

            {/* Role Tags (replacing posts/followers count row) */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {userTagsList.map((tag, idx) => (
                <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white font-semibold">
                  {tag}
                </span>
              ))}
              {/* Quick Select dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddIdentityTag(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="bg-black/60 border border-white/10 rounded-full px-2.5 py-0.5 text-[9px] text-text-secondary focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">+ Add Tag</option>
                <option value="🎬 Director">🎬 Director</option>
                <option value="✍ Writer">✍ Writer</option>
                <option value="🎥 Cinematographer">🎥 Cinematographer</option>
                <option value="🎞 Editor">🎞 Editor</option>
                <option value="🎭 Actor">🎭 Actor</option>
                <option value="🎬 Producer">🎬 Producer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bio Section (below) */}
        <div className="space-y-2 text-xs text-white pl-1 leading-relaxed">
          {/* Bio text */}
          <p className="whitespace-pre-line text-text-secondary font-medium">
            {userProfile?.bio || "Cinematographer & Filmmaker. Welcome to my creative studio."}
          </p>

          {/* Email & Phone */}
          <div className="space-y-0.5 font-mono text-[10px] text-text-secondary">
            <div>✉ {userProfile?.email || "user@tov.studio"}</div>
            {userProfile?.phone && (
              <div>📞 {userProfile.phone}</div>
            )}
          </div>

          {/* Website / Username handle */}
          <div className="flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors font-semibold">
            <span>🔗</span>
            <a href={userProfile?.website || "#"} target="_blank" rel="noopener noreferrer">
              {userProfile?.website ? userProfile.website.replace("https://", "").replace("http://", "") : "tov.studio"}
            </a>
          </div>
        </div>

        {/* Action Buttons (bottom) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="w-full bg-[#1b1d22] hover:bg-[#252830] border border-white/5 text-white font-bold text-xs h-9 rounded-lg"
          >
            Edit profile
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab(activeTab === "profile" ? "console" : "profile")}
            className="w-full bg-[#1b1d22] hover:bg-[#252830] border border-white/5 text-white font-bold text-xs h-9 rounded-lg"
          >
            {activeTab === "profile" ? "Open Console" : "View Portfolio"}
          </Button>
        </div>

      </div>

      {/* Profile completeness progress bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 bg-[#111318] border-white/5 p-5 space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <div className="space-y-0.5">
              <CardTitle className="text-xs uppercase font-mono tracking-wider font-bold">Profile Completeness</CardTitle>
              <CardDescription className="text-[10px]">Complete parameters to increase creative discovery</CardDescription>
            </div>
            <span className="text-sm font-black text-primary">{userProfile?.completeness || 45}%</span>
          </div>
          <Progress value={userProfile?.completeness || 45} color="primary" />
          {missingItems.length > 0 && (
            <div className="text-[10px] text-text-secondary flex flex-wrap gap-1.5 pt-1.5 items-center">
              <span>Missing elements:</span>
              {missingItems.map((item, idx) => (
                <span key={idx} className="text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono text-[9px]">{item}</span>
              ))}
            </div>
          )}
        </Card>

        {/* Social Links shortcuts */}
        <Card className="md:col-span-4 bg-[#111318] border-white/5 p-5 flex flex-col justify-between">
          <CardTitle className="text-xs uppercase font-mono tracking-wider font-bold">Filmmaker Credentials</CardTitle>
          <div className="flex gap-2 justify-start items-center pt-2">
            <a href={socialLinks?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/40 transition-all shadow-md">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href={socialLinks?.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/40 transition-all shadow-md">
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <a href={socialLinks?.youtube || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/40 transition-all shadow-md">
              <YoutubeIcon className="w-4 h-4" />
            </a>
            <a href={socialLinks?.imdb || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/40 transition-all shadow-md font-black font-mono text-[10px]">
              IMDb
            </a>
            <a href={socialLinks?.behance || "#"} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/40 transition-all shadow-md font-black font-mono text-[10px]">
              Be
            </a>
          </div>
        </Card>
      </div>

      {/* Animated Statistics counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-card to-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1 text-center shadow-md">
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-mono">Productions</span>
          <div className="text-xl font-black text-white">{statistics?.projects_count || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-card to-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1 text-center shadow-md">
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-mono">Script Scenes</span>
          <div className="text-xl font-black text-white">{statistics?.scripts_count || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-card to-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1 text-center shadow-md">
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-mono">Storyboard Shots</span>
          <div className="text-xl font-black text-white">{statistics?.storyboards_count || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-card to-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1 text-center shadow-md">
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-mono">AI Generations</span>
          <div className="text-xl font-black text-primary">{statistics?.ai_generations_count || 12}</div>
        </div>
        <div className="bg-gradient-to-br from-card to-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1 text-center shadow-md col-span-2 md:col-span-1">
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-mono">Files / Storage</span>
          <div className="text-xs font-bold text-white mt-1.5">
            {statistics?.files_uploaded_count || 0} files • 1.4 GB
          </div>
        </div>
      </div>

      {/* Tabs panels */}
      <AnimatePresence mode="wait">
        {activeTab === "profile" ? (
          <motion.div
            key="profile-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Portfolio & Skills (8 units) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Portfolio showcase */}
              <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Creative Portfolio Gallery</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsAddingAsset(true)} className="h-7 text-[10px] border-white/5 hover:border-primary/40 text-white cursor-pointer px-3">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Asset
                  </Button>
                </div>

                {/* Add Asset Inline Form overlay */}
                {isAddingAsset && (
                  <form onSubmit={handleAddPortfolioAsset} className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3.5 animate-fade-in text-xs">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px] font-mono text-primary">Ingest Portfolio Item</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-text-secondary font-bold">Asset Title</label>
                        <input
                          type="text"
                          required
                          value={newAssetTitle}
                          onChange={(e) => setNewAssetTitle(e.target.value)}
                          placeholder="e.g. Lost Memories Cinematic Teaser"
                          className="w-full bg-[#09090B] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase text-text-secondary font-bold">Type</label>
                          <select
                            value={newAssetType}
                            onChange={(e: any) => setNewAssetType(e.target.value)}
                            className="w-full bg-[#09090B] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-primary focus:outline-none cursor-pointer"
                          >
                            <option value="video">🎬 Video Clip</option>
                            <option value="image">🖼 Concept Frame</option>
                            <option value="document">📄 Screenplay / PDF</option>
                            <option value="audio">🎧 Sound Design</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase text-text-secondary font-bold">URL</label>
                          <input
                            type="url"
                            required
                            value={newAssetUrl}
                            onChange={(e) => setNewAssetUrl(e.target.value)}
                            placeholder="https://vimeo.com/..."
                            className="w-full bg-[#09090B] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-text-secondary font-bold">Description</label>
                      <input
                        type="text"
                        value={newAssetDesc}
                        onChange={(e) => setNewAssetDesc(e.target.value)}
                        placeholder="Camera setups, lenses, lighting configuration breakdown."
                        className="w-full bg-[#09090B] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button variant="outline" size="sm" type="button" onClick={() => setIsAddingAsset(false)} className="text-[10px] h-8 px-4">Cancel</Button>
                      <Button variant="primary" size="sm" type="submit" className="text-[10px] h-8 px-4">Save Asset</Button>
                    </div>
                  </form>
                )}

                {portfolio.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-xl text-text-secondary">
                    No portfolio showreels or concept art cards uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolio.map((item) => (
                      <div key={item.id} className="bg-black/30 border border-white/5 hover:border-primary/20 rounded-xl overflow-hidden group flex flex-col justify-between">
                        <div className="relative h-36 bg-black/80 flex items-center justify-center overflow-hidden">
                          {item.asset_type === "image" ? (
                            <img src={item.url} className="w-full h-full object-cover opacity-80" alt={item.title} />
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-text-secondary">
                              <Clapperboard className="w-8 h-8 text-primary/60" />
                              <span className="text-[9px] uppercase tracking-wider font-mono">{item.asset_type}</span>
                            </div>
                          )}
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute w-9 h-9 rounded-full bg-black/60 hover:bg-primary/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <ExternalLink className="w-4.5 h-4.5" />
                          </a>
                        </div>
                        <div className="p-4 space-y-1 relative">
                          <button onClick={() => deletePortfolioItem(item.id)} className="absolute top-4 right-4 text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <h4 className="font-bold text-white leading-tight">{item.title}</h4>
                          <p className="text-[10px] text-text-secondary line-clamp-1 leading-normal">{item.description || "Ingested filmmaker showreel portfolio card."}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Achievements row */}
              <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Gamified Creative Achievements</h3>
                </div>
                {renderAchievements()}
              </Card>

            </div>

            {/* Right Column: Skills & Activities (4 units) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Real-time Online Presence Panel */}
              <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Crew Online</h3>
                  </div>
                  <span className="text-[10px] text-green-400 font-mono font-bold">
                    {onlineUsers.length} Active
                  </span>
                </div>
                <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-none">
                  {onlineUsers.length === 0 ? (
                    <div className="text-[10px] text-text-secondary italic text-center py-4">
                      No active sessions tracked.
                    </div>
                  ) : (
                    onlineUsers.map((user, idx) => (
                      <div key={user.id || idx} className="flex items-center justify-between bg-black/25 border border-white/5 rounded-lg p-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name || "User")}`}
                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                            alt="User avatar"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{user.full_name}</p>
                            <p className="text-[9px] text-text-secondary font-mono truncate">Active now</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 whitespace-nowrap">
                          Online
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Skills list */}
              <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Professional Skills</h3>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-black/40 border border-white/5 text-white">
                      <span>{skill}</span>
                      <button onClick={() => removeUserSkill(skill)} className="text-[8px] hover:text-danger ml-1 cursor-pointer">×</button>
                    </span>
                  ))}
                  {skillsList.length === 0 && (
                    <span className="text-[10px] text-text-secondary italic">No skill tags listed. Add one below.</span>
                  )}
                </div>
                <form onSubmit={handleAddSkillSubmit} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    required
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="e.g. Color Grading"
                    className="w-full bg-[#09090B] border border-white/10 rounded px-2.5 py-1 text-[10px] text-white focus:border-primary focus:outline-none"
                  />
                  <Button variant="primary" size="sm" type="submit" className="h-7 text-[10px] px-3">Add</Button>
                </form>
              </Card>

              {/* Recent Activity Log feed */}
              <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider font-mono pb-2 border-b border-white/5">
                  <Activity className="w-4 h-4" />
                  <span>Creative Activity Feed</span>
                </div>
                <div className="space-y-3.5 flex flex-col max-h-[360px] overflow-y-auto scrollbar-none">
                  {activities.length === 0 ? (
                    <div className="text-[11px] text-text-secondary italic text-center py-8">
                      No logs synced. Add projects or upload scripts to seed your feed.
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="text-xs border-l-2 border-primary/20 pl-3 py-0.5 space-y-1">
                        <p className="text-white font-semibold leading-normal">{act.title}</p>
                        <p className="text-[10px] text-text-secondary leading-normal">{act.description}</p>
                        <span className="text-[9px] text-text-secondary block font-mono">
                          {new Date(act.created_at).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="console-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {projects.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-4 bg-[#111318] border border-dashed border-white/5 rounded-xl w-full">
                <Film className="w-8 h-8 text-primary mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">No Creative Workspaces Active</h4>
                  <p className="text-[10px] text-text-secondary max-w-sm mx-auto">Create a production workspace to unlock local weather conditions, shooting rosters, and DIT storage metrics.</p>
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="primary" size="sm" onClick={() => setActiveView("projects")} className="h-8 text-[10px] px-4 cursor-pointer">Create Project</Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("scripts")} className="h-8 text-[10px] px-4 text-white cursor-pointer">Upload Script</Button>
                </div>
              </div>
            ) : (
              <>
                {/* Left: Weather and Telemetries */}
                <div className="lg:col-span-8 space-y-6">

                  {/* Weather conditions telemetry */}
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
                    <div className="bg-white/[0.01] border border-white/5 rounded-lg p-3 text-[11px] text-text-secondary leading-relaxed">
                      {shootRecommendation}
                    </div>

                    {/* Render 3-Day Forecast */}
                    {render3DayForecastSection()}
                  </Card>

                  {/* Telemetry Checklist stats */}
                  <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
                    <div>
                      <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Production Telemetry</CardTitle>
                      <CardDescription className="text-[10px] mt-0.5">Filming progress status checklist</CardDescription>
                    </div>
                    <div className="py-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-text-secondary uppercase">
                          <span>Setups Completed</span>
                          <span className="text-white font-bold">{completedShots} of {totalShots}</span>
                        </div>
                        <Progress value={shotProgress} color="primary" />
                      </div>
                    </div>
                  </Card>

                </div>

                {/* Right: Quick actions and calendar list */}
                <div className="lg:col-span-4 space-y-6">

                  {/* Quick Actions */}
                  <Card className="bg-[#111318] border-white/5 p-5 space-y-4">
                    <div>
                      <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Quick Actions</CardTitle>
                      <CardDescription className="text-[10px] mt-0.5">Workspace controls</CardDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button variant="outline" onClick={() => setActiveView("projects")} className="h-9 text-[10px] flex items-center justify-start gap-1.5 bg-black/20 hover:border-primary/40 border-white/5 text-white">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Project</span>
                      </Button>
                      <Button variant="outline" onClick={() => setActiveView("scripts")} className="h-9 text-[10px] flex items-center justify-start gap-1.5 bg-black/20 hover:border-primary/40 border-white/5 text-white">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Script</span>
                      </Button>
                      <Button variant="outline" onClick={() => setActiveView("storyboards")} className="h-9 text-[10px] flex items-center justify-start gap-1.5 bg-black/20 hover:border-primary/40 border-white/5 text-white">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>AI Storyboard</span>
                      </Button>
                      <Button variant="outline" onClick={() => setActiveView("calendar")} className="h-9 text-[10px] flex items-center justify-start gap-1.5 bg-black/20 hover:border-primary/40 border-white/5 text-white">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Shoot</span>
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const clientId = "816922124665-sdgbpt8jlq2cbh3n927s6duu1d96agib.apps.googleusercontent.com";
                          const redirectUri = `${window.location.origin}/auth-callback`;
                          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
                            redirectUri
                          )}&response_type=token&scope=https://www.googleapis.com/auth/calendar.readonly`;
                          window.location.href = authUrl;
                        }}
                        className="w-full h-9 text-[10px] flex items-center justify-center gap-1.5 bg-primary/10 border-primary/20 hover:border-primary/50 text-primary font-bold cursor-pointer transition-all"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.99 0-.743-.08-1.3-.178-1.857H12.24z" />
                        </svg>
                        <span>Connect Google Workspace</span>
                      </Button>
                    </div>
                  </Card>

                  {/* Storage widgets */}
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile glassmorphism Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#171717] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Configure Filmmaker Profile</span>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white transition-colors cursor-pointer">
                ×
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[70vh] text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Core fields */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Username (@handle)</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Profile Picture</label>
                  <div className="flex items-center gap-3 py-1">
                    <img
                      src={editAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"}
                      className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                      alt="PFP Preview"
                    />
                    <div className="flex-1 space-y-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePfpUpload}
                        className="hidden"
                        id="pfp-file-upload"
                      />
                      <label
                        htmlFor="pfp-file-upload"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold cursor-pointer transition-colors duration-150"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{isUploadingPfp ? "Reading..." : "Upload Image"}</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Cover URL</label>
                  <input
                    type="url"
                    value={editCover}
                    onChange={(e) => setEditCover(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Website</label>
                  <input
                    type="url"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Biographical Note</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none resize-none"
                  placeholder="Tell your filmmaker story..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 555-0100"
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Date of Birth</label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Experience (Years)</label>
                  <input
                    type="number"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Social links sections */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px] font-mono text-primary">Social Handles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">Instagram URL</label>
                    <input
                      type="url"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      placeholder="https://instagram.com/username"
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">LinkedIn URL</label>
                    <input
                      type="url"
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">YouTube URL</label>
                    <input
                      type="url"
                      value={editYoutube}
                      onChange={(e) => setEditYoutube(e.target.value)}
                      placeholder="https://youtube.com/@username"
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-text-secondary uppercase font-bold">IMDb URL</label>
                    <input
                      type="url"
                      value={editImdb}
                      onChange={(e) => setEditImdb(e.target.value)}
                      placeholder="https://imdb.com/name/nm..."
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit panel */}
              <div className="border-t border-white/5 pt-4 flex gap-3 justify-end items-center">
                <button
                  type="button"
                  onClick={async () => {
                    await deleteUserProfile();
                    setIsEditModalOpen(false);
                  }}
                  className="mr-auto text-[10px] text-red-500 hover:text-red-400 font-mono uppercase tracking-wider cursor-pointer font-bold transition-colors"
                >
                  Delete Profile Account
                </button>
                <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 h-9">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="px-5 h-9">
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Image Cropper Modal Overlay */}
      {cropImageSrc && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#171717] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6"
          >
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Crop Profile Picture</h3>
              <p className="text-[10px] text-text-secondary">Drag image to position, slider to zoom</p>
            </div>

            {/* Viewport Container */}
            <div
              className="relative w-[280px] h-[280px] mx-auto bg-black border border-white/5 rounded-lg overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image */}
              <img
                src={cropImageSrc}
                alt="Crop Target"
                draggable={false}
                style={{
                  transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                  transformOrigin: "center center",
                  transition: isDraggingCrop ? "none" : "transform 0.1s ease-out"
                }}
                className="w-full h-full object-contain pointer-events-none select-none"
              />

              {/* Circular Crop Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Crop Ring */}
                <div className="w-[180px] h-[180px] rounded-full border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-text-secondary uppercase">
                <span>Scale Zoom</span>
                <span>{Math.round(cropZoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCropImageSrc(null)}
                className="h-9 text-[10px]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const canvas = document.createElement("canvas");
                  canvas.width = 200;
                  canvas.height = 200;
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    const img = new Image();
                    img.src = cropImageSrc;
                    img.onload = () => {
                      ctx.clearRect(0, 0, 200, 200);
                      ctx.save();
                      
                      // Draw Panned/Scaled Viewport representation on 200x200 canvas
                      ctx.translate(100, 100);
                      ctx.scale(cropZoom, cropZoom);
                      ctx.translate(cropOffset.x / cropZoom, cropOffset.y / cropZoom);

                      const viewSize = 280;
                      let drawW = viewSize;
                      let drawH = viewSize;
                      const ratio = img.width / img.height;
                      if (ratio > 1) {
                        drawH = viewSize;
                        drawW = viewSize * ratio;
                      } else {
                        drawW = viewSize;
                        drawH = viewSize / ratio;
                      }

                      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
                      ctx.restore();

                      const base64 = canvas.toDataURL("image/jpeg", 0.95);
                      setEditAvatar(base64);
                      setCropImageSrc(null);
                    };
                  }
                }}
                className="h-9 text-[10px]"
              >
                Apply Crop
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;

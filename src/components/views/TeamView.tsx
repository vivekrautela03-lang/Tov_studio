"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Search,
  Users,
  Contact,
  Phone,
  Mail,
  GraduationCap,
  Globe,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  UserCheck,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Department {
  id: string;
  name: string;
}

interface CastMember {
  id: string;
  full_name: string;
  gender: 'Male' | 'Female';
  phone: string;
  email: string;
  college: string;
  status: 'Available' | 'Busy' | 'Shooting';
  skills: string[];
  languages: string[];
  age?: number;
  experience: string;
  instagram: string;
  portfolio: string;
  notes: string;
  photo_url: string;
}

interface CrewMember {
  id: string;
  full_name: string;
  department_id: string;
  position: string;
  phone: string;
  email: string;
  college: string;
  availability: 'Available' | 'Busy' | 'Shooting';
  experience: string;
  skills: string[];
  notes: string;
  photo_url: string;
  departments?: Department; // joined
}

export const TeamView: React.FC = () => {
  // Load data from Zustand store instead of local states
  const { castMembers: cast, crewMembers: crew, departmentsList: departments, fetchWorkspaceData } = useProjectStore();
  const [loading, setLoading] = useState(false);

  // UI Filtering & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainTab, setSelectedMainTab] = useState<"all" | "cast" | "crew">("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [filterCollege, setFilterCollege] = useState<string>("all");

  // Admin & Modal Mode States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null); // For detailed view
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form States (for Add/Edit Member)
  const [formType, setFormType] = useState<"cast" | "crew">("cast");
  const [formId, setFormId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formGender, setFormGender] = useState<"Male" | "Female">("Male");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCollege, setFormCollege] = useState("");
  const [formStatus, setFormStatus] = useState<"Available" | "Busy" | "Shooting">("Available");
  const [formSkills, setFormSkills] = useState("");
  const [formLanguages, setFormLanguages] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formExperience, setFormExperience] = useState("");
  const [formInstagram, setFormInstagram] = useState("");
  const [formPortfolio, setFormPortfolio] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formPhoto, setFormPhoto] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formPosition, setFormPosition] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchWorkspaceData();
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Open Add Modal
  const openAddModal = (type: "cast" | "crew") => {
    setFormType(type);
    setFormId(null);
    setFormName("");
    setFormGender("Male");
    setFormPhone("");
    setFormEmail("");
    setFormCollege("");
    setFormStatus("Available");
    setFormSkills("");
    setFormLanguages("");
    setFormAge("");
    setFormExperience("");
    setFormInstagram("");
    setFormPortfolio("");
    setFormNotes("");
    setFormPhoto("");
    setFormPosition("");
    setFormDeptId(departments[0]?.id || "");
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (member: any, type: "cast" | "crew") => {
    setFormType(type);
    setFormId(member.id);
    setFormName(member.full_name || "");
    setFormPhone(member.phone || "");
    setFormEmail(member.email || "");
    setFormCollege(member.college || "");
    setFormPhoto(member.photo_url || "");
    setFormNotes(member.notes || "");
    setFormExperience(member.experience || "");
    setFormSkills(member.skills?.join(", ") || "");

    if (type === "cast") {
      setFormGender(member.gender || "Male");
      setFormStatus(member.status || "Available");
      setFormLanguages(member.languages?.join(", ") || "");
      setFormAge(member.age?.toString() || "");
      setFormInstagram(member.instagram || "");
      setFormPortfolio(member.portfolio || "");
    } else {
      setFormStatus(member.availability || "Available");
      setFormPosition(member.position || "");
      setFormDeptId(member.department_id || departments[0]?.id || "");
    }
    setIsEditModalOpen(true);
  };

  // Delete Member
  const handleDeleteMember = async (id: string, type: "cast" | "crew") => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      const table = type === "cast" ? "cast_members" : "crew_members";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    }
  };

  // Save Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedSkills = formSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (formType === "cast") {
        const parsedLanguages = formLanguages
          .split(",")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        const payload = {
          full_name: formName.trim(),
          gender: formGender,
          phone: formPhone.trim(),
          email: formEmail.trim(),
          college: formCollege.trim(),
          status: formStatus,
          skills: parsedSkills,
          languages: parsedLanguages,
          age: formAge ? parseInt(formAge) : null,
          experience: formExperience.trim(),
          instagram: formInstagram.trim(),
          portfolio: formPortfolio.trim(),
          notes: formNotes.trim(),
          photo_url: formPhoto || null
        };

        if (formId) {
          const { error } = await supabase
            .from("cast_members")
            .update(payload)
            .eq("id", formId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("cast_members").insert(payload);
          if (error) throw error;
        }
      } else {
        const payload = {
          full_name: formName.trim(),
          department_id: formDeptId || null,
          position: formPosition.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          college: formCollege.trim(),
          availability: formStatus,
          experience: formExperience.trim(),
          skills: parsedSkills,
          notes: formNotes.trim(),
          photo_url: formPhoto || null
        };

        if (formId) {
          const { error } = await supabase
            .from("crew_members")
            .update(payload)
            .eq("id", formId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("crew_members").insert(payload);
          if (error) throw error;
        }
      }

      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Save failed: " + err.message);
    }
  };

  // Get list of unique colleges for filters
  const allColleges = Array.from(
    new Set([
      ...cast.map((c) => c.college).filter(Boolean),
      ...crew.map((cr) => cr.college).filter(Boolean)
    ])
  );

  // Filter Logic
  const filteredCast = cast.filter((c) => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (c.full_name || "").toLowerCase().includes(searchLower) ||
      (c.college || "").toLowerCase().includes(searchLower) ||
      (c.phone || "").toLowerCase().includes(searchLower) ||
      (c.email || "").toLowerCase().includes(searchLower) ||
      (c.skills || []).some((s: string) => s.toLowerCase().includes(searchLower)) ||
      (c.languages || []).some((l: string) => l.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    // 2. Category Filter
    if (selectedSubCategory === "female" && c.gender !== "Female") return false;
    if (selectedSubCategory === "male" && c.gender !== "Male") return false;

    // 3. Header Tab Filter
    if (selectedMainTab === "crew") return false;

    // 4. Dropdown Filters
    if (filterGender !== "all" && c.gender !== filterGender) return false;
    if (filterAvailability !== "all" && c.status !== filterAvailability) return false;
    if (filterCollege !== "all" && c.college !== filterCollege) return false;

    return true;
  });

  const filteredCrew = crew.filter((c) => {
    const searchLower = searchQuery.toLowerCase();
    const deptName = departments.find((d) => d.id === c.department_id)?.name || "Others";

    const matchesSearch =
      (c.full_name || "").toLowerCase().includes(searchLower) ||
      (c.position || "").toLowerCase().includes(searchLower) ||
      (c.college || "").toLowerCase().includes(searchLower) ||
      (c.phone || "").toLowerCase().includes(searchLower) ||
      (c.email || "").toLowerCase().includes(searchLower) ||
      deptName.toLowerCase().includes(searchLower) ||
      (c.skills || []).some((s: string) => s.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    // 2. Category Filter
    if (selectedSubCategory !== "all" && selectedSubCategory !== "female" && selectedSubCategory !== "male") {
      // It's a department name filter
      if (deptName !== selectedSubCategory) return false;
    }

    // 3. Header Tab Filter
    if (selectedMainTab === "cast") return false;

    // 4. Dropdown Filters
    if (filterGender !== "all") return false; // Crew members don't have gender fields in schema
    if (filterAvailability !== "all" && c.availability !== filterAvailability) return false;
    if (filterCollege !== "all" && c.college !== filterCollege) return false;

    return true;
  });

  const totalMembersCount = filteredCast.length + filteredCrew.length;

  return (
    <div className="space-y-8 animate-fade-in p-6 bg-black min-h-screen text-white select-none">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Team Management
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Complete database of cast characters and production crew categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`text-xs px-4 py-2 border rounded-lg transition-colors cursor-pointer ${
              isAdminMode
                ? "bg-primary/20 text-primary border-primary"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }`}
          >
            {isAdminMode ? "Exit Admin Mode" : "Admin Panel Access"}
          </Button>

          {isAdminMode && (
            <div className="flex gap-2">
              <Button
                onClick={() => openAddModal("cast")}
                className="bg-white text-black hover:bg-white/90 text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Cast
              </Button>
              <Button
                onClick={() => openAddModal("crew")}
                className="bg-white text-black hover:bg-white/90 text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Crew
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Filtering & Searching Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Category Navigation Tree */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-[#09090B] border border-white/5 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">Categories</h3>
            
            {/* Cast Section */}
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSelectedMainTab("cast");
                  setSelectedSubCategory("all");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                  selectedMainTab === "cast" && selectedSubCategory === "all"
                    ? "bg-white/10 text-white font-bold"
                    : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Contact className="w-4 h-4" /> Cast
                </span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60">
                  {cast.length}
                </span>
              </button>

              <div className="pl-6 space-y-1 border-l border-white/5 ml-4">
                <button
                  onClick={() => {
                    setSelectedMainTab("cast");
                    setSelectedSubCategory("female");
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                    selectedMainTab === "cast" && selectedSubCategory === "female"
                      ? "text-primary font-semibold"
                      : "text-text-secondary hover:text-white"
                  }`}
                >
                  Female Actors
                </button>
                <button
                  onClick={() => {
                    setSelectedMainTab("cast");
                    setSelectedSubCategory("male");
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                    selectedMainTab === "cast" && selectedSubCategory === "male"
                      ? "text-primary font-semibold"
                      : "text-text-secondary hover:text-white"
                  }`}
                >
                  Male Actors
                </button>
              </div>
            </div>

            {/* Crew Section */}
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSelectedMainTab("crew");
                  setSelectedSubCategory("all");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                  selectedMainTab === "crew" && selectedSubCategory === "all"
                    ? "bg-white/10 text-white font-bold"
                    : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Crew
                </span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60">
                  {crew.length}
                </span>
              </button>

              <div className="pl-6 space-y-1 border-l border-white/5 ml-4 max-h-[220px] overflow-y-auto pr-1">
                {departments.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedMainTab("crew");
                      setSelectedSubCategory(d.name);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer truncate ${
                      selectedMainTab === "crew" && selectedSubCategory === d.name
                        ? "text-primary font-semibold"
                        : "text-text-secondary hover:text-white"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedMainTab !== "all" || selectedSubCategory !== "all") && (
              <Button
                onClick={() => {
                  setSelectedMainTab("all");
                  setSelectedSubCategory("all");
                }}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs py-1.5 rounded-lg cursor-pointer text-text-secondary hover:text-white"
              >
                Reset Tree View
              </Button>
            )}
          </div>
        </div>

        {/* Right Side Main Content Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search, Dropdowns, Filter Bar */}
          <div className="bg-[#09090B] border border-white/5 p-4 rounded-xl space-y-4">
            
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search by name, role, college, email, phone, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Gender (Cast Only) */}
              <div>
                <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Gender</label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  disabled={selectedMainTab === "crew"}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary disabled:opacity-40"
                >
                  <option value="all">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Status / Availability */}
              <div>
                <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Availability</label>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="all">All States</option>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Shooting">Shooting</option>
                </select>
              </div>

              {/* College Filter */}
              <div>
                <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">College</label>
                <select
                  value={filterCollege}
                  onChange={(e) => setFilterCollege(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="all">All Colleges</option>
                  {allColleges.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Active Filters Summary */}
            <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
              <div className="text-text-secondary">
                Showing <span className="text-white font-bold">{totalMembersCount}</span> matching members
              </div>
              
              {(filterGender !== "all" || filterAvailability !== "all" || filterCollege !== "all" || searchQuery !== "") && (
                <button
                  onClick={() => {
                    setFilterGender("all");
                    setFilterAvailability("all");
                    setFilterCollege("all");
                    setSearchQuery("");
                  }}
                  className="text-primary text-[11px] font-semibold hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

          </div>

          {/* Members Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {loading ? (
              <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl animate-pulse">
                Loading team database...
              </div>
            ) : totalMembersCount === 0 ? (
              <div className="col-span-full py-16 text-center text-xs text-text-secondary border border-dashed border-white/5 rounded-xl">
                No team members found matching current query filters.
              </div>
            ) : (
              <>
                {/* 1. Cast Members Display */}
                {filteredCast.map((c) => {
                  const avatarPlaceholder = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    c.full_name
                  )}&backgroundColor=030712&textColor=ffffff`;

                  return (
                    <Card
                      key={c.id}
                      className="border border-white/5 hover:border-white/10 bg-[#09090B] flex flex-col justify-between overflow-hidden group transition-all duration-300"
                    >
                      <CardContent className="p-5 space-y-4">
                        
                        {/* Member PFP and Details */}
                        <div className="flex gap-4 items-start">
                          <img
                            src={c.photo_url || avatarPlaceholder}
                            alt={c.full_name}
                            className="w-16 h-20 object-cover rounded-lg border border-white/10 ring-2 ring-primary/10 shrink-0 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="space-y-1.5 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                              {c.full_name}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-semibold inline-block">
                              Cast (Actor)
                            </span>
                            <div className="text-[10px] text-text-secondary truncate flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" /> {c.college}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                          <div>
                            <span className="text-[9px] text-text-secondary block uppercase">Gender</span>
                            <span className="text-xs text-white font-medium">{c.gender}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-secondary block uppercase">Availability</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded inline-block ${
                                c.status === "Available"
                                  ? "bg-green-500/10 text-green-400"
                                  : c.status === "Shooting"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                        </div>

                        {/* Actions Suite */}
                        <div className="border-t border-white/5 pt-3 flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedMember({ ...c, type: "cast" });
                              setIsDetailModalOpen(true);
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[11px] py-1.5 rounded-lg border border-white/10 cursor-pointer"
                          >
                            View Profile
                          </Button>

                          {isAdminMode ? (
                            <div className="flex gap-1.5">
                              <Button
                                onClick={() => openEditModal(c, "cast")}
                                className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteMember(c.id, "cast")}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg border border-red-500/20 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              {c.phone && (
                                <a
                                  href={`tel:${c.phone}`}
                                  title="Call"
                                  className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 flex items-center justify-center"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {c.email && (
                                <a
                                  href={`mailto:${c.email}`}
                                  title="Email"
                                  className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 flex items-center justify-center"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}

                {/* 2. Crew Members Display */}
                {filteredCrew.map((cr) => {
                  const avatarPlaceholder = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    cr.full_name
                  )}&backgroundColor=030712&textColor=ffffff`;
                  const deptName = cr.departments?.name || "Others";

                  return (
                    <Card
                      key={cr.id}
                      className="border border-white/5 hover:border-white/10 bg-[#09090B] flex flex-col justify-between overflow-hidden group transition-all duration-300"
                    >
                      <CardContent className="p-5 space-y-4">
                        
                        {/* Member PFP and Details */}
                        <div className="flex gap-4 items-start">
                          <img
                            src={cr.photo_url || avatarPlaceholder}
                            alt={cr.full_name}
                            className="w-16 h-20 object-cover rounded-lg border border-white/10 ring-2 ring-primary/10 shrink-0 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="space-y-1.5 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                              {cr.full_name}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 bg-white/5 text-text-secondary border border-white/10 rounded font-semibold inline-block truncate max-w-full">
                              {deptName}
                            </span>
                            <div className="text-[10px] text-text-secondary truncate flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" /> {cr.college}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                          <div>
                            <span className="text-[9px] text-text-secondary block uppercase">Role</span>
                            <span className="text-xs text-white font-medium truncate block max-w-[100px]">{cr.position || "Crew"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-secondary block uppercase">Availability</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded inline-block ${
                                cr.availability === "Available"
                                  ? "bg-green-500/10 text-green-400"
                                  : cr.availability === "Shooting"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {cr.availability}
                            </span>
                          </div>
                        </div>

                        {/* Actions Suite */}
                        <div className="border-t border-white/5 pt-3 flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedMember({ ...cr, type: "crew" });
                              setIsDetailModalOpen(true);
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[11px] py-1.5 rounded-lg border border-white/10 cursor-pointer"
                          >
                            View Profile
                          </Button>

                          {isAdminMode ? (
                            <div className="flex gap-1.5">
                              <Button
                                onClick={() => openEditModal(cr, "crew")}
                                className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteMember(cr.id, "crew")}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg border border-red-500/20 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              {cr.phone && (
                                <a
                                  href={`tel:${cr.phone}`}
                                  title="Call"
                                  className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 flex items-center justify-center"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {cr.email && (
                                <a
                                  href={`mailto:${cr.email}`}
                                  title="Email"
                                  className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 flex items-center justify-center"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}

          </div>

        </div>

      </div>

      {/* Edit/Add Member Modal Form */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#09090B] border border-white/10 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-primary" />
                {formId ? "Edit Team Member" : `Add New ${formType === "cast" ? "Cast" : "Crew"} Member`}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleSaveMember} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Type Switcher (only for new members) */}
              {!formId && (
                <div>
                  <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Classification</label>
                  <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => setFormType("cast")}
                      className={`text-xs py-2 rounded-md font-semibold transition-all cursor-pointer ${
                        formType === "cast" ? "bg-white text-black" : "text-text-secondary hover:text-white"
                      }`}
                    >
                      Cast (Actors)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("crew")}
                      className={`text-xs py-2 rounded-md font-semibold transition-all cursor-pointer ${
                        formType === "crew" ? "bg-white text-black" : "text-text-secondary hover:text-white"
                      }`}
                    >
                      Crew (Production)
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Upload Area */}
              <div>
                <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-black rounded-lg border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {formPhoto ? (
                      <img src={formPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/20" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/5 hover:bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 cursor-pointer"
                    >
                      Upload New Image
                    </Button>
                    <p className="text-[9px] text-text-secondary">PNG, JPG, or GIF. Photo cropped automatically.</p>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="Enter full name"
                  />
                </div>

                {formType === "cast" ? (
                  <div>
                    <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Gender</label>
                    <select
                      value={formGender}
                      onChange={(e: any) => setFormGender(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Department</label>
                    <select
                      value={formDeptId}
                      onChange={(e) => setFormDeptId(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Mobile Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. email@tov.studio"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">College</label>
                  <input
                    type="text"
                    value={formCollege}
                    onChange={(e) => setFormCollege(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="College or University"
                  />
                </div>

                {formType === "cast" ? (
                  <div>
                    <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Age (Optional)</label>
                    <input
                      type="number"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      placeholder="Age"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Position / Specific Role</label>
                    <input
                      type="text"
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. Cinematographer, Lead Editor"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Status / Availability</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Shooting">Shooting</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Experience (Years/Projects)</label>
                  <input
                    type="text"
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. 2 Years, 5 Short Films"
                  />
                </div>

              </div>

              <div>
                <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Skills (Comma Separated)</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Acting, Dubbing, Focus Pulling"
                />
              </div>

              {formType === "cast" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Languages</label>
                      <input
                        type="text"
                        value={formLanguages}
                        onChange={(e) => setFormLanguages(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                        placeholder="Hindi, English"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Instagram ID</label>
                      <input
                        type="text"
                        value={formInstagram}
                        onChange={(e) => setFormInstagram(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                        placeholder="@username"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Portfolio URL</label>
                      <input
                        type="url"
                        value={formPortfolio}
                        onChange={(e) => setFormPortfolio(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] text-text-secondary block mb-1.5 uppercase font-mono tracking-wider">Director / Production Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Private notes about character audit, wardrobe size, tools used, etc."
                />
              </div>

            </form>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/5 bg-black flex justify-end gap-3 shrink-0">
              <Button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs px-5 py-2.5 rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveMember}
                className="bg-white text-black hover:bg-white/90 text-xs px-6 py-2.5 rounded-lg font-bold cursor-pointer"
              >
                Save Member Record
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Detailed Member Profile Modal Overlay */}
      {isDetailModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#09090B] border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Close */}
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Header Banner */}
            <div className="h-28 bg-white/5 border-b border-white/5 flex items-end px-6 pb-4">
              <div className="flex gap-4 items-end translate-y-8">
                <img
                  src={
                    selectedMember.photo_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      selectedMember.full_name
                    )}&backgroundColor=030712&textColor=ffffff`
                  }
                  alt={selectedMember.full_name}
                  className="w-20 h-24 object-cover rounded-xl border-2 border-white ring-4 ring-black"
                />
                <div className="pb-1">
                  <h2 className="text-base font-bold text-white leading-tight">{selectedMember.full_name}</h2>
                  <span className="text-[10px] text-primary font-semibold tracking-wider uppercase block mt-1">
                    {selectedMember.type === "cast" ? "Cast Actor" : selectedMember.position || "Crew Member"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info Fields */}
            <div className="p-6 pt-12 space-y-5">
              
              {/* College & Availability */}
              <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-[9px] text-text-secondary block uppercase font-mono">College</span>
                  <span className="text-white font-medium">{selectedMember.college || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-secondary block uppercase font-mono">Availability</span>
                  <span
                    className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded inline-block ${
                      (selectedMember.status || selectedMember.availability) === "Available"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {selectedMember.status || selectedMember.availability}
                  </span>
                </div>
              </div>

              {/* Core Details */}
              <div className="space-y-3.5 text-xs text-text-secondary">
                {selectedMember.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-white/40" />
                    <span className="text-white">{selectedMember.phone}</span>
                  </div>
                )}
                {selectedMember.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/40" />
                    <span className="text-white">{selectedMember.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-white/40" />
                  <span>Experience: <strong className="text-white">{selectedMember.experience || "Not listed"}</strong></span>
                </div>
              </div>

              {/* Skills and Languages Tags */}
              <div className="space-y-3">
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div>
                    <span className="text-[9px] text-text-secondary block uppercase font-mono mb-1.5">Talents & Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.skills.map((s: string) => (
                        <span key={s} className="text-[10px] bg-white/5 border border-white/5 text-white px-2 py-0.5 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMember.type === "cast" && selectedMember.languages && selectedMember.languages.length > 0 && (
                  <div>
                    <span className="text-[9px] text-text-secondary block uppercase font-mono mb-1.5">Languages</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.languages.map((l: string) => (
                        <span key={l} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-semibold">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Private Director Notes */}
              {selectedMember.notes && (
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg text-xs leading-relaxed text-text-secondary font-sans">
                  <span className="text-[9px] text-text-secondary block uppercase font-mono mb-1">Director Notes</span>
                  {selectedMember.notes}
                </div>
              )}

              {/* Action Links */}
              <div className="flex gap-3 border-t border-white/5 pt-4">
                {selectedMember.instagram && (
                  <a
                    href={`https://instagram.com/${selectedMember.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Globe className="w-4 h-4" /> Instagram
                  </a>
                )}
                {selectedMember.portfolio && (
                  <a
                    href={selectedMember.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" /> Portfolio
                  </a>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default TeamView;

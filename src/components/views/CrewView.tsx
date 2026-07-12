"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Search,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Globe,
  Info,
  X,
  Plus,
  Trash2,
  UploadCloud,
  MessageSquare,
  Music,
  Mic,
  Loader2,
  Play,
  Pause
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useRef } from "react";

interface Department {
  id: string;
  name: string;
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
  project_id?: string;
  departments?: Department;
}

interface CrewViewProps {
  projectScope?: string;
}

export const CrewView: React.FC<CrewViewProps> = ({ projectScope }) => {
  const { createChatChannel, setActiveChannelId, setActiveView } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Add Member State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newMember, setNewMember] = useState({
    full_name: "",
    department_id: "",
    position: "",
    phone: "",
    email: "",
    college: "",
    availability: "Available" as any,
    experience: "",
    skillsInput: "",
    notes: "",
    photo_url: ""
  });

  // Notes, Profiles, Current User, and Audio State
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [isNoteComposerOpen, setIsNoteComposerOpen] = useState(false);
  const [noteContentInput, setNoteContentInput] = useState("");
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [itunesSearchQuery, setItunesSearchQuery] = useState("");
  const [itunesSongs, setItunesSongs] = useState<any[]>([]);
  const [isSearchingItunes, setIsSearchingItunes] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecordDuration, setVoiceRecordDuration] = useState(0);

  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceIntervalRef = useRef<any>(null);

  const fetchNotes = async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .gt("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false });
    if (data) setNotes(data);
  };

  const fetchCrew = async () => {
    setLoading(true);
    try {
      let query = supabase.from("crew_members").select(`
        *,
        departments (
          id,
          name
        )
      `);

      if (projectScope) {
        query = query.eq("project_id", projectScope);
      }

      const { data, error } = await query.order("full_name");
      if (data) setCrew(data);

      const { data: deptData } = await supabase.from("departments").select("*").order("name");
      if (deptData) setDepartments(deptData);
    } catch (err) {
      console.error("Error fetching crew:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    supabase.from("profiles").select("*").then(({ data }) => {
      if (data) setProfiles(data);
    });

    fetchCrew();
    fetchNotes();

    return () => {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
    };
  }, [projectScope]);

  const getCrewMemberNote = (member: CrewMember) => {
    const matchedProfile = profiles.find(
      (p) =>
        (member.email && p.email?.toLowerCase() === member.email?.toLowerCase()) ||
        (member.full_name && p.full_name?.toLowerCase() === member.full_name?.toLowerCase())
    );
    if (!matchedProfile) return null;
    return notes.find((n) => n.user_id === matchedProfile.id);
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
    audio.play();

    audio.onended = () => {
      setPlayingNoteId(null);
    };
  };

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
    if (!currentUser) {
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
          user_id: currentUser.id,
          content: noteContentInput.trim(),
          audience: "everyone",
          song_id: selectedSong?.id || null,
          song_name: selectedSong?.name || null,
          song_artist: selectedSong?.artist || null,
          song_artwork: selectedSong?.artwork || null,
          song_preview_url: selectedSong?.preview_url || null
        });

      if (error) throw error;
      
      setNoteContentInput("");
      setSelectedSong(null);
      setItunesSearchQuery("");
      setItunesSongs([]);
      setIsNoteComposerOpen(false);
      
      fetchNotes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMessageCrewMember = async (member: CrewMember) => {
    const matchedProfile = profiles.find(
      (p) =>
        (member.email && p.email?.toLowerCase() === member.email?.toLowerCase()) ||
        (member.full_name && p.full_name?.toLowerCase() === member.full_name?.toLowerCase())
    );
    if (!matchedProfile) {
      alert("This crew member does not have a user profile in the system.");
      return;
    }

    try {
      const chanId = await createChatChannel("Direct Message", false, [matchedProfile.id]);
      if (chanId) {
        setActiveChannelId(chanId);
        setActiveView("chat");
      }
    } catch (err: any) {
      alert("Error creating conversation: " + err.message);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMember((prev) => ({ ...prev, photo_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.full_name.trim()) return;

    try {
      const skills = newMember.skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
      const { error } = await supabase
        .from("crew_members")
        .insert({
          full_name: newMember.full_name.trim(),
          department_id: newMember.department_id || null,
          position: newMember.position.trim(),
          phone: newMember.phone.trim(),
          email: newMember.email.trim(),
          college: newMember.college.trim(),
          availability: newMember.availability,
          experience: newMember.experience.trim(),
          skills: skills,
          notes: newMember.notes.trim(),
          photo_url: newMember.photo_url,
          project_id: projectScope || null
        });

      if (error) throw error;
      alert("Crew member added successfully!");
      setIsAddOpen(false);
      setNewMember({
        full_name: "",
        department_id: "",
        position: "",
        phone: "",
        email: "",
        college: "",
        availability: "Available",
        experience: "",
        skillsInput: "",
        notes: "",
        photo_url: ""
      });
      fetchCrew();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMember = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this crew member?")) return;

    try {
      const { error } = await supabase.from("crew_members").delete().eq("id", id);
      if (error) throw error;
      fetchCrew();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredCrew = crew.filter((c) => {
    const searchLower = search.toLowerCase();
    const deptName = c.departments?.name || "Others";
    return (
      (c.full_name || "").toLowerCase().includes(searchLower) ||
      (c.position || "").toLowerCase().includes(searchLower) ||
      (c.college || "").toLowerCase().includes(searchLower) ||
      (c.phone || "").toLowerCase().includes(searchLower) ||
      (c.email || "").toLowerCase().includes(searchLower) ||
      deptName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-white text-xs">
      
      {/* Search and filter header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search crew name, role, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-[#22d3ee] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-text-secondary font-mono mr-2">
            Count: <span className="text-white font-semibold">{filteredCrew.length}</span>
          </span>
          <Button
            onClick={() => setIsNoteComposerOpen(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 border-[#22d3ee]/40 text-[#22d3ee] hover:bg-[#22d3ee]/10"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Share note...</span>
          </Button>
          <Button
            onClick={() => setIsAddOpen(true)}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </Button>
        </div>
      </div>

      {/* Grid of Crew Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-text-secondary border border-dashed border-white/5 rounded-xl animate-pulse">
            Loading crew database...
          </div>
        ) : filteredCrew.length === 0 ? (
          <div className="col-span-full py-16 text-center text-text-secondary border border-dashed border-white/5 rounded-xl">
            No crew members assigned or found. Click Add Team Member to input crew data.
          </div>
        ) : (
          filteredCrew.map((c) => {
            const avatarPlaceholder = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              c.full_name
            )}&backgroundColor=030712&textColor=ffffff`;
            const deptName = c.departments?.name || "Others";

            return (
              <Card key={c.id} className="border border-white/5 hover:border-white/10 bg-[#09090B] flex flex-col justify-between overflow-hidden group transition-all duration-300">
                <CardContent className="p-5 space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="relative shrink-0">
                      {/* Bubble popup speech bubble above card avatar */}
                      {(() => {
                        const userNote = getCrewMemberNote(c);
                        if (!userNote) return null;
                        const isVoice = userNote.content?.includes("🎙️") || userNote.content?.toLowerCase().includes("[voice note]") || userNote.content?.toLowerCase().includes("voice note");
                        const voiceTag = userNote.content ? userNote.content.replace("🎙️", "").replace("[Voice Note]", "").replace("[voice note]", "").trim() : "Voice Note";

                        return (
                          <div
                            onClick={() => handlePlayNote(userNote)}
                            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-20 backdrop-blur-md bg-black/85 border border-white/20 text-white rounded-xl px-2.5 py-1.5 shadow-lg text-[10px] cursor-pointer hover:scale-105 transition-transform whitespace-nowrap flex items-center gap-1.5 min-w-[60px]"
                            title={userNote.content}
                          >
                            {userNote.song_name ? (
                              <span className="flex items-center gap-1">
                                🎵 {userNote.song_name} - {userNote.song_artist}
                              </span>
                            ) : isVoice ? (
                              <span className="flex items-center gap-1">
                                🎙️ {voiceTag}
                              </span>
                            ) : (
                              <span>💬 {userNote.content.length > 20 ? userNote.content.substring(0, 17) + "..." : userNote.content}</span>
                            )}

                            {playingNoteId === userNote.id && (
                              <span className="flex items-end gap-[1.5px] h-2.5 w-3 shrink-0 inline-flex">
                                <span className="w-[1.5px] bg-cyan-400 animate-[bounce_0.8s_infinite_0.1s] h-1" />
                                <span className="w-[1.5px] bg-cyan-400 animate-[bounce_0.8s_infinite_0.3s] h-3" />
                                <span className="w-[1.5px] bg-cyan-400 animate-[bounce_0.8s_infinite_0.5s] h-2" />
                              </span>
                            )}
                            <div className="absolute bottom-[-3.5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black/85 border-r border-b border-white/20 rotate-45" />
                          </div>
                        );
                      })()}

                      <img
                        src={c.photo_url || avatarPlaceholder}
                        alt={c.full_name}
                        className="w-14 h-14 object-cover rounded-full border border-white/10 ring-2 ring-primary/10 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{c.full_name}</h4>
                      <p className="text-xs text-primary font-medium truncate">{c.position || "Crew"}</p>
                      <span className="text-[10px] text-text-secondary block font-mono">{deptName}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-text-secondary border-t border-white/5 pt-3">
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        <span className="text-white font-mono">{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        <span className="text-white truncate">{c.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      c.availability === "Available" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {c.availability}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleMessageCrewMember(c)}
                        variant="outline"
                        size="sm"
                        className="text-[10px] py-1 px-2 border-[#22d3ee]/40 text-[#22d3ee] hover:bg-[#22d3ee]/10 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </Button>
                      <button
                        onClick={(e) => handleDeleteMember(c.id, e)}
                        className="p-1 rounded bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ADD MEMBER DIALOG */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-[480px] max-w-full max-h-[90vh] overflow-y-auto bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-white scrollbar-none">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Add Crew Data</span>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded bg-white/5 text-text-secondary hover:text-white cursor-pointer font-bold"
              >
                X
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="flex justify-center">
                <label className="relative cursor-pointer group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center overflow-hidden bg-black/40">
                    {newMember.photo_url ? (
                      <img src={newMember.photo_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-text-secondary" />
                    )}
                  </div>
                  <span className="text-[9px] text-text-secondary mt-1 font-bold">Avatar Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Crew member name"
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Department</label>
                  <select
                    value={newMember.department_id}
                    onChange={(e) => setNewMember({ ...newMember, department_id: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Position / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Director, Gaffer"
                    value={newMember.position}
                    onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="Contact number"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">College</label>
                  <input
                    type="text"
                    placeholder="College / Institute"
                    value={newMember.college}
                    onChange={(e) => setNewMember({ ...newMember, college: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Availability</label>
                  <select
                    value={newMember.availability}
                    onChange={(e) => setNewMember({ ...newMember, availability: e.target.value as any })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Shooting">Shooting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Editing, Sound Mix"
                  value={newMember.skillsInput}
                  onChange={(e) => setNewMember({ ...newMember, skillsInput: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Add Crew Member</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIQUID GLASS NOTE COMPOSER MODAL --- */}
      {isNoteComposerOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[420px] bg-white/10 backdrop-blur-md border border-white/20 rounded-[28px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Compose Note</span>
              <button 
                onClick={() => {
                  setIsNoteComposerOpen(false);
                  setSelectedSong(null);
                  setItunesSearchQuery("");
                  setItunesSongs([]);
                  setNoteContentInput("");
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

              {/* iTunes attachment */}
              <div className="border border-white/10 rounded-2xl p-3 bg-black/30 space-y-3">
                <label className="block text-[10px] uppercase text-white/50 font-bold">Attach Music (Optional)</label>
                {selectedSong ? (
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
                        onClick={() => setSelectedSong(null)}
                        className="px-2 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold"
                      >
                        Remove
                      </button>
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
                                onClick={() => setSelectedSong(song)}
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
    </div>
  );
};
export default CrewView;

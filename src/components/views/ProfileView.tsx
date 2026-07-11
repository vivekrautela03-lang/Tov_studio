"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import {
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Edit2,
  Settings,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
  MessageCircle,
  Eye,
  Camera,
  Heart,
  Grid,
  Archive,
  Compass
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ProfileView: React.FC = () => {
  const { setActiveView } = useProjectStore();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [socials, setSocials] = useState<any>({
    instagram: "psf_vivek",
    linkedin: "",
    facebook: ""
  });
  const [highlights, setHighlights] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    designation: "",
    phone: "",
    instaHandle: "",
    linkedinUrl: "",
    facebookUrl: ""
  });

  // Note bubble state
  const [note, setNote] = useState("Note...");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState("");

  // Modals for uploads
  const [isAddHighlightOpen, setIsAddHighlightOpen] = useState(false);
  const [newHighlight, setNewHighlight] = useState({ label: "", photoUrl: "" });
  
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ title: "", description: "", url: "", coverUrl: "" });

  const fetchProfileData = async (currentUser: any) => {
    if (!currentUser) return;
    try {
      // 1. Fetch Profile details
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profData) {
        setProfile(profData);
        
        // Load note from localStorage
        const savedNote = localStorage.getItem(`tov_note_${currentUser.id}`);
        if (savedNote) setNote(savedNote);

        // 2. Fetch Socials
        const { data: socialData } = await supabase
          .from("social_links")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();

        const activeSocials = socialData || { instagram: "psf_vivek", linkedin: "", facebook: "" };
        setSocials(activeSocials);

        setEditForm({
          fullName: profData.full_name || "",
          username: profData.username || "psf_vivek",
          bio: profData.bio || "I write the feelings\npeople are too afraid to say,\ncapture moments\ntime tries to steal,... more",
          designation: profData.role || "Filmmaker",
          phone: profData.phone || "+91 9876543210",
          instaHandle: activeSocials.instagram || "",
          linkedinUrl: activeSocials.linkedin || "",
          facebookUrl: activeSocials.facebook || ""
        });
      }

      // 3. Fetch Highlights
      const { data: highlightData } = await supabase
        .from("bts_highlights")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: true });
      if (highlightData) setHighlights(highlightData);

      // 4. Fetch Portfolio items
      const { data: portData } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (portData) setPortfolio(portData);

    } catch (err) {
      console.error("Error loading profile dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      fetchProfileData(user);
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Update profiles
      const { error: pError } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.fullName,
          username: editForm.username,
          bio: editForm.bio,
          role: editForm.designation,
          phone: editForm.phone
        })
        .eq("id", user.id);

      if (pError) throw pError;

      // Update social links
      const { error: sError } = await supabase
        .from("social_links")
        .upsert({
          user_id: user.id,
          instagram: editForm.instaHandle,
          linkedin: editForm.linkedinUrl,
          facebook: editForm.facebookUrl
        });

      if (sError) throw sError;

      alert("Profile updated successfully!");
      setIsEditing(false);
      fetchProfileData(user);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save Note Bubble
  const handleSaveNote = () => {
    if (!user) return;
    const cleanNote = newNoteInput.trim() || "Note...";
    setNote(cleanNote);
    localStorage.setItem(`tov_note_${user.id}`, cleanNote);
    setIsEditingNote(false);
  };

  // Upload highlight photo (FileReader base64)
  const handleHighlightPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewHighlight((prev) => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Save BTS Highlight
  const handleSaveHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlight.label.trim() || !newHighlight.photoUrl) return;

    try {
      const { error } = await supabase
        .from("bts_highlights")
        .insert({
          user_id: user.id,
          label: newHighlight.label.trim(),
          photo_url: newHighlight.photoUrl
        });

      if (error) throw error;
      setIsAddHighlightOpen(false);
      setNewHighlight({ label: "", photoUrl: "" });
      fetchProfileData(user);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete BTS Highlight
  const handleDeleteHighlight = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this BTS Highlight?")) return;
    try {
      const { error } = await supabase.from("bts_highlights").delete().eq("id", id);
      if (error) throw error;
      fetchProfileData(user);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Upload portfolio cover image
  const handlePortfolioCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPortfolio((prev) => ({ ...prev, coverUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Save Portfolio Item
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolio.title.trim() || !newPortfolio.coverUrl) return;

    try {
      const { error } = await supabase
        .from("portfolio")
        .insert({
          user_id: user.id,
          title: newPortfolio.title.trim(),
          description: newPortfolio.description.trim(),
          asset_type: "image",
          url: newPortfolio.url.trim() || "#",
          thumbnail_url: newPortfolio.coverUrl
        });

      if (error) throw error;
      setIsAddPortfolioOpen(false);
      setNewPortfolio({ title: "", description: "", url: "", coverUrl: "" });
      fetchProfileData(user);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Portfolio Item
  const handleDeletePortfolio = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this portfolio item?")) return;
    try {
      const { error } = await supabase.from("portfolio").delete().eq("id", id);
      if (error) throw error;
      fetchProfileData(user);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#22d3ee]" />
      </div>
    );
  }

  const avatarPlaceholder = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    profile?.full_name || "psf_vivek"
  )}&backgroundColor=030712&textColor=ffffff`;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20 text-white text-xs">
      
      {/* 1. INSTAGRAM PROFILE STYLE HEADER */}
      <div className="flex flex-col md:flex-row items-start gap-8 bg-black/30 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
        
        {/* Avatar Container with Notes Bubble */}
        <div className="relative shrink-0 mx-auto md:mx-0">
          
          {/* Floating Notes Bubble */}
          <div
            onClick={() => {
              setNewNoteInput(note === "Note..." ? "" : note);
              setIsEditingNote(true);
            }}
            className="absolute -top-4 -left-2 z-10 bg-neutral-900 border border-white/10 rounded-full px-3 py-1 text-[10px] text-text-secondary cursor-pointer shadow-lg hover:border-[#22d3ee] transition-all flex items-center gap-1 select-none"
          >
            <span>{note}</span>
            <span className="text-[8px] opacity-40">▼</span>
          </div>

          <div className="w-28 h-28 rounded-full border border-white/10 ring-4 ring-neutral-900 flex items-center justify-center overflow-hidden bg-neutral-800">
            <img
              src={profile?.avatar_url || avatarPlaceholder}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
        </div>

        {/* Bio, Handle and Stats info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-1.5">
              <span>{profile?.username || "psf_vivek"}</span>
              <Settings className="w-4 h-4 text-text-secondary hover:text-white cursor-pointer" onClick={() => setIsEditing(true)} />
            </h2>
          </div>

          <p className="text-[11px] text-[#22d3ee] font-semibold">
            {profile?.full_name || "vivekrautela_07"}
          </p>

          {/* Stats Roster */}
          <div className="flex items-center justify-center md:justify-start gap-6 text-xs text-text-secondary">
            <div>
              <span className="text-white font-bold">{portfolio.length}</span> posts
            </div>
            <div>
              <span className="text-white font-bold">121</span> followers
            </div>
            <div>
              <span className="text-white font-bold">121</span> following
            </div>
          </div>

          {/* Bio text block */}
          <div className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line font-mono max-w-md">
            {profile?.bio}
          </div>

          {/* Contact Details & Handles */}
          <div className="space-y-1.5 text-[11px] text-text-secondary font-mono border-t border-white/5 pt-3">
            <div className="flex justify-center md:justify-start items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#22d3ee]" />
              <span className="text-white">{profile?.phone || "No phone contact"}</span>
            </div>
            <div className="flex justify-center md:justify-start items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#22d3ee]" />
              <span className="text-white">{user?.email}</span>
            </div>
            
            {/* Clickable Social Tags */}
            <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
              {socials.instagram && (
                <a
                  href={`https://instagram.com/${socials.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500 hover:text-white transition-all text-[9.5px] font-bold"
                >
                  📸 @{socials.instagram}
                </a>
              )}
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all text-[9.5px] font-bold"
                >
                  💼 LinkedIn
                </a>
              )}
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all text-[9.5px] font-bold"
                >
                  👥 Facebook
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 justify-center md:justify-start">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 sm:flex-initial px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-colors text-center text-xs cursor-pointer select-none"
            >
              Edit profile
            </button>
            <button
              onClick={() => alert("Archive history is currently empty.")}
              className="flex-1 sm:flex-initial px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-colors text-center text-xs cursor-pointer select-none"
            >
              View archive
            </button>
          </div>

        </div>
      </div>

      {/* 2. BTS HIGHLIGHTS BAR */}
      <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
        <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">BTS Highlights</h4>
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-1">
          
          {/* Add highlight circle trigger */}
          <button
            onClick={() => setIsAddHighlightOpen(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 select-none group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 group-hover:border-[#22d3ee] flex items-center justify-center bg-black/40 transition-colors">
              <Plus className="w-5 h-5 text-text-secondary group-hover:text-white" />
            </div>
            <span className="text-[9px] text-text-secondary group-hover:text-white font-medium">New BTS</span>
          </button>

          {/* Highlight Circles list */}
          {highlights.map((hl) => (
            <div
              key={hl.id}
              className="flex flex-col items-center gap-1.5 shrink-0 relative group select-none cursor-pointer"
              onClick={() => {
                setSelectedMember({ photo_url: hl.photo_url, full_name: hl.label } as any);
                setIsDetailOpen(true);
              }}
            >
              <div className="w-14 h-14 rounded-full border-2 border-[#22d3ee]/60 overflow-hidden ring-2 ring-neutral-950 bg-neutral-800">
                <img src={hl.photo_url} className="w-full h-full object-cover" alt="" />
              </div>
              <span className="text-[9.5px] text-white truncate max-w-[60px]">{hl.label}</span>
              
              <button
                onClick={(e) => handleDeleteHighlight(hl.id, e)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PORTFOLIO GRID (Instagram Grid posts) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            <Grid className="w-4.5 h-4.5 text-[#22d3ee]" />
            <span>Creative Portfolio Grid</span>
          </div>
          <Button
            onClick={() => setIsAddPortfolioOpen(true)}
            variant="primary"
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Portfolio</span>
          </Button>
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center py-16 bg-[#121212]/30 border border-dashed border-white/5 rounded-2xl">
            <Camera className="w-8 h-8 text-text-secondary mx-auto animate-pulse" />
            <p className="text-[10px] font-bold text-text-secondary uppercase mt-2">No portfolio items posted yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {portfolio.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-white/5 group cursor-pointer bg-neutral-900"
              >
                <img src={item.thumbnail_url} className="w-full h-full object-cover" alt="" />
                
                {/* Overlay hover details */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-white text-[10px] truncate max-w-[80px]">{item.title}</h5>
                    <button
                      onClick={(e) => handleDeletePortfolio(item.id, e)}
                      className="p-1 rounded bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[9px] text-text-secondary line-clamp-3 leading-snug">{item.description}</p>
                  
                  {item.url && item.url !== "#" && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9px] text-[#22d3ee] hover:underline font-bold"
                    >
                      View Asset
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-[480px] max-w-full max-h-[90vh] overflow-y-auto bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-white scrollbar-none">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Edit profile</span>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded bg-white/5 text-text-secondary hover:text-white cursor-pointer font-bold"
              >
                X
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Username / Handle</label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Designation</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Bio Description</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee] resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest pt-2">Connect socials</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Instagram handle</label>
                  <input
                    type="text"
                    placeholder="e.g. psf_vivek"
                    value={editForm.instaHandle}
                    onChange={(e) => setEditForm({ ...editForm, instaHandle: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">LinkedIn link</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Facebook link</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={editForm.facebookUrl}
                    onChange={(e) => setEditForm({ ...editForm, facebookUrl: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT NOTE MODAL */}
      {isEditingNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-80 bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#22d3ee]">Update Note Bubble</h4>
            <input
              type="text"
              maxLength={20}
              placeholder="Share a thought (max 20 chars)..."
              value={newNoteInput}
              onChange={(e) => setNewNoteInput(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
            />
            <div className="flex justify-end gap-2 text-xs">
              <Button variant="outline" size="sm" onClick={() => setIsEditingNote(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveNote}>Save Note</Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD HIGHLIGHT MODAL */}
      {isAddHighlightOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-96 bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#22d3ee]">Capture BTS highlight</h4>
            
            <form onSubmit={handleSaveHighlight} className="space-y-4">
              <div className="flex justify-center">
                <label className="relative cursor-pointer group flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center overflow-hidden bg-black/40">
                    {newHighlight.photoUrl ? (
                      <img src={newHighlight.photoUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-text-secondary" />
                    )}
                  </div>
                  <span className="text-[9px] text-text-secondary mt-1 font-bold">Select Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleHighlightPhoto} />
                </label>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Highlight Label</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="e.g. Audition"
                  value={newHighlight.label}
                  onChange={(e) => setNewHighlight({ ...newHighlight, label: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddHighlightOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Save Highlight</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PORTFOLIO MODAL */}
      {isAddPortfolioOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-[400px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#22d3ee]">Add Portfolio Asset</h4>
            
            <form onSubmit={handleSavePortfolio} className="space-y-4">
              <div className="flex justify-center">
                <label className="relative cursor-pointer group flex flex-col items-center">
                  <div className="w-20 h-20 border-2 border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center overflow-hidden bg-black/40 rounded-lg">
                    {newPortfolio.coverUrl ? (
                      <img src={newPortfolio.coverUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-text-secondary" />
                    )}
                  </div>
                  <span className="text-[9px] text-text-secondary mt-1 font-bold">Select cover image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePortfolioCover} />
                </label>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Asset Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neon Alley Gaffer sequence"
                  value={newPortfolio.title}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">External Link / URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPortfolio.url}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, url: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Cinematic properties or shot notes..."
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddPortfolioOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Add Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIGHLIGHT PREVIEW LIGHTBOX DIALOG */}
      {isDetailOpen && selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={() => setIsDetailOpen(false)}>
          <div className="relative max-w-lg max-h-[80vh] flex flex-col items-center gap-3">
            <img src={selectedMember.photo_url} className="max-w-full max-h-[70vh] rounded-lg object-contain" alt="" />
            <h4 className="text-sm font-bold text-white tracking-widest uppercase">{selectedMember.full_name}</h4>
          </div>
        </div>
      )}

    </div>
  );
};
export default ProfileView;

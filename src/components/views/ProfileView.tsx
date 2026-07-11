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
  Film,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const ProfileView: React.FC = () => {
  const { setActiveView, projects } = useProjectStore();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    bio: "",
    designation: "",
    phone: "",
    portfolio: "",
    experience: "",
    socialTwitter: "",
    socialLinkedin: "",
    socialGithub: ""
  });

  const fetchProfile = async (currentUser: any) => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data) {
        setProfile(data);
        setEditForm({
          fullName: data.full_name || "",
          bio: data.bio || "",
          designation: data.role || "Producer",
          phone: data.phone || "",
          portfolio: data.portfolio_url || "",
          experience: data.experience || "5 years",
          socialTwitter: data.twitter_url || "",
          socialLinkedin: data.linkedin_url || "",
          socialGithub: data.github_url || ""
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      fetchProfile(user);
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.fullName,
          bio: editForm.bio,
          role: editForm.designation,
          phone: editForm.phone,
          portfolio_url: editForm.portfolio,
          experience: editForm.experience,
          twitter_url: editForm.socialTwitter,
          linkedin_url: editForm.socialLinkedin,
          github_url: editForm.socialGithub
        })
        .eq("id", user.id);

      if (error) throw error;

      // Reload
      await fetchProfile(user);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createdProjects = projects.filter((p) => p.director === profile?.full_name);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Banner profile header */}
      <Card className="overflow-hidden border-white/5 bg-neutral-900/50 backdrop-blur-md">
        <div className="h-32 bg-gradient-to-r from-cyan-950 via-neutral-900 to-cyan-950 relative" />
        <CardContent className="p-6 relative -mt-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-24 h-24 rounded-full object-cover ring-4 ring-neutral-900 border-2 border-primary/20 bg-neutral-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#22d3ee] flex items-center justify-center font-bold text-black text-3xl ring-4 ring-neutral-900 border-2 border-primary/20">
                {profile?.full_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || "U"}
              </div>
            )}
            <div className="space-y-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase tracking-wider">
                {profile?.role || "Filmmaker"}
              </span>
              <h2 className="text-xl font-black text-white">{profile?.full_name || user?.email?.split("@")[0]}</h2>
              <p className="text-xs text-text-secondary">@{profile?.full_name?.toLowerCase().replace(/\s+/g, "") || "user"}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-primary" />
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveView("settings")}
              className="flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEditing ? (
        <form onSubmit={handleUpdateProfile}>
          <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Profile Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none resize-none"
                  placeholder="Tell us about your cinematic style, achievements..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Portfolio Link</label>
                  <input
                    type="url"
                    value={editForm.portfolio}
                    onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Experience Years</label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <h4 className="text-xs font-bold text-white uppercase tracking-wider pt-2">Social Connections</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">Twitter URL</label>
                  <input
                    type="url"
                    value={editForm.socialTwitter}
                    onChange={(e) => setEditForm({ ...editForm, socialTwitter: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editForm.socialLinkedin}
                    onChange={(e) => setEditForm({ ...editForm, socialLinkedin: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={editForm.socialGithub}
                    onChange={(e) => setEditForm({ ...editForm, socialGithub: e.target.value })}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <User className="w-4 h-4 text-[#22d3ee]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Biography</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {profile?.bio || "No biography provided. Click Edit Profile to tell your story."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Film className="w-4 h-4 text-[#22d3ee]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Productions Created</h3>
                </div>
                {createdProjects.length === 0 ? (
                  <p className="text-xs text-text-secondary">No production workspaces created yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {createdProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveView("projects");
                        }}
                        className="p-3 rounded-lg bg-black/30 border border-white/5 hover:border-[#22d3ee]/20 transition-all cursor-pointer flex gap-3 items-center"
                      >
                        <img src={p.coverImage} className="w-10 h-10 object-cover rounded-md" alt="" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                          <span className="text-[10px] text-text-secondary">{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Briefcase className="w-4 h-4 text-[#22d3ee]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Details</h3>
                </div>
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="text-white truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="text-white">{profile?.phone || "No phone contact"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-text-secondary shrink-0" />
                    {profile?.portfolio_url ? (
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {profile.portfolio_url.replace("https://", "")}
                      </a>
                    ) : (
                      <span className="text-text-secondary">No portfolio website</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="text-white">Experience: {profile?.experience || "None specified"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-neutral-900/50 backdrop-blur-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Globe className="w-4 h-4 text-[#22d3ee]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Social Links</h3>
                </div>
                <div className="flex gap-3">
                  {profile?.twitter_url ? (
                    <a
                      href={profile.twitter_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-white hover:text-primary transition-all"
                    >
                      <TwitterIcon />
                    </a>
                  ) : (
                    <div className="p-2 rounded-lg bg-white/5 opacity-30 text-white">
                      <TwitterIcon />
                    </div>
                  )}
                  {profile?.linkedin_url ? (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-white hover:text-primary transition-all"
                    >
                      <LinkedinIcon />
                    </a>
                  ) : (
                    <div className="p-2 rounded-lg bg-white/5 opacity-30 text-white">
                      <LinkedinIcon />
                    </div>
                  )}
                  {profile?.github_url ? (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-white hover:text-primary transition-all"
                    >
                      <GithubIcon />
                    </a>
                  ) : (
                    <div className="p-2 rounded-lg bg-white/5 opacity-30 text-white">
                      <GithubIcon />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

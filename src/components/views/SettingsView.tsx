"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Settings,
  Shield,
  Cpu,
  RefreshCw,
  Key,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  User,
  Mail,
  Phone,
  Trash2,
  UserPlus,
  LogOut,
  CheckCircle,
  ShieldAlert,
  Database,
  Activity,
  HardDrive,
  UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SettingsView: React.FC = () => {
  const { activeProjectId, memberRole, addProject, projects } = useProjectStore();
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "team" | "system" | "admin">("profile");

  // Load environment database helper
  const getDbProductionId = (projectId: string) => {
    if (projectId === "proj-1") return "d3b07384-d113-4ec6-a558-7e289bf449f1";
    if (projectId === "proj-2") return "44b6c33c-35cd-43ff-90a6-c956b7cdb10d";
    if (projectId === "proj-3") return "5c84a861-26be-45a2-9ad6-2ea8fb60a5ad";
    return projectId;
  };

  // Profile States
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileRole, setProfileRole] = useState("Crew");
  
  // Loading & Alerts states
  const [profileLoading, setProfileLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Team Directory States
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Crew");
  const [teamLoading, setTeamLoading] = useState(false);

  // System Integrations States
  const [frameIOSync, setFrameIOSync] = useState(true);
  const [arriSync, setArriSync] = useState(true);
  const [redLink, setRedLink] = useState(false);
  const [aiModel, setAiModel] = useState("tov-screenplay-v4-fine-tuned");

  // Owner Admin States
  const [adminProjTitle, setAdminProjTitle] = useState("");
  const [adminProjDirector, setAdminProjDirector] = useState("");
  const [adminProjBudget, setAdminProjBudget] = useState("$2.5M");
  const [adminProjLocation, setAdminProjLocation] = useState("Studio Soundstage C");
  const [adminInviteEmail, setAdminInviteEmail] = useState("");
  const [adminInviteRole, setAdminInviteRole] = useState("Crew");
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);

  // Asset Upload States
  const [uploadTargetProject, setUploadTargetProject] = useState("");
  const [uploadAssetType, setUploadAssetType] = useState("script");
  const [uploadAssetTitle, setUploadAssetTitle] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Set default target project when projects array changes
  useEffect(() => {
    if (projects.length > 0 && !uploadTargetProject) {
      setUploadTargetProject(projects[0].id);
    }
  }, [projects]);

  // Fetch Profile info on load
  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url || "");
          setProfileRole(data.role || "Crew");
        }
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  };

  // Fetch Active Team info
  const fetchTeam = async () => {
    setTeamLoading(true);
    const prodId = getDbProductionId(activeProjectId);
    try {
      const { data: mData } = await supabase
        .from("production_members")
        .select(`
          id,
          role,
          user_id,
          profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("production_id", prodId);
      
      if (mData) setMembers(mData);

      const { data: iData } = await supabase
        .from("invitations")
        .select("*")
        .eq("production_id", prodId);
      
      if (iData) setInvitations(iData);
    } catch (err) {
      console.error("Error loading team members:", err);
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchAdminAuditLogs = async () => {
    try {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setAdminAuditLogs(data);
    } catch (err) {
      console.error("Error loading activity logs:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTeam();
  }, [activeProjectId]);

  useEffect(() => {
    if (activeSubTab === "admin") {
      fetchAdminAuditLogs();
    }
  }, [activeSubTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No active auth session.");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
          bio: bio,
          avatar_url: avatarUrl,
          role: profileRole
        })
        .eq("id", user.id);

      if (error) throw error;
      setSuccessMsg("Your studio profile has been updated.");
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile settings.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const prodId = getDbProductionId(activeProjectId);

      const { error } = await supabase
        .from("invitations")
        .insert({
          email: inviteEmail.trim(),
          role: inviteRole,
          production_id: prodId,
          invited_by: user?.id
        });

      if (error) throw error;
      setInviteEmail("");
      fetchTeam();
      alert("Invitation successfully sent!");
    } catch (err: any) {
      alert(err.message || "Failed to dispatch team invitation.");
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (confirm("Cancel this pending invitation?")) {
      const { error } = await supabase.from("invitations").delete().eq("id", inviteId);
      if (error) alert(error.message);
      else fetchTeam();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the production workspace?")) {
      const { error } = await supabase.from("production_members").delete().eq("id", memberId);
      if (error) alert(error.message);
      else fetchTeam();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleDeleteAccount = async () => {
    if (confirm("WARNING: Are you absolutely sure you want to delete your TOV Studio account? This action is permanent and cannot be undone.")) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { error } = await supabase.from("profiles").delete().eq("id", user.id);
        if (error) throw error;
        
        await supabase.auth.signOut();
      } catch (err: any) {
        alert(err.message || "Failed to delete account. Please sign in again and retry.");
      }
    }
  };

  // Owner specific dashboard functions
  const handleAdminCreateProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProjTitle.trim()) return;

    try {
      addProject({
        title: adminProjTitle,
        tagline: `Cinematic feature production directed by ${adminProjDirector}.`,
        director: adminProjDirector,
        location: adminProjLocation,
        budget: adminProjBudget,
        budgetVal: parseInt(adminProjBudget.replace(/[^0-9]/g, "")) * 100000 || 2500000,
        spentVal: 0,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Pre-Production",
        coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80"
      });

      const { data: prodData } = await supabase
        .from("productions")
        .insert({
          title: adminProjTitle,
          status: "Pre-Production",
          budget: adminProjBudget
        })
        .select()
        .single();

      if (prodData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            action: "CREATE_PRODUCTION",
            details: `Created new production workspace: ${adminProjTitle}`
          });
        }
      }

      setAdminProjTitle("");
      setAdminProjDirector("");
      alert(`Production workspace "${adminProjTitle}" successfully initialized!`);
      fetchAdminAuditLogs();
    } catch (err: any) {
      alert(err.message || "Failed to create production workspace");
    }
  };

  const handleAdminSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInviteEmail.trim()) return;

    try {
      const prodId = getDbProductionId(activeProjectId);
      const { error } = await supabase
        .from("invitations")
        .insert({
          production_id: prodId,
          email: adminInviteEmail.trim(),
          role: adminInviteRole,
          status: "Pending"
        });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_logs").insert({
          user_id: user.id,
          action: "SEND_INVITATION",
          details: `Sent invitation to ${adminInviteEmail} as ${adminInviteRole}`
        });
      }

      setAdminInviteEmail("");
      alert(`Role invitation successfully dispatched to ${adminInviteEmail}!`);
      fetchAdminAuditLogs();
    } catch (err: any) {
      alert(err.message || "Failed to dispatch invitation");
    }
  };

  const handleAssetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      if (!uploadAssetTitle) {
        setUploadAssetTitle(file.name.split(".")[0]);
      }
    }
  };

  const handleAssetUploadSubmit = async () => {
    if (!uploadFileName || !uploadTargetProject) return;
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    try {
      const prodId = getDbProductionId(uploadTargetProject);
      const { data: fileData, error: fileError } = await supabase
        .from("files")
        .insert({
          production_id: prodId,
          name: uploadAssetTitle || uploadFileName,
          type: uploadAssetType === "script" ? "file" : "folder",
          size: "2.4 MB"
        })
        .select()
        .single();

      if (fileError) throw fileError;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_logs").insert({
          user_id: user.id,
          action: "UPLOAD_ASSET",
          details: `Uploaded asset "${uploadAssetTitle}" to production workspace`
        });
      }

      setUploadProgress(100);
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(0);
        setUploadFileName("");
        setUploadAssetTitle("");
        alert(`Asset "${uploadAssetTitle}" successfully ingested into campaign files bucket!`);
        fetchAdminAuditLogs();
        fetchTeam(); 
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setUploadProgress(0);
      alert(err.message || "Failed to upload asset node");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      
      {/* Sub Tabs Selection Header */}
      <div className="flex bg-card border border-white/5 rounded-xl p-1 gap-1 w-full max-w-lg text-xs">
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`flex-1 py-2 text-center rounded-md font-semibold cursor-pointer transition-colors ${
            activeSubTab === "profile" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveSubTab("team")}
          className={`flex-1 py-2 text-center rounded-md font-semibold cursor-pointer transition-colors ${
            activeSubTab === "team" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
          }`}
        >
          Team Directory
        </button>
        <button
          onClick={() => setActiveSubTab("system")}
          className={`flex-1 py-2 text-center rounded-md font-semibold cursor-pointer transition-colors ${
            activeSubTab === "system" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
          }`}
        >
          System Integrations
        </button>
        {memberRole === "Owner" && (
          <button
            onClick={() => setActiveSubTab("admin")}
            className={`flex-1 py-2 text-center rounded-md font-semibold cursor-pointer transition-colors ${
              activeSubTab === "admin" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
            }`}
          >
            Admin Panel
          </button>
        )}
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      <AnimatePresence mode="wait">
        
        {/* Profile Settings view */}
        {activeSubTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Personal Profile Settings</CardTitle>
                <CardDescription>Manage emergency contacts and role profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  {errorMsg && (
                    <div className="bg-danger/10 border border-danger/20 text-danger rounded-lg p-3">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="bg-success/10 border border-success/20 text-success rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary mb-1.5 font-medium">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-1.5 font-medium">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white"
                        placeholder="+1 555-0199"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary mb-1.5 font-medium">Global App Role</label>
                      <select
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Production Manager">Production Manager</option>
                        <option value="Director">Director</option>
                        <option value="Writer">Writer</option>
                        <option value="Editor">Editor</option>
                        <option value="Actor">Actor</option>
                        <option value="Cinematographer (DOP)">Cinematographer (DOP)</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-1.5 font-medium">Profile Photo URL</label>
                      <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1.5 font-medium">Bio / Experience Summary</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white resize-none"
                      placeholder="Tell us about your cinematography, scriptwriting, or editing background..."
                    />
                  </div>

                  <Button type="submit" variant="primary" disabled={profileLoading} className="w-full md:w-auto">
                    {profileLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-danger/20 bg-gradient-to-b from-card to-danger/[0.02]">
              <CardHeader>
                <div className="flex items-center gap-1.5 text-danger font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Security Zone</span>
                </div>
                <CardTitle>Session & Account Deletion</CardTitle>
                <CardDescription>Actions are permanent. Proceed with caution.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button variant="outline" onClick={handleSignOut} className="flex-1 flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of App</span>
                </Button>
                <Button variant="danger" onClick={handleDeleteAccount} className="flex-1 flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Studio Account</span>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Team Directory view */}
        {activeSubTab === "team" && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Invite member card */}
            <Card>
              <CardHeader>
                <CardTitle>Invite Production Collaborator</CardTitle>
                <CardDescription>Add new members to this active movie campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3 items-end text-xs">
                  <div className="flex-1 w-full">
                    <label className="block text-text-secondary mb-1.5 font-medium">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@oldverse.studio"
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="block text-text-secondary mb-1.5 font-medium">Workspace Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="Production Manager">Production Manager</option>
                      <option value="Director">Director</option>
                      <option value="Writer">Writer</option>
                      <option value="Editor">Editor</option>
                      <option value="Actor">Actor</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>
                  <Button type="submit" variant="primary" className="w-full sm:w-auto shrink-0 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-black" />
                    <span>Invite Member</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Members lists */}
            <Card>
              <CardHeader>
                <CardTitle>Active Collaborators</CardTitle>
                <CardDescription>Users with access to this production</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {teamLoading ? (
                  <div className="text-center py-8 text-xs text-text-secondary">Loading team directory...</div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-xs text-text-secondary">No other members in this workspace.</div>
                ) : (
                  <div className="divide-y divide-white/5 text-xs">
                    {members.map((m) => (
                      <div key={m.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {m.profiles?.avatar_url ? (
                            <img src={m.profiles.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {m.profiles?.full_name?.[0]?.toUpperCase() || m.profiles?.email?.[0]?.toUpperCase() || "C"}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-white">{m.profiles?.full_name || m.profiles?.email?.split("@")[0]}</h4>
                            <p className="text-[10px] text-text-secondary mt-0.5">{m.profiles?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-white/5 text-text-secondary uppercase">
                            {m.role}
                          </span>
                          {memberRole === "Owner" && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="p-1.5 hover:bg-danger/10 text-text-secondary hover:text-danger rounded cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Invitations list */}
            {invitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Workspace Invites</CardTitle>
                  <CardDescription>Awaiting registration</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5 text-xs">
                    {invitations.map((i) => (
                      <div key={i.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-white">{i.email}</h4>
                          <span className="text-[9px] text-text-secondary mt-1 block">Role: {i.role}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] px-2 py-0.5 rounded bg-warning/10 text-warning font-semibold">
                            Pending
                          </span>
                          {memberRole === "Owner" && (
                            <Button size="sm" variant="ghost" onClick={() => handleRevokeInvite(i.id)} className="text-xs text-danger">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </motion.div>
        )}

        {/* System Integrations view */}
        {activeSubTab === "system" && (
          <motion.div
            key="system"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Hardware & API Telemetry</CardTitle>
                <CardDescription>Sync camera frames, lens logs, and color grading LUTs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                
                {/* Frame.io */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/10 border border-white/5">
                  <div>
                    <h4 className="font-bold text-white">Frame.io Dailies Streaming</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">Automatically pull proxies from Frame.io camera-to-cloud buckets.</p>
                  </div>
                  <button onClick={() => setFrameIOSync(!frameIOSync)} className="cursor-pointer">
                    {frameIOSync ? <ToggleRight className="w-9 h-9 text-primary" /> : <ToggleLeft className="w-9 h-9 text-text-secondary" />}
                  </button>
                </div>

                {/* ARRI */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/10 border border-white/5">
                  <div>
                    <h4 className="font-bold text-white">ARRI Alexa Telemetry Hook</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">Log lenses focal lengths and metadata into shot plans.</p>
                  </div>
                  <button onClick={() => setArriSync(!arriSync)} className="cursor-pointer">
                    {arriSync ? <ToggleRight className="w-9 h-9 text-primary" /> : <ToggleLeft className="w-9 h-9 text-text-secondary" />}
                  </button>
                </div>

                {/* RED */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/10 border border-white/5">
                  <div>
                    <h4 className="font-bold text-white">RED Link Cloud LiveGrade</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">Stream color grade profiles to director monitors.</p>
                  </div>
                  <button onClick={() => setRedLink(!redLink)} className="cursor-pointer">
                    {redLink ? <ToggleRight className="w-9 h-9 text-primary" /> : <ToggleLeft className="w-9 h-9 text-text-secondary" />}
                  </button>
                </div>

              </CardContent>
            </Card>

            {/* Model parser */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 text-[10px] text-primary uppercase font-mono font-bold tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Continuity Config</span>
                </div>
                <CardTitle>AI Script Assistant Weights</CardTitle>
                <CardDescription>Select model weights for screenplay extraction audits</CardDescription>
              </CardHeader>
              <CardContent className="text-xs">
                <div>
                  <label className="block text-text-secondary mb-1.5 font-medium">Screenplay Model Parser</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary"
                  >
                    <option value="tov-screenplay-v4-fine-tuned">TOV-Screenplay-V4-Cinema (Recommended)</option>
                    <option value="gpt-4o">General OpenAI GPT-4o Engine</option>
                    <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  </select>
                </div>
              </CardContent>
            </Card>

          </motion.div>
        )}

        {/* Owner Admin Panel view */}
        {activeSubTab === "admin" && memberRole === "Owner" && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Create Production and Invite Users forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Initialize Production */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 text-[10px] text-primary uppercase font-mono font-bold tracking-wider">
                    <Database className="w-3.5 h-3.5" />
                    <span>Cinematic Node</span>
                  </div>
                  <CardTitle>Initialize New Production</CardTitle>
                  <CardDescription>Creates isolated workspaces and database targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminCreateProduction} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-text-secondary mb-1">Production Title</label>
                      <input
                        type="text"
                        required
                        value={adminProjTitle}
                        onChange={(e) => setAdminProjTitle(e.target.value)}
                        className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                        placeholder="e.g., Cyberpunk Odyssey"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-1">Director Name</label>
                      <input
                        type="text"
                        required
                        value={adminProjDirector}
                        onChange={(e) => setAdminProjDirector(e.target.value)}
                        className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                        placeholder="e.g., Kenji Sato"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-text-secondary mb-1">Budget</label>
                        <input
                          type="text"
                          required
                          value={adminProjBudget}
                          onChange={(e) => setAdminProjBudget(e.target.value)}
                          className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                          placeholder="$5.0M"
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary mb-1">Location</label>
                        <input
                          type="text"
                          required
                          value={adminProjLocation}
                          onChange={(e) => setAdminProjLocation(e.target.value)}
                          className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                          placeholder="Tokyo Studio"
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="primary" className="w-full mt-2">
                      Initialize Campaign Workspace
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Invite Team Member */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 text-[10px] text-primary uppercase font-mono font-bold tracking-wider">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Member Dispatch</span>
                  </div>
                  <CardTitle>Invite New Collaborator</CardTitle>
                  <CardDescription>Dispatch role invitations by email</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminSendInvitation} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-text-secondary mb-1">Recipient Email</label>
                      <input
                        type="email"
                        required
                        value={adminInviteEmail}
                        onChange={(e) => setAdminInviteEmail(e.target.value)}
                        className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                        placeholder="collaborator@oldverse.studio"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-1">Assigned Studio Role</label>
                      <select
                        value={adminInviteRole}
                        onChange={(e) => setAdminInviteRole(e.target.value)}
                        className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                      >
                        <option value="Production Manager">Production Manager</option>
                        <option value="Director">Director</option>
                        <option value="Writer">Writer</option>
                        <option value="Actor">Actor</option>
                        <option value="Cinematographer (DOP)">Cinematographer (DOP)</option>
                        <option value="Editor">Editor</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>
                    <Button type="submit" variant="primary" className="w-full mt-2">
                      Dispatch Invitation
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Asset Ingestion console */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 text-[10px] text-primary uppercase font-mono font-bold tracking-wider">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Asset Ingestion</span>
                </div>
                <CardTitle>Ingest Production Screenplays & Assets</CardTitle>
                <CardDescription>Upload screenplays, storyboard sketches, and casting sheets directly to your campaign bucket</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="block text-text-secondary font-medium">Select Target Workspace</label>
                    <select
                      value={uploadTargetProject}
                      onChange={(e) => setUploadTargetProject(e.target.value)}
                      className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="block text-text-secondary font-medium">Asset Classification</label>
                    <select
                      value={uploadAssetType}
                      onChange={(e) => setUploadAssetType(e.target.value)}
                      className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                    >
                      <option value="script">Screenplay Draft (PDF / FinalDraft)</option>
                      <option value="storyboard">Storyboard Sketches</option>
                      <option value="dailies">Production Dailies (Proxy Video)</option>
                      <option value="contracts">Legal Contract / Invoices</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="block text-text-secondary font-medium">Asset Title / Tag</label>
                    <input
                      type="text"
                      value={uploadAssetTitle}
                      onChange={(e) => setUploadAssetTitle(e.target.value)}
                      placeholder="e.g., Final Draft v2"
                      className="w-full bg-black/10 border border-white/5 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="p-6 border border-dashed border-white/10 rounded-xl text-center flex flex-col items-center gap-2.5 cursor-pointer hover:bg-white/[0.01] transition-all relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleAssetFileChange}
                    disabled={projects.length === 0}
                  />
                  <UploadCloud className="w-9 h-9 text-text-secondary animate-pulse" />
                  <div>
                    <span className="text-xs text-white font-medium block">
                      {uploadFileName || "Drag & drop production assets here, or click to browse"}
                    </span>
                    <span className="text-[10px] text-text-secondary mt-1 block">
                      Supports PDF, FDX, MP4, JPG (Max 500MB)
                    </span>
                  </div>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-text-secondary">Ingestion Progress</span>
                      <span className="text-white font-bold">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} color="primary" size="sm" />
                  </div>
                )}

                <Button
                  onClick={handleAssetUploadSubmit}
                  disabled={!uploadFileName || uploadProgress > 0 || projects.length === 0}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <span>Ingest Asset Node</span>
                </Button>
              </CardContent>
            </Card>

            {/* Storage & AI Credits Monitors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Storage Capacity */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 text-[10px] text-secondary uppercase font-mono font-bold tracking-wider">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Storage Engine</span>
                  </div>
                  <CardTitle>Studio Storage Capacity</CardTitle>
                  <CardDescription>Video proxies and asset catalogs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono">
                      <span className="text-text-secondary">Space Occupied</span>
                      <span className="text-white font-bold">14.2 GB of 100 GB (14%)</span>
                    </div>
                    <Progress value={14} color="primary" size="sm" />
                  </div>
                  <p className="text-[10px] text-text-secondary">
                    Your studio utilizes premium hot storage buckets for video proxy streaming. Next tier upgrades are managed via billing.
                  </p>
                </CardContent>
              </Card>

              {/* AI Credits Consumption */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 text-[10px] text-secondary uppercase font-mono font-bold tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Token Ledger</span>
                  </div>
                  <CardTitle>AI Screenplay Credits</CardTitle>
                  <CardDescription>Active token allocations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono">
                      <span className="text-text-secondary">AI Credits Burn</span>
                      <span className="text-white font-bold">420 of 1,000 credits (42%)</span>
                    </div>
                    <Progress value={42} color="secondary" size="sm" />
                  </div>
                  <p className="text-[10px] text-text-secondary">
                    AI credits are consumed during continuity analyses and shot list generation tasks. Renews automatically next cycle.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Real-time System Audit Logs */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 text-[10px] text-warning uppercase font-mono font-bold tracking-wider">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Audit Engine</span>
                </div>
                <CardTitle>Real-Time Audit Activity Logs</CardTitle>
                <CardDescription>Security and database transaction logs</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-60 overflow-y-auto divide-y divide-white/5 text-xs">
                  {adminAuditLogs.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      No recent database transaction logs found.
                    </div>
                  ) : (
                    adminAuditLogs.map((log: any, idx: number) => (
                      <div key={log.id || idx} className="p-3 flex justify-between items-start gap-4 hover:bg-white/[0.01]">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white font-mono">{log.action || "DB Write"}</span>
                          <p className="text-[10px] text-text-secondary">{log.details || `Logged query transaction ${log.id}`}</p>
                        </div>
                        <span className="text-[9px] text-text-secondary font-mono">
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString() : "Recent"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
export default SettingsView;

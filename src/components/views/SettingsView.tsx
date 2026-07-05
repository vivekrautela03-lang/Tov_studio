"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Cpu, RefreshCw, Key, ToggleLeft, ToggleRight, Sparkles, User, Mail, Phone, Trash2, UserPlus, LogOut, CheckCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SettingsView: React.FC = () => {
  const { activeProjectId } = useProjectStore();
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "team" | "system">("profile");

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
      // 1. Fetch current production member details
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

      // 2. Fetch pending invitations for this production
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

  useEffect(() => {
    fetchProfile();
    fetchTeam();
  }, [activeProjectId]);

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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      
      {/* Sub Tabs Selection Header */}
      <div className="flex bg-card border border-white/5 rounded-xl p-1 gap-1 w-full max-w-md text-xs">
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
                <CardTitle>Studio Profile</CardTitle>
                <CardDescription>Configure your personal developer identity and workspace metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                
                {/* Status messages */}
                {successMsg && (
                  <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg text-xs flex gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}
                {errorMsg && (
                  <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-lg text-xs flex gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-black text-lg select-none uppercase">
                    {fullName.substring(0, 1) || "V"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{fullName || "Studio Member"}</h4>
                    <p className="text-text-secondary text-[11px] mt-0.5">{profileRole} • {profile?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 border-t border-white/5 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-text-secondary font-medium">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-text-secondary font-medium">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555-0199"
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-text-secondary font-medium">Avatar URL</label>
                      <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://domain.com/avatar.jpg"
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-text-secondary font-medium">Platform Role</label>
                      <select
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Producer">Producer</option>
                        <option value="Director">Director</option>
                        <option value="Writer">Writer</option>
                        <option value="Editor">Editor</option>
                        <option value="Crew">Crew</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-text-secondary font-medium">Bio Description</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell us about your production experience..."
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={profileLoading}
                      className="cursor-pointer text-xs"
                    >
                      {profileLoading ? "Saving Updates..." : "Save Settings"}
                    </Button>
                  </div>
                </form>

              </CardContent>
            </Card>

            {/* Security logout and deletion panel */}
            <Card className="border border-danger/10 bg-danger/5">
              <CardHeader>
                <CardTitle className="text-white">Security & Danger Actions</CardTitle>
                <CardDescription>Handle session terminations and database key closures</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Platform session log out</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">Disconnects active tokens from the user agent.</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-xs border-white/10 hover:border-white/20 text-white cursor-pointer h-9"
                  >
                    <LogOut className="w-4 h-4 text-text-secondary" /> Sign Out
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-1 text-xs text-danger hover:bg-danger/10 cursor-pointer h-9"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </Button>
                </div>
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
            {/* Invite member form */}
            <Card>
              <CardHeader>
                <CardTitle>Invite Team Collaborator</CardTitle>
                <CardDescription>Grant production workflow access to other studio specialists</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3 text-xs items-end">
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="block text-text-secondary font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                      <input
                        type="email"
                        required
                        placeholder="collaborator@domain.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-44 space-y-1.5">
                    <label className="block text-text-secondary font-medium">Invited Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary"
                    >
                      <option value="Producer">Producer</option>
                      <option value="Director">Director</option>
                      <option value="Writer">Writer</option>
                      <option value="Editor">Editor</option>
                      <option value="Crew">Crew</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto h-9 cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <UserPlus className="w-4 h-4 text-black" /> Dispatch Invite
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Active Members and pending invites list */}
            <Card>
              <CardHeader>
                <CardTitle>Active Workspace Members</CardTitle>
                <CardDescription>Collaborators currently associated with this film production</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {teamLoading ? (
                  <div className="text-center py-6 text-xs text-text-secondary flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading directory logs...
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 text-xs">
                    {members.length === 0 ? (
                      <div className="text-center py-6 text-text-secondary italic">No active production members recorded.</div>
                    ) : (
                      members.map((member) => (
                        <div key={member.id} className="flex justify-between items-center py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs select-none uppercase">
                              {member.profiles?.full_name?.substring(0,1) || "C"}
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{member.profiles?.full_name || "Workspace Member"}</h4>
                              <p className="text-[10px] text-text-secondary mt-0.5">{member.profiles?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] px-2 py-0.5 bg-secondary/15 text-secondary border border-secondary/20 font-bold uppercase rounded">
                              {member.role}
                            </span>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-text-secondary hover:text-danger cursor-pointer transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Pending Invites Subheader */}
                {invitations.length > 0 && (
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <h4 className="text-[10px] text-text-secondary uppercase font-bold tracking-wider font-mono">Pending Invitations</h4>
                    <div className="divide-y divide-white/5 text-xs">
                      {invitations.map((invite) => (
                        <div key={invite.id} className="flex justify-between items-center py-2.5">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Mail className="w-4 h-4 shrink-0" />
                            <span>{invite.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 text-text-secondary uppercase font-bold rounded">
                              {invite.role}
                            </span>
                            <button
                              onClick={() => handleRevokeInvite(invite.id)}
                              className="text-text-secondary hover:text-danger cursor-pointer transition-colors"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

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
            {/* Telemetry Toggles */}
            <Card>
              <CardHeader>
                <CardTitle>Hardware & Cloud Integrations</CardTitle>
                <CardDescription>Hook camera telemetry and dailies upload pipes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                
                {/* Frame IO */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/10 border border-white/5">
                  <div>
                    <h4 className="font-bold text-white">Frame.io Dailies Auto-Sync</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">Upload proxies instantly on camera CUT triggers.</p>
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

      </AnimatePresence>
    </div>
  );
};
export default SettingsView;

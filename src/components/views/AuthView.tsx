"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Mail, Lock, ShieldAlert, CheckCircle, BrainCircuit, User, ArrowLeft, RefreshCw, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthViewProps {
  initialState?: "signin" | "signup" | "forgot" | "reset" | "verify";
}

export const AuthView: React.FC<AuthViewProps> = ({ initialState = "signin" }) => {
  // We keep authState for overlays like forgot, reset, verify. 
  // For standard logins/signups, we display BOTH forms simultaneously.
  const [authState, setAuthState] = useState<"standard" | "forgot" | "reset" | "verify">("standard");

  const parseError = (err: any): string => {
    if (!err) return "Authentication command failed.";
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    if (err.error_description) return err.error_description;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };
  
  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Sign Up inputs
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpRole, setSignUpRole] = useState("Crew");
  
  // Password recovery inputs
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state if initial prop changes
  useEffect(() => {
    if (initialState === "forgot") setAuthState("forgot");
    else if (initialState === "reset") setAuthState("reset");
    else if (initialState === "verify") setAuthState("verify");
    else setAuthState("standard");
  }, [initialState]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim(),
        password: signInPassword.trim()
      });
      if (error) throw error;
      setSuccessMsg("Logged in successfully! Opening your dashboard...");
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setErrorMsg(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword.trim(),
        options: {
          data: {
            full_name: signUpFullName.trim(),
            role: signUpRole
          }
        }
      });
      if (error) throw error;

      if (data.user && data.session) {
        setSuccessMsg("Account registered successfully! Redirecting...");
      } else {
        setAuthState("verify");
      }
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setErrorMsg(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/#recovery`
      });
      if (error) throw error;
      setSuccessMsg("Reset link dispatched. Please check your email inbox.");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setErrorMsg(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword.trim()
      });
      if (error) throw error;
      setSuccessMsg("Password reset successfully. You may now log in.");
      setTimeout(() => {
        setAuthState("standard");
        setNewPassword("");
      }, 2000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setErrorMsg(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      setErrorMsg(parseError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden select-none">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(62,207,142,0.08),rgba(255,255,255,0))]" />
      <div className="absolute w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full top-1/4 -left-1/4 pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 font-extrabold text-black text-lg shadow-lg shadow-primary/10">
            TOV
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-4 uppercase">
            TOV Studio OS
          </h2>
          <p className="text-xs text-text-secondary uppercase tracking-widest font-mono">
            Unified Collaboration Portal
          </p>
        </div>

        {/* Global Error/Success Banner */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-danger/10 border border-danger/25 text-danger text-[11px] p-3 rounded-lg flex gap-2 items-start max-w-md mx-auto"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-normal">{errorMsg}</p>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-primary/10 border border-primary/25 text-primary text-[11px] p-3 rounded-lg flex gap-2 items-start max-w-md mx-auto"
            >
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-normal font-medium">{successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Card Panel */}
        <Card className="border border-white/5 bg-[#171717]/80 backdrop-blur-md shadow-2xl shadow-black/80 overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            
            {/* Conditional Views */}
            {authState === "verify" ? (
              <div className="space-y-4 text-center py-8 max-w-md mx-auto">
                <Mail className="w-12 h-12 text-primary mx-auto animate-pulse" />
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Verification Email Dispatched</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    We sent a registration link to your email address. Verify the link to activate your workspace profile.
                  </p>
                </div>
                <Button
                  onClick={() => setAuthState("standard")}
                  variant="outline"
                  className="w-full text-xs cursor-pointer h-10 mt-2"
                >
                  Return to Sign In
                </Button>
              </div>
            ) : authState === "forgot" ? (
              <div className="space-y-4 max-w-md mx-auto py-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px] text-text-secondary font-mono uppercase font-bold tracking-wider">
                  <span>Reset Password Key</span>
                  <button
                    onClick={() => setAuthState("standard")}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full text-xs font-bold h-10 rounded-lg flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : "Dispatch Reset Link"}
                  </Button>
                </form>
              </div>
            ) : authState === "reset" ? (
              <div className="space-y-4 max-w-md mx-auto py-4">
                <div className="border-b border-white/5 pb-2 text-[10px] text-text-secondary font-mono uppercase font-bold tracking-wider">
                  <span>Configure New Password</span>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                      New Password Key
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full text-xs font-bold h-10 rounded-lg flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : "Unlock & Reset Key"}
                  </Button>
                </form>
              </div>
            ) : (
              // Standard View: BOTH Sign In and Sign Up are side-by-side
              <div className="space-y-6">
                
                {/* Unified Social Sign-in at the Top */}
                <div className="max-w-md mx-auto text-center space-y-3 pb-6 border-b border-white/5">
                  <div className="relative flex justify-center text-[9px] font-mono text-text-secondary uppercase mb-2">
                    <span className="bg-[#171717] px-3 z-10 font-bold">One-Click Collaboration Access</span>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleOAuth}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold border-white/10 hover:border-primary/50 text-white cursor-pointer h-10 bg-black/30"
                  >
                    <Globe className="w-4 h-4 text-primary shrink-0" />
                    <span>Continue with Google Workspace</span>
                  </Button>
                </div>

                {/* Grid Split: Login (Left) | Register (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
                  
                  {/* Vertical Line Divider on Desktop */}
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/5 transform -translate-x-1/2" />

                  {/* Left Column: Sign In */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Sign In Session</h3>
                      <p className="text-[10px] text-text-secondary leading-relaxed">
                        Access your existing productions and team assets.
                      </p>
                    </div>

                    <form onSubmit={handleSignInSubmit} className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                          <input
                            type="email"
                            required
                            placeholder="you@domain.com"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            disabled={loading}
                            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthState("forgot");
                              setErrorMsg("");
                              setSuccessMsg("");
                            }}
                            className="text-[9px] text-primary hover:underline font-mono"
                          >
                            Forgot Key?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                            disabled={loading}
                            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="w-full text-xs font-bold py-2.5 h-10 rounded-lg cursor-pointer flex items-center justify-center gap-2 mt-4"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : "Sign In"}
                      </Button>
                    </form>
                  </div>

                  {/* Right Column: Register Account */}
                  <div className="space-y-4 pt-6 md:pt-0 border-t border-white/5 md:border-t-0">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Create Account</h3>
                      <p className="text-[10px] text-text-secondary leading-relaxed">
                        Register a new profile to join or owner a film production.
                      </p>
                    </div>

                    <form onSubmit={handleSignUpSubmit} className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Elena Rostova"
                            value={signUpFullName}
                            onChange={(e) => setSignUpFullName(e.target.value)}
                            disabled={loading}
                            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                          <input
                            type="email"
                            required
                            placeholder="you@domain.com"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            disabled={loading}
                            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                          <input
                            type="password"
                            required
                            placeholder="•••••••• (Min. 6 chars)"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            disabled={loading}
                            className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                          Studio Role
                        </label>
                        <select
                          value={signUpRole}
                          onChange={(e) => setSignUpRole(e.target.value)}
                          disabled={loading}
                          className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-colors cursor-pointer"
                        >
                          <option value="Owner">Studio Owner / Admin</option>
                          <option value="Producer">Producer</option>
                          <option value="Director">Director</option>
                          <option value="Cinematographer (DOP)">Cinematographer (DOP)</option>
                          <option value="Editor">Editor</option>
                          <option value="Actor">Actor / Talent</option>
                          <option value="Crew">Crew Member</option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="w-full text-xs font-bold py-2.5 h-10 rounded-lg cursor-pointer flex items-center justify-center gap-2 mt-4"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : "Register Account"}
                      </Button>
                    </form>
                  </div>

                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[10px] text-text-secondary font-mono flex items-center justify-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-primary" />
          <span>Production-grade Supabase RLS Session Shield</span>
        </div>

      </motion.div>
    </div>
  );
};
export default AuthView;

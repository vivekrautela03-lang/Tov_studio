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
  const [authState, setAuthState] = useState<"signin" | "signup" | "forgot" | "reset" | "verify">(initialState);

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
  
  // Fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state if initial prop changes
  useEffect(() => {
    setAuthState(initialState);
  }, [initialState]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (authState === "signin") {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });
        if (error) throw error;
      } else if (authState === "signup") {
        // Sign Up with profile Metadata
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });
        if (error) throw error;

        // Check if session is established or if email verification is pending
        if (data.user && data.session) {
          setSuccessMsg("Account registered! Opening dashboard...");
        } else {
          setAuthState("verify");
        }
      } else if (authState === "forgot") {
        // Forgot Password link dispatch
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/#recovery`
        });
        if (error) throw error;
        setSuccessMsg("Reset link dispatched. Please check your email inbox.");
      } else if (authState === "reset") {
        // Reset Password update
        const { error } = await supabase.auth.updateUser({
          password: newPassword.trim()
        });
        if (error) throw error;
        setSuccessMsg("Password reset successfully. Sign in with your new key.");
        setTimeout(() => {
          setAuthState("signin");
          setPassword("");
          setNewPassword("");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Auth submit error:", err);
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
          redirectTo: window.location.origin
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
    <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(62,207,142,0.08),rgba(255,255,255,0))]" />
      <div className="absolute w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full top-1/4 -left-1/4 pointer-events-none" />

      {/* Main card panel container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm z-10 space-y-6"
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
            Create. Shoot. Deliver.
          </p>
        </div>

        {/* Form Box */}
        <Card className="border border-white/5 bg-[#171717]/85 backdrop-blur-md shadow-2xl shadow-black/80">
          <CardContent className="p-6 space-y-5">
            
            {/* Form state title */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px] text-text-secondary font-mono uppercase font-bold tracking-wider">
              <span>
                {authState === "signin" && "Sign In Session"}
                {authState === "signup" && "Register Credentials"}
                {authState === "forgot" && "Reset Key Dispatch"}
                {authState === "reset" && "Configure New Password"}
                {authState === "verify" && "Pending Verification"}
              </span>
              
              {authState !== "signin" && authState !== "verify" && (
                <button
                  onClick={() => {
                    setAuthState("signin");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              )}
            </div>

            {/* Error alerts */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-danger/10 border border-danger/25 text-danger text-[11px] p-3 rounded-lg flex gap-2 items-start"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-normal">{errorMsg}</p>
                </motion.div>
              )}

              {/* Success alerts */}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-primary/10 border border-primary/25 text-primary text-[11px] p-3 rounded-lg flex gap-2 items-start"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-normal font-medium">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form bodies */}
            {authState === "verify" ? (
              <div className="space-y-4 text-center py-4">
                <Mail className="w-10 h-10 text-primary mx-auto animate-pulse" />
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-white">Verification Email Dispatched</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed max-w-[280px] mx-auto">
                    We sent a registration link to your email address. Verify the link to activate your profile.
                  </p>
                </div>
                <Button
                  onClick={() => setAuthState("signin")}
                  variant="outline"
                  className="w-full text-xs cursor-pointer"
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                
                {/* Full name input (SignUp only) */}
                {authState === "signup" && (
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email input (No reset state) */}
                {authState !== "reset" && (
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Password input (SignIn and SignUp only) */}
                {(authState === "signin" || authState === "signup") && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                        Password
                      </label>
                      {authState === "signin" && (
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
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* New Password input (Reset only) */}
                {authState === "reset" && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                      Configure New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                      <input
                        type="password"
                        required
                        placeholder="Enter new password key..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Main Auth Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full text-xs font-bold py-2.5 h-10 rounded-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <span>
                        {authState === "signin" && "Sign In"}
                        {authState === "signup" && "Register Account"}
                        {authState === "forgot" && "Dispatch Reset Link"}
                        {authState === "reset" && "Unlock & Reset Key"}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Switch to SignUp link */}
                {authState === "signin" && (
                  <div className="text-center text-[10px] text-text-secondary pt-2">
                    Don't have access?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthState("signup");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-primary hover:underline font-bold cursor-pointer"
                    >
                      Request Registration
                    </button>
                  </div>
                )}

              </form>
            )}

            {/* Social logins separator */}
            {authState === "signin" && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="relative flex justify-center text-[9px] font-mono text-text-secondary uppercase">
                  <span className="bg-[#171717] px-2 z-10">Or collaborate via OAuth</span>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
                </div>

                {/* Google Sign-in */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleOAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium border-white/10 hover:border-primary/50 text-white cursor-pointer h-10"
                >
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  <span>Google Account Login</span>
                </Button>
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

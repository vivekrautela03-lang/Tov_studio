"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Mail, Lock, ShieldAlert, CheckCircle, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AuthView: React.FC = () => {
  const [email] = useState("theoldverse@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    // Enforce front-end credentials block immediately
    if (password.trim() !== "oldversestudio2025") {
      setErrorMsg("Security Violation: Access key does not match console records.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      console.log("Attempting sign-in for:", email);
      // 1. Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password.trim()
      });

      if (error) {
        console.warn("Sign-in failed. Attempting to auto-provision account...", error);
        
        // 2. If it fails (e.g. user does not exist in database yet), attempt to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password.trim()
        });

        if (signUpError) {
          console.error("Auto-provisioning signUp failed:", signUpError);
          throw signUpError;
        }

        if (signUpData.user && signUpData.session) {
          setSuccessMsg("Console unlocked. System initializing...");
        } else {
          setSuccessMsg("Account provisioned. Please check theoldverse@gmail.com inbox to confirm email access on Supabase.");
        }
      } else {
        console.log("Sign-in successful!");
        setSuccessMsg("Console unlocked. System initializing...");
      }
    } catch (err: any) {
      console.error("Full authentication exception caught:", err);
      
      // Robust error parsing to prevent rendering empty objects `{}`
      let message = "System error. Verification failed.";
      if (err) {
        if (typeof err === "string") {
          message = err;
        } else if (err.message && typeof err.message === "string") {
          message = err.message;
        } else if (err.error_description && typeof err.error_description === "string") {
          message = err.error_description;
        } else {
          try {
            const str = JSON.stringify(err);
            if (str && str !== "{}") {
              message = str;
            } else {
              message = err.toString() || "System verification error.";
            }
          } catch {
            message = String(err);
          }
        }
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      
      {/* Decorative Grid Background and Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(62,207,142,0.08),rgba(255,255,255,0))]" />
      <div className="absolute w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full top-1/4 -left-1/4 pointer-events-none" />

      {/* Auth Container Card */}
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
          <h2 className="text-2xl font-black tracking-tight text-white mt-4">
            TOV STUDIO OS
          </h2>
          <p className="text-xs text-text-secondary uppercase tracking-widest font-mono">
            Create. Shoot. Deliver.
          </p>
        </div>

        {/* Auth Box */}
        <Card className="border border-white/5 bg-[#171717]/85 backdrop-blur-md shadow-2xl shadow-black/80">
          <CardContent className="p-6 space-y-5">
            
            <div className="border-b border-white/5 pb-2 text-[10px] text-text-secondary font-mono uppercase font-bold tracking-wider">
              Private Terminal Session
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

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Locked Email Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                  Admin Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary/50" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-black/40 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-xs text-white/50 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Access Key Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-text-secondary uppercase font-mono font-bold tracking-wider">
                  Access Key (Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                  <input
                    type="password"
                    required
                    placeholder="Enter security key..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full text-xs font-bold py-2.5 h-10 rounded-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Unlock Console</span>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[10px] text-text-secondary font-mono flex items-center justify-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-primary" />
          <span>Secured by Supabase Authentication Layer</span>
        </div>

      </motion.div>
    </div>
  );
};
export default AuthView;

"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import {
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthViewProps {
  initialState?: "signin" | "signup" | "forgot" | "reset" | "verify";
}

// Logo Monogram SVG (overlapping T, O, V with premium serif fills)
const LogoSVG = ({ className = "w-24 h-24" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} text-white`} fill="currentColor">
    {/* Tilted Serif O */}
    <g transform="rotate(-14 46 54)">
      <path d="M 46,24 C 29,24 19,37 19,54 C 19,71 29,84 46,84 C 63,84 73,71 73,54 C 73,37 63,24 46,24 Z M 46,29 C 58,29 67,40 67,54 C 67,68 58,79 46,79 C 34,79 25,68 25,54 C 25,40 34,29 46,29 Z" />
    </g>
    {/* Serif T */}
    <path d="M 22,30 H 70 V 35 H 65 V 37 H 51 V 73 H 57 V 78 H 35 V 73 H 41 V 37 H 27 V 35 H 22 Z" />
    {/* Serif V */}
    <path d="M 58,48 L 72,78 H 75 L 89,48 H 84 L 74,72 L 63,48 Z" />
  </svg>
);

// Full Brand Logo with Filmstrip text
const BrandLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className="flex items-center gap-3">
    <LogoSVG className={className} />
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 leading-none">
        {/* Horizontal Filmstrip Icon */}
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
          <rect x="2" y="4" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="4" x2="16" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <rect x="4" y="6" width="2" height="2" rx="0.5" />
          <rect x="4" y="11" width="2" height="2" rx="0.5" />
          <rect x="4" y="16" width="2" height="2" rx="0.5" />
          <rect x="18" y="6" width="2" height="2" rx="0.5" />
          <rect x="18" y="11" width="2" height="2" rx="0.5" />
          <rect x="18" y="16" width="2" height="2" rx="0.5" />
        </svg>
        <span className="text-[13px] font-black tracking-wider text-white font-sans uppercase">
          THE OLDVERSE
        </span>
      </div>
      <span className="text-[8px] text-white/60 tracking-[0.25em] uppercase font-mono font-medium leading-none mt-1">
        PRODUCTIONS
      </span>
    </div>
  </div>
);

// Standalone Brand Showcase for Left Side
const StandaloneBrand = () => (
  <div className="flex flex-col items-center text-center space-y-6 select-none max-w-sm">
    <LogoSVG className="w-32 h-32" />
    
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        {/* Horizontal Filmstrip Icon */}
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
          <rect x="2" y="4" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="4" x2="16" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <rect x="4" y="6" width="2" height="2" rx="0.5" />
          <rect x="4" y="11" width="2" height="2" rx="0.5" />
          <rect x="4" y="16" width="2" height="2" rx="0.5" />
          <rect x="18" y="6" width="2" height="2" rx="0.5" />
          <rect x="18" y="11" width="2" height="2" rx="0.5" />
          <rect x="18" y="16" width="2" height="2" rx="0.5" />
        </svg>
        <h1 className="text-xl font-black tracking-wider text-white uppercase font-sans">
          THE OLDVERSE
        </h1>
      </div>
      <span className="text-[9px] text-white/60 tracking-[0.35em] uppercase font-mono font-bold mt-2">
        PRODUCTIONS
      </span>
    </div>

    <div className="pt-2 text-xs tracking-widest text-[#38bdf8] font-mono space-y-1">
      <p>Create. Collaborate.</p>
      <p>Bring Stories to Life.</p>
    </div>
  </div>
);

// Custom Input with Fade Up animation and focus glows
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const CustomInput: React.FC<CustomInputProps> = ({ icon, rightIcon, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex items-center w-full h-[64px] bg-transparent border border-white/20 rounded-[10px] px-4 hover:border-white/40 focus-within:border-white focus-within:shadow-[0_0_12px_rgba(255,255,255,0.05)] transition-all duration-200"
    >
      <div className="text-white/40 mr-3.5 shrink-0">{icon}</div>
      <input
        {...props}
        className="w-full bg-transparent text-base text-white placeholder-white/30 focus:outline-none h-full"
      />
      {rightIcon && <div className="ml-3 shrink-0">{rightIcon}</div>}
    </motion.div>
  );
};

// Premium Buttons
const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, type, onClick, disabled }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[60px] bg-white text-black font-semibold text-base rounded-[10px] flex items-center justify-center cursor-pointer transition-transform duration-200"
    >
      {disabled ? <RefreshCw className="w-5 h-5 animate-spin" /> : children}
    </motion.button>
  );
};

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, type, onClick, disabled }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[60px] bg-transparent border border-white/20 text-white font-semibold text-base rounded-[10px] flex items-center justify-center cursor-pointer hover:border-white/50 transition-transform duration-200"
    >
      {children}
    </motion.button>
  );
};

// Success checkmark expand animation
const SuccessCheckmark = () => (
  <div className="flex justify-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
      className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="w-10 h-10 text-emerald-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          d="M20 6L9 17l-5-5"
        />
      </motion.svg>
    </motion.div>
  </div>
);

export const AuthView: React.FC<AuthViewProps> = ({ initialState = "signin" }) => {
  const [view, setView] = useState<"login" | "register" | "forgot" | "otp" | "emailsent" | "reset">("login");

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up inputs
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpMobile, setSignUpMobile] = useState("");
  const [signUpRole, setSignUpRole] = useState("Crew");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password recovery inputs
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMobile, setResetMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  // OTP inputs
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(52);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state if initial prop changes
  useEffect(() => {
    if (initialState === "forgot") setView("forgot");
    else if (initialState === "reset") setView("reset");
    else if (initialState === "verify") setView("otp");
    else if (initialState === "signup") setView("register");
    else setView("login");
  }, [initialState]);

  // Countdown timer for OTP
  useEffect(() => {
    if (view !== "otp" || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [view, timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1); // Keep last char
    setOtp(newOtp);

    // Auto focus next input
    if (val !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index] === "" && index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

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

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword.trim(),
        options: {
          data: {
            full_name: signUpFullName.trim(),
            phone: signUpMobile.trim(),
            role: signUpRole
          }
        }
      });
      if (error) throw error;

      if (data.user && data.session) {
        setSuccessMsg("Account registered successfully! Redirecting...");
      } else {
        setView("emailsent");
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
      setView("emailsent");
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
        setView("login");
        setNewPassword("");
      }, 2000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setErrorMsg(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-x-hidden font-sans select-none w-full">
      
      {/* Left Column (40%): Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-center items-center p-12 border-r border-white/10 bg-black min-h-screen">
        <StandaloneBrand />
      </div>

      {/* Right Column (60%): Forms & Nav/Footer */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between p-6 md:p-12 min-h-screen bg-black">
        
        {/* Navbar */}
        <div className="flex justify-between items-center w-full">
          <BrandLogo className="w-9 h-9" />
          <div>
            {view === "login" ? (
              <button
                onClick={() => setView("register")}
                className="h-[44px] px-6 border border-white/20 hover:border-white/50 rounded-[10px] text-xs font-semibold text-white bg-transparent transition-colors duration-200 cursor-pointer"
              >
                Create Account
              </button>
            ) : (
              <button
                onClick={() => setView("login")}
                className="h-[44px] px-6 border border-white/20 hover:border-white/50 rounded-[10px] text-xs font-semibold text-white bg-transparent transition-colors duration-200 cursor-pointer"
              >
                Log In
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[520px] space-y-7">
            
            {/* Global Alert Banners */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-[10px] flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMsg}</p>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-[10px] flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View Switching with Slide/Fade Transition */}
            <AnimatePresence mode="wait">
              {view === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-[48px] font-bold text-white leading-tight tracking-tight">Log In</h2>
                    <p className="text-[18px] text-white/70">Enter your credentials to access your studio</p>
                  </div>

                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <CustomInput
                      type="email"
                      required
                      placeholder="Username / Email / Mobile"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      icon={<Mail className="w-5 h-5" />}
                    />

                    <CustomInput
                      type={showSignInPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      icon={<Lock className="w-5 h-5" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                          {showSignInPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      }
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgot");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="text-sm text-white/60 hover:text-white transition-colors font-medium cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="pt-2 space-y-4">
                      <PrimaryButton type="submit" disabled={loading}>
                        Log In
                      </PrimaryButton>
                      <SecondaryButton type="button" onClick={() => setView("register")}>
                        Create New Account
                      </SecondaryButton>
                    </div>
                  </form>
                </motion.div>
              )}

              {view === "register" && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-[48px] font-bold text-white leading-tight tracking-tight">Create New Account</h2>
                    <p className="text-[18px] text-white/70">Fill in the details to get started</p>
                  </div>

                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    <CustomInput
                      type="text"
                      required
                      placeholder="Full Name"
                      value={signUpFullName}
                      onChange={(e) => setSignUpFullName(e.target.value)}
                      icon={<User className="w-5 h-5" />}
                    />

                    <CustomInput
                      type="tel"
                      required
                      placeholder="Mobile Number"
                      value={signUpMobile}
                      onChange={(e) => setSignUpMobile(e.target.value)}
                      icon={<Phone className="w-5 h-5" />}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative flex items-center w-full h-[64px] bg-transparent border border-white/20 rounded-[10px] px-4 hover:border-white/40 focus-within:border-white transition-all duration-200"
                    >
                      <Briefcase className="w-5 h-5 text-white/40 mr-3.5 shrink-0" />
                      <select
                        value={signUpRole}
                        onChange={(e) => setSignUpRole(e.target.value)}
                        className="w-full bg-transparent text-base text-white focus:outline-none h-full appearance-none cursor-pointer"
                      >
                        <option value="Director" className="bg-black text-white">Director</option>
                        <option value="Producer" className="bg-black text-white">Producer</option>
                        <option value="Writer" className="bg-black text-white">Writer</option>
                        <option value="Cinematographer" className="bg-black text-white">Cinematographer</option>
                        <option value="Editor" className="bg-black text-white">Editor</option>
                        <option value="Actor" className="bg-black text-white">Actor</option>
                        <option value="Crew" className="bg-black text-white">Crew Member</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-white/40 pointer-events-none" />
                    </motion.div>

                    <CustomInput
                      type="email"
                      required
                      placeholder="Email Address"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      icon={<Mail className="w-5 h-5" />}
                    />

                    <CustomInput
                      type={showSignUpPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      icon={<Lock className="w-5 h-5" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                          {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      }
                    />

                    <CustomInput
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirm Password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      icon={<Lock className="w-5 h-5" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      }
                    />

                    <div className="pt-2">
                      <PrimaryButton type="submit" disabled={loading}>
                        Get Started
                      </PrimaryButton>
                    </div>

                    <div className="text-center text-sm text-white/50 mt-4">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setView("login")}
                        className="text-white font-semibold hover:underline cursor-pointer"
                      >
                        Log in
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {view === "forgot" && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-[48px] font-bold text-white leading-tight tracking-tight">Forgot Password?</h2>
                    <p className="text-[18px] text-white/70">
                      No worries! Enter your email address or mobile number and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {/* Section 1: Email Reset */}
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <CustomInput
                      type="email"
                      required
                      placeholder="Email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      icon={<Mail className="w-5 h-5" />}
                    />
                    <PrimaryButton type="submit" disabled={loading}>
                      Send Reset Link
                    </PrimaryButton>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-white/20 flex-1" />
                    <span className="text-xs font-mono text-white/40 tracking-wider">OR</span>
                    <div className="h-px bg-white/20 flex-1" />
                  </div>

                  {/* Section 2: Mobile Reset */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setView("otp");
                      setTimer(52);
                    }}
                    className="space-y-4"
                  >
                    <div className="flex gap-3">
                      {/* Country Code Selector */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative flex items-center h-[64px] bg-transparent border border-white/20 rounded-[10px] px-3.5 hover:border-white/40 focus-within:border-white"
                      >
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-transparent text-base text-white focus:outline-none appearance-none cursor-pointer pr-5 font-medium"
                        >
                          <option value="+91" className="bg-black text-white">+91</option>
                          <option value="+1" className="bg-black text-white">+1</option>
                          <option value="+44" className="bg-black text-white">+44</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-white/40 absolute right-2 pointer-events-none" />
                      </motion.div>

                      <div className="flex-1">
                        <CustomInput
                          type="tel"
                          required
                          placeholder="Mobile number"
                          value={resetMobile}
                          onChange={(e) => setResetMobile(e.target.value)}
                          icon={<Phone className="w-5 h-5" />}
                        />
                      </div>
                    </div>

                    <PrimaryButton type="submit">
                      Send OTP
                    </PrimaryButton>

                    <div className="text-center text-sm text-white/50 mt-4">
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => setView("login")}
                        className="text-white font-semibold hover:underline cursor-pointer"
                      >
                        Log in
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {view === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 text-center"
                >
                  <div className="flex justify-center mb-2">
                    <LogoSVG className="w-16 h-16" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[48px] font-bold text-white tracking-tight">Verify OTP</h2>
                    <p className="text-[18px] text-white/70">
                      We've sent a 6-digit OTP to <br />
                      <span className="font-semibold text-white">{countryCode} {resetMobile || "98765 43210"}</span>
                    </p>
                    <p className="text-xs text-white/40 mt-1">Enter the OTP below to reset your password.</p>
                  </div>

                  <div className="flex justify-center gap-2.5 py-4">
                    {otp.map((data, index) => (
                      <motion.input
                        key={index}
                        type="text"
                        maxLength={1}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        value={data}
                        onChange={(e) => handleOtpChange(e.target, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }}
                        className="w-[48px] h-[60px] bg-transparent border border-white/20 rounded-[8px] text-center text-xl text-white focus:border-white focus:outline-none transition-colors"
                      />
                    ))}
                  </div>

                  <div className="text-sm text-white/50">
                    Didn't receive the OTP?{" "}
                    {timer > 0 ? (
                      <span className="text-white/40 font-mono">
                        Resend available in {formatTimer(timer)}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setTimer(52);
                          setOtp(new Array(6).fill(""));
                        }}
                        className="text-white font-semibold hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="pt-4 space-y-4">
                    <PrimaryButton onClick={() => setView("reset")}>
                      Verify OTP
                    </PrimaryButton>
                    <SecondaryButton onClick={() => setView("forgot")}>
                      Change Mobile Number
                    </SecondaryButton>
                  </div>
                </motion.div>
              )}

              {view === "emailsent" && (
                <motion.div
                  key="emailsent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 text-center"
                >
                  <SuccessCheckmark />

                  <div className="space-y-2 pt-2">
                    <h2 className="text-[48px] font-bold text-white tracking-tight">Email Sent!</h2>
                    <p className="text-[18px] text-white/70 max-w-md mx-auto leading-relaxed">
                      We've sent a password reset link to <br />
                      <span className="font-semibold text-white">{resetEmail || signUpEmail || "example@email.com"}</span>
                    </p>
                    <p className="text-xs text-white/40 mt-2">
                      Please check your inbox and follow the instructions to reset your password.
                    </p>
                  </div>

                  <div className="pt-6 space-y-4">
                    <PrimaryButton onClick={() => setView("login")}>
                      Back to Login
                    </PrimaryButton>
                    <div className="text-xs text-white/40">
                      Didn't receive the email?{" "}
                      <button
                        onClick={handleForgotSubmit}
                        className="text-white font-semibold hover:underline cursor-pointer ml-1"
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {view === "reset" && (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-[48px] font-bold text-white leading-tight tracking-tight">New Password</h2>
                    <p className="text-[18px] text-white/70">Configure your new password key</p>
                  </div>

                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <CustomInput
                      type="password"
                      required
                      placeholder="New password key"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      icon={<Lock className="w-5 h-5" />}
                    />

                    <PrimaryButton type="submit" disabled={loading}>
                      Unlock & Reset Key
                    </PrimaryButton>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-left text-[11px] text-white/30 font-mono">
          © 2025 The Oldverse Productions. All rights reserved.
        </div>

      </div>

    </div>
  );
};

export default AuthView;

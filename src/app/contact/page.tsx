"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Globe,
  Phone,
  Send,
  Loader2,
  CheckCircle,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "" // Honeypot field
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          website: ""
        });
      } else {
        setApiError(data.error || "Failed to submit message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setApiError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between font-sans selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Cinematic grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-[1200px] mx-auto px-6 py-8 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-mono tracking-widest text-white/60 group-hover:text-white transition-colors">RETURN HOME</span>
        </Link>
        <div className="text-[10px] font-mono tracking-[0.25em] text-[#38bdf8] uppercase">
          Contact Deck
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1200px] mx-auto px-6 flex-1 flex flex-col lg:flex-row gap-16 items-center justify-center z-10 py-12">
        
        {/* Left Column: Context Branding & Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-5/12 space-y-10"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-[#38bdf8] font-bold">
              <span>EST. 2025</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight uppercase font-mono">
              GET IN TOUCH
            </h1>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed">
              Have a production in mind or want to collaborate on a screenplay? Reach out to our crew and let's craft cinematic stories together.
            </p>
          </div>

          {/* Contact Details Cards */}
          <div className="space-y-4 text-xs font-mono">
            
            <a
              href="mailto:theoldverse@gmail.com"
              className="flex items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-white/5 flex items-center justify-center rounded-lg border border-white/10 shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-white/40 block uppercase tracking-wider">EMAIL DIRECTORY</span>
                <span className="text-white font-medium group-hover:text-primary transition-colors truncate block">theoldverse@gmail.com</span>
              </div>
            </a>

            <a
              href="https://instagram.com/theoldverse_"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-white/5 flex items-center justify-center rounded-lg border border-white/10 shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-white/40 block uppercase tracking-wider">INSTAGRAM HANDLE</span>
                <span className="text-white font-medium group-hover:text-primary transition-colors truncate block">@theoldverse_</span>
              </div>
            </a>

            <a
              href="https://theoldverse-productions.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-white/5 flex items-center justify-center rounded-lg border border-white/10 shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-white/40 block uppercase tracking-wider">OFFICIAL WEBSITE</span>
                <span className="text-white font-medium group-hover:text-primary transition-colors truncate block">theoldverse-productions.in</span>
              </div>
            </a>

          </div>
        </motion.div>

        {/* Right Column: Contact Form Deck */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-7/12"
        >
          <Card className="bg-[#111318]/50 border border-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Send Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Honeypot field (hidden for spam protection) */}
              <div className="hidden">
                <label>Do not fill this field if you are human:</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-white/60 font-mono uppercase tracking-wider text-[9px]">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className={`w-full bg-[#000000] border ${
                      errors.name ? "border-red-500" : "border-white/10"
                    } rounded-xl px-4 py-3 text-white placeholder-white/10 focus:border-white focus:outline-none transition-colors`}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-[10px] flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-white/60 font-mono uppercase tracking-wider text-[9px]">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. john@domain.com"
                    className={`w-full bg-[#000000] border ${
                      errors.email ? "border-red-500" : "border-white/10"
                    } rounded-xl px-4 py-3 text-white placeholder-white/10 focus:border-white focus:outline-none transition-colors`}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-[10px] flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone & Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-white/60 font-mono uppercase tracking-wider text-[9px]">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 99999 99999"
                    className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/10 focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-white/60 font-mono uppercase tracking-wider text-[9px]">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Script collaboration inquiry"
                    className={`w-full bg-[#000000] border ${
                      errors.subject ? "border-red-500" : "border-white/10"
                    } rounded-xl px-4 py-3 text-white placeholder-white/10 focus:border-white focus:outline-none transition-colors`}
                  />
                  {errors.subject && (
                    <span className="text-red-500 text-[10px] flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.subject}
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-white/60 font-mono uppercase tracking-wider text-[9px]">Complete Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details regarding your script development, shoot scheduling, or casting requirements..."
                  rows={5}
                  className={`w-full bg-[#000000] border ${
                    errors.message ? "border-red-500" : "border-white/10"
                  } rounded-xl px-4 py-3 text-white placeholder-white/10 focus:border-white focus:outline-none transition-colors resize-none h-36`}
                />
                {errors.message && (
                  <span className="text-red-500 text-[10px] flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </span>
                )}
              </div>

              {/* API Route submission warnings */}
              {apiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Send Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-white/95 text-black font-extrabold py-3.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs font-mono"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>TRANSMITTING MESSAGE...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-black" />
                    <span>DISPATCH SECURE TRANSMISSION</span>
                  </>
                )}
              </Button>

            </form>
          </Card>
        </motion.div>

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.25em] z-10 border-t border-white/5">
        © 2025 TheOldverse Productions. All rights reserved.
      </footer>

      {/* SUCCESS OVERLAY POPUP */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm bg-[#111318] border border-white/10 rounded-2xl p-6 text-center space-y-5 shadow-2xl"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-[#38bdf8]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Transmission Sent</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Your message has been sent successfully. Our crew will review your inquiry and respond shortly.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/"
                  className="w-full inline-block bg-white hover:bg-white/95 text-black text-[11px] font-extrabold py-2.5 rounded-lg transition-colors cursor-pointer tracking-wider font-mono"
                  onClick={() => setSuccess(false)}
                >
                  RETURN HOME
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

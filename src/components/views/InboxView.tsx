"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Search,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  User,
  Mail,
  Phone,
  X,
  Loader2,
  ExternalLink,
  Lock,
  Archive,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const InboxView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);

  // Messages State
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Unread" | "Read" | "Replied">("All");

  // Selected Message for Drawer
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      setLoadingAdminCheck(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        if (user.email === "theoldverse@gmail.com") {
          setIsAdmin(true);
          setLoadingAdminCheck(false);
          return;
        }

        // Query profile role
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data && (data.role === "Owner" || data.role === "Admin")) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
      setLoadingAdminCheck(false);
    };

    init();
  }, []);

  // Fetch messages from Supabase
  const loadMessages = async () => {
    if (!isAdmin) return;

    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error querying contact_messages:", error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadMessages();
    }
  }, [isAdmin]);

  // Update status action
  const handleUpdateStatus = async (msgId: string, newStatus: "Read" | "Replied") => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: newStatus })
        .eq("id", msgId);

      if (error) {
        console.error(error);
        alert("Failed to update status: " + error.message);
      } else {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === msgId ? { ...msg, status: newStatus } : msg))
        );
        if (selectedMsg && selectedMsg.id === msgId) {
          setSelectedMsg((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete message action
  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("Are you sure you want to delete this contact message permanently?")) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", msgId);

      if (error) {
        console.error(error);
        alert("Failed to delete message: " + error.message);
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== msgId));
        if (selectedMsg && selectedMsg.id === msgId) {
          setSelectedMsg(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDetail = (msg: any) => {
    setSelectedMsg(msg);
    if (msg.status === "Unread") {
      handleUpdateStatus(msg.id, "Read");
    }
  };

  if (loadingAdminCheck) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center font-mono">
        <Loader2 className="w-6 h-6 animate-spin text-[#38bdf8]" />
        <span className="text-[10px] text-text-secondary uppercase tracking-widest">
          Verifying security authorizations...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center shadow-lg">
          <Lock className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            ACCESS RESTRICTED
          </h4>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Your credentials lack administrative privileges to view the public contact message logs.
          </p>
        </div>
      </div>
    );
  }

  const filteredMessages = messages.filter((msg) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (msg.name || "").toLowerCase().includes(query) ||
      (msg.email || "").toLowerCase().includes(query) ||
      (msg.subject || "").toLowerCase().includes(query) ||
      (msg.message || "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "All" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white select-none">
      
      {/* View Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white uppercase font-sans">
            Contact Inbox
          </h1>
          <p className="text-[10px] text-text-secondary mt-1 font-mono uppercase tracking-wider">
            Review public customer inquiries and production requests
          </p>
        </div>

        <Button
          onClick={loadMessages}
          variant="outline"
          size="sm"
          disabled={loadingMessages}
          className="border-white/10 hover:border-white h-8 flex items-center gap-1.5 cursor-pointer text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        
        {/* Status filters */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl text-xs font-mono">
          {(["All", "Unread", "Read", "Replied"] as const).map((status) => {
            const count =
              status === "All"
                ? messages.length
                : messages.filter((m) => m.status === status).length;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-black font-extrabold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search sender, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090B] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:border-white/45 focus:outline-none transition-colors"
          />
        </div>

      </div>

      {/* Messages Table */}
      <Card className="bg-[#111318]/40 border border-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-white/45 font-mono uppercase text-[9px] tracking-widest">
                <th className="py-4 px-6 font-semibold">Sender</th>
                <th className="py-4 px-6 font-semibold">Subject</th>
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingMessages ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center font-mono text-white/30 text-[10px] uppercase tracking-widest">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#38bdf8] mb-3" />
                    Loading inbox messages...
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center font-mono text-white/30 text-[10px] uppercase tracking-widest">
                    No matching inbox messages found.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => {
                  const isUnread = msg.status === "Unread";
                  const date = new Date(msg.created_at).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenDetail(msg)}
                      className={`hover:bg-white/[0.01] transition-colors cursor-pointer ${
                        isUnread ? "bg-white/[0.005] font-semibold text-white" : "text-white/60"
                      }`}
                    >
                      {/* Sender */}
                      <td className="py-4 px-6 max-w-[180px]">
                        <div className="flex flex-col">
                          <span className={`text-white truncate ${isUnread ? "font-bold" : ""}`}>
                            {msg.name}
                          </span>
                          <span className="text-[10px] text-white/30 truncate mt-0.5 font-mono">
                            {msg.email}
                          </span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-6 max-w-[280px]">
                        <div className="flex flex-col">
                          <span className={`text-white truncate ${isUnread ? "font-bold" : ""}`}>
                            {msg.subject}
                          </span>
                          <span className="text-[10px] text-white/30 truncate mt-0.5 max-w-xs">
                            {msg.message}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 font-mono text-[10px] text-white/45">
                        {date}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-wider ${
                            msg.status === "Unread"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : msg.status === "Replied"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-white/10 text-white/50 border border-white/5"
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          {msg.status !== "Replied" && (
                            <button
                              onClick={() => handleUpdateStatus(msg.id, "Replied")}
                              title="Mark as Replied"
                              className="p-1.5 bg-green-500/5 hover:bg-green-500/20 border border-green-500/10 text-green-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Delete Message"
                            className="p-1.5 bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 text-red-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAIL CONVERSATION DRAWER */}
      <AnimatePresence>
        {selectedMsg && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setSelectedMsg(null)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-[#09090B] border-l border-white/10 h-full shadow-2xl relative z-10 flex flex-col justify-between"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">
                    TRANSMISSION DETAILS
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {selectedMsg.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMsg(null)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                
                {/* Meta details */}
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3 font-mono text-white/60">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-white/30 shrink-0" />
                    <span className="text-white/40 min-w-[70px]">Sender:</span>
                    <strong className="text-white font-semibold">{selectedMsg.name}</strong>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/30 shrink-0" />
                    <span className="text-white/40 min-w-[70px]">Email:</span>
                    <a
                      href={`mailto:${selectedMsg.email}`}
                      className="text-[#38bdf8] hover:underline flex items-center gap-1 group"
                    >
                      {selectedMsg.email}
                      <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-[#38bdf8] transition-colors" />
                    </a>
                  </div>

                  {selectedMsg.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-white/30 shrink-0" />
                      <span className="text-white/40 min-w-[70px]">Phone:</span>
                      <strong className="text-white">{selectedMsg.phone}</strong>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-white/30 shrink-0" />
                    <span className="text-white/40 min-w-[70px]">Received:</span>
                    <strong className="text-white">
                      {new Date(selectedMsg.created_at).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} IST
                    </strong>
                  </div>

                  <div className="flex items-center gap-3">
                    <Archive className="w-4 h-4 text-white/30 shrink-0" />
                    <span className="text-white/40 min-w-[70px]">Status:</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        selectedMsg.status === "Unread"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : selectedMsg.status === "Replied"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-white/10 text-white/50 border border-white/5"
                      }`}
                    >
                      {selectedMsg.status}
                    </span>
                  </div>
                </div>

                {/* Complete Message */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider">
                    Message Body
                  </span>
                  <div className="bg-[#000000] border border-white/5 p-4 rounded-xl text-white/80 leading-relaxed font-sans text-xs min-h-[150px] whitespace-pre-wrap">
                    {selectedMsg.message}
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-white/5 bg-[#111318] flex gap-3">
                {selectedMsg.status !== "Replied" ? (
                  <Button
                    onClick={() => handleUpdateStatus(selectedMsg.id, "Replied")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-mono font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4 text-white" /> MARK REPLIED
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpdateStatus(selectedMsg.id, "Read")}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold py-2.5 rounded-lg border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-white" /> RESET TO READ
                  </Button>
                )}
                
                <Button
                  onClick={() => handleDeleteMessage(selectedMsg.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default InboxView;

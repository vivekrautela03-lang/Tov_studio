"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Search,
  Plus,
  Send,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Camera,
  Image as ImageIcon,
  Phone,
  Video,
  Info,
  ArrowLeft,
  ChevronRight,
  User,
  Users,
  Pin,
  VolumeX,
  Volume2,
  Trash2,
  Edit3,
  Copy,
  Share2,
  Check,
  CheckCheck,
  Menu,
  Sparkles,
  FileText,
  DollarSign,
  Clapperboard,
  ShieldAlert,
  Archive,
  PhoneOff,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export const ChatView: React.FC = () => {
  const {
    chatChannels,
    chatMessages,
    activeChannelId,
    fetchChatChannels,
    fetchChatMessages,
    sendChatMessage,
    createChatChannel,
    setActiveChannelId,
    deleteChatMessage,
    editChatMessage,
    markMessagesAsRead,
    toggleMessageReaction,
    toggleMuteChannel,
    togglePinChannel,
    toggleArchiveChannel,
    blockUser,
    unblockUser,
    reportUser,
    updateGroupDetails,
    updateGroupMemberRole,
    addGroupMembers,
    removeGroupMember,
    leaveGroup,
    uploadChatAttachment,
    userProfile,
    projects
  } = useProjectStore();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Filters & State
  const [activeFilter, setActiveFilter] = useState<"Primary" | "Projects" | "Requests" | "Unread" | "Archived">("Primary");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);

  // Presence & Typing State
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; timestamp: number }>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<any>(null);

  // Call & Voice Note Simulation states
  const [activeCall, setActiveCall] = useState<{ type: "voice" | "video"; user: string; status: "ringing" | "connected" } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // GIFs popover
  const [showGifs, setShowGifs] = useState(false);
  const cinemaGifs = [
    { name: "Camera Rolling", url: "https://media.giphy.com/media/l2JdUKfPf6mlV4S4M/giphy.gif" },
    { name: "Clapper Action", url: "https://media.giphy.com/media/3o7qE1YN7aBOFPRw8E/giphy.gif" },
    { name: "Director Ready", url: "https://media.giphy.com/media/26FPpSuhg0vWe5QsM/giphy.gif" },
    { name: "Producer Deal", url: "https://media.giphy.com/media/xT0xezQGu5RZCDuQUM/giphy.gif" },
    { name: "Script Burn", url: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" }
  ];

  // Emojis lists
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎬"];

  // Context Menu, Editing, Reply & Forward State
  const [messageMenu, setMessageMenu] = useState<{ msgId: string; x: number; y: number } | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [replyingToMsg, setReplyingToMsg] = useState<any>(null);
  const [forwardingMsg, setForwardingMsg] = useState<any>(null);

  // New Chat Dialog
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [blockedUsersList, setBlockedUsersList] = useState<string[]>([]);

  // Input value
  const [messageInput, setMessageInput] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>("");

  // Load user profile & members
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: { user: usr } } = await supabase.auth.getUser();
        if (usr) {
          setCurrentUser(usr);
          const { data: bData } = await supabase
            .from("blocked_users")
            .select("blocked_user_id")
            .eq("user_id", usr.id);
          setBlockedUsersList(bData?.map((b: any) => b.blocked_user_id) || []);
        }

        const { data: profilesList } = await supabase
          .from("profiles")
          .select("*");
        if (profilesList) setProfiles(profilesList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Real-time PostgreSQL subscription
  useEffect(() => {
    fetchChatChannels();
    if (!currentUser) return;

    const globalChannel = supabase
      .channel("global-chat-listener")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => {
        fetchChatChannels();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_channels" }, () => {
        fetchChatChannels();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "blocked_users" }, () => {
        supabase.from("blocked_users").select("blocked_user_id").eq("user_id", currentUser.id)
          .then(({ data }) => setBlockedUsersList(data?.map((b: any) => b.blocked_user_id) || []));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [currentUser]);

  // Clean typing statuses
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const [id, data] of Object.entries(next)) {
          if (now - data.timestamp > 3000) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to channel room changes
  useEffect(() => {
    if (!activeChannelId || !currentUser) return;

    fetchChatMessages(activeChannelId);
    markMessagesAsRead(activeChannelId);

    const channel = supabase
      .channel(`chat-room-${activeChannelId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages", filter: `channel_id=eq.${activeChannelId}` }, (payload: any) => {
        fetchChatMessages(activeChannelId);
        markMessagesAsRead(activeChannelId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannelId, currentUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChannelId]);

  // Resolve metadata details of channel
  const getChannelDetails = (channel: any) => {
    if (channel.is_group) {
      return {
        title: channel.name || "Group Workspace",
        avatar: channel.avatar_url || null,
        description: channel.description || "Production team workspace chat.",
        isGroup: true
      };
    }

    const otherMember = channel.chat_channel_members?.find(
      (m: any) => m.user_id !== currentUser?.id
    );
    const profile = otherMember?.profiles;

    return {
      title: profile?.full_name || profile?.email || "Direct Message",
      avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || "User")}`,
      description: profile?.bio || "Collaborator",
      isGroup: false,
      userId: profile?.id
    };
  };

  const activeChannel = chatChannels.find((c) => c.id === activeChannelId);
  const activeChannelDetails = activeChannel ? getChannelDetails(activeChannel) : null;
  const currentMessages = activeChannelId ? chatMessages[activeChannelId] || [] : [];
  const isBlocked = activeChannelDetails?.userId && blockedUsersList.includes(activeChannelDetails.userId);

  // Sorting: Pinned first, then latest message date, unread counts highlighted
  const sortedChannels = [...chatChannels].sort((a, b) => {
    const isAPinned = a.pinned_by?.includes(currentUser?.id);
    const isBPinned = b.pinned_by?.includes(currentUser?.id);
    if (isAPinned && !isBPinned) return -1;
    if (!isAPinned && isBPinned) return 1;

    const dateA = new Date(a.updated_at || 0).getTime();
    const dateB = new Date(b.updated_at || 0).getTime();
    return dateB - dateA;
  });

  // Filter channels based on selected tab filter
  const filteredChannels = sortedChannels.filter((ch) => {
    const details = getChannelDetails(ch);
    const matchesSearch = details.title.toLowerCase().includes(sidebarSearch.toLowerCase());
    if (!matchesSearch) return false;

    const isPinned = ch.pinned_by?.includes(currentUser?.id);
    const isArchived = ch.archived_by?.includes(currentUser?.id);
    const hasUnread = ch.unread_count > 0;

    if (activeFilter === "Archived") return isArchived;
    if (isArchived) return false;

    if (activeFilter === "Pinned" as any) return isPinned;
    if (activeFilter === "Projects") return ch.is_group;
    if (activeFilter === "Unread") return hasUnread;
    if (activeFilter === "Requests") return !ch.is_group && !isPinned; // fallbacks to direct message requests
    if (activeFilter === "Primary") return !ch.is_group; // Direct DMs

    return true;
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !attachmentFile) return;
    let fileUrl = "";

    if (attachmentFile) {
      setIsUploading(true);
      fileUrl = await uploadChatAttachment(attachmentFile);
      setIsUploading(false);
    }

    await sendChatMessage(
      activeChannelId,
      messageInput.trim(),
      fileUrl || undefined,
      replyingToMsg?.id || undefined
    );

    setMessageInput("");
    setAttachmentFile(null);
    setAttachmentPreview("");
    setReplyingToMsg(null);
  };

  const handleBlockAction = async () => {
    if (!activeChannelDetails?.userId) return;
    if (isBlocked) {
      await unblockUser(activeChannelDetails.userId);
      alert("User unblocked.");
    } else {
      await blockUser(activeChannelDetails.userId);
      alert("User blocked.");
    }
  };

  const handleReportAction = async () => {
    if (!activeChannelDetails?.userId) return;
    const reason = prompt("Please provide a reason for reporting this user:");
    if (!reason || !reason.trim()) return;
    await reportUser(activeChannelDetails.userId, reason.trim());
  };

  // Simulate calling flow
  const handleStartCall = (type: "voice" | "video") => {
    if (!activeChannelDetails) return;
    setActiveCall({ type, user: activeChannelDetails.title, status: "ringing" });
    setTimeout(() => {
      setActiveCall((prev: any) => prev ? { ...prev, status: "connected" } : null);
    }, 3000);
  };

  // Simulate Voice Note recording
  const handleToggleVoiceRecord = () => {
    if (isRecording) {
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
      setRecordingSeconds(0);
      // Mock sending audio
      sendChatMessage(activeChannelId, "🎤 Voice Note (0:08)", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const handleCreateChatSubmit = async () => {
    if (isGroup && !groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    if (selectedMembers.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }

    const channelId = await createChatChannel(
      isGroup ? groupName.trim() : null,
      isGroup,
      selectedMembers
    );

    if (channelId) {
      setActiveChannelId(channelId);
      setIsNewChatOpen(false);
      setGroupName("");
      setSelectedMembers([]);
    }
  };

  return (
    <div className="h-[82vh] flex bg-[#0b0c10]/95 border border-white/5 rounded-2xl overflow-hidden text-white relative backdrop-blur-md shadow-2xl animate-fade-in">
      
      {/* 1. CHANNELS SIDEBAR CONTAINER */}
      <div className={`w-full md:w-80 flex flex-col bg-neutral-900/40 border-r border-white/5 ${activeChannelId ? "hidden md:flex" : "flex"}`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white uppercase tracking-widest">Messages</span>
            </div>
            
            <button
              onClick={() => {
                setIsGroup(false);
                setIsNewChatOpen(true);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer border border-white/5 transition-all"
              title="Compose Message"
            >
              <Plus className="w-4.5 h-4.5 text-[#22d3ee]" />
            </button>
          </div>

          {/* Search bar inside channels sidebar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[10px] focus:outline-none focus:border-[#22d3ee] text-white"
            />
          </div>
        </div>

        {/* Filter chips bar */}
        <div className="flex gap-1.5 px-3 py-2 border-b border-white/5 overflow-x-auto no-scrollbar bg-black/10">
          {(["Primary", "Projects", "Requests", "Unread", "Archived"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === filter
                  ? "bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/20"
                  : "bg-white/5 text-text-secondary border border-transparent hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-text-secondary/70">
              <span className="text-3xl">💬</span>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-2">No messages yet</p>
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const details = getChannelDetails(channel);
              const isActive = channel.id === activeChannelId;
              const isPinned = channel.pinned_by?.includes(currentUser?.id);
              const isMuted = channel.muted_by?.includes(currentUser?.id);
              const hasUnread = channel.unread_count > 0;

              return (
                <div key={channel.id} className="relative group/channel flex items-center w-full">
                  <button
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`flex-1 flex items-center gap-3 pl-3 pr-12 py-3 rounded-xl text-left text-xs transition-all duration-200 cursor-pointer relative ${
                      isActive
                        ? "bg-[#22d3ee]/10 text-white border-l-2 border-[#22d3ee]"
                        : "hover:bg-white/5 text-text-secondary"
                    }`}
                  >
                    {/* Avatar section */}
                    <div className="relative">
                      {details.isGroup ? (
                        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[#22d3ee] text-xs">
                          {details.title.substring(0, 2).toUpperCase()}
                        </div>
                      ) : (
                        <img
                          src={details.avatar || ""}
                          className="w-11 h-11 rounded-full object-cover border border-white/10"
                          alt=""
                        />
                      )}
                      {/* Active online Presence dot */}
                      {!details.isGroup && details.userId && onlineUsers.includes(details.userId) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#3ecf8e] rounded-full ring-2 ring-neutral-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate text-white block pr-2 text-xs">{details.title}</span>
                        <div className="flex gap-1.5 items-center shrink-0">
                          {isMuted && <VolumeX className="w-3.5 h-3.5 text-text-secondary/50" />}
                          {isPinned && <Pin className="w-3.5 h-3.5 text-[#22d3ee]/80" />}
                          {details.isGroup && (
                            <span className="text-[8px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                              Project
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-[10px] truncate max-w-[130px] ${hasUnread ? "text-white font-black" : "text-text-secondary"}`}>
                          {details.description}
                        </p>
                        
                        {/* Seen or Unread status indicator */}
                        {hasUnread ? (
                          <span className="w-4 h-4 rounded-full bg-[#22d3ee] text-[9px] font-black text-black flex items-center justify-center">
                            {channel.unread_count}
                          </span>
                        ) : (
                          <span className="text-[9px] text-text-secondary/60 font-mono">Seen</span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Absolute positioned delete button, visible on mobile & desktop */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Delete conversation with "${details.title}"?`)) {
                        const { error } = await supabase
                          .from("chat_channels")
                          .delete()
                          .eq("id", channel.id);
                        if (!error) {
                          if (isActive) setActiveChannelId("");
                          fetchChatChannels();
                        }
                      }
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 flex p-1.5 rounded-lg bg-danger/10 hover:bg-danger text-danger hover:text-white transition-all cursor-pointer z-10 border border-danger/10"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CHAT PANEL VIEW */}
      <div className={`flex-1 flex flex-col bg-neutral-950/20 relative ${activeChannelId ? "flex" : "hidden md:flex"}`}>
        {activeChannel ? (
          <>
            {/* Chat header console */}
            <div className="px-4 md:px-6 py-3.5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between z-10 backdrop-blur-md">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Back button (ArrowLeft) */}
                <button
                  onClick={() => setActiveChannelId("")}
                  className="mr-1 md:mr-2 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#22d3ee] text-text-secondary hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  title="Back to list"
                >
                  <ArrowLeft className="w-4 h-4 text-[#22d3ee]" />
                </button>
                
                {activeChannelDetails?.isGroup ? (
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[#22d3ee] text-xs">
                    {activeChannelDetails.title.substring(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={activeChannelDetails?.avatar || ""}
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                      alt=""
                    />
                    {activeChannelDetails?.userId && onlineUsers.includes(activeChannelDetails.userId) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-neutral-900" />
                    )}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {activeChannelDetails?.title}
                  </h4>
                  <p className="text-[9px] text-text-secondary">
                    {activeChannelDetails?.isGroup 
                      ? `${activeChannel.chat_channel_members?.length || 0} members active`
                      : activeChannelDetails?.userId && onlineUsers.includes(activeChannelDetails.userId)
                        ? "Active now"
                        : "Offline"}
                  </p>
                </div>
              </div>

              {/* Call and details actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartCall("voice")}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#22d3ee] text-text-secondary hover:text-white transition-colors cursor-pointer"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleStartCall("video")}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#22d3ee] text-text-secondary hover:text-white transition-colors cursor-pointer"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowDetailsSidebar(!showDetailsSidebar)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#22d3ee] text-text-secondary hover:text-white transition-colors cursor-pointer"
                  title="Conversation Info"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pinned Messages Strip banner */}
            {currentMessages.some((m) => m.is_pinned) && (
              <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between text-[10px] text-primary">
                <div className="flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5 rotate-45 shrink-0" />
                  <span>Pinned Message: <strong>{currentMessages.find((m) => m.is_pinned)?.content}</strong></span>
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-text-secondary/50">
                  <span className="text-3xl">✨</span>
                  <p className="text-[10px] uppercase font-bold tracking-wider mt-2">Start conversation</p>
                </div>
              ) : (
                currentMessages.map((msg, idx) => {
                  const isSender = msg.sender_id === currentUser?.id;
                  const senderProfile = profiles.find((p) => p.id === msg.sender_id);
                  const senderName = senderProfile?.full_name || "Someone";
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[75%] ${isSender ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      {/* Sender Name if group */}
                      {activeChannelDetails?.isGroup && !isSender && (
                        <span className="text-[9px] text-text-secondary/80 font-mono mb-1 ml-1">{senderName}</span>
                      )}

                      {/* Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs relative group/msg transition-all duration-150 ${
                          isSender
                            ? "bg-gradient-to-br from-[#22d3ee]/20 to-cyan-500/10 border border-[#22d3ee]/10 text-white rounded-tr-none"
                            : "bg-white/[0.04] border border-white/5 text-white/90 rounded-tl-none"
                        }`}
                      >
                        {/* Reply content if present */}
                        {msg.reply_to_message_id && (
                          <div className="mb-2 p-2 rounded bg-black/30 border-l-2 border-[#22d3ee] text-[10px] text-text-secondary">
                            Replying to message...
                          </div>
                        )}

                        <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>

                        {/* Render file attachments with different layouts */}
                        {msg.attachment_url && (
                          <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-white/5 flex items-center gap-3">
                            {msg.attachment_url.endsWith(".pdf") ? (
                              <>
                                <FileText className="w-8 h-8 text-danger shrink-0 animate-pulse" />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-white block truncate">Production_Script.pdf</span>
                                  <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="text-[9px] text-[#22d3ee] hover:underline">Download Script</a>
                                </div>
                              </>
                            ) : msg.attachment_url.endsWith(".xlsx") || msg.attachment_url.includes("budget") ? (
                              <>
                                <DollarSign className="w-8 h-8 text-success shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-white block truncate">Budget_Sheets.xlsx</span>
                                  <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="text-[9px] text-[#22d3ee] hover:underline">Download sheet</a>
                                </div>
                              </>
                            ) : msg.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || msg.attachment_url.includes("base64") ? (
                              <img src={msg.attachment_url} className="w-36 h-24 object-cover rounded-md" alt="" />
                            ) : (
                              <>
                                <Paperclip className="w-8 h-8 text-primary shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-white block truncate">Attachment File</span>
                                  <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="text-[9px] text-[#22d3ee] hover:underline">Download file</a>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Quick long-press / context menu shortcut */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover/msg:flex gap-1.5 px-2 bg-neutral-900 border border-white/10 rounded-lg py-1 shadow-xl z-20">
                          <button
                            onClick={() => {
                              setReplyingToMsg(msg);
                            }}
                            className="p-1 hover:text-primary transition-colors text-text-secondary"
                            title="Reply"
                          >
                            <Share2 className="w-3.5 h-3.5 rotate-180" />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm("Delete this message?")) {
                                deleteChatMessage(activeChannelId, msg.id);
                              }
                            }}
                            className="p-1 hover:text-danger transition-colors text-text-secondary"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Timestamp & status */}
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[8px] text-text-secondary/70">
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isSender && (
                          <CheckCheck className="w-3 h-3 text-[#22d3ee]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Simulated Voice note recording UI overlay */}
            {isRecording && (
              <div className="bg-[#22d3ee]/10 border-t border-[#22d3ee]/20 px-4 py-2 flex items-center justify-between text-xs text-[#22d3ee]">
                <div className="flex items-center gap-3">
                  <Mic className="w-4 h-4 animate-ping shrink-0" />
                  <span>Recording Voice Note... <strong>0:{recordingSeconds.toString().padStart(2, "0")}</strong></span>
                </div>
                <button
                  onClick={handleToggleVoiceRecord}
                  className="px-3 py-1 rounded bg-[#22d3ee] text-black font-bold uppercase text-[9px]"
                >
                  Stop & Send
                </button>
              </div>
            )}

            {/* Reply Preview bar */}
            {replyingToMsg && (
              <div className="bg-white/5 border-t border-white/5 px-4 py-2.5 flex items-center justify-between text-[10px] text-text-secondary">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Replying to message</span>
                  <span className="truncate max-w-[200px] mt-0.5">{replyingToMsg.content}</span>
                </div>
                <button
                  onClick={() => setReplyingToMsg(null)}
                  className="p-1 rounded bg-white/5 text-text-secondary hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Chat Action Input bar */}
            <div className="p-3 md:p-4 border-t border-white/5 bg-[#0e1014]/80 backdrop-blur-md flex flex-col gap-2 z-10">
              
              {/* Emojis shortcuts bar */}
              {showEmojiPicker && (
                <div className="flex gap-2.5 p-2 bg-neutral-900 border border-white/10 rounded-lg w-fit">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageInput((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* GIFs Selector mini panel */}
              {showGifs && (
                <div className="p-3 bg-neutral-900 border border-white/10 rounded-xl space-y-2 max-w-sm">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/40 block">Cinematic Filmmaking GIFs</span>
                  <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                    {cinemaGifs.map((gif) => (
                      <img
                        key={gif.name}
                        src={gif.url}
                        onClick={() => {
                          sendChatMessage(activeChannelId, `🎬 GIF: ${gif.name}`, gif.url);
                          setShowGifs(false);
                        }}
                        className="w-20 h-16 object-cover rounded-lg border border-white/5 hover:border-[#22d3ee] cursor-pointer transition-all shrink-0"
                        alt={gif.name}
                        title={gif.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Main row */}
              <div className="flex items-center gap-2">
                
                {/* Media uploader trigger */}
                <input
                  type="file"
                  id="media-attach-file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachmentFile(file);
                      setAttachmentPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                
                <label
                  htmlFor="media-attach-file"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#22d3ee] text-text-secondary hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  title="Attach File/Gallery"
                >
                  <Paperclip className="w-4 h-4" />
                </label>

                {/* Camera / photo simulator button */}
                <button
                  onClick={() => {
                    const triggerUpload = document.getElementById("media-attach-file");
                    triggerUpload?.click();
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#22d3ee] text-text-secondary hover:text-white transition-colors cursor-pointer hidden sm:flex shrink-0"
                  title="Simulate Camera Snapshot"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Mic recording trigger */}
                <button
                  onClick={handleToggleVoiceRecord}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    isRecording 
                      ? "bg-danger/20 border-danger text-danger animate-pulse"
                      : "bg-white/5 border-white/5 hover:border-[#22d3ee] text-text-secondary hover:text-white"
                  }`}
                  title="Simulate Voice recording"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Emojis picker trigger */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#22d3ee] text-text-secondary hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Add Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* GIF popover trigger */}
                <button
                  onClick={() => setShowGifs(!showGifs)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#22d3ee] text-[10px] font-bold text-text-secondary hover:text-white transition-colors cursor-pointer shrink-0 font-mono"
                  title="GIF Picker"
                >
                  GIF
                </button>

                {/* Input text box */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={isUploading}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-[#22d3ee] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black font-extrabold flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 transition-all"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Attachment Preview thumbnail if selected */}
              {attachmentPreview && (
                <div className="mt-1 flex items-center gap-3 p-2 bg-neutral-900 border border-white/10 rounded-lg w-fit relative">
                  <img src={attachmentPreview} className="w-12 h-12 object-cover rounded" alt="" />
                  <span className="text-[10px] text-text-secondary font-mono truncate max-w-[120px]">{attachmentFile?.name}</span>
                  <button
                    onClick={() => {
                      setAttachmentFile(null);
                      setAttachmentPreview("");
                    }}
                    className="p-1 rounded bg-black/40 hover:bg-black text-white hover:text-danger text-xs absolute -top-1.5 -right-1.5 border border-white/10"
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-secondary/60">
            <span className="text-4xl">🎬</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mt-3">Oldverse DMs</h3>
            <p className="text-[10px] text-text-secondary mt-1">Select a production channel or collaborator to begin messaging.</p>
          </div>
        )}
      </div>

      {/* 3. DETAILS SIDEBAR (Right overlay drawer) */}
      <AnimatePresence>
        {showDetailsSidebar && activeChannelDetails && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute md:relative right-0 top-0 bottom-0 w-80 max-w-full bg-[#121319]/95 border-l border-white/5 z-40 flex flex-col h-full shadow-2xl overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Details</span>
              <button
                onClick={() => setShowDetailsSidebar(false)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              >
                X
              </button>
            </div>

            {/* Profile / Group Card info */}
            <div className="p-6 border-b border-white/5 flex flex-col items-center text-center space-y-3">
              {activeChannelDetails.isGroup ? (
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[#22d3ee] text-xl shadow-lg">
                  {activeChannelDetails.title.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <img
                  src={activeChannelDetails.avatar || ""}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/10 shadow-lg"
                  alt=""
                />
              )}
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{activeChannelDetails.title}</h3>
                <p className="text-[10px] text-text-secondary leading-normal">{activeChannelDetails.description}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-white/5 space-y-1.5">
              <button
                onClick={() => togglePinChannel(activeChannelId)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Pin className="w-4 h-4 rotate-45" />
                  <span>Pin Conversation</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => toggleMuteChannel(activeChannelId)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <VolumeX className="w-4 h-4" />
                  <span>Mute Notifications</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => toggleArchiveChannel(activeChannelId)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4" />
                  <span>Archive Conversation</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {!activeChannelDetails.isGroup && (
                <>
                  <button
                    onClick={handleBlockAction}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-danger/10 text-danger cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-danger" />
                      <span>{isBlocked ? "Unblock User" : "Block User"}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleReportAction}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Report User</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Shared Media Grid */}
            <div className="p-5 space-y-3.5 flex-1">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/40 block">Shared Media</span>
              
              <div className="grid grid-cols-3 gap-2">
                {currentMessages
                  .filter((m) => m.attachment_url && m.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                  .slice(0, 6)
                  .map((m) => (
                    <img
                      key={m.id}
                      src={m.attachment_url}
                      className="w-full h-16 object-cover rounded-lg border border-white/5 hover:border-[#22d3ee] transition-all cursor-zoom-in"
                      alt=""
                      onClick={() => window.open(m.attachment_url, "_blank")}
                    />
                  ))}
              </div>
              
              {currentMessages.filter((m) => m.attachment_url).length === 0 && (
                <p className="text-[10px] text-text-secondary">No shared photos or film files in this chat.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. CALLING INTERACTIVE SCREEN OVERLAY MODAL */}
      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md text-white">
          <div className="text-center space-y-6 max-w-sm p-8 bg-neutral-900/60 border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center">
            
            {/* Ringing circle animation */}
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-[#22d3ee]/20 animate-ping" />
              <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-[#22d3ee] flex items-center justify-center font-bold text-[#22d3ee] text-3xl shadow-lg relative">
                {activeCall.user.substring(0, 2).toUpperCase()}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">{activeCall.user}</h2>
              <p className="text-xs text-[#22d3ee] uppercase tracking-widest font-mono animate-pulse">
                {activeCall.status === "ringing" ? "Secure TOV Ringing..." : "Connected • Secure Line"}
              </p>
            </div>

            <p className="text-[10px] text-text-secondary leading-relaxed">
              TOV Studio Voice & Video Shield encryption active. Your calls are fully end-to-end encrypted.
            </p>

            <button
              onClick={() => setActiveCall(null)}
              className="p-4 rounded-full bg-danger hover:bg-danger/80 text-white transition-colors cursor-pointer flex items-center justify-center"
              title="Hang Up"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* 5. NEW MESSAGE & GROUP MODAL OVERLAY */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[450px] max-w-full bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-white">New Conversation</span>
              <button
                onClick={() => {
                  setIsNewChatOpen(false);
                  setGroupName("");
                  setSelectedMembers([]);
                }}
                className="p-1 rounded bg-white/5 text-text-secondary hover:text-white"
              >
                X
              </button>
            </div>

            {/* Conversation type switch */}
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
              <button
                onClick={() => setIsGroup(false)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  !isGroup ? "bg-[#22d3ee] text-black" : "text-text-secondary hover:text-white"
                }`}
              >
                Direct Message
              </button>
              <button
                onClick={() => setIsGroup(true)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  isGroup ? "bg-[#22d3ee] text-black" : "text-text-secondary hover:text-white"
                }`}
              >
                Create Group
              </button>
            </div>

            {/* Group Name input if group */}
            {isGroup && (
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VFX Team, Nishaan Writers"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>
            )}

            {/* Member search list */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase text-text-secondary">Select Recipients</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search crew members..."
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              {/* Members checkboxes list */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 pt-1.5 no-scrollbar">
                {profiles
                  .filter((p) => p.id !== currentUser?.id && p.full_name?.toLowerCase().includes(searchMemberQuery.toLowerCase()))
                  .map((p) => {
                    const isSelected = selectedMembers.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMembers(selectedMembers.filter((m) => m !== p.id));
                          } else {
                            if (!isGroup) {
                              // Direct Message can only have 1 selected recipient
                              setSelectedMembers([p.id]);
                            } else {
                              setSelectedMembers([...selectedMembers, p.id]);
                            }
                          }
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 hover:bg-white/5 cursor-pointer border border-white/[0.02]"
                      >
                        <div className="flex items-center gap-3">
                          <img src={p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || "User")}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                          <div className="text-left">
                            <span className="text-xs font-bold text-white block">{p.full_name}</span>
                            <span className="text-[9px] text-text-secondary">{p.role || "Crew Member"}</span>
                          </div>
                        </div>

                        <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-[#22d3ee] border-[#22d3ee] text-black" : "border-white/20"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsNewChatOpen(false);
                  setGroupName("");
                  setSelectedMembers([]);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCreateChatSubmit}
              >
                Start Chatting
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ChatView;

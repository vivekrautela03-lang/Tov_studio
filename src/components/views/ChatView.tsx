"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Plus,
  User,
  Users,
  Search,
  Pin,
  Archive,
  VolumeX,
  Volume2,
  Trash2,
  Edit2,
  Check,
  CheckCheck,
  Flag,
  X,
  Smile,
  Send,
  Paperclip,
  Share2,
  Info,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Eye,
  Lock,
  ArrowLeft,
  Settings,
  MoreVertical,
  Reply,
  Copy,
  Forward,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    updateProfilePrivacySettings,
    userProfile
  } = useProjectStore();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Filters & State
  const [channelFilter, setChannelFilter] = useState<"all" | "direct" | "groups" | "pinned" | "archived">("all");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);

  // Presence & Typing State
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; timestamp: number }>>({});
  
  const activeChannelRef = useRef<any>(null);
  const lastTypingSent = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Context Menu, Editing, Reply & Forward State
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number } | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [replyingToMsg, setReplyingToMsg] = useState<any>(null);
  const [forwardingMsg, setForwardingMsg] = useState<any>(null);

  // Modals & Popovers
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [blockedUsersList, setBlockedUsersList] = useState<string[]>([]);

  const [messageInput, setMessageInput] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<string>("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Flood protection rate-limiting
  const [recentMessageTimes, setRecentMessageTimes] = useState<number[]>([]);

  // Load profiles and currentUser
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, message_privacy, online_privacy, pfp_privacy");
      setProfiles(profs || []);

      // Load blocked users
      if (user) {
        const { data: blocks } = await supabase
          .from("blocked_users")
          .select("blocked_user_id")
          .eq("user_id", user.id);
        setBlockedUsersList(blocks?.map((b: any) => b.blocked_user_id) || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Real-time channel list & activity subscription
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

  // Clean up typing users after 3 seconds of inactivity
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

  // Real-time message, presence, and typing subscription
  useEffect(() => {
    if (!activeChannelId || !currentUser) return;

    fetchChatMessages(activeChannelId);
    markMessagesAsRead(activeChannelId);

    const channel = supabase
      .channel(`chat-room-${activeChannelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${activeChannelId}`
        },
        (payload: any) => {
          fetchChatMessages(activeChannelId);
          markMessagesAsRead(activeChannelId);

          // Dispatch native browser notification and in-app notification center item
          if (payload.eventType === "INSERT" && payload.new) {
            const newMsg = payload.new;
            if (newMsg.sender_id !== currentUser?.id) {
              const senderProfile = profiles.find((p) => p.id === newMsg.sender_id);
              const senderName = senderProfile?.full_name || "Someone";
              
              if (
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification(`New message from ${senderName}`, {
                  body: newMsg.content || "Sent an image attachment",
                  icon: "/logo.png"
                });
              }

              // In-app notification center list
              useProjectStore.getState().addNotification({
                title: `Message from ${senderName}`,
                message: newMsg.content || "Sent an image attachment",
                type: "info"
              });
            }
          }
        }
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId === currentUser?.id) return;
        setTypingUsers((prev) => ({
          ...prev,
          [payload.userId]: { name: payload.userName, timestamp: Date.now() }
        }));
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const activeIds = Object.values(state)
          .flatMap((presences: any) => presences.map((p: any) => p.user_id))
          .filter(Boolean);
        setOnlineUsers(activeIds);
      });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: currentUser?.id,
          user_name: userProfile?.full_name || "Someone",
          online_at: new Date().toISOString()
        });
      }
    });

    activeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      activeChannelRef.current = null;
    };
  }, [activeChannelId, currentUser, userProfile]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChannelId]);

  const handleAttachmentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Maximum upload size is 10MB.");
      return;
    }

    setIsUploading(true);
    setAttachmentFile(file);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAttachment(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("FileReader failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);

    const now = Date.now();
    if (now - lastTypingSent.current > 1500 && activeChannelRef.current) {
      lastTypingSent.current = now;
      activeChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: currentUser?.id,
          userName: userProfile?.full_name || "Someone",
          isTyping: true
        }
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !selectedAttachment) || !activeChannelId) return;

    // Flooding Check
    const now = Date.now();
    const recent = recentMessageTimes.filter((t) => now - t < 5000);
    if (recent.length >= 3) {
      alert("Please slow down. Max 3 messages per 5 seconds.");
      return;
    }
    setRecentMessageTimes([...recent, now]);

    // Simple Profanity / Input Sanitization
    let sanitizedContent = messageInput.trim();
    sanitizedContent = sanitizedContent.replace(/<[^>]*>/g, ""); // strip simple HTML

    let finalAttachmentUrl = selectedAttachment;
    if (attachmentFile) {
      setIsUploading(true);
      finalAttachmentUrl = await uploadChatAttachment(attachmentFile);
      setIsUploading(false);
    }

    await sendChatMessage(
      activeChannelId,
      sanitizedContent,
      finalAttachmentUrl || undefined,
      replyingToMsg?.id || undefined,
      undefined,
      false
    );

    setMessageInput("");
    setSelectedAttachment("");
    setAttachmentFile(null);
    setReplyingToMsg(null);
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInput.trim() || !editingMsgId || !activeChannelId) return;

    await editChatMessage(activeChannelId, editingMsgId, editInput.trim().replace(/<[^>]*>/g, ""));
    setEditingMsgId(null);
    setEditInput("");
  };

  const handleCreateChannel = async () => {
    if (isGroup && !groupName.trim()) {
      alert("Please provide a group name.");
      return;
    }
    if (selectedMembers.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }

    const channelName = isGroup ? groupName.trim() : null;
    const targetChannelId = await createChatChannel(channelName, isGroup, selectedMembers);
    if (targetChannelId) {
      // If group, update details
      if (isGroup) {
        await updateGroupDetails(targetChannelId, groupName.trim(), groupDescription.trim(), groupAvatar.trim());
      }
      setActiveChannelId(targetChannelId);
      setIsNewChatOpen(false);
      setGroupName("");
      setGroupDescription("");
      setGroupAvatar("");
      setSelectedMembers([]);
      setIsGroup(false);
    }
  };

  const toggleSelectMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      if (!isGroup) {
        setSelectedMembers([id]);
      } else {
        setSelectedMembers([...selectedMembers, id]);
      }
    }
  };

  // Helper to resolve channel display attributes
  const getChannelDetails = (channel: any) => {
    if (channel.is_group) {
      return {
        title: channel.name || "Group Workspace",
        avatar: channel.avatar_url || null,
        description: channel.description || "No description set.",
        isGroup: true
      };
    }

    // Direct Message: find other member
    const otherMember = channel.chat_channel_members?.find(
      (m: any) => m.user_id !== currentUser?.id
    );
    const profile = otherMember?.profiles;

    return {
      title: profile?.full_name || profile?.email || "Direct Message",
      avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.full_name || "User")}`,
      description: profile?.bio || "Filmmaking collaborator",
      isGroup: false,
      userId: profile?.id
    };
  };

  const activeChannel = chatChannels.find((c) => c.id === activeChannelId);
  const activeChannelDetails = activeChannel ? getChannelDetails(activeChannel) : null;
  const currentMessages = activeChannelId ? chatMessages[activeChannelId] || [] : [];

  const currentMemberRow = activeChannel?.chat_channel_members?.find((m: any) => m.user_id === currentUser?.id);
  const currentUserRole = currentMemberRow?.role || "Member";

  const isBlocked = activeChannelDetails?.userId && blockedUsersList.includes(activeChannelDetails.userId);

  // Filters mapping
  const filteredChannels = chatChannels.filter((ch) => {
    const details = getChannelDetails(ch);
    const matchesSearch = details.title.toLowerCase().includes(sidebarSearch.toLowerCase());
    if (!matchesSearch) return false;

    const isPinned = ch.pinned_by?.includes(currentUser?.id);
    const isArchived = ch.archived_by?.includes(currentUser?.id);

    if (channelFilter === "pinned") return isPinned;
    if (channelFilter === "archived") return isArchived;
    if (isArchived) return false; // hide archived channels by default

    if (channelFilter === "direct") return !ch.is_group;
    if (channelFilter === "groups") return ch.is_group;
    return true;
  });

  const filteredProfiles = profiles.filter((p) => {
    if (p.id === currentUser?.id) return false;
    const search = searchMemberQuery.toLowerCase();
    return (
      (p.full_name || "").toLowerCase().includes(search) ||
      (p.email || "").toLowerCase().includes(search)
    );
  });

  const handleForwardMessage = async (targetChannelId: string) => {
    if (!forwardingMsg) return;
    setIsUploading(true);
    await sendChatMessage(
      targetChannelId,
      `[Forwarded]: ${forwardingMsg.content}`,
      forwardingMsg.attachment_url || undefined,
      undefined,
      forwardingMsg.sender_id
    );
    setIsUploading(false);
    setForwardingMsg(null);
    alert("Message forwarded successfully!");
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Message copied to clipboard!");
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

  return (
    <div className="h-[80vh] flex border border-white/5 bg-[#09090B] rounded-xl overflow-hidden text-white select-none relative">
      
      {/* 1. CHANNELS SIDEBAR */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-[#0b0c10] shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5 font-sans">
              <MessageSquare className="w-4.5 h-4.5 text-[#3ecf8e]" />
              <span>TOV Messaging</span>
            </h3>
            <Button
              onClick={() => {
                setIsGroup(false);
                setIsNewChatOpen(true);
              }}
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg cursor-pointer border-white/10 hover:border-[#3ecf8e]"
            >
              <Plus className="w-4 h-4 text-[#3ecf8e]" />
            </Button>
          </div>

          {/* Direct & Group Creation buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsGroup(false);
                setIsNewChatOpen(true);
              }}
              className="flex-1 text-[10px] h-8 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-pointer"
            >
              <User className="w-3 h-3 text-[#3ecf8e] mr-1" /> Direct Message
            </Button>
            <Button
              onClick={() => {
                setIsGroup(true);
                setIsNewChatOpen(true);
              }}
              className="flex-1 text-[10px] h-8 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-pointer"
            >
              <Users className="w-3 h-3 text-[#3ecf8e] mr-1" /> Create Group
            </Button>
          </div>

          {/* Search bar inside channels sidebar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-[#14161c] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[10px] focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>
        </div>

        {/* Sidebar Tabs Filter */}
        <div className="flex gap-1 p-2 bg-black/20 border-b border-white/5 text-[9px] font-mono overflow-x-auto scrollbar-none">
          {["all", "direct", "groups", "pinned", "archived"].map((filter) => (
            <button
              key={filter}
              onClick={() => setChannelFilter(filter as any)}
              className={`px-2.5 py-1 rounded-md capitalize cursor-pointer whitespace-nowrap ${
                channelFilter === filter ? "bg-[#3ecf8e]/10 text-[#3ecf8e]" : "text-text-secondary hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-10 text-[10px] text-text-secondary">
              No conversations.
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const details = getChannelDetails(channel);
              const isActive = channel.id === activeChannelId;
              const isPinned = channel.pinned_by?.includes(currentUser?.id);
              const isMuted = channel.muted_by?.includes(currentUser?.id);

              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer relative ${
                    isActive
                      ? "bg-[#3ecf8e]/10 text-white border-l-2 border-[#3ecf8e]"
                      : "hover:bg-white/5 text-text-secondary"
                  }`}
                >
                  {/* Avatar section */}
                  <div className="relative">
                    {details.isGroup ? (
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[#3ecf8e] text-xs">
                        {details.title.substring(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <img
                        src={details.avatar || ""}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                        alt=""
                      />
                    )}
                    {/* Active online Presence dot */}
                    {!details.isGroup && details.userId && onlineUsers.includes(details.userId) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-black" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate text-white block pr-2">{details.title}</span>
                      <div className="flex gap-1 items-center shrink-0">
                        {isMuted && <VolumeX className="w-3 h-3 text-text-secondary/55" />}
                        {isPinned && <Pin className="w-3 h-3 text-[#3ecf8e]/70" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-text-secondary truncate mt-0.5">{details.description}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CHAT PANEL VIEW */}
      <div className="flex-1 flex flex-col bg-[#0e1014] relative">
        {activeChannel ? (
          <>
            {/* Chat header console */}
            <div className="px-6 py-3.5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {activeChannelDetails?.isGroup ? (
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[#3ecf8e] text-xs">
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
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-[#0e1014]" />
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

              {/* Chat action bar */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowSearchBox(!showSearchBox)}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-lg cursor-pointer border-white/10 hover:border-[#3ecf8e]"
                >
                  <Search className="w-4 h-4 text-text-secondary" />
                </Button>
                <Button
                  onClick={() => setShowDetailsSidebar(!showDetailsSidebar)}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-lg cursor-pointer border-white/10 hover:border-[#3ecf8e]"
                >
                  <Info className="w-4 h-4 text-text-secondary" />
                </Button>
              </div>
            </div>

            {/* Inline search bar toggle */}
            {showSearchBox && (
              <div className="px-6 py-2 border-b border-white/5 bg-[#111317] flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search messages in this conversation..."
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white outline-none"
                />
                <Button
                  onClick={() => {
                    setConversationSearch("");
                    setShowSearchBox(false);
                  }}
                  variant="outline"
                  className="h-6 px-2 text-[9px] rounded"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Conversation Messages Scroll Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-text-secondary">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">No messages yet</h5>
                    <p className="text-[10px] text-text-secondary">Send a message to start collaboration</p>
                  </div>
                </div>
              ) : (
                currentMessages.map((msg: any) => {
                  const isOwnMessage = msg.sender_id === currentUser?.id;
                  const senderName = msg.profiles?.full_name || "Someone";
                  const senderAvatar = msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(senderName)}`;
                  
                  // Filter by message search query
                  if (conversationSearch && !msg.content?.toLowerCase().includes(conversationSearch.toLowerCase())) {
                    return null;
                  }

                  // Find parent reply message
                  const parentMsg = msg.reply_to_message_id 
                    ? currentMessages.find((m) => m.id === msg.reply_to_message_id) 
                    : null;

                  return (
                    <div
                      key={msg.id}
                      id={`msg-${msg.id}`}
                      className={`flex gap-3 items-end max-w-[85%] relative group ${
                        isOwnMessage ? "ml-auto flex-row-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <img
                        src={senderAvatar}
                        className="w-7.5 h-7.5 rounded-full object-cover border border-white/10 shrink-0"
                        alt=""
                      />

                      {/* Content block */}
                      <div className="space-y-1 relative">
                        {/* Sender info */}
                        {!isOwnMessage && (
                          <span className="text-[9px] text-text-secondary block font-bold font-mono">
                            {senderName}
                          </span>
                        )}

                        {/* Reply Preview */}
                        {parentMsg && (
                          <div 
                            onClick={() => {
                              const el = document.getElementById(`msg-${parentMsg.id}`);
                              el?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="bg-white/5 border-l-2 border-[#3ecf8e] p-1.5 rounded text-[9px] text-text-secondary cursor-pointer hover:bg-white/10 mb-1 max-w-sm truncate"
                          >
                            <span className="font-bold text-[#3ecf8e]">{parentMsg.profiles?.full_name || "Someone"}:</span> {parentMsg.content || "Attachment"}
                          </div>
                        )}

                        {/* Main bubble */}
                        <div
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY });
                          }}
                          className={`p-3 rounded-2xl text-xs relative ${
                            isOwnMessage
                              ? "bg-[#14161c] text-white rounded-br-none border border-white/5"
                              : "bg-[#20222b] text-white rounded-bl-none border border-white/5"
                          }`}
                        >
                          {/* Image Attachment Rendering */}
                          {msg.attachment_url && (
                            <div className="mb-2 max-w-xs rounded-lg overflow-hidden border border-white/10">
                              {msg.attachment_url.startsWith("data:image/") || msg.attachment_url.includes(".png") || msg.attachment_url.includes(".jpg") || msg.attachment_url.includes(".jpeg") ? (
                                <img
                                  src={msg.attachment_url}
                                  className="w-full object-cover max-h-48 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(msg.attachment_url, "_blank")}
                                  alt="Attachment"
                                />
                              ) : (
                                <a
                                  href={msg.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-black/40 hover:bg-black/60 transition-colors text-text-secondary"
                                >
                                  <Paperclip className="w-4 h-4 text-[#3ecf8e]" />
                                  <span className="text-[10px] font-mono truncate max-w-[150px]">View Attachment</span>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Message Content */}
                          {editingMsgId === msg.id ? (
                            <form onSubmit={handleEditSubmit} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={editInput}
                                onChange={(e) => setEditInput(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                autoFocus
                              />
                              <Button type="submit" size="sm" className="h-7 px-2 bg-success text-black font-bold">
                                Save
                              </Button>
                              <Button
                                onClick={() => setEditingMsgId(null)}
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                              >
                                Cancel
                              </Button>
                            </form>
                          ) : (
                            <p className="leading-normal break-words whitespace-pre-wrap">{msg.content}</p>
                          )}

                          {/* Reaction Emojis Badges */}
                          {msg.message_reactions && msg.message_reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 border-t border-white/5 pt-1.5">
                              {Array.from(new Set(msg.message_reactions.map((r: any) => r.emoji))).map((emoji: any) => {
                                const count = msg.message_reactions.filter((r: any) => r.emoji === emoji).length;
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => toggleMessageReaction(activeChannelId, msg.id, emoji)}
                                    className="inline-flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2 py-0.5 text-[9px] hover:bg-white/10 cursor-pointer"
                                  >
                                    <span>{emoji}</span>
                                    <span className="text-text-secondary font-mono">{count}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Status tick */}
                        <div className={`flex items-center gap-1.5 text-[9px] text-text-secondary font-mono mt-0.5 ${
                          isOwnMessage ? "justify-end" : ""
                        }`}>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          {isOwnMessage && (
                            <span>
                              {msg.read_by && msg.read_by.length > 0 ? (
                                <CheckCheck className="w-3.5 h-3.5 text-success shrink-0" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Smiley Quick Reaction button on Hover */}
                      <div className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 px-2 ${
                        isOwnMessage ? "-left-12" : "-right-12"
                      }`}>
                        <button
                          onClick={() => toggleMessageReaction(activeChannelId, msg.id, "❤️")}
                          className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer text-xs"
                          title="Heart Reaction"
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => {
                            setReplyingToMsg(msg);
                            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
                          title="Reply"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Real-time typing indicators */}
              {Object.values(typingUsers).length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-text-secondary italic">
                  <div className="flex gap-1 items-center shrink-0">
                    <span className="w-1.5 h-1.5 bg-[#3ecf8e] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#3ecf8e] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#3ecf8e] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>
                    {Object.values(typingUsers).map((u) => u.name).join(", ")}{" "}
                    {Object.values(typingUsers).length === 1 ? "is" : "are"} typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview Bar above Input */}
            {replyingToMsg && (
              <div className="px-6 py-2 bg-[#12141a] border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] text-text-secondary truncate">
                  <span className="font-bold text-[#3ecf8e]">Replying to {replyingToMsg.profiles?.full_name || "Someone"}:</span>{" "}
                  {replyingToMsg.content || "Attachment"}
                </div>
                <button
                  onClick={() => setReplyingToMsg(null)}
                  className="text-text-secondary hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input & Upload Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/[0.01] space-y-2">
              {/* Attachment Thumbnail */}
              {selectedAttachment && (
                <div className="relative inline-block border border-white/10 rounded-lg p-1.5 bg-black/40">
                  {attachmentFile?.type.startsWith("image/") ? (
                    <img src={selectedAttachment} className="h-16 w-16 object-cover rounded" alt="" />
                  ) : (
                    <div className="h-16 w-16 bg-[#161820] border border-white/5 rounded flex flex-col items-center justify-center text-text-secondary text-[8px] font-mono p-1">
                      <Paperclip className="w-4 h-4 text-[#3ecf8e] mb-1" />
                      <span className="truncate max-w-full">{attachmentFile?.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAttachment("");
                      setAttachmentFile(null);
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Text Input Row */}
              <div className="flex gap-3 items-center">
                <input
                  type="file"
                  onChange={handleAttachmentSelect}
                  className="hidden"
                  id="chat-upload-select"
                  disabled={isBlocked || isUploading}
                />
                <label
                  htmlFor="chat-upload-select"
                  className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-white cursor-pointer transition-colors shrink-0 flex items-center justify-center"
                >
                  <Paperclip className="w-4 h-4 text-[#3ecf8e]" />
                </label>

                <input
                  type="text"
                  placeholder={
                    isBlocked 
                      ? "You have blocked this user" 
                      : "Type your message..."
                  }
                  value={messageInput}
                  disabled={isBlocked || isUploading}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="flex-1 bg-[#14161c] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#3ecf8e]"
                />

                <Button
                  type="submit"
                  disabled={isBlocked || isUploading}
                  variant="primary"
                  className="px-4 py-2.5 h-9 bg-[#3ecf8e] text-black font-bold flex items-center gap-1.5 cursor-pointer shrink-0 rounded-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1b1e26] border border-white/5 flex items-center justify-center text-text-secondary">
              <MessageSquare className="w-8 h-8 text-[#3ecf8e]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Select a channel to collaborate</h4>
              <p className="text-xs text-text-secondary max-w-sm mt-1 leading-normal">
                Choose a direct conversation or group workspace from the sidebar to coordinate screenplays, cast availability, or shooting schedules.
              </p>
            </div>
          </div>
        )}

        {/* Floating Context Menu */}
        {contextMenu && (
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-[9999] bg-[#0c0e12] border border-white/10 rounded-xl p-2 shadow-2xl w-44 space-y-1 font-sans text-xs text-white"
          >
            {/* Quick Emoji Reaction bar */}
            <div className="flex gap-2 justify-around border-b border-white/5 pb-2 mb-1 px-1">
              {["❤️", "👍", "😂", "😮", "😢", "🙏"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    toggleMessageReaction(activeChannelId, contextMenu.msgId, emoji);
                    setContextMenu(null);
                  }}
                  className="hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Actions list */}
            <button
              onClick={() => {
                const msg = currentMessages.find((m) => m.id === contextMenu.msgId);
                setReplyingToMsg(msg);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 rounded text-left transition-colors cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5 text-text-secondary" />
              <span>Reply</span>
            </button>
            <button
              onClick={() => {
                const msg = currentMessages.find((m) => m.id === contextMenu.msgId);
                if (msg) handleCopyMessage(msg.content);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 rounded text-left transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-text-secondary" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => {
                const msg = currentMessages.find((m) => m.id === contextMenu.msgId);
                setForwardingMsg(msg);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 rounded text-left transition-colors cursor-pointer"
            >
              <Forward className="w-3.5 h-3.5 text-text-secondary" />
              <span>Forward</span>
            </button>

            {/* Sender specific actions */}
            {currentMessages.find((m) => m.id === contextMenu.msgId)?.sender_id === currentUser?.id && (
              <>
                <button
                  onClick={() => {
                    const msg = currentMessages.find((m) => m.id === contextMenu.msgId);
                    if (msg) {
                      setEditingMsgId(msg.id);
                      setEditInput(msg.content);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 rounded text-left transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Edit Message</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this message for everyone?")) {
                      deleteChatMessage(activeChannelId, contextMenu.msgId);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-danger hover:bg-danger/10 rounded text-left transition-colors cursor-pointer font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. DETAILS DRAWER SIDEBAR */}
      <AnimatePresence>
        {showDetailsSidebar && activeChannel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-white/5 bg-[#0b0c10] flex flex-col h-full shrink-0 overflow-y-auto w-80 font-sans"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#3ecf8e]" />
                <span>Conversation Details</span>
              </h4>
              <button
                onClick={() => setShowDetailsSidebar(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info Card */}
            <div className="p-5 border-b border-white/5 flex flex-col items-center text-center space-y-3">
              {activeChannelDetails?.isGroup ? (
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[#3ecf8e] text-lg">
                  {activeChannelDetails.title.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <img
                  src={activeChannelDetails?.avatar || ""}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/10 shadow-lg"
                  alt=""
                />
              )}
              <div>
                <h5 className="text-xs font-bold text-white">{activeChannelDetails?.title}</h5>
                <p className="text-[10px] text-text-secondary mt-1">{activeChannelDetails?.description}</p>
              </div>
            </div>

            {/* Quick Actions (Mute, Pin, Archive) */}
            <div className="p-4 border-b border-white/5 space-y-1 text-xs">
              <button
                onClick={() => togglePinChannel(activeChannelId)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-text-secondary hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Pin className="w-4 h-4 text-text-secondary" />
                  <span>Pin Conversation</span>
                </div>
                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-text-secondary">
                  {activeChannel.pinned_by?.includes(currentUser?.id) ? "Pinned" : "Pin"}
                </span>
              </button>

              <button
                onClick={() => toggleMuteChannel(activeChannelId)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-text-secondary hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <VolumeX className="w-4 h-4 text-text-secondary" />
                  <span>Mute Notifications</span>
                </div>
                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-text-secondary">
                  {activeChannel.muted_by?.includes(currentUser?.id) ? "Muted" : "Mute"}
                </span>
              </button>

              <button
                onClick={() => toggleArchiveChannel(activeChannelId)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-text-secondary hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-text-secondary" />
                  <span>Archive Conversation</span>
                </div>
                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-text-secondary">
                  {activeChannel.archived_by?.includes(currentUser?.id) ? "Archived" : "Archive"}
                </span>
              </button>
            </div>

            {/* Block & Report Actions (Direct Message only) */}
            {!activeChannelDetails?.isGroup && (
              <div className="p-4 border-b border-white/5 space-y-2">
                <Button
                  onClick={handleBlockAction}
                  variant="outline"
                  className="w-full text-xs h-9 text-danger border-danger/20 hover:bg-danger/10 hover:text-danger cursor-pointer"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  <span>{isBlocked ? "Unblock User" : "Block User"}</span>
                </Button>
                <Button
                  onClick={handleReportAction}
                  variant="outline"
                  className="w-full text-xs h-9 text-text-secondary hover:bg-white/5 cursor-pointer"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  <span>Report User</span>
                </Button>
              </div>
            )}

            {/* Group Members List (Group only) */}
            {activeChannelDetails?.isGroup && (
              <div className="p-4 border-b border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <h6 className="text-[10px] uppercase font-bold text-text-secondary">Group Members</h6>
                  {(currentUserRole === "Owner" || currentUserRole === "Admin") && (
                    <Button
                      onClick={() => {
                        const email = prompt("Enter team member email to add:");
                        if (!email) return;
                        const matched = profiles.find((p) => p.email?.toLowerCase() === email.trim().toLowerCase());
                        if (!matched) {
                          alert("No matching TOV user found with that email.");
                          return;
                        }
                        addGroupMembers(activeChannelId, [matched.id]);
                        alert("Member added!");
                      }}
                      variant="outline"
                      className="h-6 px-2 text-[9px] cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {activeChannel.chat_channel_members?.map((m: any) => {
                    const prof = m.profiles;
                    if (!prof) return null;
                    const isSelf = prof.id === currentUser?.id;

                    return (
                      <div key={prof.id} className="flex items-center justify-between text-xs p-1.5 hover:bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={prof.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(prof.full_name || "User")}`}
                            className="w-7 h-7 rounded-full object-cover border border-white/5 shrink-0"
                            alt=""
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white truncate block max-w-[120px]">{prof.full_name || prof.email}</span>
                            <span className="text-[8px] text-[#3ecf8e] font-bold uppercase">{m.role || "Member"}</span>
                          </div>
                        </div>

                        {/* Admin actions over this member */}
                        {!isSelf && (currentUserRole === "Owner" || currentUserRole === "Admin") && (
                          <div className="flex gap-1">
                            {/* Promote Admin option */}
                            {currentUserRole === "Owner" && m.role !== "Admin" && (
                              <button
                                onClick={() => updateGroupMemberRole(activeChannelId, prof.id, "Admin")}
                                className="p-1 hover:bg-white/10 rounded text-[9px] text-[#3ecf8e]"
                                title="Promote to Admin"
                              >
                                <Crown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* Kick option */}
                            {m.role !== "Owner" && (m.role !== "Admin" || currentUserRole === "Owner") && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove ${prof.full_name} from group?`)) {
                                    removeGroupMember(activeChannelId, prof.id);
                                  }
                                }}
                                className="p-1 hover:bg-white/10 rounded text-danger"
                                title="Kick Member"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Leave Group option */}
                <Button
                  onClick={() => {
                    if (confirm("Are you sure you want to leave this group?")) {
                      leaveGroup(activeChannelId);
                      setActiveChannelId("");
                    }
                  }}
                  variant="outline"
                  className="w-full text-xs h-9 text-danger border-danger/10 hover:bg-danger/5 cursor-pointer mt-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Leave Group</span>
                </Button>
              </div>
            )}

            {/* Shared Media Tab */}
            <div className="p-4 flex-1 flex flex-col min-h-0">
              <h6 className="text-[10px] uppercase font-bold text-text-secondary mb-3">Shared Attachments</h6>
              <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                {currentMessages.filter((m: any) => m.attachment_url).length === 0 ? (
                  <div className="col-span-full py-8 text-center text-[10px] text-text-secondary">
                    No attachments shared yet.
                  </div>
                ) : (
                  currentMessages.filter((m: any) => m.attachment_url).map((m: any) => {
                    const isImg = m.attachment_url.startsWith("data:image/") || m.attachment_url.includes(".png") || m.attachment_url.includes(".jpg") || m.attachment_url.includes(".jpeg");
                    return (
                      <div
                        key={m.id}
                        onClick={() => window.open(m.attachment_url, "_blank")}
                        className="aspect-square bg-card border border-white/5 rounded-lg overflow-hidden cursor-pointer hover:border-[#3ecf8e] transition-colors relative flex items-center justify-center p-1"
                      >
                        {isImg ? (
                          <img src={m.attachment_url} className="w-full h-full object-cover rounded" alt="" />
                        ) : (
                          <Paperclip className="w-5 h-5 text-[#3ecf8e]" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. NEW CHAT & GROUP CREATION MODAL OVERLAY */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e12] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isGroup ? "Create Collaborative Group" : "Start Private Conversation"}
                </h4>
                <p className="text-[10px] text-text-secondary">Select recipients to connect</p>
              </div>
              <button
                onClick={() => setIsNewChatOpen(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Details (for Group only) */}
            {isGroup && (
              <div className="p-5 border-b border-white/5 space-y-3 bg-[#111317]/50">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-text-secondary">Group Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Neo-Tokyo Script Read"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-[#14161c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-text-secondary">Group Description</label>
                  <input
                    type="text"
                    placeholder="Short summary of this channel's agenda..."
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="w-full bg-[#14161c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
              </div>
            )}

            {/* Search list profiles */}
            <div className="p-5 flex-1 flex flex-col min-h-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search collaborators by name or email..."
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  className="w-full bg-[#14161c] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              {/* Members selection list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {filteredProfiles.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-text-secondary">
                    No matching users found.
                  </div>
                ) : (
                  filteredProfiles.map((p) => {
                    const isSelected = selectedMembers.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleSelectMember(p.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                          isSelected ? "bg-[#3ecf8e]/10 border border-[#3ecf8e]/20" : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || "User")}`}
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                            alt=""
                          />
                          <div className="text-left">
                            <span className="font-bold text-xs text-white block leading-tight">{p.full_name}</span>
                            <span className="text-[9px] text-text-secondary">{p.email}</span>
                          </div>
                        </div>

                        {/* Checkbox state indicator */}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#3ecf8e] border-[#3ecf8e]" : "border-white/20"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal actions footer */}
            <div className="p-5 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
              <Button
                onClick={() => setIsNewChatOpen(false)}
                variant="outline"
                className="text-xs h-9 border-white/10 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChannel}
                variant="primary"
                className="px-4 py-2 bg-[#3ecf8e] text-black font-bold text-xs h-9 cursor-pointer rounded-lg"
              >
                {isGroup ? "Create Group" : "Start Conversation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FORWARD MESSAGE MODAL OVERLAY */}
      {forwardingMsg && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e12] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[70vh]">
            
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#3ecf8e]" />
                <span>Forward Message</span>
              </h4>
              <button
                onClick={() => setForwardingMsg(null)}
                className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat List to forward to */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
              {chatChannels.length === 0 ? (
                <p className="text-center text-[10px] text-text-secondary py-8">No channels to forward to.</p>
              ) : (
                chatChannels.map((ch) => {
                  const details = getChannelDetails(ch);
                  return (
                    <div key={ch.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {details.isGroup ? (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[#3ecf8e] text-[10px]">
                            {details.title.substring(0, 2).toUpperCase()}
                          </div>
                        ) : (
                          <img src={details.avatar || ""} className="w-8 h-8 rounded-full object-cover border border-white/5" alt="" />
                        )}
                        <span className="font-bold text-white truncate block">{details.title}</span>
                      </div>
                      <Button
                        onClick={() => handleForwardMessage(ch.id)}
                        variant="outline"
                        className="h-7 px-3 text-[10px] border-white/10 hover:border-[#3ecf8e] cursor-pointer"
                      >
                        Send
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatView;

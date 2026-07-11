"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { supabase } from "@/utils/supabaseClient";
import {
  MessageSquare,
  Plus,
  Send,
  Users,
  User,
  Hash,
  X,
  Search,
  MessageCircle,
  Clock,
  MessageSquarePlus,
  Heart,
  Image
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

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
    toggleLikeMessage
  } = useProjectStore();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

  const [messageInput, setMessageInput] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load profiles and currentUser
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url");
      setProfiles(profs || []);
      setLoading(false);
    };
    init();
  }, []);

  // Fetch channel list
  useEffect(() => {
    fetchChatChannels();
  }, []);

  // Real-time message subscription
  useEffect(() => {
    if (!activeChannelId) return;

    fetchChatMessages(activeChannelId);

    const channel = supabase
      .channel(`chat-room-${activeChannelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${activeChannelId}`
        },
        () => {
          fetchChatMessages(activeChannelId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannelId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChannelId]);

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedAttachment(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !selectedAttachment) || !activeChannelId) return;

    await sendChatMessage(activeChannelId, messageInput.trim(), selectedAttachment || undefined);
    setMessageInput("");
    setSelectedAttachment("");
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
      setActiveChannelId(targetChannelId);
      // Reset
      setIsNewChatOpen(false);
      setGroupName("");
      setSelectedMembers([]);
      setIsGroup(false);
    }
  };

  const toggleSelectMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      if (!isGroup) {
        // Direct messages only allow 1 recipient
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
        avatar: null,
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
      isGroup: false
    };
  };

  const activeChannel = chatChannels.find((c) => c.id === activeChannelId);
  const activeChannelDetails = activeChannel ? getChannelDetails(activeChannel) : null;
  const currentMessages = activeChannelId ? chatMessages[activeChannelId] || [] : [];

  const filteredProfiles = profiles.filter((p) => {
    if (p.id === currentUser?.id) return false;
    const search = searchMemberQuery.toLowerCase();
    return (
      (p.full_name || "").toLowerCase().includes(search) ||
      (p.email || "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="h-[80vh] flex border border-white/5 bg-[#09090B] rounded-xl overflow-hidden text-white select-none">
      
      {/* 1. CHANNELS SIDEBAR */}
      <div className="w-80 border-r border-white/5 flex flex-col justify-between bg-[#111318] shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5 font-sans">
              <MessageSquare className="w-4.5 h-4.5 text-primary" />
              <span>Studio Messaging</span>
            </h3>
            <Button
              onClick={() => {
                setIsGroup(false);
                setIsNewChatOpen(true);
              }}
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg cursor-pointer border-white/10 hover:border-primary"
            >
              <Plus className="w-4 h-4 text-primary" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsGroup(false);
                setIsNewChatOpen(true);
              }}
              className="flex-1 text-[10px] h-8 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-pointer"
            >
              <User className="w-3 h-3 text-primary mr-1" /> Direct Message
            </Button>
            <Button
              onClick={() => {
                setIsGroup(true);
                setIsNewChatOpen(true);
              }}
              className="flex-1 text-[10px] h-8 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-pointer"
            >
              <Users className="w-3 h-3 text-primary mr-1" /> Create Group
            </Button>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatChannels.length === 0 ? (
            <div className="text-center py-10 text-[10px] text-text-secondary">
              No conversations started.
            </div>
          ) : (
            chatChannels.map((channel) => {
              const details = getChannelDetails(channel);
              const isActive = channel.id === activeChannelId;

              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-white/5 text-text-secondary border border-transparent"
                  }`}
                >
                  {details.isGroup ? (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Hash className="w-4 h-4 text-primary" />
                    </div>
                  ) : (
                    <img
                      src={details.avatar}
                      className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                      alt={details.title}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold block truncate text-white">{details.title}</span>
                    <span className="text-[10px] text-text-secondary block truncate mt-0.5">
                      {details.isGroup ? "Group Channel" : "Direct Message"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CHAT SPACE */}
      <div className="flex-1 flex flex-col justify-between bg-black">
        {activeChannelId && activeChannelDetails ? (
          <>
            {/* Chat Space Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-[#111318] flex items-center gap-3">
              {activeChannelDetails.isGroup ? (
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <Hash className="w-5 h-5 text-primary" />
                </div>
              ) : (
                <img
                  src={activeChannelDetails.avatar}
                  className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                  alt={activeChannelDetails.title}
                />
              )}
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">{activeChannelDetails.title}</h4>
                <div className="text-[9px] text-text-secondary mt-0.5 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>Real-time channel active</span>
                </div>
              </div>
            </div>

            {/* Chat Messages stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="text-center py-20 text-xs text-text-secondary">
                  No messages here yet. Send a greeting!
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isSelf = msg.sender_id === currentUser?.id;
                  const senderName = msg.profiles?.full_name || "User";
                  const avatar = msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(senderName)}`;
                  const time = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[80%] ${isSelf ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      <img
                        src={avatar}
                        className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                        alt={senderName}
                      />
                      <div className="space-y-1 min-w-0">
                        <div className={`flex items-center gap-2 text-[10px] ${isSelf ? "justify-end" : ""}`}>
                          <span className="font-bold text-white">{senderName}</span>
                          <span className="text-[9px] text-text-secondary">{time}</span>
                        </div>
                        <div
                          onDoubleClick={() => toggleLikeMessage(activeChannelId, msg.id)}
                          className={`p-3 rounded-xl text-xs leading-relaxed break-words font-sans relative select-none ${
                            isSelf
                              ? "bg-primary text-black font-semibold rounded-tr-none"
                              : "bg-[#111318] text-white border border-white/5 rounded-tl-none"
                          }`}
                        >
                          {msg.attachment_url && (
                            <div className="mb-2 overflow-hidden rounded-lg border border-white/10 max-w-xs">
                              <img
                                src={msg.attachment_url}
                                alt="Attachment"
                                className="w-full h-auto object-cover max-h-60"
                              />
                            </div>
                          )}
                          {msg.content}

                          {msg.likes && msg.likes.length > 0 && (
                            <button
                              onClick={() => toggleLikeMessage(activeChannelId, msg.id)}
                              className="absolute -bottom-2.5 -right-2.5 bg-[#18181B] border border-white/10 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-md hover:scale-105 transition-transform cursor-pointer"
                            >
                              <Heart className={`w-2.5 h-2.5 ${msg.likes.includes(currentUser?.id) ? "fill-red-500 text-red-500" : "text-white/50"}`} />
                              <span className="text-[8px] text-white/50">{msg.likes.length}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment preview bar if file is selected */}
            {selectedAttachment && (
              <div className="px-6 py-2 bg-[#111318] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[10px] text-white/50">Photo attachment loaded</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment("")}
                  className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message Input bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#111318] flex items-center gap-3">
              <label className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg cursor-pointer text-white/60 hover:text-white transition-colors shrink-0 flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAttachmentSelect}
                />
                <Image className="w-4 h-4 text-primary" />
              </label>
              <input
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-white/20"
              />
              <Button
                type="submit"
                variant="primary"
                className="h-10 text-black font-bold px-5 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              <MessageSquarePlus className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Select a Conversation</h4>
              <p className="text-[10px] text-text-secondary mt-1">
                Choose a direct message or select a group to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. NEW CONVERSATION DIALOG */}
      {isNewChatOpen && (
        <Dialog
          isOpen={isNewChatOpen}
          onClose={() => setIsNewChatOpen(false)}
          title={isGroup ? "Initialize Group Chat Room" : "Start New Direct Message"}
          size="md"
        >
          <div className="space-y-4 text-xs select-none">
            
            {isGroup && (
              <div>
                <label className="block text-text-secondary text-[10px] uppercase font-semibold mb-1.5">Group Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Script Review Team"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-text-secondary text-[10px] uppercase font-semibold mb-1.5">Search Studio Members</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  className="w-full bg-[#09090B] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-[10px] uppercase font-semibold mb-1.5">
                {isGroup ? "Select Group Members" : "Select Recipient"}
              </label>
              
              <div className="max-h-48 overflow-y-auto border border-white/5 rounded-lg bg-[#09090B] p-2 space-y-1">
                {filteredProfiles.length === 0 ? (
                  <div className="text-center py-6 text-text-secondary">
                    No members found matching search.
                  </div>
                ) : (
                  filteredProfiles.map((p) => {
                    const isSelected = selectedMembers.includes(p.id);
                    const avatar = p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || "User")}`;

                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleSelectMember(p.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-white border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={avatar} className="w-7 h-7 rounded-md object-cover border border-white/10 shrink-0" alt="" />
                          <div>
                            <span className="font-semibold block">{p.full_name || "User"}</span>
                            <span className="text-[9px] text-text-secondary">{p.email}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-primary mr-1">Selected</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => setIsNewChatOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChannel}
                variant="primary"
                className="flex-1 text-black font-bold cursor-pointer"
              >
                {isGroup ? "Initialize Group" : "Open DM Chat"}
              </Button>
            </div>

          </div>
        </Dialog>
      )}

    </div>
  );
};
export default ChatView;

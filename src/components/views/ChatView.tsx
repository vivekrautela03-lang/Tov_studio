"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useProjectStore } from "@/store/useProjectStore";
import {
  VolumeX,
  Pin,
  Trash2,
  Camera,
  Mic,
  Smile,
  Send,
  Volume2,
  Video,
  PhoneOff,
  Share2,
  CheckCheck,
  Check,
  Phone,
  VideoOff,
  MicOff,
  Expand,
  Sparkles,
  Layers,
  ArrowLeft,
  Search,
  MoreVertical,
  Plus,
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { encryptMessage, decryptMessage } from "@/utils/crypto";

export const ChatView: React.FC = () => {
  const {
    chatChannels,
    chatMessages,
    fetchChatChannels,
    fetchChatMessages,
    sendChatMessage,
    createChatChannel,
    setActiveChannelId,
    activeChannelId,
    deleteChatMessage,
    markMessagesAsRead,
    togglePinChannel,
    toggleMuteChannel,
    toggleArchiveChannel,
    uploadChatAttachment,
    userProfile,
    projects,
    setActiveView
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

  // Real Presence & Typing State
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; timestamp: number; mode?: string }>>({});
  const presenceChannelRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<any>(null);

  // E2EE Decrypted message caches
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

  // WebRTC Voice & Video Call states
  const [activeCall, setActiveCall] = useState<{
    type: "voice" | "video";
    partnerName: string;
    partnerAvatar: string;
    partnerId: string;
    channelId: string;
    status: "ringing-out" | "ringing-in" | "connected" | "idle";
    direction: "incoming" | "outgoing";
  } | null>(null);

  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [beautyMode, setBeautyMode] = useState(false);
  const [bgBlur, setBgBlur] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Refs for WebRTC Streams
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalChannelRef = useRef<any>(null);
  const callIntervalRef = useRef<any>(null);

  // Dial tone synthesizer parameters
  const ringtoneOscRef = useRef<any>(null);
  const ringtoneGainRef = useRef<any>(null);

  // Drag-to-Accept Swipe gesture state
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeStartRef = useRef(0);

  // Chat message attachments and popovers
  const [messageInput, setMessageInput] = useState("");
  const [replyingToMsg, setReplyingToMsg] = useState<any>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");

  const [showGifs, setShowGifs] = useState(false);
  const cinemaGifs = [
    { name: "Camera Rolling", url: "https://media.giphy.com/media/l2JdUKfPf6mlV4S4M/giphy.gif" },
    { name: "Clapper Action", url: "https://media.giphy.com/media/3o7qE1YN7aBOFPRw8E/giphy.gif" },
    { name: "Director Ready", url: "https://media.giphy.com/media/26FPpSuhg0vWe5QsM/giphy.gif" }
  ];

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEmojis = ["🎬", "📽️", "🎥", "🍿", "🔥", "❤️", "👍", "👏", "😮", "😢", "🚀"];

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState("");
  const [newChatIsGroup, setNewChatIsGroup] = useState(false);
  const [newChatGroupName, setNewChatGroupName] = useState("");
  const [newChatSelectedMembers, setNewChatSelectedMembers] = useState<string[]>([]);

  // 1. Initialize user & presence
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        initializePresence(user);
        initializeSignaling(user);
        markMessagesAsDeliveredGlobal(user.id);
      }
    });

    supabase.from("profiles").select("*").then(({ data }) => {
      if (data) setProfiles(data);
    });
  }, []);

  // 2. Presence & typing tracking
  const initializePresence = (user: any) => {
    const presenceChannel = supabase.channel("global-presence-room", {
      config: {
        presence: {
          key: user.id
        }
      }
    });
    presenceChannelRef.current = presenceChannel;

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const onlineIds = Object.keys(state);
        setOnlineUsers(onlineIds);

        // Map typing users
        const typingMap: any = {};
        Object.entries(state).forEach(([userId, presences]: [string, any]) => {
          const mainPres = presences[0];
          if (mainPres?.typing_in) {
            typingMap[userId] = {
              name: mainPres.username || "Crew Member",
              timestamp: Date.now(),
              mode: mainPres.mode || "typing"
            };
          }
        });
        setTypingUsers(typingMap);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            typing_in: null,
            username: userProfile?.full_name || user.email
          });
        }
      });
  };

  const handleTypingStatus = async (isTyping: boolean, mode = "typing") => {
    if (!presenceChannelRef.current || !currentUser) return;
    await presenceChannelRef.current.track({
      online_at: new Date().toISOString(),
      typing_in: isTyping ? activeChannelId : null,
      mode: isTyping ? mode : null,
      username: userProfile?.full_name || currentUser.email
    });
  };

  // 3. WebRTC Call Signaling Listeners
  const initializeSignaling = (user: any) => {
    const signalChannel = supabase.channel("tov-calling-signal-broadcast");
    signalChannelRef.current = signalChannel;

    signalChannel
      .on("broadcast", { event: "call-invite" }, (payload: any) => {
        const data = payload.payload;
        if (data.receiverId === user.id) {
          // Play ringing tone
          startRingtone(true);
          setActiveCall({
            type: data.mediaType,
            partnerName: data.senderName,
            partnerAvatar: data.senderPhoto,
            partnerId: data.senderId,
            channelId: data.channelId,
            status: "ringing-in",
            direction: "incoming"
          });
        }
      })
      .on("broadcast", { event: "call-accept" }, (payload: any) => {
        const data = payload.payload;
        if (data.receiverId === user.id) {
          stopRingtone();
          setActiveCall((prev: any) => (prev ? { ...prev, status: "connected" } : null));
          startWebRTCConnection(true, data.senderId, prevTypeRef.current);
        }
      })
      .on("broadcast", { event: "call-hangup" }, (payload: any) => {
        const data = payload.payload;
        if (data.receiverId === user.id) {
          handleHangUpCleanup();
        }
      })
      .on("broadcast", { event: "webrtc-offer" }, async (payload: any) => {
        const data = payload.payload;
        if (data.receiverId === user.id) {
          await handleRemoteOffer(data.sdp, data.senderId);
        }
      })
      .on("broadcast", { event: "webrtc-answer" }, async (payload: any) => {
        const data = payload.payload;
        if (data.receiverId === user.id) {
          await handleRemoteAnswer(data.sdp);
        }
      })
      .on("broadcast", { event: "webrtc-candidate" }, async (payload: any) => {
        const data = payload.payload;
        if (data.receiverId === user.id && peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.error("Error adding remote ICE candidate:", e);
          }
        }
      })
      .subscribe();
  };

  const prevTypeRef = useRef<"voice" | "video">("voice");

  // Initiate Call
  const handleInitiateCall = (type: "voice" | "video") => {
    if (!activeChannelId || !activeChannelDetails || !currentUser) return;
    
    let partnerId = activeChannelDetails.userId;
    let partnerName = activeChannelDetails.title;
    let partnerAvatar = activeChannelDetails.avatar || "";

    // Fallback for testing when alone or no valid collaborator profile
    if (!partnerId || partnerId === currentUser.id) {
      partnerId = "mock-testing-partner-id";
      partnerName = partnerName || "AI Director (Simulated)";
      partnerAvatar = partnerAvatar || "https://api.dicebear.com/7.x/initials/svg?seed=Director";
    }

    prevTypeRef.current = type;
    startRingtone(false);

    setActiveCall({
      type,
      partnerName,
      partnerAvatar,
      partnerId,
      channelId: activeChannelId,
      status: "ringing-out",
      direction: "outgoing"
    });

    // If it's a simulated call, trigger auto-accept after 2 seconds
    if (partnerId === "mock-testing-partner-id") {
      setTimeout(() => {
        stopRingtone();
        setActiveCall((prev: any) => {
          if (prev && prev.partnerId === "mock-testing-partner-id") {
            return { ...prev, status: "connected" };
          }
          return prev;
        });
        startWebRTCConnection(false, "mock-testing-partner-id", type);
      }, 2000);
      return;
    }

    if (signalChannelRef.current) {
      signalChannelRef.current.send({
        type: "broadcast",
        event: "call-invite",
        payload: {
          senderId: currentUser.id,
          senderName: userProfile?.full_name || currentUser.email,
          senderPhoto: userProfile?.avatar_url || "",
          receiverId: partnerId,
          mediaType: type,
          channelId: activeChannelId
        }
      });
    }
  };

  // Accept Call
  const handleAcceptCall = () => {
    if (!activeCall || !currentUser || !signalChannelRef.current) return;
    stopRingtone();
    setActiveCall((prev: any) => (prev ? { ...prev, status: "connected" } : null));

    signalChannelRef.current.send({
      type: "broadcast",
      event: "call-accept",
      payload: {
        senderId: currentUser.id,
        receiverId: activeCall.partnerId
      }
    });

    startWebRTCConnection(false, activeCall.partnerId, activeCall.type);
  };

  // Reject / Hang Up Call
  const handleHangUp = () => {
    if (!activeCall || !signalChannelRef.current || !currentUser) return;
    signalChannelRef.current.send({
      type: "broadcast",
      event: "call-hangup",
      payload: {
        senderId: currentUser.id,
        receiverId: activeCall.partnerId
      }
    });
    handleHangUpCleanup();
  };

  const handleHangUpCleanup = () => {
    stopRingtone();
    setActiveCall(null);
    setCallTimer(0);
    clearInterval(callIntervalRef.current);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
  };

  // WebRTC core connection steps
  const startWebRTCConnection = async (isInitiator: boolean, partnerId: string, type: "voice" | "video") => {
    try {
      const constraints = {
        audio: true,
        video: type === "video" ? { facingMode: "user" } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      setTimeout(() => {
        const localVid = document.getElementById("local-video-feed") as HTMLVideoElement;
        if (localVid) localVid.srcObject = stream;
      }, 500);

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      });
      peerConnectionRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote tracks
      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        setTimeout(() => {
          const remoteVid = document.getElementById("remote-video-feed") as HTMLVideoElement;
          const remoteAud = document.getElementById("remote-audio-feed") as HTMLAudioElement;
          if (type === "video" && remoteVid) {
            remoteVid.srcObject = event.streams[0];
          } else if (type === "voice" && remoteAud) {
            remoteAud.srcObject = event.streams[0];
          }
        }, 500);
      };

      // For simulated calling, copy local stream to remote video immediately
      if (partnerId === "mock-testing-partner-id") {
        setTimeout(() => {
          const remoteVid = document.getElementById("remote-video-feed") as HTMLVideoElement;
          if (type === "video" && remoteVid) {
            remoteVid.srcObject = stream;
          }
        }, 500);
      } else {
        pc.onicecandidate = (event) => {
          if (event.candidate && signalChannelRef.current && currentUser) {
            signalChannelRef.current.send({
              type: "broadcast",
              event: "webrtc-candidate",
              payload: {
                senderId: currentUser.id,
                receiverId: partnerId,
                candidate: event.candidate.toJSON()
              }
            });
          }
        };

        if (isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          signalChannelRef.current.send({
            type: "broadcast",
            event: "webrtc-offer",
            payload: {
              senderId: currentUser.id,
              receiverId: partnerId,
              sdp: offer.sdp
            }
          });
        }
      }

      // Start call Timer
      setCallTimer(0);
      callIntervalRef.current = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("WebRTC connection failed:", err);
      alert("Could not access audio or video devices.");
      handleHangUpCleanup();
    }
  };

  const handleRemoteOffer = async (sdp: string, partnerId: string) => {
    if (!peerConnectionRef.current) return;
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      if (signalChannelRef.current && currentUser) {
        signalChannelRef.current.send({
          type: "broadcast",
          event: "webrtc-answer",
          payload: {
            senderId: currentUser.id,
            receiverId: partnerId,
            sdp: answer.sdp
          }
        });
      }
    } catch (e) {
      console.error("Error setting remote offer:", e);
    }
  };

  const handleRemoteAnswer = async (sdp: string) => {
    if (!peerConnectionRef.current) return;
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
    } catch (e) {
      console.error("Error setting remote answer:", e);
    }
  };

  // Dial Tone Synthesizer
  const startRingtone = (incoming = false) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(incoming ? 380 : 440, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      let t = ctx.currentTime;
      for (let i = 0; i < 20; i++) {
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.setValueAtTime(0, t + 1.2);
        t += 3;
      }

      osc.start();
      ringtoneOscRef.current = osc;
      ringtoneGainRef.current = ctx;
    } catch (e) {
      console.error(e);
    }
  };

  const stopRingtone = () => {
    try {
      if (ringtoneOscRef.current) {
        ringtoneOscRef.current.stop();
        ringtoneOscRef.current = null;
      }
      if (ringtoneGainRef.current && ringtoneGainRef.current.state !== "closed") {
        ringtoneGainRef.current.close();
        ringtoneGainRef.current = null;
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mute / Cam Toggles
  const handleToggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const handleToggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  // Beauty & Blur filters
  const getFilterStyle = () => {
    let str = "";
    if (beautyMode) str += "brightness(1.08) contrast(1.03) saturate(1.05) ";
    if (bgBlur) str += "blur(8px)";
    return str || undefined;
  };

  // 4. PostgreSQL messaging database sync
  useEffect(() => {
    fetchChatChannels();
    if (!currentUser) return;

    const globalChannel = supabase
      .channel("global-chat-listener")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => {
        fetchChatChannels();
        if (activeChannelId) {
          fetchChatMessages(activeChannelId);
          markMessagesAsRead(activeChannelId);
          markMessagesAsDelivered(activeChannelId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [currentUser, activeChannelId]);

  // Sync active channel DMs
  useEffect(() => {
    if (!activeChannelId || !currentUser) return;
    fetchChatMessages(activeChannelId);
    markMessagesAsRead(activeChannelId);
    markMessagesAsDelivered(activeChannelId);
  }, [activeChannelId, currentUser]);

  const markMessagesAsDelivered = async (channelId: string) => {
    if (!currentUser) return;
    await supabase.rpc("mark_messages_delivered", { p_channel_id: channelId, p_user_id: currentUser.id });
  };

  const markMessagesAsDeliveredGlobal = async (userId: string) => {
    // Deliver all unseen messages globally on app start
    const { data } = await supabase.from("chat_channels").select("id");
    if (data) {
      data.forEach((ch) => {
        supabase.rpc("mark_messages_delivered", { p_channel_id: ch.id, p_user_id: userId });
      });
    }
  };

  // E2EE Decryptor engine
  const currentMessages = chatMessages[activeChannelId] || [];

  useEffect(() => {
    if (!activeChannelId || currentMessages.length === 0) return;

    const decryptAll = async () => {
      const cacheUpdates: Record<string, string> = {};
      for (const msg of currentMessages) {
        if (!decryptedCache[msg.id]) {
          const dec = await decryptMessage(msg.content, activeChannelId);
          cacheUpdates[msg.id] = dec;
        }
      }
      if (Object.keys(cacheUpdates).length > 0) {
        setDecryptedCache((prev) => ({ ...prev, ...cacheUpdates }));
      }
    };
    decryptAll();
  }, [currentMessages, activeChannelId]);

  // Drag-to-Swipe Handlers
  const handleTouchStartSwipe = (e: React.TouchEvent) => {
    setIsSwiping(true);
    swipeStartRef.current = e.touches[0].clientX - swipeX;
  };

  const handleTouchMoveSwipe = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const delta = e.touches[0].clientX - swipeStartRef.current;
    const clamped = Math.max(0, Math.min(185, delta));
    setSwipeX(clamped);
    if (clamped >= 170) {
      setIsSwiping(false);
      handleAcceptCall();
    }
  };

  const handleTouchEndSwipe = () => {
    setIsSwiping(false);
    if (swipeX < 170) {
      setSwipeX(0);
    }
  };

  // Format Call Timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
    const profileObj = otherMember?.profiles;

    return {
      title: profileObj?.full_name || profileObj?.email || "Direct Message",
      avatar: profileObj?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileObj?.full_name || "User")}`,
      description: profileObj?.bio || "Collaborator",
      isGroup: false,
      userId: profileObj?.id
    };
  };

  const activeChannel = chatChannels.find((c) => c.id === activeChannelId);
  const activeChannelDetails = activeChannel ? getChannelDetails(activeChannel) : null;

  // Send message
  const handleSendMessage = async () => {
    if (!activeChannelId || (!messageInput.trim() && !attachmentFile)) return;

    setIsUploading(true);
    let uploadedUrl = "";
    if (attachmentFile) {
      uploadedUrl = await uploadChatAttachment(attachmentFile);
    }

    const textToSend = messageInput.trim();
    const encrypted = await encryptMessage(textToSend || "[Media attachment]", activeChannelId);

    await sendChatMessage(
      activeChannelId,
      encrypted,
      uploadedUrl,
      replyingToMsg?.id || undefined
    );

    setMessageInput("");
    setReplyingToMsg(null);
    setAttachmentFile(null);
    setAttachmentPreview("");
    setIsUploading(false);
    handleTypingStatus(false);
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachmentPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Toggle voice recording simulations
  const handleToggleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingSeconds(0);
      // Simulate sending voice note
      sendChatMessage(activeChannelId, "[Voice Note]", "https://codesandbox.io/mock-voice.mp3");
      handleTypingStatus(false);
    } else {
      setIsRecording(true);
      handleTypingStatus(true, "recording");
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#09090B] text-white select-none">
      
      {/* 1. CONVERSATION SIDEBAR */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col h-full bg-[#121319]/40 ${activeChannelId ? "hidden md:flex" : "flex"}`}>
        
        {/* Header toolbar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("dashboard")}
              className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white cursor-pointer mr-1"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Direct Messages</span>
          </div>
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#22d3ee] text-white hover:text-black transition-all cursor-pointer border border-white/10"
            title="Compose Message"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {chatChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-text-secondary/70">
              <span className="text-3xl">💬</span>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-2">No messages yet</p>
            </div>
          ) : (
            chatChannels.map((channel) => {
              const details = getChannelDetails(channel);
              const isActive = channel.id === activeChannelId;
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
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-[10px] truncate max-w-[130px] ${hasUnread ? "text-white font-black" : "text-text-secondary"}`}>
                          {details.description}
                        </p>
                        
                        {/* Blue dot on unread messages (never numbers as requested!) */}
                        {hasUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        )}
                      </div>
                    </div>
                  </button>

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
        {activeChannel && activeChannelDetails ? (
          <>
            {/* Chat header toolbar */}
            <div className="px-4 md:px-6 py-3.5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between z-10 backdrop-blur-md">
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setActiveChannelId("")}
                  className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white md:hidden cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0 bg-neutral-800 flex items-center justify-center font-bold text-[#22d3ee] text-xs">
                  {activeChannelDetails.avatar ? (
                    <img src={activeChannelDetails.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    activeChannelDetails.title.substring(0, 2).toUpperCase()
                  )}
                </div>
                
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate block">{activeChannelDetails.title}</h4>
                  <span className="text-[9px] text-[#3ecf8e] font-medium block">
                    {!activeChannelDetails.isGroup && activeChannelDetails.userId && onlineUsers.includes(activeChannelDetails.userId) ? "Active Now" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Call actions */}
              <div className="flex gap-1.5 items-center">
                {!activeChannelDetails.isGroup && (
                  <>
                    <button
                      onClick={() => handleInitiateCall("voice")}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/5"
                      title="Voice Call"
                    >
                      <Phone className="w-4 h-4 text-[#22d3ee]" />
                    </button>
                    <button
                      onClick={() => handleInitiateCall("video")}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/5"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4 text-[#22d3ee]" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsSidebar(!showDetailsSidebar)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar bg-black/10">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-secondary/70">
                  <span className="text-2xl animate-pulse">🎬</span>
                  <p className="text-[10px] uppercase font-bold tracking-widest mt-2">End-to-End Encrypted</p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isSender = msg.sender_id === currentUser?.id;
                  const decrypted = decryptedCache[msg.id] || msg.content;
                  
                  // Ticks Status Resolver
                  const otherUser = activeChannel.chat_channel_members?.find((m: any) => m.user_id !== currentUser?.id);
                  const isRead = otherUser && msg.read_by?.includes(otherUser.user_id);
                  const isDelivered = otherUser && msg.delivered_to?.includes(otherUser.user_id);

                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[70%] ${isSender ? "ml-auto items-end" : "mr-auto items-start"} group/msg relative`}>
                      <div className={`p-3 rounded-2xl text-xs relative ${
                        isSender 
                          ? "bg-gradient-to-br from-cyan-900/60 to-neutral-900 border border-[#22d3ee]/20 text-white rounded-tr-none" 
                          : "bg-neutral-900/80 border border-white/5 text-text-secondary rounded-tl-none"
                      }`}>
                        
                        {/* Text */}
                        <p className="leading-relaxed whitespace-pre-wrap">{decrypted}</p>

                        {/* Attachment media */}
                        {msg.attachment_url && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-white/5">
                            {msg.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                              <img src={msg.attachment_url} className="max-w-full max-h-48 object-cover" alt="" />
                            ) : (
                              <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/40 text-[10px] text-[#22d3ee] hover:underline">
                                <FileText className="w-4 h-4" />
                                <span>View Attachment File</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Ticks & Timestamps */}
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[8px] text-text-secondary/70">
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isSender && (
                            <>
                              {isRead ? (
                                <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-cyan-400" /></span>
                              ) : isDelivered ? (
                                <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 text-text-secondary/50" /></span>
                              ) : (
                                <span title="Sent"><Check className="w-3.5 h-3.5 text-text-secondary/50" /></span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* In-app typing presence overlay banner */}
            {Object.entries(typingUsers).filter(([uid]) => uid !== currentUser?.id).map(([uid, t]) => (
              <div key={uid} className="px-6 py-1 bg-black/40 text-[9px] text-[#22d3ee] font-mono animate-pulse">
                ⌨️ {t.name} is {t.mode || "typing"}...
              </div>
            ))}

            {/* Input Composer toolbar */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="media-attach-file"
                  className="hidden"
                  onChange={handleSelectFile}
                />
                <button
                  onClick={() => document.getElementById("media-attach-file")?.click()}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary hover:text-white cursor-pointer shrink-0"
                  title="Attach Photo or Document"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleVoiceRecord}
                  className={`p-2 rounded-lg border transition-all shrink-0 cursor-pointer ${
                    isRecording ? "bg-danger/20 border-danger text-danger animate-pulse" : "bg-white/5 border-white/5"
                  }`}
                  title="Record Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Input Text Box */}
                <input
                  type="text"
                  placeholder="Message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTypingStatus(e.target.value.trim().length > 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={isUploading}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-[#22d3ee] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black font-bold flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Attachment Preview thumbnail */}
              {attachmentPreview && (
                <div className="mt-2 p-2 bg-neutral-900 border border-white/10 rounded-lg w-fit flex items-center gap-3 relative">
                  <img src={attachmentPreview} className="w-12 h-12 object-cover rounded" alt="" />
                  <span className="text-[9px] text-text-secondary font-mono truncate max-w-[120px]">{attachmentFile?.name}</span>
                  <button onClick={() => setAttachmentPreview("")} className="p-1 rounded bg-black/40 text-white font-bold text-[9px] absolute -top-1.5 -right-1.5">X</button>
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

      {/* 3. CALLING SHIELD INTERACTIVE SCREEN MODAL OVERLAY */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg text-white animate-fade-in">
          <div className="text-center space-y-6 max-w-sm p-8 bg-neutral-900/60 border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center relative overflow-hidden w-[90%]">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-black to-black z-0 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center space-y-6 w-full">
              
              {/* Ringing waves pulsating circles */}
              <div className="relative">
                {activeCall.status !== "connected" && (
                  <>
                    <span className="absolute -inset-4 rounded-full bg-cyan-400/10 animate-ping duration-1000" />
                    <span className="absolute -inset-8 rounded-full bg-cyan-400/5 animate-pulse duration-700" />
                  </>
                )}
                
                <div className="w-24 h-24 rounded-full border-2 border-[#22d3ee] overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-[#22d3ee] text-3xl shadow-xl">
                  {activeCall.partnerAvatar ? (
                    <img src={activeCall.partnerAvatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    activeCall.partnerName.substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-wide">{activeCall.partnerName}</h2>
                <p className="text-[10px] text-[#22d3ee] uppercase tracking-widest font-mono font-bold animate-pulse">
                  {activeCall.status === "ringing-out" ? "Dialing..." : 
                   activeCall.status === "ringing-in" ? "Incoming Call..." : 
                   `CONNECTED • ${formatTimer(callTimer)}`}
                </p>
              </div>

              {/* WebRTC Video Feeds */}
              {activeCall.status === "connected" && activeCall.type === "video" && (
                <div className="w-full h-48 bg-black rounded-2xl overflow-hidden border border-white/10 relative">
                  
                  {/* Remote caller feed */}
                  <video
                    id="remote-video-feed"
                    autoPlay
                    playsInline
                    style={{ filter: getFilterStyle() }}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Local preview (Inset PiP) */}
                  <div className="absolute bottom-2 right-2 w-20 h-28 rounded-lg overflow-hidden border border-white/20 bg-neutral-900 shadow-lg">
                    <video
                      id="local-video-feed"
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Hidden audio element for voice calls */}
              <audio id="remote-audio-feed" autoPlay />

              {/* Secure Call Encryption Disclaimer */}
              <p className="text-[9px] text-text-secondary leading-relaxed max-w-[240px]">
                🛡️ E2EE Voice & Video Shield Active. Call is secured via WebRTC DTLS encryption keys.
              </p>

              {/* FaceTime-style Slide-to-Accept Slider (Incoming only) */}
              {activeCall.status === "ringing-in" && (
                <div className="w-full space-y-4">
                  
                  {/* Slide Slider Container */}
                  <div
                    className="w-64 h-12 bg-white/5 border border-white/10 rounded-full mx-auto relative flex items-center justify-between px-2 overflow-hidden"
                  >
                    <div 
                      className="absolute inset-y-1 left-1 bg-[#3ecf8e] text-black font-bold text-[10px] uppercase tracking-widest rounded-full flex items-center justify-center shadow-lg transition-transform"
                      style={{ 
                        transform: `translateX(${swipeX}px)`,
                        width: "100px",
                        cursor: "grab"
                      }}
                      onTouchStart={handleTouchStartSwipe}
                      onTouchMove={handleTouchMoveSwipe}
                      onTouchEnd={handleTouchEndSwipe}
                    >
                      Accept »
                    </div>
                    <span className="w-full text-center text-[9px] uppercase tracking-wider text-text-secondary/70 pl-24 pointer-events-none select-none">
                      Swipe to Answer
                    </span>
                  </div>

                  {/* Standard reject/decline button */}
                  <button
                    onClick={handleHangUp}
                    className="w-11 h-11 mx-auto rounded-full bg-danger hover:bg-danger/80 text-white transition-colors cursor-pointer flex items-center justify-center shadow-md"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Outgoing or Connected Call controls */}
              {activeCall.status !== "ringing-in" && (
                <div className="flex gap-4 items-center justify-center">
                  
                  {/* Mute Mic toggle */}
                  <button
                    onClick={handleToggleMute}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      isMuted ? "bg-white/10 border-white/20 text-[#22d3ee]" : "bg-neutral-800 border-white/5 text-white hover:bg-white/5"
                    }`}
                    title="Mute Mic"
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Hang Up Action */}
                  <button
                    onClick={handleHangUp}
                    className="w-12 h-12 rounded-full bg-danger hover:bg-danger/80 text-white transition-colors cursor-pointer flex items-center justify-center shadow-lg"
                    title="Hang Up"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>

                  {/* Video Disable toggle (video only) */}
                  {activeCall.type === "video" && (
                    <>
                      <button
                        onClick={handleToggleCamera}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                          isCameraOff ? "bg-white/10 border-white/20 text-[#22d3ee]" : "bg-neutral-800 border-white/5 text-white hover:bg-white/5"
                        }`}
                        title="Camera Toggle"
                      >
                        {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </button>
                      
                      {/* Filter/Beauty toggle */}
                      <button
                        onClick={() => setBeautyMode(!beautyMode)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                          beautyMode ? "bg-white/10 border-white/20 text-[#22d3ee]" : "bg-neutral-800 border-white/5 text-white hover:bg-white/5"
                        }`}
                        title="Beauty Filter"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 4. NEW MESSAGE COMPOSER MODAL */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[420px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Create Conversation</span>
              <button onClick={() => setIsNewChatOpen(false)} className="p-1 rounded bg-white/5 text-text-secondary hover:text-white font-bold cursor-pointer">X</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Select Contact</label>
                <select
                  onChange={async (e) => {
                    const id = e.target.value;
                    if (!id) return;
                    setIsNewChatOpen(false);
                    const chanId = await createChatChannel("Direct Message", false, [id]);
                    if (chanId) setActiveChannelId(chanId);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                >
                  <option value="">Select User Profile</option>
                  {profiles.filter(p => p.id !== currentUser?.id).map(p => (
                    <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ChatView;

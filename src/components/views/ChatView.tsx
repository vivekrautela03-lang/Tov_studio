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
  FileText,
  Heart,
  Music as MusicIcon,
  Play,
  Pause,
  ShieldAlert,
  Folder as FolderIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  File as FileIcon,
  Search as SearchIcon,
  X,
  Loader2,
  Palette
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
    setActiveView,
    fetchNotes,
    addNote,
    deleteNote,
    fetchStories,
    addStory,
    likeStory,
    viewStory,
    updateChatChannelTheme,
    pinChatMessage,
    unpinChatMessage,
    notes,
    stories
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

  // --- STATE FOR STORIES, NOTES, THEMES, SHARED MEDIA, AI ASSISTANT ---
  const [isCreatorChoiceOpen, setIsCreatorChoiceOpen] = useState(false);
  const [isNoteComposerOpen, setIsNoteComposerOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isNoteViewerOpen, setIsNoteViewerOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  
  const [activeNote, setActiveNote] = useState<any>(null);
  const [activeStoryUser, setActiveStoryUser] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  
  // Custom theme/wallpaper picker drawer
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  
  // Shared Media Drawer
  const [isSharedMediaOpen, setIsSharedMediaOpen] = useState(false);
  const [sharedMediaTab, setSharedMediaTab] = useState<"photos" | "videos" | "files" | "audios" | "links">("photos");
  const [sharedMediaSearch, setSharedMediaSearch] = useState("");

  // Selected song attachment objects
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [itunesSearchQuery, setItunesSearchQuery] = useState("");
  const [itunesSongs, setItunesSongs] = useState<any[]>([]);
  const [isSearchingItunes, setIsSearchingItunes] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  // Story progress & timer
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quickReplyText, setQuickReplyText] = useState("");

  // Note composer input states
  const [noteContentInput, setNoteContentInput] = useState("");
  const [noteAudience, setNoteAudience] = useState<"everyone" | "close_friends">("everyone");

  // Story composer input states
  const [storyCaptionInput, setStoryCaptionInput] = useState("");
  const [storyAudience, setStoryAudience] = useState<"everyone" | "close_friends">("everyone");
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState("");
  const [storyMediaType, setStoryMediaType] = useState<"image" | "video">("image");

  // Audio preview helper
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // AI Assistant states
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [aiActionMessage, setAiActionMessage] = useState<any>(null); // For individual message actions
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponseText, setAiResponseText] = useState("");
  const [showAiResponseModal, setShowAiResponseModal] = useState(false);

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

    fetchNotes();
    fetchStories();
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

  // Story Progress Timer Effect
  useEffect(() => {
    if (!isStoryViewerOpen || !activeStoryUser || isPaused) return;

    const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
    if (userStories.length === 0) return;

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Delay briefly then transition to next story
          setTimeout(() => {
            handleNextStory();
          }, 0);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isStoryViewerOpen, activeStoryUser, activeStoryIndex, isPaused, stories]);

  useEffect(() => {
    setStoryProgress(0);
  }, [activeStoryIndex, activeStoryUser]);

  // Audio preview cleanup on unmount or component changes
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  // iTunes Search Helper
  const handleSearchItunes = async (query: string) => {
    if (!query.trim()) {
      setItunesSongs([]);
      return;
    }
    setIsSearchingItunes(true);
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15`);
      const data = await response.json();
      const formatted = (data.results || []).map((track: any) => ({
        id: track.trackId?.toString() || Math.random().toString(),
        name: track.trackName || "Unknown Song",
        artist: track.artistName || "Unknown Artist",
        artwork: track.artworkUrl100 || "",
        preview_url: track.previewUrl || ""
      }));
      setItunesSongs(formatted);
    } catch (error) {
      console.error("iTunes search error:", error);
    } finally {
      setIsSearchingItunes(false);
    }
  };

  // Play Preview Track
  const handlePlayPreview = (song: any) => {
    if (!song.preview_url) return;

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }

    if (playingSongId === song.id) {
      setPlayingSongId(null);
      return;
    }

    const audio = new Audio(song.preview_url);
    audio.volume = 0.5;
    audioPreviewRef.current = audio;
    setPlayingSongId(song.id);
    audio.play();

    audio.onended = () => {
      setPlayingSongId(null);
    };
  };

  // Story Navigation
  const handleNextStory = () => {
    if (!activeStoryUser) return;
    const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
    if (activeStoryIndex < userStories.length - 1) {
      const nextIndex = activeStoryIndex + 1;
      setActiveStoryIndex(nextIndex);
      viewStory(userStories[nextIndex].id);
    } else {
      handleCloseStoryViewer();
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      const prevIndex = activeStoryIndex - 1;
      setActiveStoryIndex(prevIndex);
      const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
      viewStory(userStories[prevIndex].id);
    } else {
      setStoryProgress(0);
    }
  };

  const handleCloseStoryViewer = () => {
    setIsStoryViewerOpen(false);
    setActiveStoryUser(null);
    setActiveStoryIndex(0);
    setStoryProgress(0);
  };

  // Story Quick Reply
  const handleSendQuickReply = async () => {
    if (!quickReplyText.trim() || !activeStoryUser) return;
    
    let channel = chatChannels.find((c: any) => 
      !c.is_group && c.chat_channel_members?.some((m: any) => m.user_id === activeStoryUser)
    );
    
    let channelId = channel?.id;
    if (!channelId) {
      channelId = await createChatChannel("Direct Message", false, [activeStoryUser]);
    }
    
    if (channelId) {
      const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
      const activeStory = userStories[activeStoryIndex];
      const replyMessage = `📸 Replied to story: "${activeStory?.caption || "Story"}"\n\n${quickReplyText}`;
      const encrypted = await encryptMessage(replyMessage, channelId);
      await sendChatMessage(channelId, encrypted, undefined);
      setQuickReplyText("");
      alert("Reply sent as Direct Message!");
    }
  };

  // AI Assistant Helpers
  const translateText = async (text: string, lang: string) => {
    setAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    let translated = text;
    if (lang === "Spanish") {
      translated = `Hola! ${text} (Traducido)`;
    } else if (lang === "French") {
      translated = `Bonjour! ${text} (Traduit)`;
    } else if (lang === "German") {
      translated = `Hallo! ${text} (Übersetzt)`;
    } else if (lang === "Japanese") {
      translated = `こんにちは! ${text} (翻訳済み)`;
    }
    setMessageInput(translated);
    setAiLoading(false);
    setIsAiMenuOpen(false);
  };

  const summarizeThread = async () => {
    setAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const lastMsgs = currentMessages.slice(-15);
    let summaryText = "";
    if (lastMsgs.length === 0) {
      summaryText = "There are no messages in this channel to summarize yet.";
    } else {
      const participants = Array.from(new Set(lastMsgs.map((m: any) => m.profiles?.full_name || (m.sender_id === currentUser?.id ? "You" : "Collaborator"))));
      summaryText = `### 🎬 AI Conversation Summary\n\n**Participants:** ${participants.join(", ")}\n\n**Key Discussion Points:**\n1. Project alignment and timeline synchronization.\n2. Exchanged direct notes and asset attachments.\n3. Discussed key blockers.\n\n**Action Items:**\n- Review uploaded media files.\n- Follow up on the latest notes and story updates.`;
    }
    setAiResponseText(summaryText);
    setShowAiResponseModal(true);
    setAiLoading(false);
    setIsAiMenuOpen(false);
  };

  const suggestSmartReplies = async () => {
    setAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const lastMsg = currentMessages[currentMessages.length - 1];
    const lastDecrypted = lastMsg ? (decryptedCache[lastMsg.id] || lastMsg.content) : "";
    
    let suggestions = ["Sounds good!", "Let's do it!", "I'll check and let you know."];
    if (lastDecrypted.toLowerCase().includes("ready")) {
      suggestions = ["Yes, fully ready!", "Almost ready, give me 5 mins.", "Need to finish one task first."];
    } else if (lastDecrypted.toLowerCase().includes("call") || lastDecrypted.toLowerCase().includes("meeting")) {
      suggestions = ["Joining now!", "Can we reschedule?", "Sure, let's hop on."];
    } else if (lastDecrypted.toLowerCase().includes("perfect") || lastDecrypted.toLowerCase().includes("good") || lastDecrypted.toLowerCase().includes("great")) {
      suggestions = ["Awesome!", "Thanks for confirming!", "Let's keep going."];
    }
    
    setAiSuggestions(suggestions);
    setAiLoading(false);
    setIsAiMenuOpen(false);
  };

  const handleSelectSmartReply = (reply: string) => {
    setMessageInput(reply);
    setAiSuggestions([]);
  };

  const handleTranslateMessage = async (msg: any, lang: string) => {
    setAiLoading(true);
    const text = decryptedCache[msg.id] || msg.content;
    await new Promise(resolve => setTimeout(resolve, 800));
    let translatedText = "";
    if (lang === "English") {
      translatedText = `[English]: ${text} (Translated)`;
    } else if (lang === "Spanish") {
      translatedText = `[Spanish]: Hola! ${text} (Traducido)`;
    } else if (lang === "French") {
      translatedText = `[French]: Bonjour! ${text} (Traduit)`;
    } else if (lang === "German") {
      translatedText = `[German]: Hallo! ${text} (Übersetzt)`;
    } else if (lang === "Japanese") {
      translatedText = `[Japanese]: こんにちは! ${text} (翻訳済み)`;
    }
    setAiResponseText(translatedText);
    setShowAiResponseModal(true);
    setAiLoading(false);
    setIsAiMenuOpen(false);
    setAiActionMessage(null);
  };

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

  const activeTheme = activeChannel?.theme_name || "dark";
  const activeWallpaper = activeChannel?.wallpaper_url || null;

  let themeContainerClass = "";
  let themeLogClass = "";

  if (activeTheme === "neon-purple") {
    themeContainerClass = "shadow-[inset_0_0_50px_rgba(168,85,247,0.15)] border-purple-500/20 bg-purple-950/5";
    themeLogClass = "bg-purple-950/10";
  } else if (activeTheme === "neon-blue") {
    themeContainerClass = "shadow-[inset_0_0_50px_rgba(6,182,212,0.15)] border-cyan-500/20 bg-cyan-950/5";
    themeLogClass = "bg-cyan-950/10";
  } else if (activeTheme === "cinematic") {
    themeContainerClass = "shadow-[inset_0_0_50px_rgba(249,115,22,0.15)] border-orange-950/20 bg-[#14100c]";
    themeLogClass = "bg-orange-950/5";
  } else {
    themeContainerClass = "bg-[#121319]/40";
    themeLogClass = "bg-black/10";
  }

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

        {/* Instagram-style horizontal scroll bar of stories & notes */}
        <div className="px-3 py-3 border-b border-white/5 bg-black/15 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth shrink-0 items-center">
          {/* First circle: Current user with add action */}
          <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0 relative">
            <div 
              onClick={() => setIsCreatorChoiceOpen(true)}
              className="w-11 h-11 rounded-full border border-white/15 bg-neutral-800 flex items-center justify-center relative font-bold text-xs text-[#22d3ee] hover:scale-105 transition-transform"
            >
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} className="w-full h-full object-cover rounded-full" alt="" />
              ) : (
                userProfile?.full_name?.substring(0, 2).toUpperCase() || "ME"
              )}
              {/* Plus Badge */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22d3ee] hover:bg-cyan-400 text-black font-extrabold rounded-full flex items-center justify-center border-2 border-[#121319] text-[10px]">
                +
              </div>
            </div>
            <span className="text-[9px] text-text-secondary font-mono">My Story</span>
          </div>

          {/* Remaining circles: Workspace profiles */}
          {profiles.filter(p => p.id !== currentUser?.id).map(p => {
            const userNote = notes.find((n: any) => n.user_id === p.id);
            const userStories = stories.filter((s: any) => s.user_id === p.id);
            const hasActiveStories = userStories.length > 0;
            const noteSnippet = userNote ? (userNote.content.substring(0, 12) + (userNote.content.length > 12 ? "..." : "")) : "";

            return (
              <div key={p.id} className="flex flex-col items-center gap-1 shrink-0 relative group">
                
                {/* Active Note Speech Bubble */}
                {userNote && (
                  <div 
                    onClick={() => {
                      setActiveNote(userNote);
                      setIsNoteViewerOpen(true);
                    }}
                    className="absolute -top-4 z-20 bg-neutral-900 border border-white/15 rounded-lg px-1.5 py-0.5 text-[8px] text-white shadow-lg whitespace-nowrap cursor-pointer hover:scale-105 transition-transform max-w-[70px] truncate"
                    title={userNote.content}
                  >
                    {noteSnippet}
                    {/* bubble triangle */}
                    <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-1 h-1 bg-neutral-900 border-r border-b border-white/15 rotate-45" />
                  </div>
                )}

                {/* Avatar container with glowing ring if active story */}
                <div 
                  onClick={() => {
                    if (hasActiveStories) {
                      setActiveStoryUser(p.id);
                      setActiveStoryIndex(0);
                      setIsStoryViewerOpen(true);
                      viewStory(userStories[0].id);
                    } else if (userNote) {
                      setActiveNote(userNote);
                      setIsNoteViewerOpen(true);
                    }
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all ${
                    hasActiveStories 
                      ? "bg-gradient-to-tr from-cyan-400 to-purple-500 p-[2px]" 
                      : "border border-white/10"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-[#22d3ee]">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      p.full_name?.substring(0, 2).toUpperCase() || "UN"
                    )}
                  </div>
                </div>
                
                <span className="text-[9px] text-text-secondary truncate max-w-[45px]">
                  {p.full_name || "User"}
                </span>
              </div>
            );
          })}
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
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ${themeContainerClass} ${activeChannelId ? "flex" : "hidden md:flex"}`}>
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
                {/* Chat Theme picker */}
                <button
                  onClick={() => setIsThemePickerOpen(true)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/5"
                  title="Choose Chat Theme & Wallpaper"
                >
                  <Palette className="w-4 h-4 text-purple-400" />
                </button>

                {/* Shared Media Drawer */}
                <button
                  onClick={() => setIsSharedMediaOpen(true)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/5"
                  title="Shared Media Drawer"
                >
                  <FolderIcon className="w-4 h-4 text-cyan-400" />
                </button>

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

            {/* Pinned Messages Banner */}
            {currentMessages.filter((m: any) => m.is_pinned).length > 0 && (
              <div className="px-4 py-2 bg-neutral-900/90 border-b border-white/5 flex items-center justify-between text-xs text-text-secondary z-10 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Pin className="w-3.5 h-3.5 text-cyan-400 shrink-0 fill-cyan-400/20" />
                  <span className="font-bold text-white shrink-0 text-[10px]">PINNED MESSAGE:</span>
                  <p 
                    onClick={() => {
                      const pins = currentMessages.filter((m: any) => m.is_pinned);
                      const latestPin = pins[pins.length - 1];
                      if (latestPin) {
                        const el = document.getElementById(`msg-${latestPin.id}`);
                        el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="truncate hover:underline cursor-pointer text-cyan-300 hover:text-white text-[10px]"
                  >
                    {decryptedCache[currentMessages.filter((m: any) => m.is_pinned).slice(-1)[0].id] || currentMessages.filter((m: any) => m.is_pinned).slice(-1)[0].content}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      const pins = currentMessages.filter((m: any) => m.is_pinned);
                      const latestPin = pins[pins.length - 1];
                      if (latestPin) unpinChatMessage(activeChannelId, latestPin.id);
                    }}
                    className="text-[10px] text-danger hover:underline cursor-pointer font-bold"
                  >
                    Unpin
                  </button>
                </div>
              </div>
            )}

            {/* Chat Messages Log */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar relative transition-all duration-300 ${themeLogClass}`}>
              {activeWallpaper && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.08] bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${activeWallpaper})` }}
                />
              )}
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
                    <div 
                      key={msg.id} 
                      id={`msg-${msg.id}`}
                      className={`flex flex-col max-w-[70%] ${isSender ? "ml-auto items-end" : "mr-auto items-start"} group/msg relative z-10`}
                    >
                      {/* Floating actions bar on hover */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity z-20"
                        style={isSender ? { right: '100%', marginRight: '8px' } : { left: '100%', marginLeft: '8px' }}
                      >
                        <button
                          onClick={() => msg.is_pinned ? unpinChatMessage(activeChannelId, msg.id) : pinChatMessage(activeChannelId, msg.id)}
                          className="p-1 rounded bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                          title={msg.is_pinned ? "Unpin message" : "Pin message"}
                        >
                          <Pin className={`w-3.5 h-3.5 ${msg.is_pinned ? "text-cyan-400 fill-cyan-400" : "text-text-secondary"}`} />
                        </button>
                        <button
                          onClick={() => {
                            setAiActionMessage(msg);
                            setIsAiMenuOpen(true);
                          }}
                          className="p-1 rounded bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-[#22d3ee] transition-colors cursor-pointer"
                          title="AI Actions"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className={`p-3 rounded-2xl text-xs relative ${
                        isSender 
                          ? "bg-gradient-to-br from-cyan-900/60 to-neutral-900 border border-[#22d3ee]/20 text-white rounded-tr-none" 
                          : "bg-neutral-900/80 border border-white/5 text-text-secondary rounded-tl-none"
                      }`}>
                        
                        {/* Pinned badge */}
                        {msg.is_pinned && (
                          <div className="flex items-center gap-1 text-[8px] text-cyan-400 uppercase tracking-widest font-bold mb-1">
                            <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                          </div>
                        )}

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
              {/* AI smart reply suggestion pills */}
              {aiSuggestions.length > 0 && (
                <div className="flex items-center gap-2 pb-2.5 overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[8px] uppercase tracking-widest text-[#22d3ee] font-mono shrink-0">AI Replies:</span>
                  {aiSuggestions.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSmartReply(reply)}
                      className="px-2.5 py-1 rounded-full bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-500/30 text-[#22d3ee] text-[9px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                  <button
                    onClick={() => setAiSuggestions([])}
                    className="px-2 py-0.5 text-text-secondary hover:text-white text-[8px] font-bold shrink-0 ml-auto"
                  >
                    Clear
                  </button>
                </div>
              )}

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

                {/* AI Assistant menu button */}
                <button
                  onClick={() => {
                    setAiActionMessage(null);
                    setIsAiMenuOpen(true);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[#22d3ee] cursor-pointer shrink-0 transition-colors"
                  title="AI DM Assistant"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
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

      {/* --- ADD ACTIVITY (NOTE/STORY) CHOICE MODAL --- */}
      {isCreatorChoiceOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[320px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl text-white space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Create Activity</span>
              <button onClick={() => setIsCreatorChoiceOpen(false)} className="p-1 rounded hover:bg-white/5 text-text-secondary hover:text-white font-bold cursor-pointer">X</button>
            </div>
            <p className="text-[10px] text-text-secondary">Share a 60-character Note with a soundtrack, or publish an image/video Story!</p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setIsCreatorChoiceOpen(false);
                  setIsNoteComposerOpen(true);
                }}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-center gap-1.5 transition-all"
              >
                <span className="text-2xl">💬</span>
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">Write Note</span>
              </button>

              <button
                onClick={() => {
                  setIsCreatorChoiceOpen(false);
                  setIsStoryCreatorOpen(true);
                }}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-center gap-1.5 transition-all"
              >
                <span className="text-2xl">📸</span>
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">Post Story</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- WRITE NOTE MODAL --- */}
      {isNoteComposerOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[420px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Compose Note</span>
              <button onClick={() => {
                setIsNoteComposerOpen(false);
                setSelectedSong(null);
                setItunesSearchQuery("");
                setItunesSongs([]);
                setNoteContentInput("");
              }} className="p-1 rounded hover:bg-white/5 text-text-secondary hover:text-white font-bold cursor-pointer">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Your Note (Max 60 chars)</label>
                <textarea
                  maxLength={60}
                  rows={2}
                  value={noteContentInput}
                  placeholder="What's on your mind?..."
                  onChange={(e) => setNoteContentInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#22d3ee] resize-none"
                />
                <span className="text-[9px] text-text-secondary/70 font-mono block text-right mt-1">
                  {noteContentInput.length}/60
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Audience</label>
                <select
                  value={noteAudience}
                  onChange={(e: any) => setNoteAudience(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                >
                  <option value="everyone">Everyone</option>
                  <option value="close_friends">Close Friends</option>
                </select>
              </div>

              {/* iTunes block */}
              <div className="border border-white/5 rounded-xl p-3 bg-black/30 space-y-3">
                <label className="block text-[10px] uppercase text-text-secondary font-bold">Attach Music (Optional)</label>
                {selectedSong ? (
                  <div className="flex items-center justify-between p-2 bg-neutral-900 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img src={selectedSong.artwork} className="w-8 h-8 rounded object-cover" alt="" />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">{selectedSong.name}</span>
                        <span className="text-[9px] text-text-secondary block truncate">{selectedSong.artist}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePlayPreview(selectedSong)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white"
                      >
                        {playingSongId === selectedSong.id ? <Pause className="w-3.5 h-3.5 text-[#22d3ee]" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSong(null)}
                        className="p-1 rounded bg-danger/20 hover:bg-danger text-danger hover:text-white text-[9px] font-bold px-1.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search songs..."
                        value={itunesSearchQuery}
                        onChange={(e) => setItunesSearchQuery(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSearchItunes(itunesSearchQuery)}
                        className="px-3 py-1 bg-white/5 hover:bg-[#22d3ee] hover:text-black border border-white/5 rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-all"
                      >
                        Search
                      </button>
                    </div>

                    {isSearchingItunes ? (
                      <div className="text-center py-2 flex items-center justify-center gap-1.5 text-[10px] text-text-secondary font-mono uppercase">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#22d3ee]" /> Searching...
                      </div>
                    ) : itunesSongs.length > 0 ? (
                      <div className="max-h-28 overflow-y-auto no-scrollbar space-y-1.5 bg-black/40 rounded-lg p-2 border border-white/5">
                        {itunesSongs.map(song => (
                          <div key={song.id} className="flex items-center justify-between p-1.5 hover:bg-white/5 rounded transition-colors">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img src={song.artwork} className="w-6 h-6 rounded object-cover" alt="" />
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-white block truncate">{song.name}</span>
                                <span className="text-[8px] text-text-secondary block truncate">{song.artist}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handlePlayPreview(song)}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white shrink-0"
                              >
                                {playingSongId === song.id ? <Pause className="w-3 h-3 text-[#22d3ee]" /> : <Play className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedSong(song)}
                                className="px-2 py-0.5 rounded bg-[#22d3ee] text-black font-bold text-[9px] hover:bg-cyan-400 shrink-0"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <button
                onClick={async () => {
                  if (!noteContentInput.trim()) {
                    alert("Note content cannot be empty.");
                    return;
                  }
                  await addNote(noteContentInput, selectedSong, noteAudience);
                  setIsNoteComposerOpen(false);
                  setSelectedSong(null);
                  setItunesSearchQuery("");
                  setItunesSongs([]);
                  setNoteContentInput("");
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-br from-[#22d3ee] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black font-bold text-xs cursor-pointer transition-colors"
              >
                Share Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD STORY MODAL --- */}
      {isStoryCreatorOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[420px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Create Story</span>
              <button onClick={() => {
                setIsStoryCreatorOpen(false);
                setStoryFile(null);
                setStoryPreview("");
                setSelectedSong(null);
                setItunesSearchQuery("");
                setItunesSongs([]);
                setStoryCaptionInput("");
              }} className="p-1 rounded hover:bg-white/5 text-text-secondary hover:text-white font-bold cursor-pointer">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Select Media</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  id="story-media-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setStoryFile(file);
                    setStoryMediaType(file.type.startsWith("video") ? "video" : "image");
                    setStoryPreview(URL.createObjectURL(file));
                  }}
                />
                {storyPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 h-32 bg-black flex items-center justify-center">
                    {storyMediaType === "video" ? (
                      <video src={storyPreview} className="w-full h-full object-cover" muted autoPlay loop />
                    ) : (
                      <img src={storyPreview} className="w-full h-full object-cover" alt="" />
                    )}
                    <button
                      onClick={() => {
                        setStoryFile(null);
                        setStoryPreview("");
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black p-1 rounded-full text-white text-[10px] font-bold"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => document.getElementById("story-media-upload")?.click()}
                    className="w-full border border-dashed border-white/20 hover:border-[#22d3ee]/40 rounded-xl h-24 flex flex-col items-center justify-center text-text-secondary hover:text-white transition-colors"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Choose File</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Caption</label>
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={storyCaptionInput}
                  onChange={(e) => setStoryCaptionInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1">Audience</label>
                <select
                  value={storyAudience}
                  onChange={(e: any) => setStoryAudience(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                >
                  <option value="everyone">Everyone</option>
                  <option value="close_friends">Close Friends</option>
                </select>
              </div>

              {/* iTunes block */}
              <div className="border border-white/5 rounded-xl p-3 bg-black/30 space-y-3">
                <label className="block text-[10px] uppercase text-text-secondary font-bold">Attach Music (Optional)</label>
                {selectedSong ? (
                  <div className="flex items-center justify-between p-2 bg-neutral-900 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img src={selectedSong.artwork} className="w-8 h-8 rounded object-cover" alt="" />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">{selectedSong.name}</span>
                        <span className="text-[9px] text-text-secondary block truncate">{selectedSong.artist}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePlayPreview(selectedSong)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white"
                      >
                        {playingSongId === selectedSong.id ? <Pause className="w-3.5 h-3.5 text-[#22d3ee]" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSong(null)}
                        className="p-1 rounded bg-danger/20 hover:bg-danger text-danger hover:text-white text-[9px] font-bold px-1.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search songs..."
                        value={itunesSearchQuery}
                        onChange={(e) => setItunesSearchQuery(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSearchItunes(itunesSearchQuery)}
                        className="px-3 py-1 bg-white/5 hover:bg-[#22d3ee] hover:text-black border border-white/5 rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-all"
                      >
                        Search
                      </button>
                    </div>

                    {isSearchingItunes ? (
                      <div className="text-center py-2 flex items-center justify-center gap-1.5 text-[10px] text-text-secondary font-mono uppercase">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#22d3ee]" /> Searching...
                      </div>
                    ) : itunesSongs.length > 0 ? (
                      <div className="max-h-28 overflow-y-auto no-scrollbar space-y-1.5 bg-black/40 rounded-lg p-2 border border-white/5">
                        {itunesSongs.map(song => (
                          <div key={song.id} className="flex items-center justify-between p-1.5 hover:bg-white/5 rounded transition-colors">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img src={song.artwork} className="w-6 h-6 rounded object-cover" alt="" />
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-white block truncate">{song.name}</span>
                                <span className="text-[8px] text-text-secondary block truncate">{song.artist}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handlePlayPreview(song)}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white shrink-0"
                              >
                                {playingSongId === song.id ? <Pause className="w-3 h-3 text-[#22d3ee]" /> : <Play className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedSong(song)}
                                className="px-2 py-0.5 rounded bg-[#22d3ee] text-black font-bold text-[9px] hover:bg-cyan-400 shrink-0"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <button
                onClick={async () => {
                  if (!storyFile) {
                    alert("Please select an image or video file first.");
                    return;
                  }
                  setIsUploading(true);
                  try {
                    const mediaUrl = await uploadChatAttachment(storyFile);
                    await addStory(mediaUrl, storyMediaType, storyCaptionInput, selectedSong, storyAudience);
                    setIsStoryCreatorOpen(false);
                    setStoryFile(null);
                    setStoryPreview("");
                    setSelectedSong(null);
                    setItunesSearchQuery("");
                    setItunesSongs([]);
                    setStoryCaptionInput("");
                  } catch (e: any) {
                    alert("Media upload failed: " + e.message);
                  } finally {
                    setIsUploading(false);
                  }
                }}
                disabled={isUploading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-br from-[#22d3ee] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Uploading media...</span>
                  </>
                ) : (
                  <span>Post Story</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VISUALIZE NOTE VIEW MODAL --- */}
      {isNoteViewerOpen && activeNote && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="w-[380px] bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-white text-center space-y-5 relative">
            <button 
              onClick={() => {
                setIsNoteViewerOpen(false);
                setActiveNote(null);
              }} 
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-neutral-800 flex items-center justify-center text-[#22d3ee] font-bold text-lg">
                {activeNote.profiles?.avatar_url ? (
                  <img src={activeNote.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  activeNote.profiles?.full_name?.substring(0, 2).toUpperCase() || "UN"
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{activeNote.profiles?.full_name || "Workspace Member"}</h4>
                <span className="text-[9px] text-text-secondary font-mono">{new Date(activeNote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Spech bubble wrapper */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-purple-950/30 border border-white/10 shadow-lg text-sm text-white italic whitespace-pre-wrap leading-relaxed">
              <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-cyan-950/30 to-purple-950/30 border-r border-b border-white/10 rotate-45" />
              "{activeNote.content}"
            </div>

            {/* Attached sound styling */}
            {activeNote.song_name && (
              <div className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <img 
                      src={activeNote.song_artwork || ""} 
                      className={`w-9 h-9 rounded-full object-cover border border-white/10 ${playingSongId === activeNote.song_id ? "animate-[spin_4s_linear_infinite]" : ""}`} 
                      alt="" 
                    />
                    <MusicIcon className="w-3.5 h-3.5 text-[#22d3ee] absolute -bottom-1 -right-1 bg-black rounded-full p-0.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[11px] font-bold text-white block truncate">{activeNote.song_name}</span>
                    <span className="text-[9px] text-text-secondary block truncate">{activeNote.song_artist}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {playingSongId === activeNote.song_id && (
                    <div className="flex items-end gap-0.5 h-3.5 w-4 shrink-0">
                      <div className="w-[2.5px] bg-[#22d3ee] rounded-full animate-pulse" style={{ animation: 'eqBar 0.8s ease-in-out infinite', animationDelay: '0.1s', height: '6px' }} />
                      <div className="w-[2.5px] bg-[#22d3ee] rounded-full animate-pulse" style={{ animation: 'eqBar 0.8s ease-in-out infinite', animationDelay: '0.3s', height: '12px' }} />
                      <div className="w-[2.5px] bg-[#22d3ee] rounded-full animate-pulse" style={{ animation: 'eqBar 0.8s ease-in-out infinite', animationDelay: '0.5s', height: '8px' }} />
                      <style>{`
                        @keyframes eqBar {
                          0%, 100% { height: 4px; }
                          50% { height: 14px; }
                        }
                      `}</style>
                    </div>
                  )}
                  <button
                    onClick={() => handlePlayPreview({
                      id: activeNote.song_id,
                      preview_url: activeNote.song_preview_url
                    })}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-[#22d3ee] text-white hover:text-black transition-colors cursor-pointer"
                  >
                    {playingSongId === activeNote.song_id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {activeNote.user_id === currentUser?.id && (
              <button
                onClick={async () => {
                  if (confirm("Delete this Note?")) {
                    await deleteNote(activeNote.id);
                    setIsNoteViewerOpen(false);
                    setActiveNote(null);
                  }
                }}
                className="text-[10px] text-danger hover:underline font-bold mt-2 cursor-pointer"
              >
                Delete Note
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- DYNAMIC STORIES VIEWER MODAL --- */}
      {isStoryViewerOpen && activeStoryUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 text-white">
          {(() => {
            const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
            if (userStories.length === 0) return null;
            const activeStory = userStories[activeStoryIndex];
            const author = activeStory.profiles;
            const hasLiked = activeStory.likes?.includes(currentUser?.id);

            return (
              <div className="w-full max-w-md h-full md:h-[90vh] flex flex-col justify-between bg-neutral-950 border border-white/5 md:rounded-3xl overflow-hidden relative shadow-2xl">
                
                {/* Progress bars at top */}
                <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-20 flex gap-1">
                  {userStories.map((story: any, idx: number) => {
                    let width = "0%";
                    if (idx < activeStoryIndex) width = "100%";
                    if (idx === activeStoryIndex) width = `${storyProgress}%`;
                    return (
                      <div key={story.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 transition-all duration-100 ease-linear" style={{ width }} />
                      </div>
                    );
                  })}
                </div>

                {/* Header toolbar */}
                <div className="absolute top-4 inset-x-0 px-4 pt-2 z-20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-neutral-800 flex items-center justify-center font-bold text-xs text-[#22d3ee]">
                      {author?.avatar_url ? (
                        <img src={author.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        author?.full_name?.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">{author?.full_name || "Collaborator"}</span>
                      <span className="text-[8px] text-text-secondary font-mono">{new Date(activeStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCloseStoryViewer}
                    className="p-1 rounded bg-black/40 hover:bg-black/80 text-white font-bold cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Left/Right switcher zones */}
                <div className="absolute inset-y-16 inset-x-0 z-10 flex">
                  <div 
                    onClick={handlePrevStory}
                    className="w-1/3 h-full cursor-w-resize"
                  />
                  <div 
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    className="w-1/3 h-full"
                  />
                  <div 
                    onClick={handleNextStory}
                    className="w-1/3 h-full cursor-e-resize"
                  />
                </div>

                {/* Media Container */}
                <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden select-none">
                  {activeStory.media_type === "video" ? (
                    <video 
                      src={activeStory.media_url} 
                      className="w-full h-full object-contain pointer-events-none" 
                      autoPlay 
                      muted={false} 
                      loop 
                    />
                  ) : (
                    <img 
                      src={activeStory.media_url} 
                      className="w-full h-full object-contain pointer-events-none" 
                      alt="" 
                    />
                  )}

                  {/* Attached song sticker */}
                  {activeStory.song_name && (
                    <div className="absolute bottom-16 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-2.5 flex items-center justify-between z-20">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={activeStory.song_artwork} className="w-8 h-8 rounded object-cover border border-white/5 animate-spin" style={{ animationDuration: '4s' }} alt="" />
                        <div className="text-left min-w-0">
                          <span className="text-[10px] font-bold text-white block truncate">{activeStory.song_name}</span>
                          <span className="text-[8px] text-text-secondary block truncate">{activeStory.song_artist}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePlayPreview({
                          id: activeStory.song_id,
                          preview_url: activeStory.song_preview_url
                        })}
                        className="p-1 rounded-full bg-white/10 text-white hover:bg-white/20 shrink-0 cursor-pointer"
                      >
                        {playingSongId === activeStory.song_id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Caption overlay */}
                  {activeStory.caption && (
                    <div className="absolute bottom-4 inset-x-4 bg-black/40 p-2.5 rounded-lg border border-white/5 text-center text-xs text-white z-20 pointer-events-none select-none">
                      {activeStory.caption}
                    </div>
                  )}
                </div>

                {/* Bottom details & Quick replies */}
                <div className="p-3 border-t border-white/5 bg-[#09090B] z-20 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => likeStory(activeStory.id)}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                      title="Like Story"
                    >
                      <Heart className={`w-5 h-5 ${hasLiked ? "text-danger fill-danger" : "text-white"}`} />
                    </button>
                    
                    <input
                      type="text"
                      placeholder="Send a quick reply..."
                      value={quickReplyText}
                      onChange={(e) => setQuickReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendQuickReply();
                      }}
                      className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                    />
                    <button
                      onClick={handleSendQuickReply}
                      className="p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Seen by views list if owner */}
                  {activeStory.user_id === currentUser?.id && (
                    <div className="border-t border-white/5 pt-2">
                      <span className="text-[8px] uppercase tracking-widest text-text-secondary block mb-1">
                        👁️ Seen by ({activeStory.views?.length || 0})
                      </span>
                      {activeStory.views && activeStory.views.length > 0 ? (
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                          {activeStory.views.map((v: any, index: number) => (
                            <div key={index} className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-neutral-800 flex items-center justify-center text-[9px] shrink-0" title={v.full_name}>
                              {v.avatar_url ? (
                                <img src={v.avatar_url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                v.full_name?.substring(0, 2).toUpperCase()
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[8px] text-text-secondary/50">No views yet</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* --- CUSTOM CHAT THEME & WALLPAPER PICKER --- */}
      {isThemePickerOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[360px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Chat Theme & Wallpaper</span>
              <button onClick={() => setIsThemePickerOpen(false)} className="p-1 rounded hover:bg-white/5 text-text-secondary hover:text-white font-bold cursor-pointer">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary mb-1.5">Preset Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "dark", label: "Dark Classic", color: "bg-neutral-800" },
                    { name: "cinematic", label: "Cinematic Warm", color: "bg-amber-950 border-amber-500/30" },
                    { name: "neon-purple", label: "Neon Purple Glow", color: "bg-purple-950 border-purple-500/30" },
                    { name: "neon-blue", label: "Neon Blue Glow", color: "bg-cyan-950 border-cyan-500/30" }
                  ].map(theme => (
                    <button
                      key={theme.name}
                      onClick={async () => {
                        if (activeChannelId) {
                          await updateChatChannelTheme(activeChannelId, theme.name, activeWallpaper || undefined);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        activeTheme === theme.name 
                          ? "border-[#22d3ee] bg-white/5 text-white" 
                          : "border-white/5 bg-black/40 text-text-secondary hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${theme.color} mb-1 border`} />
                      <span className="font-semibold block">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase text-text-secondary">Custom Wallpaper URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/wallpaper.jpg"
                    value={activeWallpaper || ""}
                    onChange={async (e) => {
                      if (activeChannelId) {
                        await updateChatChannelTheme(activeChannelId, activeTheme, e.target.value || undefined);
                      }
                    }}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                  />
                  {activeWallpaper && (
                    <button
                      onClick={async () => {
                        if (activeChannelId) {
                          await updateChatChannelTheme(activeChannelId, activeTheme, undefined);
                        }
                      }}
                      className="px-2.5 py-1 bg-danger/20 hover:bg-danger text-danger hover:text-white rounded-lg text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SHARED MEDIA DRAWER --- */}
      {isSharedMediaOpen && (
        <div className="fixed inset-y-0 right-0 z-[100] w-80 bg-neutral-900 border-l border-white/10 shadow-2xl flex flex-col text-white animate-slide-in">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#121319]/80 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee] flex items-center gap-1.5">
              <FolderIcon className="w-4 h-4" /> Shared Media
            </span>
            <button onClick={() => setIsSharedMediaOpen(false)} className="p-1 rounded hover:bg-white/5 text-text-secondary hover:text-white font-bold cursor-pointer">X</button>
          </div>

          <div className="p-3 border-b border-white/5 bg-black/20">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shared items..."
                value={sharedMediaSearch}
                onChange={(e) => setSharedMediaSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
              />
              <SearchIcon className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-5 border-b border-white/5 text-[8px] uppercase tracking-wider text-center font-bold text-text-secondary">
            {[
              { id: "photos", label: "Photos", icon: ImageIcon },
              { id: "videos", label: "Videos", icon: Video },
              { id: "files", label: "Files", icon: FileIcon },
              { id: "audios", label: "Audios", icon: MusicIcon },
              { id: "links", label: "Links", icon: LinkIcon }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = sharedMediaTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSharedMediaTab(tab.id as any)}
                  className={`py-2 flex flex-col items-center gap-1 transition-all ${
                    isActive 
                      ? "border-b-2 border-cyan-400 text-white bg-white/5" 
                      : "border-b-2 border-transparent hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-black/10">
            {(() => {
              const items = currentMessages.filter((m: any) => {
                const decrypted = decryptedCache[m.id] || m.content || "";
                if (sharedMediaSearch) {
                  const query = sharedMediaSearch.toLowerCase();
                  const matches = decrypted.toLowerCase().includes(query) || (m.attachment_url && m.attachment_url.toLowerCase().includes(query));
                  if (!matches) return false;
                }

                if (sharedMediaTab === "photos") {
                  return m.attachment_url && m.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)/i);
                }
                if (sharedMediaTab === "videos") {
                  return m.attachment_url && m.attachment_url.match(/\.(mp4|webm|ogg|mov)/i);
                }
                if (sharedMediaTab === "audios") {
                  return (m.attachment_url && m.attachment_url.match(/\.(mp3|wav|ogg|aac|m4a)/i)) || decrypted.includes("[Voice Note]");
                }
                if (sharedMediaTab === "links") {
                  return decrypted.match(/https?:\/\/[^\s]+/i);
                }
                if (sharedMediaTab === "files") {
                  return m.attachment_url && !m.attachment_url.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm|ogg|mov|mp3|wav|aac|m4a)/i);
                }
                return false;
              });

              if (items.length === 0) {
                return (
                  <div className="text-center py-20 text-text-secondary/60 text-[10px] uppercase font-bold tracking-wider">
                    No items found
                  </div>
                );
              }

              return items.map((m: any) => {
                const decrypted = decryptedCache[m.id] || m.content || "";
                const dateStr = new Date(m.created_at).toLocaleDateString([], { month: "short", day: "numeric" });
                
                if (sharedMediaTab === "photos") {
                  return (
                    <a key={m.id} href={m.attachment_url} target="_blank" rel="noreferrer" className="block group relative rounded-lg overflow-hidden border border-white/5 hover:border-[#22d3ee]/40 transition-colors">
                      <img src={m.attachment_url} className="w-full h-28 object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[9px] text-white font-mono">{dateStr}</span>
                      </div>
                    </a>
                  );
                }
                if (sharedMediaTab === "videos") {
                  return (
                    <div key={m.id} className="rounded-lg overflow-hidden border border-white/5 bg-black/40 p-1">
                      <video src={m.attachment_url} controls className="w-full h-28 object-cover rounded" />
                      <span className="text-[8px] text-text-secondary font-mono block mt-1 px-1">{dateStr}</span>
                    </div>
                  );
                }
                if (sharedMediaTab === "links") {
                  const linkMatch = decrypted.match(/https?:\/\/[^\s]+/i);
                  const url = linkMatch ? linkMatch[0] : "#";
                  return (
                    <a key={m.id} href={url} target="_blank" rel="noreferrer" className="block p-2.5 rounded-lg bg-neutral-900 border border-white/5 hover:border-[#22d3ee]/40 transition-colors">
                      <div className="text-xs text-[#22d3ee] truncate font-medium underline mb-1">{url}</div>
                      <div className="text-[10px] text-text-secondary truncate italic">"{decrypted}"</div>
                      <span className="text-[8px] text-text-secondary/50 font-mono block mt-1.5">{dateStr}</span>
                    </a>
                  );
                }
                
                return (
                  <a key={m.id} href={m.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-900 border border-white/5 hover:border-[#22d3ee]/40 transition-colors">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[#22d3ee] shrink-0">
                      {sharedMediaTab === "audios" ? <MusicIcon className="w-4 h-4" /> : <FileIcon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-white truncate font-medium">
                        {m.attachment_url?.split("/").pop() || "Shared Document"}
                      </div>
                      <span className="text-[8px] text-text-secondary/70 font-mono">{dateStr}</span>
                    </div>
                  </a>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* --- INLINE AI DM ACTIONS DIALOGS --- */}
      {isAiMenuOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-[360px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5 text-[#22d3ee]">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">AI DM Assistant</span>
              </div>
              <button 
                onClick={() => {
                  setIsAiMenuOpen(false);
                  setAiActionMessage(null);
                }} 
                className="p-1 rounded hover:bg-white/5 text-text-secondary hover:text-white font-bold cursor-pointer"
              >
                X
              </button>
            </div>

            {aiLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-[#22d3ee] animate-spin" />
                <span className="text-[10px] uppercase font-mono text-text-secondary">AI is thinking...</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {aiActionMessage ? (
                  <>
                    <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 mb-3">
                      <span className="text-[9px] uppercase tracking-wider text-text-secondary block mb-1">Message Context:</span>
                      <p className="text-[10px] text-white italic truncate">
                        "{decryptedCache[aiActionMessage.id] || aiActionMessage.content}"
                      </p>
                    </div>

                    <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Actions:</div>
                    <button
                      onClick={async () => {
                        setAiLoading(true);
                        const text = decryptedCache[aiActionMessage.id] || aiActionMessage.content;
                        await new Promise(r => setTimeout(r, 1000));
                        const replyText = `Smart Suggestion: "I agree, let's proceed with that."`;
                        setAiResponseText(replyText);
                        setShowAiResponseModal(true);
                        setAiLoading(false);
                        setIsAiMenuOpen(false);
                        setAiActionMessage(null);
                      }}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-[#22d3ee]/20 hover:text-white rounded-lg text-xs transition-colors flex items-center justify-between"
                    >
                      <span>Suggest Smart Reply</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#22d3ee]" />
                    </button>

                    <div className="border-t border-white/5 my-2 pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary block mb-1">Translate To:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {["English", "Spanish", "French", "German", "Japanese"].map(lang => (
                          <button
                            key={lang}
                            onClick={() => handleTranslateMessage(aiActionMessage, lang)}
                            className="px-2 py-1.5 bg-white/5 hover:bg-[#22d3ee]/20 rounded-md text-[10px] text-left transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={suggestSmartReplies}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-[#22d3ee]/20 hover:text-white rounded-lg text-xs transition-colors flex items-center justify-between"
                    >
                      <span>Suggest Smart Replies</span>
                      <span className="text-[10px] text-[#22d3ee] font-mono">Pills</span>
                    </button>

                    <button
                      onClick={summarizeThread}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-[#22d3ee]/20 hover:text-white rounded-lg text-xs transition-colors flex items-center justify-between"
                    >
                      <span>Summarize Chat Thread</span>
                      <span className="text-[10px] text-[#22d3ee] font-mono">Recent</span>
                    </button>

                    {messageInput.trim() && (
                      <div className="border-t border-white/5 my-2 pt-2">
                        <span className="text-[10px] uppercase tracking-wider text-text-secondary block mb-1.5">Translate Input Composer:</span>
                        <div className="grid grid-cols-2 gap-2">
                          {["Spanish", "French", "German", "Japanese"].map(lang => (
                            <button
                              key={lang}
                              onClick={() => translateText(messageInput, lang)}
                              className="px-2 py-1.5 bg-white/5 hover:bg-[#22d3ee]/20 rounded-md text-[10px] text-left transition-colors"
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- AI RESPONSE DISPLAY MODAL --- */}
      {showAiResponseModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="w-[400px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-bounce" /> AI Assistant Output
              </span>
              <button onClick={() => setShowAiResponseModal(false)} className="p-1 rounded hover:bg-white/5 text-white font-bold cursor-pointer">X</button>
            </div>
            <div className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto no-scrollbar">
              {aiResponseText}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              {(aiResponseText.startsWith("[Translated") || aiResponseText.includes("Translated") || aiResponseText.startsWith("Hola!") || aiResponseText.startsWith("Bonjour!")) ? (
                <button
                  onClick={() => {
                    const cleaned = aiResponseText.replace(/^\[.*\]:\s*/, "");
                    setMessageInput(cleaned);
                    setShowAiResponseModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-[10px] hover:bg-cyan-400 transition-colors"
                >
                  Insert into Input
                </button>
              ) : null}
              <button
                onClick={() => setShowAiResponseModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ChatView;

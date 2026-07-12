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
  Palette,
  Menu,
  ChevronDown,
  Lock,
  Unlock,
  Archive,
  Tag,
  Bell,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Calendar,
  BarChart2,
  Sticker,
  User,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { encryptMessage, decryptMessage } from "@/utils/crypto";

// Mock lyrics database for Apple Music note visualizer
const MOCK_LYRICS: Record<string, string[]> = {
  "default": [
    "Attaching some notes for the scene mockup...",
    "Reviewing visual effects drafts...",
    "Perfecting camera angles for Sequence 3...",
    "Ready for the director's review...",
    "Let's finalize production specs tomorrow!"
  ],
  "blinding": [
    "I've been tryna call...",
    "I've been on my own for long enough...",
    "Maybe you can show me how to love, maybe...",
    "I'm going through withdrawals...",
    "You don't even have to do too much...",
    "You can turn me on with just a touch, baby..."
  ],
  "stay": [
    "I do the same thing I told you that I never would...",
    "I told you I'd change, even when I knew I never could...",
    "I know that I can't find nobody else as good as you...",
    "I need you to stay, need you to stay, yeah..."
  ],
  "starboy": [
    "I'm tryna put you in the worst mood, ah...",
    "P1 cleaner than your church shoes, ah...",
    "Milli point two just to hurt you, ah...",
    "House so empty, need a centerpiece..."
  ]
};

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

  // Filters & Header States
  const [activeFilter, setActiveFilter] = useState<"Primary" | "Projects" | "Requests" | "Unread" | "Archived">("Primary");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAiSearchSuggestions, setShowAiSearchSuggestions] = useState(false);
  const [userStatus, setUserStatus] = useState<string>("active");

  // Real Presence & Typing State
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; timestamp: number; mode?: string }>>({});
  const presenceChannelRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<any>(null);

  // E2EE Decrypted message caches
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

  // Modals & Sheets
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

  // Audio preview timeline scrubbing
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(30);

  // Story progress & timer
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quickReplyText, setQuickReplyText] = useState("");

  // Note composer input states
  const [noteContentInput, setNoteContentInput] = useState("");
  const [noteAudience, setNoteAudience] = useState<"everyone" | "close_friends">("everyone");

  // Story composer & Stamp states
  const [storyCaptionInput, setStoryCaptionInput] = useState("");
  const [storyAudience, setStoryAudience] = useState<"everyone" | "close_friends">("everyone");
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState("");
  const [storyMediaType, setStoryMediaType] = useState<"image" | "video">("image");
  const [storyStampType, setStoryStampType] = useState<"none" | "poll" | "link" | "countdown" | "slider">("none");
  const [storyStampData, setStoryStampData] = useState<any>({});
  
  // Interactive Story Stamp votes/interactions in viewer
  const [pollVoted, setPollVoted] = useState<"A" | "B" | null>(null);
  const [emojiSliderVal, setEmojiSliderVal] = useState<number>(50);

  // Audio preview helper
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // AI Assistant states
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [aiActionMessage, setAiActionMessage] = useState<any>(null);
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
  const [noiseCancel, setNoiseCancel] = useState(false);
  const [callFilter, setCallFilter] = useState<"none" | "cinematic" | "noir" | "cyberpunk">("none");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState(false);

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

  // Chat list gesture swipe state
  const [swipingChannelId, setSwipingChannelId] = useState<string | null>(null);
  const [channelSwipeOffset, setChannelSwipeOffset] = useState<number>(0);
  const channelSwipeStartRef = useRef<number>(0);

  // Long-press Bottom Sheet State
  const longPressTimeoutRef = useRef<any>(null);
  const [activeBottomSheetChannel, setActiveBottomSheetChannel] = useState<any>(null);
  const [channelLabels, setChannelLabels] = useState<Record<string, string[]>>({});
  const [lockedChannels, setLockedChannels] = useState<Record<string, boolean>>({});
  const [showFaceIdLock, setShowFaceIdLock] = useState<string | null>(null);
  const [isAuthenticatingFaceId, setIsAuthenticatingFaceId] = useState(false);

  // Chat message attachments and popovers
  const [messageInput, setMessageInput] = useState("");
  const [replyingToMsg, setReplyingToMsg] = useState<any>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);

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
    setIsRecording(false);
    setCallFilter("none");
    setBgBlur(false);
    setNoiseCancel(false);
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

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  // FaceTime Filters styling
  const getFilterStyle = () => {
    let str = "";
    if (beautyMode) str += "brightness(1.06) contrast(1.02) saturate(1.05) ";
    if (bgBlur) str += "blur(8px) ";
    if (callFilter === "cinematic") str += "sepia(0.2) saturate(1.2) contrast(1.05) ";
    if (callFilter === "noir") str += "grayscale(1) contrast(1.2) ";
    if (callFilter === "cyberpunk") str += "hue-rotate(180deg) saturate(1.4) ";
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

  // Drag-to-Accept Call Swipe Handlers
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

  // Chat list swipe deltas
  const handleChannelSwipeStart = (e: React.TouchEvent | React.MouseEvent, channelId: string) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setSwipingChannelId(channelId);
    channelSwipeStartRef.current = clientX;
  };

  const handleChannelSwipeMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!swipingChannelId) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - channelSwipeStartRef.current;
    
    // clamp bounds: -180px for swipe-left reveals; 120px for swipe-right reveals
    const clamped = Math.max(-180, Math.min(120, deltaX));
    setChannelSwipeOffset(clamped);
  };

  const handleChannelSwipeEnd = () => {
    if (!swipingChannelId) return;
    
    if (channelSwipeOffset < -80) {
      // Lock swipe left to show Archive, Delete, Pin
      setChannelSwipeOffset(-180);
    } else if (channelSwipeOffset > 60) {
      // Lock swipe right to show Mark Unread, Reply
      setChannelSwipeOffset(120);
    } else {
      // Spring back
      setChannelSwipeOffset(0);
      setSwipingChannelId(null);
    }
  };

  const resetSwipeStates = () => {
    setChannelSwipeOffset(0);
    setSwipingChannelId(null);
  };

  // Long-press Bottom Sheet Trigger
  const startLongPressTimer = (e: React.MouseEvent | React.TouchEvent, channel: any) => {
    longPressTimeoutRef.current = setTimeout(() => {
      setActiveBottomSheetChannel(channel);
    }, 500);
  };

  const cancelLongPressTimer = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  // FaceID locks simulation
  const handleAuthenticateFaceId = () => {
    setIsAuthenticatingFaceId(true);
    setTimeout(() => {
      setIsAuthenticatingFaceId(false);
      const lockedChanId = showFaceIdLock;
      setShowFaceIdLock(null);
      if (lockedChanId) {
        setActiveChannelId(lockedChanId);
      }
    }, 1500);
  };

  const toggleLockChannel = (channelId: string) => {
    setLockedChannels(prev => ({
      ...prev,
      [channelId]: !prev[channelId]
    }));
    setActiveBottomSheetChannel(null);
    alert(`Conversation lock status changed.`);
  };

  const handleChannelLabelAdd = (channelId: string, label: string) => {
    setChannelLabels(prev => {
      const existing = prev[channelId] || [];
      if (existing.includes(label)) {
        return { ...prev, [channelId]: existing.filter(l => l !== label) };
      }
      return { ...prev, [channelId]: [...existing, label] };
    });
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
    // Reset stamp interactive state when shifting slides
    setPollVoted(null);
  }, [activeStoryIndex, activeStoryUser]);

  // Audio preview cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  // Sync Note/Music progress for Apple Music visualizer
  useEffect(() => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setAudioTime(audio.currentTime);
      setAudioDuration(audio.duration || 30);
    };

    const onEnded = () => {
      setPlayingSongId(null);
      setAudioTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playingSongId]);

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
      
      let captionText = activeStory?.caption || "Story";
      try {
        if (captionText.startsWith("{")) {
          captionText = JSON.parse(captionText).textCaption;
        }
      } catch (e) {}

      const replyMessage = `📸 Replied to story: "${captionText}"\n\n${quickReplyText}`;
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
  const handleSendMessage = async (rawMessage?: string) => {
    const textToSend = rawMessage !== undefined ? rawMessage : messageInput.trim();
    if (!activeChannelId || (!textToSend && !attachmentFile)) return;

    setIsUploading(true);
    let uploadedUrl = "";
    if (attachmentFile) {
      uploadedUrl = await uploadChatAttachment(attachmentFile);
    }

    const encrypted = await encryptMessage(textToSend || "[Media attachment]", activeChannelId);

    await sendChatMessage(
      activeChannelId,
      encrypted,
      uploadedUrl,
      replyingToMsg?.id || undefined
    );

    if (rawMessage === undefined) {
      setMessageInput("");
    }
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
      handleSendMessage("[Voice Note] duration: 32s");
    } else {
      setIsRecording(true);
      handleTypingStatus(true, "recording");
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Custom filters matching Primary / Projects categories
  const filteredChannels = chatChannels.filter(channel => {
    const details = getChannelDetails(channel);
    
    // search filter
    if (sidebarSearch.trim()) {
      const q = sidebarSearch.toLowerCase();
      const matches = details.title.toLowerCase().includes(q) || details.description.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (activeFilter === "Projects") return channel.is_group === true;
    if (activeFilter === "Unread") return channel.unread_count > 0;
    if (activeFilter === "Archived") return channel.is_archived === true;
    return channel.is_archived !== true; // Primary DMs default
  });

  const activeTheme = activeChannel?.theme_name || "dark";
  const activeWallpaper = activeChannel?.wallpaper_url || null;

  let themeContainerClass = "bg-black/60";
  let themeLogClass = "bg-white/[0.02]";

  if (activeTheme === "neon-purple") {
    themeContainerClass = "shadow-[inset_0_0_80px_rgba(168,85,247,0.18)] border-purple-500/20 bg-purple-950/5";
    themeLogClass = "bg-purple-950/10";
  } else if (activeTheme === "neon-blue") {
    themeContainerClass = "shadow-[inset_0_0_80px_rgba(6,182,212,0.18)] border-cyan-500/20 bg-cyan-950/5";
    themeLogClass = "bg-cyan-950/10";
  } else if (activeTheme === "cinematic") {
    themeContainerClass = "shadow-[inset_0_0_80px_rgba(249,115,22,0.18)] border-orange-950/20 bg-[#16120e]/60";
    themeLogClass = "bg-orange-950/5";
  }

  return (
    <div className="h-screen w-full flex bg-[#0c0d12] text-white select-none relative overflow-hidden font-sans">
      
      {/* Background iOS Ambient Glass Blobs */}
      <div className="absolute top-[-15%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-pink-500/5 to-purple-500/10 blur-[160px] pointer-events-none z-0" />

      {/* Embedded Animations CSS */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wave {
          0%, 100% { height: 6px; }
          50% { height: 26px; }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slideup {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadein {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-wave {
          animation: wave 0.9s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: rotateSlow 8s linear infinite;
        }
        .animate-ring-spin {
          animation: ringRotate 3s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* FaceTime Dynamic Island Floating Call Bar */}
      {activeCall && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[120] pointer-events-none flex justify-center w-full max-w-sm px-4">
          <div 
            onClick={() => setIsDynamicIslandExpanded(!isDynamicIslandExpanded)}
            className={`pointer-events-auto bg-black/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] cursor-pointer flex items-center justify-between transition-all duration-500 cubic-bezier(0.16,1,0.3,1) overflow-hidden ${
              isDynamicIslandExpanded 
                ? "w-full rounded-[24px] p-4 h-32" 
                : "w-[240px] rounded-full px-4.5 py-2 h-10"
            }`}
          >
            {isDynamicIslandExpanded ? (
              <div className="flex flex-col justify-between w-full h-full text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-neutral-800 flex items-center justify-center font-bold text-cyan-400">
                      {activeCall.partnerAvatar ? (
                        <img src={activeCall.partnerAvatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        activeCall.partnerName.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-white leading-tight">{activeCall.partnerName}</h5>
                      <span className="text-[9px] text-[#22d3ee] font-mono capitalize">FaceTime {activeCall.type} • {activeCall.status}</span>
                    </div>
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full text-[8px] text-red-400 font-bold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Rec
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                  <span className="text-[10px] text-white/50 font-mono">Duration: {formatTimer(callTimer)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleMute(); }}
                      className={`p-1.5 rounded-full border ${isMuted ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-white/10 border-white/5 text-white"}`}
                    >
                      {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleHangUp(); }}
                      className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-[10px] font-semibold text-white/90 truncate max-w-[120px]">
                    {activeCall.status === "connected" ? `Connected • ${formatTimer(callTimer)}` : "Calling..."}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-800 border border-white/10 flex items-center justify-center">
                  <Phone className="w-3 h-3 text-cyan-400 animate-bounce" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FaceID Lock overlay for locked channels */}
      {showFaceIdLock && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-3xl flex items-center justify-center text-white animate-fadein">
          <div className="text-center p-8 max-w-sm bg-white/[0.05] border border-white/15 rounded-[32px] shadow-2xl flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              {isAuthenticatingFaceId ? (
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              ) : (
                <Lock className="w-10 h-10 text-cyan-300" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Chat Locked</h3>
              <p className="text-xs text-white/60 leading-relaxed">This workspace conversation is sealed with Apple FaceID. Authenticate to view.</p>
            </div>
            <div className="w-full flex gap-3">
              <button 
                onClick={() => setShowFaceIdLock(null)}
                className="flex-1 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAuthenticateFaceId}
                disabled={isAuthenticatingFaceId}
                className="flex-1 py-2.5 rounded-2xl bg-cyan-400 text-black hover:bg-cyan-300 text-xs font-bold transition-all shadow-lg"
              >
                Authenticate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. CONVERSATION SIDEBAR */}
      <div className={`w-full md:w-[360px] border-r border-white/10 flex flex-col h-full bg-[#101217]/50 backdrop-blur-[32px] relative z-10 shrink-0 ${activeChannelId ? "hidden md:flex" : "flex"}`}>
        
        {/* REDESIGNED DASHBOARD HOME HEADER TOOLBAR */}
        <div className="bg-white/[0.04] backdrop-blur-[24px] border border-white/10 rounded-[28px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_32px_0_rgba(0,0,0,0.25)] p-3 mx-3 mt-3 mb-2 flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]">
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveView("dashboard")} 
              className="p-2 hover:bg-white/[0.08] rounded-full transition-all text-white/80 hover:text-white"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {/* Username selector dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                className="flex items-center gap-1.5 p-1 px-2.5 rounded-full hover:bg-white/[0.08] border border-white/5 transition-all text-xs font-semibold text-white/90"
              >
                <span className="max-w-[80px] truncate">{userProfile?.full_name || currentUser?.email || "Workspace"}</span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>
              {showUserDropdown && (
                <div className="absolute left-0 mt-2 w-48 rounded-[20px] bg-black/90 backdrop-blur-xl border border-white/15 p-2 shadow-2xl z-50 animate-fadein">
                  <div className="px-2.5 py-1 text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold mb-1">Select Status</div>
                  {[
                    { id: "active", label: "Active Now", color: "bg-green-500" },
                    { id: "away", label: "Away", color: "bg-amber-500" },
                    { id: "dnd", label: "Do Not Disturb", color: "bg-red-500" },
                    { id: "offline", label: "Invisible", color: "bg-gray-500" }
                  ].map(status => (
                    <button
                      key={status.id}
                      onClick={() => {
                        setUserStatus(status.id);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 text-left text-xs transition-colors"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                      <span className="text-white/80">{status.label}</span>
                      {userStatus === status.id && <Check className="w-3 h-3 text-cyan-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Presence dot & Compose / Search buttons */}
            <span className={`w-2.5 h-2.5 rounded-full ${
              userStatus === "active" ? "bg-green-500 shadow-[0_0_6px_#22c55e]" :
              userStatus === "away" ? "bg-amber-500" :
              userStatus === "dnd" ? "bg-red-500" : "bg-gray-500"
            }`} title={`Status: ${userStatus}`} />

            <button
              onClick={() => setIsNewChatOpen(true)}
              className="p-1.5 bg-white/[0.08] hover:bg-[#22d3ee] border border-white/10 rounded-full transition-all text-white hover:text-black shadow-md cursor-pointer"
              title="Compose Message"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSearchBox(!showSearchBox)}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                showSearchBox ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-400" : "bg-white/[0.08] border-white/10 text-white hover:bg-white/15"
              }`}
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular glass search bar with Mock AI suggestions */}
        {showSearchBox && (
          <div className="px-3 mb-2 relative z-30 animate-fadein">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search or Ask AI..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                onFocus={() => setShowAiSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowAiSearchSuggestions(false), 200)}
                className="w-full bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
              />
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3" />
              {sidebarSearch && (
                <button onClick={() => setSidebarSearch("")} className="absolute right-3 p-0.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {showAiSearchSuggestions && (
              <div className="absolute left-3 right-3 mt-1 rounded-[24px] bg-black/90 backdrop-blur-xl border border-white/15 p-3 shadow-2xl z-50 animate-fadein">
                <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>AI Suggestions</span>
                </div>
                <div className="space-y-1">
                  {[
                    { text: "Summarize recent DMs", action: () => { summarizeThread(); } },
                    { text: "Smart Suggest smart replies", action: () => { suggestSmartReplies(); } },
                    { text: "Filter by VFX discussions", action: () => { setSidebarSearch("VFX"); } }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={s.action}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs text-white/80 hover:text-white transition-all flex items-center justify-between"
                    >
                      <span>{s.text}</span>
                      <span className="text-[9px] text-white/40 font-mono">»</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Categories / Filter Pills */}
        <div className="px-3 pb-2 flex gap-1 items-center overflow-x-auto no-scrollbar shrink-0">
          {(["Primary", "Projects", "Requests", "Unread", "Archived"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                activeFilter === tab 
                  ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                  : "bg-white/[0.04] border-white/5 text-white/50 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* REDESIGNED STORIES & NOTES ROWS (INSTAGRAM STYLE) */}
        <div className="px-3.5 py-3 border-y border-white/10 bg-white/[0.01] flex gap-3 overflow-x-auto no-scrollbar scroll-smooth shrink-0 items-center">
          
          {/* Add story circle */}
          <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0 relative">
            <div 
              onClick={() => setIsCreatorChoiceOpen(true)}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/[0.08] flex items-center justify-center relative font-bold text-xs text-cyan-400 hover:scale-105 transition-transform shadow-md"
            >
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} className="w-full h-full object-cover rounded-full" alt="" />
              ) : (
                userProfile?.full_name?.substring(0, 2).toUpperCase() || "ME"
              )}
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-cyan-400 text-black font-extrabold rounded-full flex items-center justify-center border-2 border-[#121319] text-[10px] shadow-sm">
                +
              </div>
            </div>
            <span className="text-[9px] text-white/40 font-semibold mt-1">My Story</span>
          </div>

          {/* User bubbles with stories & notes */}
          {profiles.filter(p => p.id !== currentUser?.id).map(p => {
            const userNote = notes.find((n: any) => n.user_id === p.id);
            const userStories = stories.filter((s: any) => s.user_id === p.id);
            const hasActiveStories = userStories.length > 0;
            const hasUnseen = hasActiveStories && userStories.some((s: any) => !s.views?.includes(currentUser?.id));
            const noteSnippet = userNote ? (userNote.content.substring(0, 10) + (userNote.content.length > 10 ? "..." : "")) : "";
            
            // Mock verify status for specific users
            const isVerified = p.full_name?.toLowerCase().includes("director") || p.full_name?.toLowerCase().includes("vfx") || p.full_name?.length % 2 === 0;

            return (
              <div key={p.id} className="flex flex-col items-center gap-1 shrink-0 relative group">
                
                {/* Note Bubble above profiles */}
                {userNote && (
                  <div 
                    onClick={() => {
                      setActiveNote(userNote);
                      setIsNoteViewerOpen(true);
                    }}
                    className="absolute -top-4.5 z-20 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl px-1.5 py-0.5 text-[8px] text-white shadow-lg whitespace-nowrap cursor-pointer hover:scale-105 transition-transform max-w-[64px] truncate"
                    title={userNote.content}
                  >
                    {userNote.song_name ? `🎵 ${noteSnippet}` : noteSnippet}
                    <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-1 h-1 bg-black/90 border-r border-b border-white/20 rotate-45" />
                  </div>
                )}

                {/* Avatar with colorful ring for unseen, gray for seen */}
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all relative ${
                    hasActiveStories 
                      ? hasUnseen
                        ? "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2.5px] animate-[pulse_1.5s_infinite]" 
                        : "bg-white/20 p-[1.5px]" 
                      : "border border-white/10 p-[1.5px]"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden flex items-center justify-center font-bold text-xs text-cyan-400">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      p.full_name?.substring(0, 2).toUpperCase() || "U"
                    )}
                  </div>

                  {/* Verified badges */}
                  {isVerified && (
                    <span className="absolute -top-1.5 -right-1 bg-blue-500 text-white rounded-full p-0.5 border border-black shadow-sm">
                      <CheckCircle2 className="w-2.5 h-2.5 fill-white text-blue-500" />
                    </span>
                  )}

                  {/* Green presence indicators */}
                  {onlineUsers.includes(p.id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121319] shadow-[0_0_6px_#22c55e]" />
                  )}
                </div>
                
                <span className="text-[9px] text-white/50 truncate max-w-[50px]">
                  {p.full_name || "User"}
                </span>
              </div>
            );
          })}
        </div>

        {/* CHAT LIST WITH SWIPE GESTURES & LONG PRESS */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 no-scrollbar">
          {filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-white/30">
              <span className="text-3xl">🎬</span>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-2">No conversations</p>
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const details = getChannelDetails(channel);
              const isActive = channel.id === activeChannelId;
              const hasUnread = channel.unread_count > 0;
              const isLocked = lockedChannels[channel.id];
              const labels = channelLabels[channel.id] || [];

              const swipeOffset = swipingChannelId === channel.id ? channelSwipeOffset : 0;

              return (
                <div 
                  key={channel.id} 
                  className="relative overflow-hidden rounded-[20px] bg-white/[0.02] border border-white/5 w-full h-[76px] transition-all duration-300"
                  onTouchStart={(e) => { startLongPressTimer(e, channel); handleChannelSwipeStart(e, channel.id); }}
                  onTouchMove={(e) => { cancelLongPressTimer(); handleChannelSwipeMove(e); }}
                  onTouchEnd={() => { cancelLongPressTimer(); handleChannelSwipeEnd(); }}
                  onMouseDown={(e) => { startLongPressTimer(e, channel); handleChannelSwipeStart(e, channel.id); }}
                  onMouseMove={(e) => { cancelLongPressTimer(); handleChannelSwipeMove(e); }}
                  onMouseUp={() => { cancelLongPressTimer(); handleChannelSwipeEnd(); }}
                  onMouseLeave={() => { cancelLongPressTimer(); handleChannelSwipeEnd(); }}
                >
                  
                  {/* Underneath Action Panel */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 z-0">
                    {/* Left Swiped (swipeOffset > 0): Reply & Mark Unread */}
                    <div className="flex gap-2 text-xs">
                      <button 
                        onClick={(e) => { e.stopPropagation(); resetSwipeStates(); setReplyingToMsg({ id: "mock", content: "Replying to chat..." }); }}
                        className="p-2.5 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 flex items-center justify-center"
                        title="Reply"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); resetSwipeStates(); alert("Marked unread"); }}
                        className="p-2.5 rounded-full bg-blue-500/25 border border-blue-400/40 text-blue-300 flex items-center justify-center"
                        title="Mark Unread"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Right Swiped (swipeOffset < 0): Archive, Delete, Pin */}
                    <div className="flex gap-2 text-xs ml-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); resetSwipeStates(); togglePinChannel(channel.id); }}
                        className="p-2.5 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-300 flex items-center justify-center"
                        title="Pin Chat"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); resetSwipeStates(); toggleArchiveChannel(channel.id); }}
                        className="p-2.5 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-300 flex items-center justify-center"
                        title="Archive Chat"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          resetSwipeStates();
                          if (confirm(`Delete DM with ${details.title}?`)) {
                            const { error } = await supabase.from("chat_channels").delete().eq("id", channel.id);
                            if (!error) {
                              if (isActive) setActiveChannelId("");
                              fetchChatChannels();
                            }
                          }
                        }}
                        className="p-2.5 rounded-full bg-red-500/25 border border-red-400/40 text-red-300 flex items-center justify-center"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Top sliding row card */}
                  <div
                    onClick={() => {
                      if (swipeOffset !== 0) {
                        resetSwipeStates();
                        return;
                      }
                      if (isLocked) {
                        setShowFaceIdLock(channel.id);
                      } else {
                        setActiveChannelId(channel.id);
                      }
                    }}
                    style={{ transform: `translateX(${swipeOffset}px)` }}
                    className={`absolute inset-0 z-10 flex items-center gap-3 px-3 py-2 text-left text-xs transition-all cursor-pointer bg-white/[0.04] rounded-[20px] border border-white/5 select-none ${
                      isActive ? "bg-cyan-500/10 border-cyan-400/30" : "hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="relative">
                      {details.isGroup ? (
                        <div className="w-10 h-10 rounded-[14px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                          {details.title.substring(0, 2).toUpperCase()}
                        </div>
                      ) : (
                        <img src={details.avatar || ""} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                      )}
                      {!details.isGroup && details.userId && onlineUsers.includes(details.userId) && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_4px_#22c55e]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate text-xs flex items-center gap-1">
                          {details.title}
                          {isLocked && <Lock className="w-2.5 h-2.5 text-white/40" />}
                          {channel.is_pinned && <Pin className="w-2.5 h-2.5 text-amber-400 fill-amber-400/20 rotate-45" />}
                        </span>
                        {labels.length > 0 && (
                          <div className="flex gap-1">
                            {labels.map(l => (
                              <span key={l} className="text-[7px] font-extrabold uppercase px-1 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">{l}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-[10px] truncate max-w-[150px] ${hasUnread ? "text-white font-bold" : "text-white/40"}`}>
                          {details.description}
                        </p>
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        )}
                      </div>
                    </div>

                  </div>
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
            <div className="px-4 md:px-6 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveChannelId("")}
                  className="p-1 hover:bg-white/5 rounded-lg text-white/50 hover:text-white md:hidden cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0 bg-neutral-800 flex items-center justify-center font-bold text-cyan-400">
                  {activeChannelDetails.avatar ? (
                    <img src={activeChannelDetails.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    activeChannelDetails.title.substring(0, 2).toUpperCase()
                  )}
                </div>
                
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate block">{activeChannelDetails.title}</h4>
                  <span className="text-[9px] text-green-400 font-semibold block">
                    {!activeChannelDetails.isGroup && activeChannelDetails.userId && onlineUsers.includes(activeChannelDetails.userId) ? "Active Now" : "Offline"}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 items-center">
                <button
                  onClick={() => setIsThemePickerOpen(true)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/5"
                  title="Choose Chat Theme & Wallpaper"
                >
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                </button>

                <button
                  onClick={() => setIsSharedMediaOpen(true)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/5"
                  title="Shared Media Drawer"
                >
                  <FolderIcon className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                {!activeChannelDetails.isGroup && (
                  <>
                    <button
                      onClick={() => handleInitiateCall("voice")}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/5"
                      title="Voice Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#22d3ee]" />
                    </button>
                    <button
                      onClick={() => handleInitiateCall("video")}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/5"
                      title="Video Call"
                    >
                      <Video className="w-3.5 h-3.5 text-[#22d3ee]" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsSidebar(!showDetailsSidebar)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pinned Messages Banner */}
            {currentMessages.filter((m: any) => m.is_pinned).length > 0 && (
              <div className="px-4 py-2 bg-black/80 border-b border-white/10 flex items-center justify-between text-xs text-white/60 z-10 backdrop-blur-sm shrink-0">
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
                <button 
                  onClick={() => {
                    const pins = currentMessages.filter((m: any) => m.is_pinned);
                    const latestPin = pins[pins.length - 1];
                    if (latestPin) unpinChatMessage(activeChannelId, latestPin.id);
                  }}
                  className="text-[10px] text-red-400 hover:underline cursor-pointer font-bold shrink-0 ml-2"
                >
                  Unpin
                </button>
              </div>
            )}

            {/* Chat Messages Log */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative transition-all duration-300 ${themeLogClass}`}>
              {activeWallpaper && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.08] bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${activeWallpaper})` }}
                />
              )}
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/30">
                  <span className="text-2xl animate-pulse">🎬</span>
                  <p className="text-[10px] uppercase font-bold tracking-widest mt-2">End-to-End Encrypted</p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isSender = msg.sender_id === currentUser?.id;
                  const decrypted = decryptedCache[msg.id] || msg.content;
                  
                  const otherUser = activeChannel.chat_channel_members?.find((m: any) => m.user_id !== currentUser?.id);
                  const isRead = otherUser && msg.read_by?.includes(otherUser.user_id);
                  const isDelivered = otherUser && msg.delivered_to?.includes(otherUser.user_id);

                  // Message Templates Resolver
                  const isPdf = decrypted.startsWith("[PDF]");
                  const isContact = decrypted.startsWith("[Contact]");
                  const isLocation = decrypted.startsWith("[Location]");
                  const isInvite = decrypted.startsWith("[Invite]");
                  const isTask = decrypted.startsWith("[Task]");
                  const isReel = decrypted.startsWith("[Reel]");
                  const isVoiceNote = decrypted.startsWith("[Voice Note]");
                  const isRepliedStory = decrypted.startsWith("📸 Replied to story:");

                  return (
                    <div 
                      key={msg.id} 
                      id={`msg-${msg.id}`}
                      className={`flex flex-col max-w-[75%] ${isSender ? "ml-auto items-end" : "mr-auto items-start"} group/msg relative z-10`}
                    >
                      {/* Floating action overlays */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity z-20"
                        style={isSender ? { right: '100%', marginRight: '8px' } : { left: '100%', marginLeft: '8px' }}
                      >
                        <button
                          onClick={() => msg.is_pinned ? unpinChatMessage(activeChannelId, msg.id) : pinChatMessage(activeChannelId, msg.id)}
                          className="p-1 rounded-full bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                          title={msg.is_pinned ? "Unpin message" : "Pin message"}
                        >
                          <Pin className={`w-3.5 h-3.5 ${msg.is_pinned ? "text-cyan-400 fill-cyan-400" : "text-white/40"}`} />
                        </button>
                        <button
                          onClick={() => {
                            setAiActionMessage(msg);
                            setIsAiMenuOpen(true);
                          }}
                          className="p-1 rounded-full bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-[#22d3ee] transition-colors cursor-pointer"
                          title="AI Actions"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* REDESIGNED REFLECTIVE LIQUID GLASS BUBBLES WITH EDGE HIGHLIGHTS */}
                      <div className={`p-3 rounded-[22px] text-xs relative border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all ${
                        isSender 
                          ? "bg-white/[0.08] border-white/20 text-white rounded-tr-none" 
                          : "bg-white/[0.04] border-white/10 text-white/80 rounded-tl-none"
                      }`}>
                        
                        {msg.is_pinned && (
                          <div className="flex items-center gap-1 text-[8px] text-cyan-400 uppercase tracking-widest font-bold mb-1.5">
                            <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                          </div>
                        )}

                        {/* RENDER TEMPLATES */}
                        {isPdf ? (
                          <div className="flex flex-col gap-2 p-2 bg-black/40 rounded-xl border border-white/10 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400">
                                <FileIcon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate text-[11px]">{decrypted.replace("[PDF]", "").trim()}</span>
                                <span className="text-[9px] text-white/40 block">3.4 MB • PDF Document</span>
                              </div>
                            </div>
                            <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1 mt-1">
                              <FileText className="w-3 h-3" /> Download Document
                            </a>
                          </div>
                        ) : isContact ? (
                          <div className="flex flex-col gap-2.5 p-2.5 bg-black/40 rounded-xl border border-white/10 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-xs">
                                {decrypted.replace("[Contact]", "").trim().substring(0,2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate text-[11px]">{decrypted.replace("[Contact]", "").trim()}</span>
                                <span className="text-[9px] text-white/40 block">Production Collaborator</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => alert("Mock Messaging Contact")}
                              className="w-full py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] text-white font-bold hover:bg-white/10 transition-all"
                            >
                              Message Contact
                            </button>
                          </div>
                        ) : isLocation ? (
                          <div className="flex flex-col gap-2 p-2 bg-black/40 rounded-xl border border-white/10 min-w-[220px]">
                            <div className="h-24 rounded-lg bg-neutral-800 overflow-hidden relative border border-white/5 flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-cyan-400 animate-bounce absolute" />
                              <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-black/80 flex items-end justify-center p-1">
                                <span className="text-[8px] text-white/30 font-mono">Mock Map Sandbox View</span>
                              </div>
                            </div>
                            <div>
                              <span className="font-bold text-white block text-[11px]">Location Pin</span>
                              <p className="text-[9px] text-white/50">{decrypted.replace("[Location]", "").trim()}</p>
                            </div>
                            <button 
                              onClick={() => alert("Open Mock Location Map")}
                              className="text-left text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
                            >
                              Open in Maps »
                            </button>
                          </div>
                        ) : isInvite ? (
                          <div className="flex flex-col gap-2.5 p-3 bg-gradient-to-br from-indigo-950/40 to-black/40 rounded-xl border border-white/10 min-w-[220px]">
                            <div className="border-b border-white/10 pb-2">
                              <span className="text-[8px] text-indigo-300 uppercase tracking-widest font-extrabold block">Calendar Event</span>
                              <h5 className="font-bold text-white text-[11px] mt-0.5">{decrypted.replace("[Invite]", "").trim()}</h5>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => alert("RSVP Accepted")} className="flex-1 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-[9px] font-bold">Accept</button>
                              <button onClick={() => alert("RSVP Declined")} className="flex-1 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-[9px] font-bold">Decline</button>
                            </div>
                          </div>
                        ) : isTask ? (
                          <div className="flex flex-col gap-2 p-2.5 bg-black/40 rounded-xl border border-white/10 min-w-[210px]">
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] text-amber-300 uppercase tracking-widest font-extrabold">Active Task</span>
                              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[7px] font-extrabold uppercase">High</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <input type="checkbox" className="mt-0.5 rounded border-white/20 bg-transparent text-cyan-500 focus:ring-0" />
                              <p className="text-[10px] text-white leading-tight">{decrypted.replace("[Task]", "").trim()}</p>
                            </div>
                          </div>
                        ) : isReel ? (
                          <div className="flex flex-col gap-2 p-2 bg-black/40 rounded-xl border border-white/10 min-w-[200px]">
                            <div className="h-32 rounded-lg bg-neutral-800 relative overflow-hidden border border-white/5 flex items-center justify-center">
                              <Play className="w-10 h-10 text-white opacity-80 z-10" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                                <span className="text-[9px] text-white font-mono">BTS Production Reel</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-white/50">
                              <span>15.2k Likes</span>
                              <span>284 Comments</span>
                            </div>
                          </div>
                        ) : isVoiceNote ? (
                          <div className="flex items-center gap-3 min-w-[220px] p-1.5 bg-black/40 rounded-xl">
                            <button onClick={() => alert("Play voice note")} className="p-2 bg-cyan-400 text-black rounded-full shadow-md">
                              <Play className="w-3.5 h-3.5 fill-black" />
                            </button>
                            
                            {/* Waveform animated display */}
                            <div className="flex-1 flex items-center gap-[2.5px] h-6">
                              {Array.from({ length: 18 }).map((_, i) => (
                                <span 
                                  key={i} 
                                  className="w-[2.5px] bg-cyan-400/40 rounded-full" 
                                  style={{ height: `${4 + Math.sin(i * 0.8) * 14}px` }} 
                                />
                              ))}
                            </div>
                            <span className="text-[9px] text-white/40 pr-2 font-mono">0:32</span>
                          </div>
                        ) : isRepliedStory ? (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {/* Replied story preview block */}
                            <div className="p-2 bg-white/[0.04] border border-white/10 rounded-xl flex items-center gap-2">
                              <div className="w-10 h-12 bg-neutral-800 rounded overflow-hidden flex-shrink-0 border border-white/5 flex items-center justify-center text-[10px] text-white/30">
                                📸
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] text-cyan-300 font-bold block uppercase tracking-wide">Story Preview</span>
                                <p className="text-[9px] text-white/50 truncate italic">"{decrypted.split("\n\n")[0].replace("📸 Replied to story:", "").replace(/"/g, "").trim()}"</p>
                              </div>
                            </div>
                            <p className="leading-relaxed font-semibold">{decrypted.split("\n\n")[1]}</p>
                          </div>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{decrypted}</p>
                        )}

                        {msg.attachment_url && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                            {msg.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                              <img src={msg.attachment_url} className="max-w-full max-h-48 object-cover" alt="" />
                            ) : (
                              <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/40 text-[10px] text-cyan-300 hover:underline">
                                <FileText className="w-4 h-4" />
                                <span>View Attachment File</span>
                              </a>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[8px] text-white/40 justify-end">
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isSender && (
                            <>
                              {isRead ? (
                                <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-cyan-400" /></span>
                              ) : isDelivered ? (
                                <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 text-white/30" /></span>
                              ) : (
                                <span title="Sent"><Check className="w-3.5 h-3.5 text-white/30" /></span>
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

            {/* In-app typing presence overlay */}
            {Object.entries(typingUsers).filter(([uid]) => uid !== currentUser?.id).map(([uid, t]) => (
              <div key={uid} className="px-6 py-1 bg-black/40 text-[9px] text-[#22d3ee] font-mono animate-pulse">
                ⌨️ {t.name} is {t.mode || "typing"}...
              </div>
            ))}

            {/* REDESIGNED CHAT INPUT COMPOSER (FLOATING APPLE GLASS INPUT BAR) */}
            <div className="p-4 bg-white/[0.01] border-t border-white/10 backdrop-blur-md relative">
              
              {/* AI smart reply suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="flex items-center gap-2 pb-2.5 overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[8px] uppercase tracking-widest text-[#22d3ee] font-mono shrink-0">AI Replies:</span>
                  {aiSuggestions.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSmartReply(reply)}
                      className="px-2.5 py-1 rounded-full bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[9px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                  <button
                    onClick={() => setAiSuggestions([])}
                    className="px-2 py-0.5 text-white/40 hover:text-white text-[8px] font-bold shrink-0 ml-auto"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Floating Input capsule */}
              <div className="relative max-w-4xl mx-auto w-full flex items-center gap-2 bg-white/[0.06] backdrop-blur-[24px] border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_32px_0_rgba(0,0,0,0.35)] rounded-[28px] px-3.5 py-2.5">
                
                <input
                  type="file"
                  id="media-attach-file"
                  className="hidden"
                  onChange={handleSelectFile}
                />

                {/* Plus button expanding grid of 14 attachments */}
                <div className="relative">
                  <button
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      isPlusMenuOpen ? "bg-cyan-400 text-black border-cyan-300 rotate-45" : "bg-white/10 border-white/5 text-white hover:bg-white/15"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {isPlusMenuOpen && (
                    <div className="absolute bottom-12 left-0 bg-[#0d0d11]/95 backdrop-blur-[32px] border border-white/15 rounded-[28px] p-4.5 shadow-2xl grid grid-cols-4 gap-4.5 z-50 animate-slideup w-[310px]">
                      {[
                        { icon: Camera, label: "Camera", color: "bg-red-500", click: () => { setIsPlusMenuOpen(false); document.getElementById("media-attach-file")?.click(); } },
                        { icon: ImageIcon, label: "Gallery", color: "bg-green-500", click: () => { setIsPlusMenuOpen(false); document.getElementById("media-attach-file")?.click(); } },
                        { icon: Mic, label: "Voice", color: "bg-purple-500", click: () => { setIsPlusMenuOpen(false); handleToggleVoiceRecord(); } },
                        { icon: Sticker, label: "GIF", color: "bg-yellow-500", click: () => { setIsPlusMenuOpen(false); setShowGifs(!showGifs); } },
                        { icon: Plus, label: "Sticker", color: "bg-orange-500", click: () => { setIsPlusMenuOpen(false); setShowEmojiPicker(!showEmojiPicker); } },
                        { icon: Smile, label: "Emoji", color: "bg-pink-500", click: () => { setIsPlusMenuOpen(false); setShowEmojiPicker(!showEmojiPicker); } },
                        { icon: FileText, label: "Files", color: "bg-blue-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[PDF] ProductionScript_v3.pdf"); } },
                        { icon: MapPin, label: "Location", color: "bg-teal-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[Location] Stage 4, Burbank Studio (34.1578, -118.3392)"); } },
                        { icon: MusicIcon, label: "Music", color: "bg-indigo-500", click: () => { setIsPlusMenuOpen(false); setIsNoteComposerOpen(true); } },
                        { icon: BarChart2, label: "Poll", color: "bg-lime-500", click: () => { setIsPlusMenuOpen(false); setIsStoryCreatorOpen(true); } },
                        { icon: FolderIcon, label: "Projects", color: "bg-rose-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[Task] Finalize VFX Scene 14 - High Priority - Due Jul 18"); } },
                        { icon: Calendar, label: "Calendar", color: "bg-cyan-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[Invite] Table Read: Episode 2 - Jul 15, 2026, 2:00 PM"); } },
                        { icon: Sparkles, label: "AI Assist", color: "bg-violet-500", click: () => { setIsPlusMenuOpen(false); setIsAiMenuOpen(true); } },
                        { icon: MicOff, label: "Microphone", color: "bg-emerald-500", click: () => { setIsPlusMenuOpen(false); handleToggleVoiceRecord(); } }
                      ].map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={index}
                            onClick={item.click}
                            className="flex flex-col items-center gap-1 hover:scale-105 transition-transform"
                          >
                            <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white shadow-md`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <span className="text-[8px] text-white/60 font-semibold">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Search or Ask AI..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTypingStatus(e.target.value.trim().length > 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-white/35 focus:ring-0"
                />

                {/* Emoji indicator */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 text-white/50 hover:text-white transition-colors"
                >
                  <Smile className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={isUploading}
                  className="p-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-full shadow-lg transition-transform hover:scale-105 flex-shrink-0"
                >
                  <Send className="w-4 h-4 fill-black" />
                </button>
              </div>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex gap-2 z-50">
                  {chatEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageInput(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Attachment Preview */}
              {attachmentPreview && (
                <div className="mt-2.5 p-2 bg-neutral-900 border border-white/10 rounded-xl w-fit flex items-center gap-3 relative z-10 mx-auto">
                  <img src={attachmentPreview} className="w-12 h-12 object-cover rounded-lg" alt="" />
                  <span className="text-[9px] text-white/50 font-mono truncate max-w-[120px]">{attachmentFile?.name}</span>
                  <button onClick={() => setAttachmentPreview("")} className="p-1 rounded bg-black/40 text-white font-bold text-[9px] absolute -top-1.5 -right-1.5">X</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/30">
            <span className="text-4xl animate-pulse">🎬</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mt-3">Liquid Glass Workspace</h3>
            <p className="text-[10px] text-white/40 mt-1">Select a collaborator or DM to begin premium messaging.</p>
          </div>
        )}
      </div>

      {/* 3. FACETIME HYBRID CALL SCREEN OVERLAY */}
      {activeCall && activeCall.status !== "idle" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-[32px] text-white animate-fadein">
          <div className="relative w-full max-w-lg h-full md:h-[85vh] bg-white/[0.04] border border-white/20 rounded-none md:rounded-[32px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.25)] flex flex-col justify-between p-6">
            
            {/* Blinking recording status dot */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest z-50">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Recording FaceTime ({formatTimer(recordingSeconds)})</span>
              </div>
            )}

            {/* Video displays or profile display */}
            <div className="flex-1 w-full flex items-center justify-center relative rounded-[24px] overflow-hidden bg-black/40 border border-white/5">
              
              {activeCall.status === "connected" && activeCall.type === "video" ? (
                <div className="w-full h-full relative">
                  
                  {/* Remote Feed */}
                  <video
                    id="remote-video-feed"
                    autoPlay
                    playsInline
                    style={{ filter: getFilterStyle() }}
                    className="w-full h-full object-cover"
                  />

                  {/* Local feed PIP */}
                  <div className="absolute bottom-4 right-4 w-28 h-40 bg-neutral-900 rounded-[18px] overflow-hidden border border-white/20 shadow-2xl">
                    <video
                      id="local-video-feed"
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <span className="absolute -inset-4 rounded-full bg-cyan-400/10 animate-ping" />
                    <div className="w-24 h-24 rounded-full border-2 border-cyan-400 bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-cyan-400 text-3xl shadow-2xl">
                      {activeCall.partnerAvatar ? (
                        <img src={activeCall.partnerAvatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        activeCall.partnerName.substring(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{activeCall.partnerName}</h2>
                    <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                      {activeCall.status === "ringing-in" ? "Incoming FaceTime..." : "Ringing..."}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <audio id="remote-audio-feed" autoPlay />

            {/* Interactive Call Controls Bar */}
            <div className="mt-4 space-y-4">
              
              {/* FaceTime Settings Overlay */}
              {activeCall.status === "connected" && (
                <div className="flex justify-center gap-2 flex-wrap">
                  <button 
                    onClick={() => setBgBlur(!bgBlur)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${bgBlur ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300" : "bg-white/5 border-white/10 text-white/70"}`}
                  >
                    Portrait Blur
                  </button>
                  <button 
                    onClick={() => setNoiseCancel(!noiseCancel)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${noiseCancel ? "bg-green-500/20 border-green-400/40 text-green-300" : "bg-white/5 border-white/10 text-white/70"}`}
                  >
                    Noise Cancel: {noiseCancel ? "ON" : "OFF"}
                  </button>
                  <button 
                    onClick={toggleRecording}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${isRecording ? "bg-red-500/20 border-red-400/40 text-red-300" : "bg-white/5 border-white/10 text-white/70"}`}
                  >
                    Record
                  </button>
                  
                  {activeCall.type === "video" && (
                    <select
                      value={callFilter}
                      onChange={(e: any) => setCallFilter(e.target.value)}
                      className="bg-black/60 border border-white/15 rounded-full px-3 py-1 text-[10px] font-bold text-white focus:outline-none"
                    >
                      <option value="none">Normal Filter</option>
                      <option value="cinematic">Cinematic Warm</option>
                      <option value="noir">Noir/Mono</option>
                      <option value="cyberpunk">Cyberpunk</option>
                    </select>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4">
                {activeCall.status === "ringing-in" ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    {/* Slide to answer */}
                    <div className="w-64 h-12 bg-white/5 border border-white/15 rounded-full relative flex items-center justify-between px-2 overflow-hidden shadow-inner">
                      <div
                        className="absolute inset-y-1 left-1 bg-green-500 text-black font-bold text-[10px] uppercase tracking-widest rounded-full flex items-center justify-center shadow-lg transition-transform cursor-grab"
                        style={{ transform: `translateX(${swipeX}px)`, width: "100px" }}
                        onTouchStart={handleTouchStartSwipe}
                        onTouchMove={handleTouchMoveSwipe}
                        onTouchEnd={handleTouchEndSwipe}
                      >
                        Answer »
                      </div>
                      <span className="w-full text-center text-[9px] uppercase tracking-wider text-white/30 pl-24 pointer-events-none select-none">
                        Swipe to Answer
                      </span>
                    </div>

                    <button 
                      onClick={handleHangUp}
                      className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4.5 items-center">
                    <button 
                      onClick={handleToggleMute}
                      className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                        isMuted ? "bg-red-500/20 border-red-500/30 text-red-300" : "bg-white/10 border-white/5 text-white"
                      }`}
                    >
                      {isMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                    </button>
                    <button 
                      onClick={handleHangUp}
                      className="w-13 h-13 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                    {activeCall.type === "video" && (
                      <button 
                        onClick={handleToggleCamera}
                        className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                          isCameraOff ? "bg-red-500/20 border-red-500/30 text-red-300" : "bg-white/10 border-white/5 text-white"
                        }`}
                      >
                        {isCameraOff ? <VideoOff className="w-4.5 h-4.5" /> : <Video className="w-4.5 h-4.5" />}
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 4. NEW MESSAGE COMPOSER MODAL */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[380px] bg-neutral-900 border border-white/10 rounded-[28px] p-5 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Create Conversation</span>
              <button onClick={() => setIsNewChatOpen(false)} className="p-1 rounded bg-white/5 text-white font-bold cursor-pointer">X</button>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-white/50 mb-1">Select Collaborator</label>
              <select
                onChange={async (e) => {
                  const id = e.target.value;
                  if (!id) return;
                  setIsNewChatOpen(false);
                  const chanId = await createChatChannel("Direct Message", false, [id]);
                  if (chanId) setActiveChannelId(chanId);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
              >
                <option value="">Select User Profile</option>
                {profiles.filter(p => p.id !== currentUser?.id).map(p => (
                  <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD ACTIVITY (NOTE/STORY) CHOICE MODAL --- */}
      {isCreatorChoiceOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[320px] bg-neutral-900 border border-white/10 rounded-[28px] p-5 shadow-2xl text-white space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Create Activity</span>
              <button onClick={() => setIsCreatorChoiceOpen(false)} className="p-1 rounded hover:bg-white/5 text-white/60 hover:text-white font-bold cursor-pointer">X</button>
            </div>
            <p className="text-[10px] text-white/50">Share a 60-character Note with music track, or upload an image/video Story!</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => { setIsCreatorChoiceOpen(false); setIsNoteComposerOpen(true); }}
                className="flex flex-col items-center justify-center p-4 rounded-[20px] bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-center gap-1.5 transition-all"
              >
                <span className="text-2xl">💬</span>
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">Write Note</span>
              </button>
              <button
                onClick={() => { setIsCreatorChoiceOpen(false); setIsStoryCreatorOpen(true); }}
                className="flex flex-col items-center justify-center p-4 rounded-[20px] bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-center gap-1.5 transition-all"
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
          <div className="w-[420px] bg-[#121319] border border-white/10 rounded-[28px] p-5 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Compose Note</span>
              <button onClick={() => {
                setIsNoteComposerOpen(false);
                setSelectedSong(null);
                setItunesSearchQuery("");
                setItunesSongs([]);
                setNoteContentInput("");
              }} className="p-1 rounded hover:bg-white/5 text-white/50 hover:text-white font-bold cursor-pointer">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-white/50 mb-1">Your Note (Max 60 chars)</label>
                <textarea
                  maxLength={60}
                  rows={2}
                  value={noteContentInput}
                  placeholder="What's on your mind?..."
                  onChange={(e) => setNoteContentInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#22d3ee] resize-none"
                />
                <span className="text-[9px] text-white/40 font-mono block text-right mt-1">
                  {noteContentInput.length}/60
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-white/50 mb-1">Audience</label>
                <select
                  value={noteAudience}
                  onChange={(e: any) => setNoteAudience(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                >
                  <option value="everyone">Everyone</option>
                  <option value="close_friends">Close Friends</option>
                </select>
              </div>

              {/* iTunes attachment */}
              <div className="border border-white/5 rounded-2xl p-3 bg-black/30 space-y-3">
                <label className="block text-[10px] uppercase text-white/50 font-bold">Attach Music (Optional)</label>
                {selectedSong ? (
                  <div className="flex items-center justify-between p-2 bg-neutral-900 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <img src={selectedSong.artwork} className="w-8 h-8 rounded object-cover" alt="" />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">{selectedSong.name}</span>
                        <span className="text-[9px] text-white/40 block truncate">{selectedSong.artist}</span>
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
                        className="px-2 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold"
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
                      <div className="text-center py-2 flex items-center justify-center gap-1.5 text-[10px] text-white/40 font-mono uppercase">
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
                                <span className="text-[8px] text-white/40 block truncate">{song.artist}</span>
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
                  if (!noteContentInput.trim()) return;
                  await addNote(noteContentInput, selectedSong, noteAudience);
                  setIsNoteComposerOpen(false);
                  setSelectedSong(null);
                  setNoteContentInput("");
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-br from-[#22d3ee] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black font-bold text-xs cursor-pointer"
              >
                Share Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD STORY MODAL WITH STAMPS OVERLAYS --- */}
      {isStoryCreatorOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="w-[420px] bg-[#121319] border border-white/10 rounded-[28px] p-5 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Create Story</span>
              <button onClick={() => {
                setIsStoryCreatorOpen(false);
                setStoryFile(null);
                setStoryPreview("");
                setSelectedSong(null);
                setStoryCaptionInput("");
                setStoryStampType("none");
                setStoryStampData({});
              }} className="p-1 rounded hover:bg-white/5 text-white/50 hover:text-white font-bold cursor-pointer">X</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-white/50 mb-1">Select Media</label>
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
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 h-32 bg-black flex items-center justify-center">
                    {storyMediaType === "video" ? (
                      <video src={storyPreview} className="w-full h-full object-cover" muted autoPlay loop />
                    ) : (
                      <img src={storyPreview} className="w-full h-full object-cover" alt="" />
                    )}
                    <button
                      onClick={() => { setStoryFile(null); setStoryPreview(""); }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black p-1.5 rounded-full text-white text-[10px] font-bold"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => document.getElementById("story-media-upload")?.click()}
                    className="w-full border border-dashed border-white/20 hover:border-[#22d3ee]/40 rounded-2xl h-20 flex flex-col items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Choose File</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase text-white/50 mb-1">Caption</label>
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={storyCaptionInput}
                  onChange={(e) => setStoryCaptionInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>

              {/* STAMPS ATTACHMENT OPTIONS */}
              <div className="space-y-2 border-t border-white/5 pt-2">
                <label className="block text-[10px] uppercase text-white/50 mb-1">Add Stamp (Optional)</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["none", "poll", "link", "countdown", "slider"] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setStoryStampType(t)}
                      className={`py-1 rounded-xl text-[9px] font-bold capitalize transition-all border ${
                        storyStampType === t 
                          ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {storyStampType === "poll" && (
                  <div className="space-y-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <input 
                      type="text" 
                      placeholder="Poll Question?" 
                      value={storyStampData.question || ""} 
                      onChange={(e) => setStoryStampData({ ...storyStampData, question: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white" 
                    />
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Option A" 
                        value={storyStampData.optA || ""} 
                        onChange={(e) => setStoryStampData({ ...storyStampData, optA: e.target.value })}
                        className="w-1/2 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Option B" 
                        value={storyStampData.optB || ""} 
                        onChange={(e) => setStoryStampData({ ...storyStampData, optB: e.target.value })}
                        className="w-1/2 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-white" 
                      />
                    </div>
                  </div>
                )}

                {storyStampType === "link" && (
                  <div className="space-y-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <input 
                      type="text" 
                      placeholder="Link Label" 
                      value={storyStampData.label || ""} 
                      onChange={(e) => setStoryStampData({ ...storyStampData, label: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white" 
                    />
                    <input 
                      type="text" 
                      placeholder="https://example.com" 
                      value={storyStampData.url || ""} 
                      onChange={(e) => setStoryStampData({ ...storyStampData, url: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white" 
                    />
                  </div>
                )}

                {storyStampType === "countdown" && (
                  <div className="space-y-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <input 
                      type="text" 
                      placeholder="Countdown Label" 
                      value={storyStampData.title || ""} 
                      onChange={(e) => setStoryStampData({ ...storyStampData, title: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white" 
                    />
                  </div>
                )}

                {storyStampType === "slider" && (
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <input 
                      type="text" 
                      placeholder="Choose Slider Emoji (e.g. 🔥)" 
                      value={storyStampData.emoji || "🔥"} 
                      onChange={(e) => setStoryStampData({ ...storyStampData, emoji: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white text-center" 
                    />
                  </div>
                )}
              </div>

              <button
                onClick={async () => {
                  if (!storyFile) {
                    alert("Please select media first.");
                    return;
                  }
                  setIsUploading(true);
                  try {
                    const mediaUrl = await uploadChatAttachment(storyFile);
                    
                    // encode stamp data into caption JSON
                    const payload = {
                      textCaption: storyCaptionInput,
                      stamp: storyStampType !== "none" ? { type: storyStampType, data: storyStampData } : null
                    };

                    await addStory(mediaUrl, storyMediaType, JSON.stringify(payload), selectedSong, storyAudience);
                    setIsStoryCreatorOpen(false);
                    setStoryFile(null);
                    setStoryPreview("");
                    setStoryCaptionInput("");
                    setStoryStampType("none");
                    setStoryStampData({});
                  } catch (e: any) {
                    alert("Media upload failed: " + e.message);
                  } finally {
                    setIsUploading(false);
                  }
                }}
                disabled={isUploading}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-br from-[#22d3ee] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black font-bold text-xs flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Post Story</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VISUALIZE NOTE VIEW MODAL (APPLE MUSIC MINI PLAYER STYLING) --- */}
      {isNoteViewerOpen && activeNote && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fadein">
          <div className="w-[380px] bg-[#0c0d12]/90 border border-white/20 rounded-[32px] p-6 shadow-2xl text-white text-center space-y-5 relative">
            <button 
              onClick={() => {
                setIsNoteViewerOpen(false);
                setActiveNote(null);
                if (audioPreviewRef.current) audioPreviewRef.current.pause();
                setPlayingSongId(null);
              }} 
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-neutral-800 flex items-center justify-center text-[#22d3ee] font-bold text-sm">
                {activeNote.profiles?.avatar_url ? (
                  <img src={activeNote.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  activeNote.profiles?.full_name?.substring(0, 2).toUpperCase() || "UN"
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{activeNote.profiles?.full_name || "Workspace Member"}</h4>
                <span className="text-[9px] text-white/40 font-mono">Shared Note</span>
              </div>
            </div>

            {/* Note text bubble */}
            <div className="relative p-4 rounded-[20px] bg-white/[0.05] border border-white/10 shadow-lg text-xs text-white leading-relaxed">
              "{activeNote.content}"
              <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/[0.05] border-r border-b border-white/10 rotate-45" />
            </div>

            {/* APPLE-STYLED MINI PLAYER */}
            {activeNote.song_name && (
              <div className="p-4 bg-white/[0.05] border border-white/15 rounded-[24px] space-y-4">
                
                {/* Album artwork */}
                <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                  <img 
                    src={activeNote.song_artwork || ""} 
                    className={`w-full h-full object-cover ${playingSongId === activeNote.song_id ? "animate-spin-slow" : ""}`}
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 justify-center">
                    <MusicIcon className="w-5 h-5 text-cyan-300" />
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-xs font-bold text-white block truncate">{activeNote.song_name}</span>
                  <span className="text-[10px] text-white/50 block truncate">{activeNote.song_artist}</span>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-end justify-center gap-[3px] h-8 my-2">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-[2.5px] bg-cyan-400 rounded-full transition-all duration-300 ${
                        playingSongId === activeNote.song_id ? "animate-wave" : "h-1.5"
                      }`}
                      style={{
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: `${0.5 + Math.random() * 0.7}s`
                      }}
                    />
                  ))}
                </div>

                {/* Real Time Progress Bar */}
                <div className="space-y-1">
                  <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                    <div 
                      className="absolute top-0 left-0 h-full bg-cyan-400 transition-all duration-100" 
                      style={{ width: `${(audioTime / audioDuration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-white/40 font-mono">
                    <span>{formatTimer(Math.floor(audioTime))}</span>
                    <span>{formatTimer(Math.floor(audioDuration))}</span>
                  </div>
                </div>

                {/* Lyrics Visualizer */}
                <div className="h-20 overflow-y-auto no-scrollbar border-t border-white/5 pt-2 text-[10px] font-medium text-white/40 space-y-1.5 text-center">
                  {(() => {
                    const lName = activeNote.song_name.toLowerCase();
                    let lyrics = MOCK_LYRICS.default;
                    if (lName.includes("blind")) lyrics = MOCK_LYRICS.blinding;
                    else if (lName.includes("stay")) lyrics = MOCK_LYRICS.stay;
                    else if (lName.includes("starboy")) lyrics = MOCK_LYRICS.starboy;

                    // Compute active lyric line based on current play time
                    const activeIndex = Math.min(lyrics.length - 1, Math.floor((audioTime / audioDuration) * lyrics.length));

                    return lyrics.map((line, idx) => (
                      <p 
                        key={idx} 
                        className={`transition-all duration-300 ${idx === activeIndex ? "text-cyan-300 scale-105 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-white/40"}`}
                      >
                        {line}
                      </p>
                    ));
                  })()}
                </div>

                {/* Playback Controls */}
                <div className="flex justify-center items-center gap-4 border-t border-white/5 pt-3">
                  <button
                    onClick={() => handlePlayPreview({
                      id: activeNote.song_id,
                      preview_url: activeNote.song_preview_url
                    })}
                    className="p-3.5 rounded-full bg-cyan-400 text-black hover:scale-105 transition-transform shadow-lg cursor-pointer"
                  >
                    {playingSongId === activeNote.song_id ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
                  </button>
                </div>

              </div>
            )}

            {activeNote.user_id === currentUser?.id && (
              <button
                onClick={async () => {
                  if (confirm("Delete note?")) {
                    await deleteNote(activeNote.id);
                    setIsNoteViewerOpen(false);
                    setActiveNote(null);
                  }
                }}
                className="text-[10px] text-red-400 hover:underline font-bold mt-2 cursor-pointer block mx-auto"
              >
                Delete Note
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- DYNAMIC STORIES VIEWER MODAL WITH CUSTOM STAMPS --- */}
      {isStoryViewerOpen && activeStoryUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 text-white">
          {(() => {
            const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
            if (userStories.length === 0) return null;
            const activeStory = userStories[activeStoryIndex];
            const author = activeStory.profiles;
            const hasLiked = activeStory.likes?.includes(currentUser?.id);

            // Parse caption JSON
            let captionText = activeStory.caption || "";
            let stamp: any = null;
            try {
              if (activeStory.caption && activeStory.caption.startsWith("{")) {
                const parsed = JSON.parse(activeStory.caption);
                captionText = parsed.textCaption;
                stamp = parsed.stamp;
              }
            } catch (e) {}

            return (
              <div className="w-full max-w-md h-full md:h-[90vh] flex flex-col justify-between bg-neutral-950 border border-white/10 md:rounded-[32px] overflow-hidden relative shadow-2xl">
                
                {/* Progress bars */}
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

                {/* Header */}
                <div className="absolute top-4 inset-x-0 px-4 pt-2 z-20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-neutral-800 flex items-center justify-center font-bold text-xs text-cyan-400">
                      {author?.avatar_url ? (
                        <img src={author.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        author?.full_name?.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">{author?.full_name || "Collaborator"}</span>
                      <span className="text-[8px] text-white/40 font-mono">{new Date(activeStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <button onClick={handleCloseStoryViewer} className="p-1 rounded-full bg-black/40 hover:bg-black/80 text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Click zones */}
                <div className="absolute inset-y-16 inset-x-0 z-10 flex">
                  <div onClick={handlePrevStory} className="w-1/3 h-full cursor-w-resize" />
                  <div 
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    className="w-1/3 h-full"
                  />
                  <div onClick={handleNextStory} className="w-1/3 h-full cursor-e-resize" />
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden select-none">
                  {activeStory.media_type === "video" ? (
                    <video src={activeStory.media_url} className="w-full h-full object-contain pointer-events-none" autoPlay muted loop />
                  ) : (
                    <img src={activeStory.media_url} className="w-full h-full object-contain pointer-events-none" alt="" />
                  )}

                  {/* INTERACTIVE CUSTOM STAMP OVERLAY */}
                  {stamp && (
                    <div className="absolute top-1/3 inset-x-8 z-20 flex flex-col items-center">
                      
                      {stamp.type === "poll" && (
                        <div className="w-56 bg-black/70 backdrop-blur-md border border-white/10 rounded-[20px] p-3.5 text-center space-y-2 shadow-2xl">
                          <span className="text-[10px] text-white/50 uppercase font-mono tracking-wider">Story Poll</span>
                          <p className="text-xs font-bold text-white">{stamp.data.question || "Do you agree?"}</p>
                          
                          {pollVoted ? (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span>{stamp.data.optA || "Option A"}: 65%</span>
                                <span>{stamp.data.optB || "Option B"}: 35%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400" style={{ width: "65%" }} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPollVoted("A"); }}
                                className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold border border-white/5"
                              >
                                {stamp.data.optA || "A"}
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPollVoted("B"); }}
                                className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold border border-white/5"
                              >
                                {stamp.data.optB || "B"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {stamp.type === "link" && (
                        <a 
                          href={stamp.data.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 py-2 px-4 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 rounded-full text-xs font-bold text-cyan-300 hover:scale-105 transition-transform"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>{stamp.data.label || "Visit Link"}</span>
                        </a>
                      )}

                      {stamp.type === "countdown" && (
                        <div className="bg-black/75 backdrop-blur-md border border-white/10 rounded-[20px] p-3 text-center space-y-1 w-48 shadow-2xl">
                          <span className="text-[9px] text-white/50 uppercase tracking-widest block font-bold">{stamp.data.title || "Countdown"}</span>
                          <div className="flex justify-center gap-2 text-xs font-mono font-bold text-cyan-300">
                            <span>18h</span>:<span>45m</span>:<span>20s</span>
                          </div>
                        </div>
                      )}

                      {stamp.type === "slider" && (
                        <div className="w-48 bg-black/70 backdrop-blur-md border border-white/10 rounded-[20px] p-3 text-center space-y-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[18px] block">{stamp.data.emoji || "🔥"}</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={emojiSliderVal} 
                            onChange={(e) => setEmojiSliderVal(Number(e.target.value))}
                            className="w-full accent-cyan-400 bg-white/10 h-1 rounded-full cursor-pointer" 
                          />
                        </div>
                      )}

                    </div>
                  )}

                  {/* Attached song sticker */}
                  {activeStory.song_name && (
                    <div className="absolute bottom-16 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-2 flex items-center justify-between z-20">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={activeStory.song_artwork} className="w-8 h-8 rounded object-cover border border-white/5 animate-spin" style={{ animationDuration: '4s' }} alt="" />
                        <div className="text-left min-w-0">
                          <span className="text-[10px] font-bold text-white block truncate">{activeStory.song_name}</span>
                          <span className="text-[8px] text-white/40 block truncate">{activeStory.song_artist}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePlayPreview({ id: activeStory.song_id, preview_url: activeStory.song_preview_url })}
                        className="p-1 rounded-full bg-white/10 text-white hover:bg-white/20 shrink-0 cursor-pointer"
                      >
                        {playingSongId === activeStory.song_id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Caption */}
                  {captionText && (
                    <div className="absolute bottom-4 inset-x-4 bg-black/40 p-2 text-center text-xs text-white z-20 pointer-events-none select-none rounded-xl border border-white/5">
                      {captionText}
                    </div>
                  )}
                </div>

                {/* Replies & interactive footers */}
                <div className="p-3 border-t border-white/10 bg-[#09090B] z-20 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => likeStory(activeStory.id)}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                    >
                      <Heart className={`w-5 h-5 ${hasLiked ? "text-red-500 fill-red-500" : "text-white"}`} />
                    </button>
                    
                    <input
                      type="text"
                      placeholder="Send a quick reply..."
                      value={quickReplyText}
                      onChange={(e) => setQuickReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendQuickReply(); }}
                      className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                    />
                    <button onClick={handleSendQuickReply} className="p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold cursor-pointer">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {activeStory.user_id === currentUser?.id && (
                    <div className="border-t border-white/5 pt-2">
                      <span className="text-[8px] uppercase tracking-widest text-white/40 block mb-1">Seen by ({activeStory.views?.length || 0})</span>
                      {activeStory.views && activeStory.views.length > 0 ? (
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                          {activeStory.views.map((v: any, index: number) => (
                            <div key={index} className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-neutral-800 flex items-center justify-center text-[9px] shrink-0" title={v.full_name}>
                              {v.avatar_url ? <img src={v.avatar_url} className="w-full h-full object-cover" alt="" /> : v.full_name?.substring(0, 2).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[8px] text-white/30">No views yet</span>
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
          <div className="w-[360px] bg-neutral-900 border border-white/10 rounded-[28px] p-5 shadow-2xl space-y-4 text-white relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chat Wallpaper & Theme</span>
              <button onClick={() => setIsThemePickerOpen(false)} className="p-1 rounded hover:bg-white/5 text-white/50 hover:text-white font-bold cursor-pointer">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-white/50 mb-1.5">Theme Selection</label>
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
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${
                        activeTheme === theme.name 
                          ? "border-[#22d3ee] bg-white/5 text-white" 
                          : "border-white/5 bg-black/40 text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${theme.color} mb-1 border`} />
                      <span className="font-semibold block">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase text-white/50">Wallpaper Image Link</label>
                <input
                  type="text"
                  placeholder="https://example.com/wallpaper.jpg"
                  value={activeWallpaper || ""}
                  onChange={async (e) => {
                    if (activeChannelId) {
                      await updateChatChannelTheme(activeChannelId, activeTheme, e.target.value || undefined);
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22d3ee]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SHARED MEDIA DRAWER --- */}
      {isSharedMediaOpen && (
        <div className="fixed inset-y-0 right-0 z-[100] w-80 bg-neutral-950 border-l border-white/15 shadow-2xl flex flex-col text-white animate-slide-in">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#121319]/80 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee] flex items-center gap-1.5">
              <FolderIcon className="w-4 h-4" /> Shared Media
            </span>
            <button onClick={() => setIsSharedMediaOpen(false)} className="p-1 rounded hover:bg-white/5 text-white/50 hover:text-white font-bold cursor-pointer">X</button>
          </div>

          <div className="grid grid-cols-5 border-b border-white/5 text-[8px] uppercase tracking-wider text-center font-bold text-white/50">
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

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/10 no-scrollbar">
            {currentMessages.filter((m: any) => {
              const decrypted = decryptedCache[m.id] || m.content || "";
              if (sharedMediaTab === "photos") return m.attachment_url && m.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)/i);
              if (sharedMediaTab === "videos") return m.attachment_url && m.attachment_url.match(/\.(mp4|webm|ogg|mov)/i);
              if (sharedMediaTab === "audios") return m.attachment_url && m.attachment_url.match(/\.(mp3|wav|ogg|aac|m4a)/i);
              if (sharedMediaTab === "links") return decrypted.match(/https?:\/\/[^\s]+/i);
              if (sharedMediaTab === "files") return m.attachment_url && !m.attachment_url.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm|ogg|mov|mp3|wav|aac|m4a)/i);
              return false;
            }).map((m: any) => {
              const decrypted = decryptedCache[m.id] || m.content || "";
              const dateStr = new Date(m.created_at).toLocaleDateString([], { month: "short", day: "numeric" });
              return (
                <div key={m.id} className="p-2.5 rounded-xl bg-neutral-900 border border-white/5">
                  <span className="text-[8px] text-white/40 block mb-1 font-mono">{dateStr}</span>
                  {m.attachment_url ? (
                    <a href={m.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-300 hover:underline truncate block">
                      {m.attachment_url.split("/").pop()}
                    </a>
                  ) : (
                    <p className="text-xs italic">"{decrypted}"</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- INLINE AI ACTIONS DIALOG --- */}
      {isAiMenuOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-[360px] bg-neutral-900 border border-white/10 rounded-[28px] p-5 shadow-2xl space-y-4 text-white relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">AI DM Assistant</span>
              </div>
              <button onClick={() => { setIsAiMenuOpen(false); setAiActionMessage(null); }} className="p-1 rounded hover:bg-white/5 text-white/50 hover:text-white font-bold cursor-pointer">X</button>
            </div>

            {aiLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-[#22d3ee] animate-spin" />
                <span className="text-[10px] uppercase font-mono text-white/40">Thinking...</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {aiActionMessage ? (
                  <>
                    <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 mb-3">
                      <span className="text-[9px] uppercase tracking-wider text-white/50 block mb-1">Message Context:</span>
                      <p className="text-[10px] text-white italic truncate">"{decryptedCache[aiActionMessage.id] || aiActionMessage.content}"</p>
                    </div>

                    <button
                      onClick={async () => {
                        setAiLoading(true);
                        await new Promise(r => setTimeout(r, 1000));
                        setAiResponseText(`Smart Suggestion: "I agree, let's proceed with that."`);
                        setShowAiResponseModal(true);
                        setAiLoading(false);
                        setIsAiMenuOpen(false);
                        setAiActionMessage(null);
                      }}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-[#22d3ee]/20 rounded-xl text-xs transition-colors flex items-center justify-between"
                    >
                      <span>Suggest Smart Reply</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    <div className="border-t border-white/5 my-2 pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Translate To:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {["English", "Spanish", "French", "German", "Japanese"].map(lang => (
                          <button
                            key={lang}
                            onClick={() => handleTranslateMessage(aiActionMessage, lang)}
                            className="px-2 py-1.5 bg-white/5 hover:bg-cyan-500/20 rounded-md text-[10px] text-left transition-colors"
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
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-xs transition-colors flex items-center justify-between"
                    >
                      <span>Suggest Smart Replies</span>
                      <span className="text-[10px] text-[#22d3ee] font-mono">Pills</span>
                    </button>

                    <button
                      onClick={summarizeThread}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-xs transition-colors flex items-center justify-between"
                    >
                      <span>Summarize Chat Thread</span>
                      <span className="text-[10px] text-[#22d3ee] font-mono">Recent</span>
                    </button>
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
            <div className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto no-scrollbar">
              {aiResponseText}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
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

      {/* --- LIQUID GLASS LONG PRESS BOTTOM SHEET --- */}
      {activeBottomSheetChannel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[115] flex items-end justify-center transition-opacity duration-300" onClick={() => setActiveBottomSheetChannel(null)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0d0d12]/90 backdrop-blur-[32px] border-t border-white/20 rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] z-[120] space-y-4 text-white"
          >
            {/* Sheet Handle bar */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2 cursor-pointer" onClick={() => setActiveBottomSheetChannel(null)} />
            
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400">
                {getChannelDetails(activeBottomSheetChannel).title.substring(0,2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">{getChannelDetails(activeBottomSheetChannel).title}</h4>
                <p className="text-[10px] text-white/50">{getChannelDetails(activeBottomSheetChannel).description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              
              <button 
                onClick={() => { togglePinChannel(activeBottomSheetChannel.id); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all"
              >
                <Pin className="w-4 h-4 text-amber-400" />
                <span>{activeBottomSheetChannel.is_pinned ? "Unpin Chat" : "Pin Chat"}</span>
              </button>

              <button 
                onClick={() => { alert("Marked read/unread"); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Mark Unread</span>
              </button>

              <button 
                onClick={() => { setActiveFilter(activeFilter === "Projects" ? "Primary" : "Projects"); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all"
              >
                <Users className="w-4 h-4 text-teal-400" />
                <span>Move Category</span>
              </button>

              <button 
                onClick={() => { toggleArchiveChannel(activeBottomSheetChannel.id); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all"
              >
                <Archive className="w-4 h-4 text-purple-400" />
                <span>Archive Chat</span>
              </button>

              <button 
                onClick={() => { toggleMuteChannel(activeBottomSheetChannel.id); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all"
              >
                <VolumeX className="w-4 h-4 text-red-400" />
                <span>Mute Notifications</span>
              </button>

              <button 
                onClick={() => { toggleLockChannel(activeBottomSheetChannel.id); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>{lockedChannels[activeBottomSheetChannel.id] ? "Unlock Chat" : "Lock Chat (FaceID)"}</span>
              </button>

              <button 
                onClick={() => { handleChannelLabelAdd(activeBottomSheetChannel.id, "Production"); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all"
              >
                <Tag className="w-4 h-4 text-rose-400" />
                <span>Label: Production</span>
              </button>

              <button 
                onClick={() => { handleChannelLabelAdd(activeBottomSheetChannel.id, "Review"); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all"
              >
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>Label: Review</span>
              </button>

              <button 
                onClick={() => { alert("Reminder Scheduled in 1 Hour"); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-left transition-all col-span-2 justify-center"
              >
                <Bell className="w-4 h-4 text-yellow-400" />
                <span>Set Reminder (1 Hour)</span>
              </button>

              <button 
                onClick={() => { alert("Reported to Crew Safety"); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/30 rounded-2xl hover:bg-red-950/40 text-left transition-all text-red-300"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Crew</span>
              </button>

              <button 
                onClick={() => { alert("Member Blocked"); setActiveBottomSheetChannel(null); }}
                className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/30 rounded-2xl hover:bg-red-950/40 text-left transition-all text-red-300"
              >
                <Ban className="w-4 h-4" />
                <span>Block Member</span>
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatView;

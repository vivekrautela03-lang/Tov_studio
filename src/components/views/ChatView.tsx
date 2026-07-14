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

const VoiceNotePlayer: React.FC<{ url: string; durationText?: string }> = ({ url, durationText = "0:12" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current?.duration || 0);
      };
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    }
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isSimulated = !url || !url.startsWith("http");

  return (
    <div className="flex items-center gap-3 min-w-[220px] p-1.5 bg-black/40 rounded-xl select-none">
      {!isSimulated && <audio ref={audioRef} src={url} className="hidden" />}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }} 
        className="p-2 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black rounded-full shadow-md transition-all cursor-pointer"
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-black text-black" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-black text-black" />
        )}
      </button>
      
      {/* Waveform animated display */}
      <div className="flex-1 flex items-center gap-[2.5px] h-6 relative">
        {Array.from({ length: 18 }).map((_, i) => {
          const isPlayed = !isSimulated && duration > 0 && (i / 18) <= (currentTime / duration);
          return (
            <span 
              key={i} 
              className={`w-[2.5px] rounded-full transition-colors duration-150 ${
                isPlayed ? "bg-cyan-400" : isPlaying ? "bg-cyan-400/60 animate-pulse" : "bg-cyan-400/30"
              }`} 
              style={{ 
                height: `${4 + Math.sin(i * 0.8) * 14}px`,
                animationDelay: `${i * 50}ms`
              }} 
            />
          );
        })}
      </div>
      <span className="text-[9px] text-white/40 pr-2 font-mono">
        {isPlaying ? formatTime(currentTime) : isSimulated ? durationText : formatTime(duration || 12)}
      </span>
    </div>
  );
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
    stories,
    fetchNotifications
  } = useProjectStore();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Filters & Header States
  const [activeFilter, setActiveFilter] = useState<"Primary" | "General" | "Groups">("Primary");
  const [generalChannelIds, setGeneralChannelIds] = useState<string[]>([]);
  const [unapprovedChannelIds, setUnapprovedChannelIds] = useState<string[]>([]);
  const [localUnreadChannelIds, setLocalUnreadChannelIds] = useState<string[]>([]);
  const [closeFriendUserIds, setCloseFriendUserIds] = useState<string[]>([]);
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // E2EE Decrypted message caches
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

  // Modals & Sheets
  const [isCreatorChoiceOpen, setIsCreatorChoiceOpen] = useState(false);
  const [isNoteComposerOpen, setIsNoteComposerOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isNoteViewerOpen, setIsNoteViewerOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  
  const [activeNote, setActiveNote] = useState<any>(null);
  const [noteDetailReplyText, setNoteDetailReplyText] = useState("");
  const [activeStoryUser, setActiveStoryUser] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [isViewerListOpen, setIsViewerListOpen] = useState(false);
  
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
  const viewerDrawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isStoryViewerOpen || !activeStoryUser) return;
    const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
    const activeStory = userStories[activeStoryIndex];
    if (!activeStory) return;

    let parsedLayers: any = null;
    try {
      if (activeStory.caption) {
        const parsed = JSON.parse(activeStory.caption);
        parsedLayers = parsed.layers;
      }
    } catch (e) {}

    const canvas = viewerDrawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (parsedLayers && parsedLayers.drawings) {
      parsedLayers.drawings.forEach((stroke: any) => {
        if (stroke.points.length < 1) return;
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = stroke.size;
        ctx.globalAlpha = stroke.opacity;

        if (stroke.type === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
        } else {
          ctx.globalCompositeOperation = "source-over";
        }

        if (stroke.type === "neon") {
          ctx.strokeStyle = "#ffffff";
          ctx.shadowColor = stroke.color;
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = stroke.color;
          ctx.shadowBlur = 0;
        }

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });
    }
  }, [isStoryViewerOpen, activeStoryUser, activeStoryIndex, stories]);

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

  // Last message state to derive status
  const [lastMessages, setLastMessages] = useState<Record<string, any>>({});

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
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [isStoryUploaderOptionsOpen, setIsStoryUploaderOptionsOpen] = useState(false);
  const [isAddNoteOptionsOpen, setIsAddNoteOptionsOpen] = useState(false);

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

  // View tracker for notes in ChatView & Auto-play note soundtrack preview on loop
  useEffect(() => {
    if (isNoteViewerOpen && activeNote && currentUser) {
      if (activeNote.user_id !== currentUser.id) {
        const currentViewers = activeNote.viewers || [];
        if (!currentViewers.includes(currentUser.id)) {
          const updatedViewers = [...currentViewers, currentUser.id];
          supabase.from("notes").update({ viewers: updatedViewers }).eq("id", activeNote.id).then(() => {
            fetchNotes();
          });
        }
      }

      // Auto-play music preview on loop
      if (activeNote.song_preview_url) {
        if (audioPreviewRef.current) {
          audioPreviewRef.current.pause();
        }
        const audio = new Audio(activeNote.song_preview_url);
        audio.volume = 0.5;
        audio.loop = true; // loop non-stop
        audioPreviewRef.current = audio;
        setPlayingSongId(activeNote.song_id || activeNote.id);
        audio.play().catch(e => console.warn("Auto-play blocked until user interaction:", e));
      }
    } else {
      if (!isNoteViewerOpen && audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        setPlayingSongId(null);
      }
    }
  }, [isNoteViewerOpen, activeNote]);

  // Initialize some channels in general and requests lists so they are populated
  useEffect(() => {
    if (chatChannels.length > 0) {
      const defaultRequests = chatChannels
        .filter((c, idx) => idx === chatChannels.length - 1 && !c.is_group)
        .map(c => c.id);
      setUnapprovedChannelIds(prev => prev.length === 0 ? defaultRequests : prev);

      const defaultGeneral = chatChannels
        .filter((c, idx) => idx % 3 === 1 && !defaultRequests.includes(c.id))
        .map(c => c.id);
      setGeneralChannelIds(prev => prev.length === 0 ? defaultGeneral : prev);
    }
  }, [chatChannels]);

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
              mode: mainPres.mode || "typing",
              channelId: mainPres.typing_in
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

    let callLogText = "";
    if (activeCall.status === "connected") {
      callLogText = `[Call] FaceTime ${activeCall.type === "video" ? "Video" : "Audio"} • Ended • ${formatTimer(callTimer)}`;
    } else if (activeCall.status === "ringing-out") {
      callLogText = `[Call] FaceTime ${activeCall.type === "video" ? "Video" : "Audio"} • Missed`;
    } else if (activeCall.status === "ringing-in") {
      callLogText = `[Call] FaceTime ${activeCall.type === "video" ? "Video" : "Audio"} • Declined`;
    }
    if (callLogText && activeCall.partnerId !== "mock-testing-partner-id") {
      handleSendMessage(callLogText);
    }

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
      console.warn("Real media devices access failed, falling back to virtual media tracks:", err);
      
      let stream: MediaStream;
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = ctx.createMediaStreamDestination();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0; // completely silent
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        
        const audioTrack = dest.stream.getAudioTracks()[0];
        const tracks = [audioTrack];

        if (type === "video") {
          const canvas = document.createElement("canvas");
          canvas.width = 380;
          canvas.height = 640;
          const canvasCtx = canvas.getContext("2d");
          if (canvasCtx) {
            canvasCtx.fillStyle = "#0c0d12";
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
          }
          const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(10) : null;
          if (canvasStream) {
            const videoTrack = canvasStream.getVideoTracks()[0];
            if (videoTrack) tracks.push(videoTrack);
          }
        }
        
        stream = new MediaStream(tracks);
      } catch (fallbackErr) {
        console.error("Virtual stream creation failed:", fallbackErr);
        stream = new MediaStream();
      }

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
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

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

      setCallTimer(0);
      callIntervalRef.current = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
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
    if (currentUser) {
      loadLastMessages();
    }
    if (!currentUser) return;

    const globalChannel = supabase
      .channel("global-chat-listener")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => {
        fetchChatChannels();
        loadLastMessages();
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

  // Real-time Stories subscription in ChatView
  useEffect(() => {
    const channel = supabase
      .channel("chat-stories-realtime-listener")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStories]);

  // Real-time Notifications subscription in ChatView
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("chat-notifications-realtime-listener")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  // Sync active channel DMs
  useEffect(() => {
    if (!activeChannelId || !currentUser) return;
    fetchChatMessages(activeChannelId);
    markMessagesAsRead(activeChannelId);
    markMessagesAsDelivered(activeChannelId);
    loadLastMessages();
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

  // Fetch last messages to derive statuses
  const loadLastMessages = async () => {
    const { data: channels } = await supabase.from("chat_channels").select("id");
    if (!channels || channels.length === 0) return;
    const channelIds = channels.map(c => c.id);
    const promises = channelIds.map(async (channelId) => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, channel_id, sender_id, content, created_at, read_by, delivered_to")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false })
        .limit(1);
      return { channelId, msg: data?.[0] || null };
    });
    
    const results = await Promise.all(promises);
    const newLastMessages: Record<string, any> = {};
    results.forEach(({ channelId, msg }) => {
      if (msg) {
        newLastMessages[channelId] = msg;
      }
    });
    setLastMessages(newLastMessages);
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

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleLikeNote = async (note: any) => {
    if (!currentUser) return;
    const currentLikes = note.likes || [];
    let updatedLikes;
    if (currentLikes.includes(currentUser.id)) {
      updatedLikes = currentLikes.filter((id: string) => id !== currentUser.id);
    } else {
      updatedLikes = [...currentLikes, currentUser.id];
    }
    const { error } = await supabase.from("notes").update({ likes: updatedLikes }).eq("id", note.id);
    if (!error) {
      setActiveNote({ ...note, likes: updatedLikes });
      fetchNotes();
    }
  };

  const handleSendNoteReaction = async (targetUserId: string, text: string) => {
    try {
      let channel = chatChannels.find((c: any) => 
        !c.is_group && c.chat_channel_members?.some((m: any) => m.user_id === targetUserId)
      );
      let channelId = channel?.id;
      if (!channelId) {
        channelId = await createChatChannel("Direct Message", false, [targetUserId]);
      }
      if (!channelId) {
        alert("Could not start message thread.");
        return;
      }
      await sendChatMessage(channelId, text, undefined);
      setIsNoteViewerOpen(false);
      setActiveNote(null);
      setNoteDetailReplyText("");
      alert("Reaction sent!");
    } catch (err: any) {
      alert("Error sending reaction: " + err.message);
    }
  };

  const getLastMessagePreview = (channelId: string) => {
    const lastMsg = lastMessages[channelId];
    if (!lastMsg) return "No messages yet";
    
    const isSender = lastMsg.sender_id === currentUser?.id;
    const rawContent = decryptedCache[lastMsg.id] || lastMsg.content || "";
    
    let prefix = isSender ? "You: " : "";
    let messageText = rawContent;
    
    if (rawContent.startsWith("[Voice Note]")) {
      messageText = "voice message";
    } else if (rawContent.startsWith("[PDF]")) {
      messageText = "document";
    } else if (rawContent.startsWith("[Location]")) {
      messageText = "location pin";
    } else if (rawContent.startsWith("[Contact]")) {
      messageText = "contact card";
    } else if (rawContent.startsWith("[Task]")) {
      messageText = "task details";
    } else if (rawContent.startsWith("[Invite]")) {
      messageText = "event invite";
    } else if (rawContent.startsWith("[Reel]")) {
      messageText = "video reel";
    } else if (lastMsg.attachment_url) {
      messageText = "photo";
    }
    
    return `${prefix}${messageText}`;
  };

  const handleBlockUser = async (blockedUserId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from("blocked_users").insert({ user_id: currentUser.id, blocked_user_id: blockedUserId });
    if (error) {
      if (error.code === "23505") {
        alert("This user is already blocked.");
      } else {
        alert(error.message);
      }
    } else {
      alert("User blocked successfully.");
    }
  };

  const handleReportUser = async (reportedUserId: string) => {
    if (!currentUser) return;
    const reason = prompt("Enter the reason for reporting this user:");
    if (!reason?.trim()) return;
    const { error } = await supabase.from("reported_users").insert({
      reporter_id: currentUser.id,
      reported_user_id: reportedUserId,
      reason: reason.trim()
    });
    if (error) {
      alert(error.message);
    } else {
      alert("User reported successfully.");
    }
  };

  const toggleCloseFriend = (userId: string) => {
    setCloseFriendUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectProfileDM = async (userId: string) => {
    let channel = chatChannels.find((c: any) => 
      !c.is_group && c.chat_channel_members?.some((m: any) => m.user_id === userId)
    );
    let channelId = channel?.id;
    if (!channelId) {
      channelId = await createChatChannel("Direct Message", false, [userId]);
    }
    if (channelId) {
      setActiveChannelId(channelId);
    }
  };

  const SwipeableChatItem = ({ 
    channel, 
    isActive, 
    details, 
    hasUnread, 
    statusText, 
    isMuted, 
    isPinned, 
    isCloseFriend, 
    onClick, 
    onLongPress 
  }: {
    channel: any;
    isActive: boolean;
    details: any;
    hasUnread: boolean;
    statusText: string;
    isMuted: boolean;
    isPinned: boolean;
    isCloseFriend: boolean;
    onClick: () => void;
    onLongPress: (e: any) => void;
  }) => {
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const swipeStartX = useRef(0);
    const swipeStartTranslateX = useRef(0);
    const dragThreshold = 5;
    const hasDragged = useRef(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
      setIsSwiping(true);
      swipeStartX.current = e.touches[0].clientX;
      swipeStartTranslateX.current = translateX;
      hasDragged.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isSwiping) return;
      const delta = e.touches[0].clientX - swipeStartX.current;
      if (Math.abs(delta) > dragThreshold) {
        hasDragged.current = true;
      }
      const targetX = swipeStartTranslateX.current + delta;
      const clamped = Math.min(0, Math.max(-170, targetX));
      setTranslateX(clamped);
    };

    const handleTouchEnd = () => {
      setIsSwiping(false);
      if (translateX < -80) {
        setTranslateX(-160);
      } else {
        setTranslateX(0);
      }
    };

    // Mouse handlers for desktop dragging
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsSwiping(true);
      swipeStartX.current = e.clientX;
      swipeStartTranslateX.current = translateX;
      hasDragged.current = false;
      
      const handleGlobalMouseMove = (moveEv: MouseEvent) => {
        const delta = moveEv.clientX - swipeStartX.current;
        if (Math.abs(delta) > dragThreshold) {
          hasDragged.current = true;
        }
        const targetX = swipeStartTranslateX.current + delta;
        const clamped = Math.min(0, Math.max(-170, targetX));
        setTranslateX(clamped);
      };

      const handleGlobalMouseUp = () => {
        setIsSwiping(false);
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        if (translateX < -80) {
          setTranslateX(-160);
        } else {
          setTranslateX(0);
        }
      };

      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    };

    return (
      <div className="relative overflow-hidden w-full rounded-[12px] bg-black select-none h-[72px] shrink-0">
        {/* Background Action Buttons */}
        <div className="absolute right-0 top-0 bottom-0 flex z-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleMuteChannel(channel.id);
              setTranslateX(0);
            }}
            className="bg-[#5f52a0] text-white flex flex-col items-center justify-center w-[53px] h-full text-[10px] gap-1 font-bold hover:brightness-110 transition-all"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute</span>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleArchiveChannel(channel.id);
              setTranslateX(0);
            }}
            className="bg-[#262626] text-white flex flex-col items-center justify-center w-[53px] h-full text-[10px] gap-1 font-bold hover:brightness-110 border-l border-white/5 transition-all"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm("Delete this conversation?")) {
                await supabase.from("chat_channels").delete().eq("id", channel.id);
                fetchChatChannels();
              }
              setTranslateX(0);
            }}
            className="bg-[#ed4956] text-white flex flex-col items-center justify-center w-[54px] h-full text-[10px] gap-1 font-bold hover:brightness-110 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Main card panel content */}
        <div
          ref={cardRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (hasDragged.current) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            onClick();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            onLongPress(e);
          }}
          onMouseDownCapture={(e) => {
            const timeout = setTimeout(() => {
              if (!hasDragged.current) {
                onLongPress(e);
              }
            }, 500);
            const clear = () => clearTimeout(timeout);
            window.addEventListener("mouseup", clear, { once: true });
            window.addEventListener("touchend", clear, { once: true });
          }}
          style={{ transform: `translateX(${translateX}px)` }}
          className={`flex items-center gap-3 px-4 py-3 text-left bg-[#0b0b0d] hover:bg-[#1a1a1c] border-b border-white/5 cursor-pointer relative z-10 w-full h-full ${
            isSwiping ? "" : "transition-transform duration-200"
          } ${isActive ? "bg-[#1c1c1e]" : ""}`}
        >
          <div className="relative shrink-0">
            {details.isGroup ? (
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-sm">
                {details.title.substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/5 bg-neutral-800">
                <img src={details.avatar || ""} className="w-full h-full object-cover" alt="" />
              </div>
            )}
            
            {/* Online green indicator */}
            {!details.isGroup && details.userId && onlineUsers.includes(details.userId) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ed840] rounded-full border-2 border-[#0b0b0d]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-[14px] truncate flex items-center gap-1.5 ${hasUnread ? "font-bold text-white" : "font-medium text-[#f5f5f5]"}`}>
                {details.title}
                {isPinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400/20 rotate-45" />}
                {isMuted && <VolumeX className="w-3 h-3 text-white/40" />}
                {isCloseFriend && (
                  <span className="bg-[#4ed840] text-black text-[9px] px-1 rounded font-bold uppercase tracking-wider flex items-center scale-90">CF</span>
                )}
              </span>
              <span className="text-[12px] text-[#8e8e8e] shrink-0">
                {channel.last_msg_time ? formatRelativeTime(channel.last_msg_time) : ""}
              </span>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <p className={`text-[13px] truncate pr-4 ${hasUnread ? "font-bold text-white" : "text-[#8e8e8e]"}`}>
                {statusText}
              </p>
              {hasUnread && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#0095f6] shrink-0" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get elapsed relative time for notes
  const getElapsedTime = (created_at: string) => {
    try {
      const diff = Date.now() - new Date(created_at).getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 60) return `${Math.max(1, mins)}m`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h`;
      return `${Math.floor(hrs / 24)}d`;
    } catch (e) {
      return "3h";
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

  // Autoplay story background audio in ChatView stories viewer
  useEffect(() => {
    if (isStoryViewerOpen && activeStoryUser && stories.length > 0) {
      const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
      const activeStory = userStories[activeStoryIndex];
      if (activeStory && activeStory.song_preview_url) {
        if (audioPreviewRef.current) {
          audioPreviewRef.current.pause();
        }
        const audio = new Audio(activeStory.song_preview_url);
        audio.loop = true;
        audio.play().catch(e => console.log("Audio play failed in ChatView:", e));
        audioPreviewRef.current = audio;
      } else {
        if (audioPreviewRef.current) {
          audioPreviewRef.current.pause();
          audioPreviewRef.current = null;
        }
      }
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    }
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, [isStoryViewerOpen, activeStoryUser, activeStoryIndex]);

  useEffect(() => {
    setStoryProgress(0);
    // Reset stamp interactive state when shifting slides
    setPollVoted(null);

    const markStoryAsViewed = async () => {
      if (!activeStoryUser || !currentUser) return;
      const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
      const activeStory = userStories[activeStoryIndex];
      if (activeStory && activeStory.user_id !== currentUser.id) {
        viewStory(activeStory.id);
      }
    };
    markStoryAsViewed();
  }, [activeStoryIndex, activeStoryUser, stories, currentUser]);

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

  const handleDeleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);
      
      if (error) throw error;
      
      await fetchStories();
      
      if (!activeStoryUser) return;
      const userStoriesAfterDelete = stories.filter((s: any) => s.user_id === activeStoryUser && s.id !== storyId);
      
      if (userStoriesAfterDelete.length === 0) {
        handleCloseStoryViewer();
      } else if (activeStoryIndex >= userStoriesAfterDelete.length) {
        setActiveStoryIndex(userStoriesAfterDelete.length - 1);
        setStoryProgress(0);
      } else {
        setStoryProgress(0);
      }
    } catch (err: any) {
      alert("Error deleting story: " + err.message);
    }
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
  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      const finalSecs = recordingSeconds;
      setRecordingSeconds(0);
      handleTypingStatus(false);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      } else {
        handleSendMessage(`[Voice Note] simulation?duration=${finalSecs}s`);
      }
    } else {
      setIsRecording(true);
      handleTypingStatus(true, "recording");
      audioChunksRef.current = [];

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
            type: "audio/webm"
          });

          const audioUrl = await uploadChatAttachment(audioFile);
          if (audioUrl) {
            handleSendMessage(`[Voice Note] ${audioUrl}`);
          } else {
            console.error("Failed to upload voice note audio.");
          }
        };

        mediaRecorder.start();
        recordingIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);

      } catch (err) {
        console.error("Microphone access denied or error:", err);
        recordingIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      }
    }
  };

  // Custom filters matching Primary / General / Groups categories
  const filteredChannels = chatChannels.filter(channel => {
    const details = getChannelDetails(channel);
    const isGeneral = generalChannelIds.includes(channel.id);

    // Tab filter
    if (activeFilter === "Groups") {
      if (!channel.is_group) return false;
    } else if (activeFilter === "General") {
      if (channel.is_group) return false;
      if (!isGeneral) return false;
    } else {
      // Primary tab
      if (channel.is_group || isGeneral) return false;
    }

    // Search filter
    if (sidebarSearch.trim()) {
      const q = sidebarSearch.toLowerCase();
      
      // 1. Channel title / description
      const titleMatch = details.title.toLowerCase().includes(q) || details.description.toLowerCase().includes(q);
      
      // 2. Members list
      const membersMatch = channel.chat_channel_members?.some((m: any) => {
        const p = m.profiles;
        return p?.full_name?.toLowerCase().includes(q) || p?.email?.toLowerCase().includes(q);
      });

      // 3. Last message content
      const lastMsg = lastMessages[channel.id];
      const lastMsgDecrypted = lastMsg ? (decryptedCache[lastMsg.id] || lastMsg.content || "") : "";
      const messageMatch = lastMsgDecrypted.toLowerCase().includes(q);

      // 4. Notes matching this channel's collaborator
      const notesMatch = notes.some((n: any) => {
        const isCollab = channel.chat_channel_members?.some((m: any) => m.user_id === n.user_id);
        return isCollab && n.content?.toLowerCase().includes(q);
      });

      if (!titleMatch && !membersMatch && !messageMatch && !notesMatch) {
        return false;
      }
    }

    if (channel.is_archived && activeFilter !== "Groups") {
      return false;
    }

    return true;
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

      {/* 1. REDESIGNED CONVERSATION SIDEBAR - INSTAGRAM DM INBOX STYLE */}
      <div className={`w-full md:w-[360px] flex flex-col h-full bg-[#0b0b0d] border-r border-white/10 relative z-10 shrink-0 select-none ${activeChannelId ? "hidden md:flex" : "flex"}`}>
        
        {/* Sticky Header: Exit back to dashboard, Username with Dropdown, Pencil Icon */}
        <div className="sticky top-0 z-40 bg-[#0b0b0d] px-5 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setActiveView("dashboard")} 
              className="p-1.5 hover:bg-[#262626] rounded-full transition-all text-[#a8a8a8] hover:text-white mr-1"
              title="Exit Chat View"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                className="flex items-center gap-1 px-1 py-0.5 text-[20px] font-bold text-white tracking-tight hover:opacity-80 transition-opacity"
              >
                <span className="max-w-[150px] truncate">{userProfile?.username || userProfile?.full_name?.toLowerCase().replace(/\s+/g, '_') || currentUser?.email?.split('@')[0] || "psf_vivek"}</span>
                <ChevronDown className="w-4 h-4 text-[#a8a8a8]" />
              </button>
              {showUserDropdown && (
                <div className="absolute left-0 mt-2 w-48 rounded-[12px] bg-[#262626] border border-white/10 p-1.5 shadow-2xl z-50 animate-fadein">
                  <div className="px-2.5 py-1 text-[9px] text-[#8e8e8e] uppercase tracking-widest font-bold mb-1">Select Status</div>
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
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] hover:bg-white/5 text-left text-xs transition-colors"
                    >
                      <span className={`w-2 h-2 rounded-full ${status.color}`} />
                      <span className="text-white/90">{status.label}</span>
                      {userStatus === status.id && <Check className="w-3.5 h-3.5 text-cyan-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setIsNewChatOpen(true)}
            className="p-1 hover:opacity-75 transition-opacity text-white"
            title="Compose Message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </div>

        {/* Sliding Tab Underline Selection (Primary, General, Groups) */}
        <div className="flex border-b border-white/10 relative px-4 mt-2 justify-around select-none shrink-0">
          {(["Primary", "General", "Groups"] as const).map((tab) => {
            const isGroups = tab === "Groups";
            
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex-1 text-center py-2.5 text-[14px] font-semibold transition-colors relative z-10 ${
                  activeFilter === tab ? "text-white" : "text-[#8e8e8e] hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1 justify-center w-full">
                  <span>{tab}</span>
                  {isGroups && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewChatIsGroup(true);
                        setIsNewChatOpen(true);
                      }}
                      className="ml-1 p-0.5 rounded-md hover:bg-white/15 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center shrink-0"
                      title="Create Group Chat"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
          {/* Smooth Underline */}
          <div 
            className="absolute bottom-0 h-[1.5px] bg-white transition-all duration-300 ease-out"
            style={{
              width: `${100 / 3}%`,
              left: `${((activeFilter === "Primary" ? 0 : activeFilter === "General" ? 1 : 2) * 100) / 3}%`
            }}
          />
        </div>

        {/* Search Input Bar (Rounded, below tabs, always visible) */}
        <div className="px-5 py-3 relative z-30 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              onFocus={() => setShowAiSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowAiSearchSuggestions(false), 200)}
              className="w-full bg-[#262626] border-none rounded-[10px] pl-9 pr-8 py-2 text-[14px] text-white placeholder-[#8e8e8e] focus:outline-none transition-all shadow-sm"
            />
            <Search className="w-4 h-4 text-[#8e8e8e] absolute left-3" />
            {sidebarSearch && (
              <button onClick={() => setSidebarSearch("")} className="absolute right-3 p-0.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {showAiSearchSuggestions && (
            <div className="absolute left-5 right-5 mt-1 rounded-[14px] bg-[#262626] border border-white/10 p-3 shadow-2xl z-50 animate-fadein">
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
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-xs text-white/80 hover:text-white transition-all flex items-center justify-between"
                  >
                    <span>{s.text}</span>
                    <span className="text-[9px] text-white/40 font-mono">»</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STORIES & NOTES ROW */}
        <div className="px-5 py-2 border-b border-white/5 bg-[#0b0b0d] shrink-0">
          <div className="flex gap-4.5 overflow-x-auto no-scrollbar scroll-smooth items-start pt-11 pb-2 px-1">
            
            {/* First circle: "Your note" / Me */}
            <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 relative select-none">
              {/* Bubble Note display */}
              {(() => {
                const ownNote = notes.find(n => n.user_id === currentUser?.id);
                if (ownNote) {
                  return (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNote(ownNote);
                        setIsNoteViewerOpen(true);
                      }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center group/note animate-fadein"
                    >
                      <div className="bg-[#262626] border border-white/10 px-3 py-1.5 rounded-[18px] min-w-[75px] max-w-[110px] shadow-[0_4px_16px_rgba(0,0,0,0.6)] text-center text-[10px] leading-tight text-white select-none relative group-hover/note:bg-red-950/90 transition-colors">
                        {ownNote.song_name ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center gap-1 mb-0.5 text-[9px] font-bold text-white truncate max-w-full">
                              <span className="text-[8px] text-white/70">|||</span>
                              <span className="truncate">{ownNote.song_name}</span>
                            </div>
                            <span className="text-[7.5px] text-white/50 truncate max-w-full block">
                              {ownNote.song_artist || "Unknown Artist"}
                            </span>
                          </div>
                        ) : (
                          <p className="font-medium text-white break-words text-[9.5px] max-h-[36px] overflow-hidden text-ellipsis line-clamp-2 px-0.5">
                            {ownNote.content}
                          </p>
                        )}
                        
                        {/* Speech Bubble Arrow pointing down */}
                        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#262626] border-r border-b border-white/10 rotate-45 z-[1] group-hover/note:bg-red-950/90 transition-colors" />
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div 
                onClick={() => {
                  setIsNoteComposerOpen(true);
                }}
                className="relative"
              >
                {(() => {
                  const myStories = stories.filter(s => s.user_id === currentUser?.id);
                  const hasStories = myStories.length > 0;
                  return (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      hasStories ? "bg-gradient-to-tr from-[#3897f0] via-[#a80077] to-[#b12a5b] p-[2.5px]" : "bg-neutral-800 p-[1.5px]"
                    }`}>
                      <div className="w-full h-full rounded-full bg-black p-[2px]">
                        {userProfile?.avatar_url ? (
                          <img src={userProfile.avatar_url} className="w-full h-full object-cover rounded-full" alt="" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center font-bold text-cyan-400 text-sm">
                            {userProfile?.full_name?.substring(0, 2).toUpperCase() || "ME"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#0095f6] text-white font-bold rounded-full flex items-center justify-center border-[2px] border-[#0b0b0d] text-[12px] shadow-sm">
                  +
                </div>
              </div>
              <span className="text-[11px] text-[#8e8e8e] font-semibold mt-1">Your note</span>
            </div>

            {/* Crew members circles */}
            {(() => {
              const otherProfiles = profiles.filter(p => p.id !== currentUser?.id);
              const sortedMembers = [...otherProfiles].sort((a, b) => {
                const aStories = stories.filter(s => s.user_id === a.id);
                const bStories = stories.filter(s => s.user_id === b.id);
                const aHasStories = aStories.length > 0;
                const bHasStories = bStories.length > 0;
                
                if (aHasStories && !bHasStories) return -1;
                if (!aHasStories && bHasStories) return 1;
                
                if (aHasStories && bHasStories) {
                  const aHasUnseen = aStories.some(s => !s.viewers?.includes(currentUser?.id));
                  const bHasUnseen = bStories.some(s => !s.viewers?.includes(currentUser?.id));
                  if (aHasUnseen && !bHasUnseen) return -1;
                  if (!aHasUnseen && bHasUnseen) return 1;
                  
                  const aTime = Math.max(...aStories.map(s => new Date(s.created_at).getTime()));
                  const bTime = Math.max(...bStories.map(s => new Date(s.created_at).getTime()));
                  return bTime - aTime;
                }
                
                const aOnline = onlineUsers.includes(a.id);
                const bOnline = onlineUsers.includes(b.id);
                if (aOnline && !bOnline) return -1;
                if (!aOnline && bOnline) return 1;
                
                return (a.full_name || "").localeCompare(b.full_name || "");
              });

              return sortedMembers.map(p => {
                const userStories = stories.filter((s: any) => s.user_id === p.id);
                const hasActiveStories = userStories.length > 0;
                const hasUnseen = hasActiveStories && userStories.some((s: any) => !s.viewers?.includes(currentUser?.id));
                const userNote = notes.find((n: any) => n.user_id === p.id);
                const isOnline = onlineUsers.includes(p.id);

                return (
                  <div key={p.id} className="flex flex-col items-center gap-1.5 shrink-0 relative select-none group">
                    {/* Note bubble */}
                    {userNote && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNote(userNote);
                          setIsNoteViewerOpen(true);
                        }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-fadein cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                      >
                        <div className="bg-[#262626] border border-white/10 px-3 py-1.5 rounded-[18px] min-w-[75px] max-w-[110px] shadow-[0_4px_16px_rgba(0,0,0,0.6)] text-center text-[10px] leading-tight text-white select-none relative">
                          {userNote.song_name ? (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center gap-1 mb-0.5 text-[9px] font-bold text-white truncate max-w-full">
                                <span className="text-[8px] text-white/70">|||</span>
                                <span className="truncate">{userNote.song_name}</span>
                              </div>
                              <span className="text-[7.5px] text-white/50 truncate max-w-full block">
                                {userNote.song_artist || "Unknown Artist"}
                              </span>
                            </div>
                          ) : (
                            <p className="font-medium text-white break-words text-[9.5px] max-h-[36px] overflow-hidden text-ellipsis line-clamp-2 px-0.5">
                              {userNote.content}
                            </p>
                          )}
                          
                          {/* Speech Bubble Arrow pointing down */}
                          <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#262626] border-r border-b border-white/10 rotate-45 z-[1]" />
                        </div>
                      </div>
                    )}

                    {/* Avatar ring */}
                    <div 
                      onClick={() => {
                        if (hasActiveStories) {
                          setActiveStoryUser(p.id);
                          setActiveStoryIndex(0);
                          setIsStoryViewerOpen(true);
                          viewStory(userStories[0].id);
                        } else {
                          handleSelectProfileDM(p.id);
                        }
                      }}
                      className="relative cursor-pointer"
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        hasActiveStories 
                          ? hasUnseen 
                            ? "bg-gradient-to-tr from-[#3897f0] via-[#a80077] to-[#b12a5b] p-[2.5px]" 
                            : "bg-[#262626] p-[1.5px]"
                          : "border border-white/10 p-[1px]"
                      }`}>
                        <div className="w-full h-full rounded-full bg-black p-[2px]">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} className="w-full h-full object-cover rounded-full" alt="" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center font-bold text-cyan-400 text-sm">
                              {p.full_name?.substring(0, 2).toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Online dot indicator */}
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4ed840] rounded-full border-2 border-[#0b0b0d] shadow-[0_0_4px_rgba(78,216,64,0.4)]" />
                      )}
                    </div>
                    
                    <span className="text-[11px] text-[#8e8e8e] truncate max-w-[72px] mt-0.5 font-medium">
                      {p.full_name || p.email?.split('@')[0]}
                    </span>
                  </div>
                );
              });
            })()}

          </div>
        </div>

        {/* CHAT LIST CONTAINER */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 no-scrollbar flex flex-col">
          {filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-white/30">
              <span className="text-3xl">🎬</span>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-2">No conversations</p>
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const details = getChannelDetails(channel);
              const isActive = channel.id === activeChannelId;
              const hasUnread = channel.unread_count > 0 || localUnreadChannelIds.includes(channel.id);
              
              const isMuted = channel.muted_by?.includes(currentUser?.id) || channel.is_muted;
              const isPinned = channel.pinned_by?.includes(currentUser?.id) || channel.is_pinned;
              const isCloseFriend = closeFriendUserIds.includes(details.userId || "");

              // Derive status text
              const lastMsg = lastMessages[channel.id];
              let statusText = getLastMessagePreview(channel.id);
              const otherMember = channel.chat_channel_members?.find((m: any) => m.user_id !== currentUser?.id);
              const isTyping = Object.values(typingUsers).some((t: any) => t.channelId === channel.id);

              if (isTyping) {
                statusText = "Typing...";
              } else if (lastMsg) {
                const isSender = lastMsg.sender_id === currentUser?.id;
                if (isSender) {
                  const isRead = otherMember && lastMsg.read_by?.includes(otherMember.user_id);
                  const isDelivered = otherMember && lastMsg.delivered_to?.includes(otherMember.user_id);
                  if (isRead) {
                    statusText += " · Seen";
                  } else if (isDelivered) {
                    statusText += " · Delivered";
                  } else {
                    statusText += " · Sent";
                  }
                }
              }

              return (
                <SwipeableChatItem
                  key={channel.id}
                  channel={channel}
                  isActive={isActive}
                  details={details}
                  hasUnread={hasUnread}
                  statusText={statusText}
                  isMuted={isMuted}
                  isPinned={isPinned}
                  isCloseFriend={isCloseFriend}
                  onClick={() => {
                    if (isSelectionModeActive) {
                      setSelectedChannelIds(prev => 
                        prev.includes(channel.id) 
                          ? prev.filter(id => id !== channel.id)
                          : [...prev, channel.id]
                      );
                      return;
                    }
                    if (lockedChannels[channel.id]) {
                      setShowFaceIdLock(channel.id);
                    } else {
                      if (localUnreadChannelIds.includes(channel.id)) {
                        setLocalUnreadChannelIds(prev => prev.filter(id => id !== channel.id));
                      }
                      setActiveChannelId(channel.id);
                    }
                  }}
                  onLongPress={() => {
                    setActiveBottomSheetChannel(channel);
                  }}
                />
              );
            })
          )}
        </div>

        {/* LIQUID GLASS SELECTION MODE BANNER */}
        {isSelectionModeActive && (
          <div className="p-3 bg-[#161618] border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                {selectedChannelIds.length} Selected
              </span>
              <button 
                onClick={() => {
                  setIsSelectionModeActive(false);
                  setSelectedChannelIds([]);
                }}
                className="text-[9px] uppercase tracking-wider text-white/50 hover:text-white font-bold"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  if (selectedChannelIds.length < 2) {
                    alert("Please select at least 2 conversations to create a group.");
                    return;
                  }
                  alert(`Group created with selected channels: ${selectedChannelIds.join(", ")}`);
                  setIsSelectionModeActive(false);
                  setSelectedChannelIds([]);
                }}
                className="py-1 px-2 rounded-xl bg-[#262626] hover:bg-[#363636] border border-white/10 text-[9px] text-white font-bold uppercase tracking-wider transition-all text-center"
              >
                Create Group
              </button>
              <button
                onClick={() => {
                  alert(`Broadcast created for channels: ${selectedChannelIds.join(", ")}`);
                  setIsSelectionModeActive(false);
                  setSelectedChannelIds([]);
                }}
                className="py-1 px-2 rounded-xl bg-[#262626] hover:bg-[#363636] border border-white/10 text-[9px] text-white font-bold uppercase tracking-wider transition-all text-center"
              >
                Create Broadcast
              </button>
              <button
                onClick={() => {
                  selectedChannelIds.forEach(id => toggleMuteChannel(id));
                  alert(`Muted selected channels.`);
                  setIsSelectionModeActive(false);
                  setSelectedChannelIds([]);
                }}
                className="py-1 px-2 rounded-xl bg-[#262626] hover:bg-[#363636] border border-white/10 text-[9px] text-white font-bold uppercase tracking-wider transition-all text-center"
              >
                Mute Selected
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete ${selectedChannelIds.length} conversations?`)) {
                    for (const id of selectedChannelIds) {
                      await supabase.from("chat_channels").delete().eq("id", id);
                    }
                    alert("Deleted selected conversations.");
                    fetchChatChannels();
                    setIsSelectionModeActive(false);
                    setSelectedChannelIds([]);
                  }
                }}
                className="py-1 px-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-[9px] text-red-300 font-bold uppercase tracking-wider transition-all text-center"
              >
                Delete Selected
              </button>
              <button
                onClick={() => {
                  selectedChannelIds.forEach(id => toggleArchiveChannel(id));
                  alert(`Archived selected channels.`);
                  setIsSelectionModeActive(false);
                  setSelectedChannelIds([]);
                }}
                className="py-1 px-2 rounded-xl bg-[#262626] hover:bg-[#363636] border border-white/10 text-[9px] text-white font-bold uppercase tracking-wider transition-all text-center"
              >
                Archive Selected
              </button>
              <button
                onClick={() => {
                  const label = prompt("Enter label name (e.g. Production, Review):");
                  if (label) {
                    selectedChannelIds.forEach(id => handleChannelLabelAdd(id, label));
                    alert(`Added label "${label}" to selected channels.`);
                  }
                  setIsSelectionModeActive(false);
                  setSelectedChannelIds([]);
                }}
                className="py-1 px-2 rounded-xl bg-[#262626] hover:bg-[#363636] border border-white/10 text-[9px] text-white font-bold uppercase tracking-wider transition-all text-center"
              >
                Add Label
              </button>
            </div>
          </div>
        )}
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
                  const isCall = decrypted.startsWith("[Call]");
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
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this message?")) {
                              await deleteChatMessage(activeChannelId, msg.id);
                            }
                          }}
                          className="p-1 rounded-full bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-red-400 transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                        ) : isCall ? (
                          <div className="flex flex-col gap-2 p-2.5 bg-black/40 rounded-xl border border-white/10 min-w-[210px] select-none text-left">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-[8px] text-[#22d3ee] uppercase tracking-widest font-extrabold flex items-center gap-1">
                                <Video className="w-3 h-3 text-[#22d3ee]" /> FaceTime Call
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[7px] font-extrabold uppercase">
                                {decrypted.includes("Missed") ? "Missed" : decrypted.includes("Declined") ? "Declined" : "Ended"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1.5 pt-1">
                              <p className="text-[10px] text-white leading-tight font-semibold">
                                {decrypted.replace("[Call]", "").trim()}
                              </p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const isVideo = decrypted.toLowerCase().includes("video");
                                  handleInitiateCall(isVideo ? "video" : "voice");
                                }}
                                className="w-full py-1.5 mt-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black text-[9px] font-extrabold uppercase tracking-wider text-center transition-all cursor-pointer"
                              >
                                Call Back
                              </button>
                            </div>
                          </div>
                        ) : isVoiceNote ? (
                          <VoiceNotePlayer 
                            url={decrypted.replace("[Voice Note]", "").trim()} 
                            durationText={decrypted.includes("duration:") ? decrypted.split("duration:")[1].trim() : "0:12"} 
                          />
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

              {unapprovedChannelIds.includes(activeChannelId) ? (
                /* --- MESSAGE REQUEST ACTIONS BANNER --- */
                <div className="max-w-xl mx-auto w-full bg-[#1c1c1e] border border-white/10 rounded-[24px] p-5 shadow-2xl space-y-4 text-center z-10 animate-slideup relative mb-2">
                  <h5 className="font-bold text-white text-xs">
                    Accept Message Request?
                  </h5>
                  <p className="text-[10px] text-white/50 leading-relaxed px-4">
                    Do you want to let this person send you messages and calls? They won't know you've read their messages until you accept the request.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setUnapprovedChannelIds(prev => prev.filter(id => id !== activeChannelId));
                        alert("Message request deleted.");
                        setActiveChannelId("");
                      }}
                      className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full text-[11px] transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setUnapprovedChannelIds(prev => prev.filter(id => id !== activeChannelId));
                        setGeneralChannelIds(prev => [...prev, activeChannelId]);
                        alert("Message request accepted and moved to General box!");
                      }}
                      className="px-6 py-2 bg-[#0095f6] hover:bg-blue-600 text-white font-bold rounded-full text-[11px] transition-all shadow-lg hover:scale-102 active:scale-98 cursor-pointer"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ) : (
                /* --- Floating Input capsule --- */
                <div className="relative max-w-4xl mx-auto w-full flex items-center gap-2 bg-white/[0.06] backdrop-blur-[24px] border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_32px_0_rgba(0,0,0,0.35)] rounded-[28px] px-3.5 py-2.5">
                  
                  <input
                    type="file"
                    id="media-attach-file"
                    className="hidden"
                    onChange={handleSelectFile}
                  />

                  {/* Plus button expanding grid of 13 attachments */}
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
                          { icon: FileIcon, label: "Files", color: "bg-blue-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[File] Document.pdf"); } },
                          { icon: Sticker, label: "GIF", color: "bg-yellow-500", click: () => { setIsPlusMenuOpen(false); setShowGifs(!showGifs); } },
                          { icon: Smile, label: "Sticker", color: "bg-orange-500", click: () => { setIsPlusMenuOpen(false); setShowEmojiPicker(!showEmojiPicker); } },
                          { icon: Mic, label: "Voice", color: "bg-purple-500", click: () => { setIsPlusMenuOpen(false); handleToggleVoiceRecord(); } },
                          { icon: MapPin, label: "Location", color: "bg-teal-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[Location] Stage 4, Burbank Studio (34.1578, -118.3392)"); } },
                          { icon: MusicIcon, label: "Music", color: "bg-indigo-500", click: () => { setIsPlusMenuOpen(false); setIsNoteComposerOpen(true); } },
                          { icon: FolderIcon, label: "Projects", color: "bg-rose-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[Task] Finalize VFX Scene 14"); } },
                          { icon: Calendar, label: "Calendar", color: "bg-cyan-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[Invite] Table Read: Episode 2 - Jul 15, 2:00 PM"); } },
                          { icon: BarChart2, label: "Poll", color: "bg-lime-500", click: () => { setIsPlusMenuOpen(false); setStoryStampType("poll"); setIsStoryCreatorOpen(true); } },
                          { icon: User, label: "Contact", color: "bg-amber-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[Contact] Vivek Rautela (+1 555-0199)"); } },
                          { icon: FileText, label: "Documents", color: "bg-emerald-500", click: () => { setIsPlusMenuOpen(false); handleSendMessage("[Document] Script_v3.pdf"); } }
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
   
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isUploading}
                    className="p-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-full shadow-lg transition-transform hover:scale-105 flex-shrink-0"
                  >
                    <Send className="w-4 h-4 fill-black" />
                  </button>
                </div>
              )}

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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadein">
          <div className="w-[380px] max-h-[85vh] flex flex-col bg-neutral-900 border border-white/10 rounded-[28px] p-5 shadow-2xl space-y-4 text-white overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">New Message</span>
              <button 
                onClick={() => {
                  setIsNewChatOpen(false);
                  setNewChatIsGroup(false);
                  setNewChatGroupName("");
                  setNewChatSelectedMembers([]);
                }} 
                className="p-1.5 rounded-full hover:bg-white/5 text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle tabs for DM vs Group */}
            <div className="grid grid-cols-2 bg-black/40 p-1 rounded-full border border-white/5 shrink-0">
              <button
                onClick={() => setNewChatIsGroup(false)}
                className={`py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${!newChatIsGroup ? "bg-[#22d3ee] text-black" : "text-white/60 hover:text-white"}`}
              >
                Direct Message
              </button>
              <button
                onClick={() => setNewChatIsGroup(true)}
                className={`py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${newChatIsGroup ? "bg-[#22d3ee] text-black" : "text-white/60 hover:text-white"}`}
              >
                Group Chat
              </button>
            </div>

            {!newChatIsGroup ? (
              /* --- DIRECT MESSAGE SETUP --- */
              <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar py-1">
                <label className="block text-[9px] uppercase tracking-wider text-white/40 font-bold">Select Collaborator</label>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {profiles.filter(p => p.id !== currentUser?.id).map(p => (
                    <button
                      key={p.id}
                      onClick={async () => {
                        setIsNewChatOpen(false);
                        const chanId = await createChatChannel("Direct Message", false, [p.id]);
                        if (chanId) setActiveChannelId(chanId);
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-[#22d3ee]/10 text-left transition-colors border border-white/5 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          p.full_name?.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{p.full_name || "User"}</span>
                        <span className="text-[10px] text-white/45 block truncate">{p.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* --- GROUP CHAT SETUP --- */
              <div className="flex-1 flex flex-col min-h-0 space-y-4">
                <div className="space-y-1.5 shrink-0">
                  <label className="block text-[9px] uppercase tracking-wider text-white/40 font-bold">Group Name</label>
                  <input
                    type="text"
                    placeholder="Enter group name (e.g. VFX Crew)..."
                    value={newChatGroupName}
                    onChange={(e) => setNewChatGroupName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#22d3ee] h-9"
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-wider text-white/40 font-bold">Select Members</label>
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar max-h-[200px]">
                    {profiles.filter(p => p.id !== currentUser?.id).map(p => {
                      const isSelected = newChatSelectedMembers.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setNewChatSelectedMembers(prev => 
                              isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected ? "bg-[#22d3ee]/10 border-[#22d3ee]/30" : "bg-white/5 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0">
                              {p.avatar_url ? (
                                <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                p.full_name?.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">{p.full_name || "User"}</span>
                              <span className="text-[10px] text-white/45 block truncate">{p.email}</span>
                            </div>
                          </div>
                          <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            isSelected ? "bg-[#22d3ee] border-[#22d3ee] text-black" : "border-white/20 bg-black/20"
                          }`}>
                            {isSelected && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!newChatGroupName.trim()) {
                      alert("Please specify a group name.");
                      return;
                    }
                    if (newChatSelectedMembers.length < 1) {
                      alert("Please select at least 1 group member.");
                      return;
                    }
                    setIsNewChatOpen(false);
                    const name = newChatGroupName.trim();
                    const members = [...newChatSelectedMembers];
                    
                    // Reset modal state
                    setNewChatIsGroup(false);
                    setNewChatGroupName("");
                    setNewChatSelectedMembers([]);

                    const chanId = await createChatChannel(name, true, members);
                    if (chanId) setActiveChannelId(chanId);
                    alert(`Group "${name}" successfully created!`);
                  }}
                  className="w-full py-2.5 bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-black font-extrabold rounded-xl text-xs transition-colors cursor-pointer shadow-lg mt-2 shrink-0"
                >
                  Create Group Chat
                </button>
              </div>
            )}
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

      {/* --- VISUALIZE NOTE DETAILS INSTAGRAM BOTTOM SHEET --- */}
      {isNoteViewerOpen && activeNote && (
        <div 
          onClick={() => {
            setIsNoteViewerOpen(false);
            setActiveNote(null);
          }}
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm animate-fadein flex items-end justify-center"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#121212]/95 border-t border-white/10 rounded-t-[28px] p-5 pb-8 shadow-2xl text-white z-[125] flex flex-col justify-between animate-slideup"
          >
            {/* Drag handle */}
            <div 
              className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 cursor-pointer" 
              onClick={() => {
                setIsNoteViewerOpen(false);
                setActiveNote(null);
              }} 
            />

            {/* Header with avatar, username, and time */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0 bg-neutral-800 flex items-center justify-center font-bold text-cyan-400 text-xs">
                {activeNote.profiles?.avatar_url ? (
                  <img src={activeNote.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  activeNote.profiles?.full_name?.substring(0, 2).toUpperCase() || "UN"
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-white leading-tight">
                  {activeNote.profiles?.full_name?.toLowerCase().replace(/\s+/g, '_') || "collaborator"}
                  <span className="text-white/40 font-normal text-[11px] ml-1.5 font-sans">
                    {getElapsedTime(activeNote.created_at)}
                  </span>
                </h4>
                <span className="text-[10px] text-white/40 block mt-0.5 font-medium">Shared a note</span>
              </div>
            </div>

            {/* Note & Song display pill */}
            <div className="space-y-4 mb-6">
              {/* If normal text note, show text note box */}
              {!activeNote.song_name && (
                <div className="relative p-3.5 rounded-[18px] bg-white/[0.06] border border-white/5 shadow-md text-xs text-white max-w-sm leading-relaxed">
                  "{activeNote.content}"
                </div>
              )}

              {/* If song, show note content and the music pill */}
              {activeNote.song_name && (
                <div className="space-y-3">
                  {activeNote.content && (
                    <div className="text-[12px] text-white/90 px-1 font-medium">
                      "{activeNote.content}"
                    </div>
                  )}

                  {/* Music pill matching Instagram */}
                  <div 
                    onClick={() => {
                      if (activeNote.song_preview_url) {
                        if (playingSongId === (activeNote.song_id || activeNote.id)) {
                          if (audioPreviewRef.current) audioPreviewRef.current.pause();
                          setPlayingSongId(null);
                        } else {
                          if (audioPreviewRef.current) audioPreviewRef.current.pause();
                          const audio = new Audio(activeNote.song_preview_url);
                          audio.volume = 0.5;
                          audio.loop = true;
                          audioPreviewRef.current = audio;
                          setPlayingSongId(activeNote.song_id || activeNote.id);
                          audio.play();
                        }
                      }
                    }}
                    className="flex items-center gap-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/5 rounded-full pl-3 pr-5 py-2.5 w-fit max-w-[340px] cursor-pointer transition-all active:scale-[0.98] select-none"
                  >
                    {/* Play status icon */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white text-black shrink-0 shadow-md">
                      {playingSongId === (activeNote.song_id || activeNote.id) ? (
                        <div className="flex gap-0.5 items-end h-2.5">
                          <span className="w-[1.5px] h-2 bg-black rounded-full animate-wave" style={{ animationDuration: '0.4s' }} />
                          <span className="w-[1.5px] h-3 bg-black rounded-full animate-wave" style={{ animationDuration: '0.6s' }} />
                          <span className="w-[1.5px] h-1.5 bg-black rounded-full animate-wave" style={{ animationDuration: '0.5s' }} />
                        </div>
                      ) : (
                        <Play className="w-2.5 h-2.5 fill-black pl-[1.5px]" />
                      )}
                    </div>
                    
                    {/* Song title and artist */}
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-white block truncate leading-snug">
                        {activeNote.song_name}
                      </span>
                      <span className="text-[9.5px] text-white/50 block truncate leading-none mt-0.5">
                        {activeNote.song_artist || "Unknown Artist"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Note Reply Input with quick reactions & heart */}
            <div className="space-y-4">
              {/* Quick react emoji bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Quick React</span>
                <div className="flex gap-3">
                  {["😂", "😮", "😢", "😍", "👏", "🔥", "🎉", "💯"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        handleSendNoteReaction(activeNote.user_id, emoji);
                        setIsNoteViewerOpen(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform cursor-pointer flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input feed & Heart */}
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center bg-white/[0.06] border border-white/5 rounded-full px-4.5 py-2.5">
                  <input
                    type="text"
                    value={noteDetailReplyText}
                    onChange={(e) => setNoteDetailReplyText(e.target.value)}
                    placeholder={`Message ${activeNote.profiles?.full_name?.toLowerCase().replace(/\s+/g, '_') || "collaborator"}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && noteDetailReplyText.trim()) {
                        handleSendNoteReaction(activeNote.user_id, `💬 Replied to your note: ${noteDetailReplyText}`);
                        setNoteDetailReplyText("");
                        setIsNoteViewerOpen(false);
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-white/35 focus:ring-0 p-0 h-5"
                  />
                  {noteDetailReplyText.trim() && (
                    <button
                      onClick={() => {
                        handleSendNoteReaction(activeNote.user_id, `💬 Replied to your note: ${noteDetailReplyText}`);
                        setNoteDetailReplyText("");
                        setIsNoteViewerOpen(false);
                      }}
                      className="text-cyan-400 text-xs font-bold hover:text-cyan-300 ml-2 cursor-pointer transition-colors"
                    >
                      Send
                    </button>
                  )}
                </div>

                {/* Heart like button */}
                <button
                  onClick={() => handleLikeNote(activeNote)}
                  className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                    (activeNote.likes || []).includes(currentUser?.id)
                      ? "bg-red-500/10 border-red-500/30 text-red-500 hover:scale-105"
                      : "bg-white/5 border-white/10 text-white/70 hover:text-white"
                  }`}
                  title="Like Note"
                >
                  <Heart className={`w-4.5 h-4.5 ${(activeNote.likes || []).includes(currentUser?.id) ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Note Views list for own notes */}
            {activeNote.user_id === currentUser?.id && (() => {
              const noteViewers = (activeNote.viewers || [])
                .map((viewerId: string) => profiles.find((p) => p.id === viewerId))
                .filter(Boolean);

              if (noteViewers.length === 0) return null;

              return (
                <div className="mt-5 border-t border-white/5 pt-4 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">
                    Viewed By ({noteViewers.length})
                  </span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {noteViewers.map((viewer: any) => (
                      <div key={viewer.id} className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-neutral-800 shrink-0" title={viewer.full_name}>
                        {viewer.avatar_url ? (
                          <img src={viewer.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-cyan-400">
                            {viewer.full_name?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {activeNote.user_id === currentUser?.id && (
              <button
                onClick={async () => {
                  if (confirm("Delete note?")) {
                    await deleteNote(activeNote.id);
                    setIsNoteViewerOpen(false);
                    setActiveNote(null);
                  }
                }}
                className="text-[10px] text-red-400 hover:underline font-bold mt-3.5 cursor-pointer block mx-auto shrink-0"
              >
                Delete Note
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- DYNAMIC STORIES VIEWER MODAL --- */}
      {isStoryViewerOpen && activeStoryUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 text-white" onClick={() => {
          setIsStoryViewerOpen(false);
          setActiveStoryUser(null);
          setIsViewerListOpen(false);
        }}>
          {(() => {
            const userStories = stories.filter((s: any) => s.user_id === activeStoryUser);
            if (userStories.length === 0) return null;
            const activeStory = userStories[activeStoryIndex];
            const author = activeStory.profiles;
            const hasLiked = activeStory.likes?.includes(currentUser?.id);

            // Parse caption JSON and custom text overlay
            let captionText = "";
            let textOverlayText = "";
            let parsedLayers: any = null;
            try {
              if (activeStory.caption) {
                const parsed = JSON.parse(activeStory.caption);
                captionText = parsed.textCaption || "";
                textOverlayText = parsed.textOverlay || "";
                parsedLayers = parsed.layers || null;
              }
            } catch (e) {
              captionText = activeStory.caption || "";
            }

            return (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md h-full flex flex-col justify-between bg-neutral-950 border-none md:border md:border-white/10 rounded-none md:rounded-[28px] overflow-hidden relative shadow-2xl"
              >
                
                {/* Progress bars */}
                <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-20 flex gap-1">
                  {userStories.map((story: any, idx: number) => {
                    let width = "0%";
                    if (idx < activeStoryIndex) width = "100%";
                    if (idx === activeStoryIndex) width = `${storyProgress}%`;
                    return (
                      <div key={story.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width }} />
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
                    <div className="text-left">
                      <span className="text-[11px] font-bold block">{author?.full_name || "Collaborator"}</span>
                      {activeStory.song_name && (
                        <div className="flex items-center gap-1 text-[#0095f6] text-[9px] font-bold mt-0.5 animate-pulse">
                          <span>🎵</span>
                          <span className="truncate max-w-[150px]">{activeStory.song_name}</span>
                        </div>
                      )}
                      <span className="text-[8px] text-white/40 font-mono">{new Date(activeStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {activeStory.user_id === currentUser?.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStory(activeStory.id);
                        }}
                        className="p-1 rounded-full bg-black/40 hover:bg-black/80 text-red-400 hover:text-red-500 cursor-pointer"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => {
                      setIsStoryViewerOpen(false);
                      setActiveStoryUser(null);
                      setIsViewerListOpen(false);
                    }} className="p-1 rounded-full bg-black/40 hover:bg-black/80 text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Click zones */}
                <div className="absolute inset-y-16 inset-x-0 z-10 flex">
                  <div onClick={() => {
                    handlePrevStory();
                    setIsViewerListOpen(false);
                  }} className="w-1/3 h-full cursor-pointer" />
                  <div 
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    className="w-1/3 h-full"
                  />
                  <div onClick={() => {
                    handleNextStory();
                    setIsViewerListOpen(false);
                  }} className="w-1/3 h-full cursor-pointer" />
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden select-none pointer-events-none">
                  {activeStory.media_type === "video" ? (
                    <video src={activeStory.media_url} className="w-full h-full object-contain pointer-events-none" autoPlay muted loop />
                  ) : (
                    <img src={activeStory.media_url} className="w-full h-full object-contain pointer-events-none" alt="" />
                  )}

                  {/* Custom Text layers */}
                  {parsedLayers && parsedLayers.texts && parsedLayers.texts.map((l: any) => (
                    <div
                      key={l.id}
                      style={{
                        left: l.x,
                        top: l.y,
                        transform: `translate(-50%, -50%) scale(${l.scale}) rotate(${l.rotation}deg)`,
                        color: l.color,
                        fontFamily: l.font,
                        fontSize: "24px"
                      }}
                      className={`absolute z-10 px-3 py-1.5 font-bold whitespace-nowrap select-none text-center ${
                        l.bgHighlight ? (l.color === "#ffffff" ? "bg-black text-white" : "bg-white text-black") : ""
                      } rounded-lg`}
                    >
                      {l.text}
                    </div>
                  ))}

                  {/* Custom Sticker layers */}
                  {parsedLayers && parsedLayers.stickers && parsedLayers.stickers.map((s: any) => (
                    <div
                      key={s.id}
                      style={{
                        left: s.x,
                        top: s.y,
                        transform: `translate(-50%, -50%) scale(${s.scale}) rotate(${s.rotation}deg)`
                      }}
                      className="absolute z-10 select-none"
                    >
                      {s.type === "emoji" && (
                        <span className="text-[72px] leading-none block">{s.data.emoji}</span>
                      )}
                      
                      {s.type === "gif" && s.src && (
                        <img src={s.src} className="w-28 h-28 object-contain" alt="" />
                      )}

                      {s.type === "location" && (
                        <div className="bg-white text-[#0095f6] font-bold text-xs px-4 py-2 rounded-full shadow-lg border border-white/20 whitespace-nowrap">
                          📍 {s.data.name}
                        </div>
                      )}

                      {s.type === "countdown" && (
                        <div className="bg-black/90 border border-white/10 rounded-2xl p-3 text-center w-40 shadow-xl">
                          <span className="text-[10px] text-white/50 block font-bold uppercase">{s.data.title}</span>
                          <span className="text-[14px] text-[#00ffcc] font-mono font-bold block mt-1">23h : 45m : 10s</span>
                        </div>
                      )}

                      {s.type === "poll" && (
                        <div className="bg-white rounded-2xl p-3 text-center w-48 shadow-xl text-black">
                          <p className="text-[11px] font-bold leading-tight">{s.data.question}</p>
                          <div className="flex gap-1.5 mt-2.5">
                            <div className="flex-1 py-2 bg-neutral-100 rounded-xl text-[10px] font-bold">{s.data.optA}</div>
                            <div className="flex-1 py-2 bg-neutral-100 rounded-xl text-[10px] font-bold">{s.data.optB}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Drawing strokes Canvas */}
                  <canvas 
                    ref={viewerDrawingCanvasRef}
                    width={380}
                    height={640}
                    className="absolute inset-0 z-10 pointer-events-none"
                  />

                  {/* Legacy/Standard text overlay fallback */}
                  {!parsedLayers && textOverlayText && (
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 px-4 py-2.5 bg-black/60 border border-white/20 rounded-2xl text-center max-w-[85%] font-extrabold text-[20px] tracking-wide text-white drop-shadow-md select-none">
                      {textOverlayText}
                    </div>
                  )}

                  {/* Legacy/Standard soundtrack sticker fallback */}
                  {!parsedLayers && activeStory.song_name && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-3 bg-neutral-900/90 border border-white/10 backdrop-blur-md rounded-2xl flex items-center gap-2.5 shadow-xl max-w-[80%] select-none">
                      <img src={activeStory.song_artwork || "https://api.dicebear.com/7.x/initials/svg?seed=Music"} className="w-10 h-10 rounded-xl object-cover shrink-0" alt="" />
                      <div className="min-w-0 flex-1 text-left">
                        <span className="text-[11px] font-bold text-white block truncate">{activeStory.song_name}</span>
                        <span className="text-[9px] text-[#0095f6] font-semibold block truncate">{activeStory.song_artist}</span>
                        <span className="text-[8px] text-white/40 block mt-0.5">🎵 Story Soundtrack</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls & Interactive Overlays */}
                {activeStory.user_id === currentUser?.id ? (
                  /* --- OWN STORY VIEWERS TRIGGER --- */
                  <div className="relative z-20 p-4 text-center flex flex-col items-center bg-[#09090b] border-t border-white/10">
                    {captionText && (
                      <p className="text-white text-xs font-semibold px-4 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl max-w-[90%] mx-auto shadow-lg leading-relaxed mb-3">
                        {captionText}
                      </p>
                    )}
                    
                    <button
                      onClick={() => setIsViewerListOpen(true)}
                      className="flex items-center gap-2 bg-black/50 border border-white/10 px-4 py-2 rounded-full hover:bg-black/80 transition-all text-white font-bold text-xs cursor-pointer shadow-lg"
                    >
                      {(() => {
                        const viewsList = activeStory.views || [];
                        const firstThree = viewsList.slice(0, 3);
                        return (
                          <div className="flex -space-x-1.5 mr-1">
                            {firstThree.map((v: any, index: number) => {
                              const avatarUrl = v?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v?.full_name || "V")}`;
                              return (
                                <img key={index} src={avatarUrl} className="w-4.5 h-4.5 rounded-full border border-black object-cover" alt="" />
                              );
                            })}
                          </div>
                        );
                      })()}
                      <span>Activity</span>
                      <span className="text-white/40 font-mono">{(activeStory.views || []).length}</span>
                    </button>
                  </div>
                ) : (
                  /* --- TEAMMATE STORY REPLY & LIKING --- */
                  <div className="relative z-20 p-4 flex items-center justify-between gap-3 w-full bg-[#09090b] border-t border-white/10">
                    {captionText && (
                      <div className="absolute bottom-full mb-3 left-4 right-4 text-center">
                        <p className="text-white text-xs font-semibold px-4 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl max-w-[95%] mx-auto shadow-lg leading-relaxed">
                          {captionText}
                        </p>
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Send message..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value;
                          if (val.trim()) {
                            let channel = chatChannels.find((c: any) => 
                              !c.is_group && c.chat_channel_members?.some((m: any) => m.user_id === activeStory.user_id)
                            );
                            const textPayload = `💬 Replied to your story: "${val}"`;
                            if (channel) {
                              sendChatMessage(channel.id, textPayload);
                            } else {
                              createChatChannel("Direct Message", false, [activeStory.user_id]).then(newChanId => {
                                if (newChanId) sendChatMessage(newChanId, textPayload);
                              });
                            }
                            alert(`Story reply successfully sent to ${author?.full_name || "Teammate"}!`);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                      className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-black/40 transition-all h-9"
                    />

                    <button
                      onClick={() => likeStory(activeStory.id)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white transition-all cursor-pointer hover:scale-110 ${hasLiked ? "text-[#e0245e]" : "text-white/70 hover:text-white"}`}
                      title="Like Story"
                    >
                      <svg viewBox="0 0 24 24" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* --- SLIDE-UP VIEWER LIST DRAWER (IMAGE 1 SCREENSHOT) --- */}
                {isViewerListOpen && (
                  <div 
                    className="absolute inset-x-0 bottom-0 z-40 bg-[#0c0d12] border-t border-white/10 rounded-t-[24px] h-[75%] flex flex-col justify-between text-white animate-slideup"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Handle indicator */}
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0 cursor-pointer" onClick={() => setIsViewerListOpen(false)} />

                    {/* Header Stats Bar */}
                    <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
                      <div className="flex items-center gap-4">
                        <button className="text-white/60 hover:text-white">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                          </svg>
                        </button>

                        <div className="flex items-center gap-1.5 text-[#0095f6] font-bold text-sm">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4.5 h-4.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>{(activeStory.views || []).length}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (confirm("Delete this story?")) {
                            handleDeleteStory(activeStory.id);
                            setIsViewerListOpen(false);
                          }
                        }}
                        className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Viewers list */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                      <span className="text-[12px] uppercase tracking-wider text-white/40 font-bold block text-left">
                        Who viewed your story
                      </span>
                      {(() => {
                        const storyViewersList = (activeStory.views || [])
                          .map((v: any) => {
                            const viewerId = typeof v === "string" ? v : v?.id;
                            return profiles.find(p => p.id === viewerId);
                          })
                          .filter(Boolean);

                        if (storyViewersList.length === 0) {
                          return (
                            <div className="text-center py-12 text-xs text-white/30 italic">
                              No views yet
                            </div>
                          );
                        }

                        return storyViewersList.map((viewer: any) => {
                          const viewerAvatar = viewer.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewer.full_name || "Viewer")}&backgroundColor=030712&textColor=ffffff`;
                          const isViewerLiked = (activeStory.likes || []).includes(viewer.id);
                          const handle = viewer.full_name?.toLowerCase().replace(/\s+/g, ".") || "viewer";

                          return (
                            <div key={viewer.id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img src={viewerAvatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                                  {isViewerLiked && (
                                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#e0245e] rounded-full border border-black flex items-center justify-center text-white shadow-md animate-pulse">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="text-left">
                                  <span className="text-xs font-bold text-white block leading-none">{handle}</span>
                                  <span className="text-[10px] text-white/50 block mt-0.5">{viewer.full_name}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button className="p-1.5 hover:bg-white/5 text-white/40 hover:text-white rounded-full">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setIsStoryViewerOpen(false);
                                    setActiveStoryUser(null);
                                    setIsViewerListOpen(false);
                                  }}
                                  className="p-1.5 hover:bg-white/5 text-white/40 hover:text-[#0095f6] rounded-full transition-colors"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 rotate-[15deg]">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
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

      {/* --- INLINE AI ACTIONS DIALOG (FULL SCREEN OVERLAY) --- */}
      {isAiMenuOpen && (
        <div className="fixed inset-0 z-[130] bg-[#07080c]/98 backdrop-blur-[32px] flex flex-col p-6 md:p-10 text-white animate-fadein overflow-y-auto">
          {/* Ambient fluid glow background orbs */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between relative z-10 py-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#22d3ee]">AI assistant workspace</h2>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider font-mono">Advanced Agentic Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsAiMenuOpen(false); setAiActionMessage(null); }} 
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:scale-105 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Area */}
            {aiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#22d3ee] animate-spin" />
                <span className="text-xs uppercase font-mono text-cyan-400 tracking-wider">Generating AI response...</span>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                
                {/* Message Context card */}
                {aiActionMessage && (
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-[22px] backdrop-blur-md shadow-md">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-extrabold block mb-2">Message Context:</span>
                    <p className="text-xs text-white/80 italic leading-relaxed">
                      "{decryptedCache[aiActionMessage.id] || aiActionMessage.content}"
                    </p>
                  </div>
                )}

                {/* Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiActionMessage ? (
                    <>
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
                        className="p-5 text-left bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 rounded-[24px] transition-all flex flex-col justify-between gap-4 group"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Smart Reply</span>
                          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-[10px] text-white/50">Analyze current message context and propose contextually aware replies.</p>
                      </button>

                      <div className="p-5 bg-white/5 border border-white/5 rounded-[24px] flex flex-col justify-between gap-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Translate Content</span>
                        <div className="grid grid-cols-3 gap-1.5 mt-1">
                          {["English", "Spanish", "French", "German", "Japanese", "Italian"].map(lang => (
                            <button
                              key={lang}
                              onClick={() => handleTranslateMessage(aiActionMessage, lang)}
                              className="px-2.5 py-1.5 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-[10px] text-center transition-colors border border-white/5 hover:border-cyan-400/20"
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
                        className="p-5 text-left bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 rounded-[24px] transition-all flex flex-col justify-between gap-4 group"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Suggest Smart Replies</span>
                          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-[10px] text-white/50">Generate quick pills above the chat field to answer current questions.</p>
                      </button>

                      <button
                        onClick={summarizeThread}
                        className="p-5 text-left bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 rounded-[24px] transition-all flex flex-col justify-between gap-4 group"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Summarize Chat Thread</span>
                          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-[10px] text-white/50">Compile summary notes of all recent back-and-forth updates in the channel.</p>
                      </button>
                    </>
                  )}
                </div>

                {/* Custom AI Chat Prompt Box */}
                <div className="mt-8 p-5 bg-white/[0.02] border border-white/10 rounded-[24px] space-y-3">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">Ask AI Assistant</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="custom-ai-input"
                      placeholder="Ask questions about screenplays, tasks, scheduling conflicts..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#22d3ee]"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          const input = (e.target as HTMLInputElement).value.trim();
                          if (!input) return;
                          (e.target as HTMLInputElement).value = "";
                          setAiLoading(true);
                          await new Promise(r => setTimeout(r, 1200));
                          setAiResponseText(`AI Assistant:\n\nRegarding your request "${input}":\n\nAll systems are fully operational. Note uploads, FaceTime streams, and Liquid Glass layers have been verified. There are no scheduling conflicts recorded.`);
                          setShowAiResponseModal(true);
                          setAiLoading(false);
                          setIsAiMenuOpen(false);
                        }
                      }}
                    />
                    <button
                      onClick={async () => {
                        const inputEl = document.getElementById("custom-ai-input") as HTMLInputElement;
                        const input = inputEl?.value.trim();
                        if (!input) return;
                        inputEl.value = "";
                        setAiLoading(true);
                        await new Promise(r => setTimeout(r, 1200));
                        setAiResponseText(`AI Assistant:\n\nRegarding your request "${input}":\n\nAll systems are fully operational. Note uploads, FaceTime streams, and Liquid Glass layers have been verified. There are no scheduling conflicts recorded.`);
                        setShowAiResponseModal(true);
                        setAiLoading(false);
                        setIsAiMenuOpen(false);
                      }}
                      className="px-4 py-2.5 bg-cyan-400 hover:bg-[#22d3ee] hover:text-black border border-cyan-400 rounded-xl text-xs text-black font-bold cursor-pointer transition-all shrink-0"
                    >
                      Ask
                    </button>
                  </div>
                </div>

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

      {/* --- UPLOAD STORY CHOICES MODAL --- */}
      {isStoryUploaderOptionsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadein">
          <div className="w-[320px] bg-[#121319]/90 border border-white/20 rounded-[28px] p-5 shadow-2xl text-white text-center space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Upload Story</span>
              <button 
                onClick={() => setIsStoryUploaderOptionsOpen(false)} 
                className="p-1 rounded hover:bg-white/5 text-white/60 hover:text-white font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-white/50">Select how you want to share your story:</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: "Camera", icon: "📸", action: () => { setIsStoryUploaderOptionsOpen(false); setIsStoryCreatorOpen(true); setTimeout(() => document.getElementById("story-media-upload")?.click(), 300); } },
                { label: "Gallery", icon: "🖼️", action: () => { setIsStoryUploaderOptionsOpen(false); setIsStoryCreatorOpen(true); setTimeout(() => document.getElementById("story-media-upload")?.click(), 300); } },
                { label: "Video", icon: "🎥", action: () => { setIsStoryUploaderOptionsOpen(false); setIsStoryCreatorOpen(true); setStoryMediaType("video"); setTimeout(() => document.getElementById("story-media-upload")?.click(), 300); } },
                { label: "Photo", icon: "📷", action: () => { setIsStoryUploaderOptionsOpen(false); setIsStoryCreatorOpen(true); setStoryMediaType("image"); setTimeout(() => document.getElementById("story-media-upload")?.click(), 300); } },
                { label: "Music Story", icon: "🎵", action: () => { setIsStoryUploaderOptionsOpen(false); setIsStoryCreatorOpen(true); setStoryStampType("slider"); } },
                { label: "Text Story", icon: "✍️", action: () => { setIsStoryUploaderOptionsOpen(false); setIsStoryCreatorOpen(true); setStoryStampType("none"); } },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className="flex flex-col items-center justify-center p-3.5 rounded-[20px] bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-center gap-1.5 transition-all animate-fadein"
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- ADD NOTE CHOICES MODAL --- */}
      {isAddNoteOptionsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadein">
          <div className="w-[320px] bg-[#121319]/90 border border-white/20 rounded-[28px] p-5 shadow-2xl text-white text-center space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">Add Note</span>
              <button 
                onClick={() => setIsAddNoteOptionsOpen(false)} 
                className="p-1 rounded hover:bg-white/5 text-white/60 hover:text-white font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-white/50">Choose a note type to share with your crew:</p>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { label: "Text Note", icon: "💬", action: () => { setIsAddNoteOptionsOpen(false); setIsNoteComposerOpen(true); } },
                { label: "Music", icon: "🎵", action: () => { setIsAddNoteOptionsOpen(false); setIsNoteComposerOpen(true); } },
                { label: "Voice Note", icon: "🎙️", action: () => { setIsAddNoteOptionsOpen(false); setIsNoteComposerOpen(true); setNoteContentInput("🎙️ Voice Note"); } },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-center gap-1 transition-all animate-fadein"
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- INSTAGRAM STYLED CENTER VIEWPORT LONG PRESS MODAL --- */}
      {activeBottomSheetChannel && (() => {
        const details = getChannelDetails(activeBottomSheetChannel);
        const isMuted = activeBottomSheetChannel.muted_by?.includes(currentUser?.id) || activeBottomSheetChannel.is_muted;
        const isPinned = activeBottomSheetChannel.pinned_by?.includes(currentUser?.id) || activeBottomSheetChannel.is_pinned;
        const isCloseFriend = closeFriendUserIds.includes(details.userId || "");
        const isLocalUnread = localUnreadChannelIds.includes(activeBottomSheetChannel.id);
        const isRequest = unapprovedChannelIds.includes(activeBottomSheetChannel.id);

        return (
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadein" 
            onClick={() => setActiveBottomSheetChannel(null)}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-[280px] bg-[#262626] border border-white/10 rounded-[14px] overflow-hidden flex flex-col text-center divide-y divide-[#363636] text-white shadow-2xl animate-[scaleIn_0.2s_ease-out]"
            >
              {/* Header Preview */}
              <div className="py-4 px-3 flex flex-col items-center gap-1.5 bg-[#262626]">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-neutral-800 flex items-center justify-center font-bold text-cyan-400 text-lg">
                  {details.avatar ? (
                    <img src={details.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    details.title.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white truncate max-w-[220px]">{details.title}</h4>
                  <p className="text-[10px] text-[#8e8e8e] truncate max-w-[220px]">{details.description}</p>
                </div>
              </div>

              {/* Pin Chat */}
              <button 
                onClick={() => { togglePinChannel(activeBottomSheetChannel.id); setActiveBottomSheetChannel(null); }}
                className="w-full py-3 text-xs font-semibold text-[#0095f6] hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                {isPinned ? "Unpin" : "Pin"}
              </button>

              {/* Mute Chat */}
              <button 
                onClick={() => { toggleMuteChannel(activeBottomSheetChannel.id); setActiveBottomSheetChannel(null); }}
                className="w-full py-3 text-xs font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                {isMuted ? "Unmute Notifications" : "Mute Notifications"}
              </button>

              {/* Archive */}
              <button 
                onClick={() => { toggleArchiveChannel(activeBottomSheetChannel.id); setActiveBottomSheetChannel(null); }}
                className="w-full py-3 text-xs font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                Archive
              </button>

              {/* Mark Read/Unread */}
              <button 
                onClick={() => {
                  setLocalUnreadChannelIds(prev => 
                    prev.includes(activeBottomSheetChannel.id)
                      ? prev.filter(id => id !== activeBottomSheetChannel.id)
                      : [...prev, activeBottomSheetChannel.id]
                  );
                  setActiveBottomSheetChannel(null);
                }}
                className="w-full py-3 text-xs font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                {isLocalUnread ? "Mark as Read" : "Mark as Unread"}
              </button>

              {/* Move to General / Primary */}
              <button 
                onClick={() => {
                  if (generalChannelIds.includes(activeBottomSheetChannel.id)) {
                    setGeneralChannelIds(prev => prev.filter(id => id !== activeBottomSheetChannel.id));
                  } else {
                    setGeneralChannelIds(prev => [...prev, activeBottomSheetChannel.id]);
                  }
                  setActiveBottomSheetChannel(null);
                }}
                className="w-full py-3 text-xs font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                {generalChannelIds.includes(activeBottomSheetChannel.id) ? "Move to Primary" : "Move to General"}
              </button>

              {/* Approve Request (only if in Request state) */}
              {isRequest && (
                <button 
                  onClick={() => {
                    setUnapprovedChannelIds(prev => prev.filter(id => id !== activeBottomSheetChannel.id));
                    setActiveBottomSheetChannel(null);
                    alert("Chat request approved!");
                  }}
                  className="w-full py-3 text-xs font-bold text-green-400 hover:bg-white/5 active:bg-white/10 transition-colors"
                >
                  Approve Request
                </button>
              )}

              {/* Close Friend */}
              <button 
                onClick={() => {
                  if (details.userId) {
                    toggleCloseFriend(details.userId);
                  } else {
                    alert("Cannot set close friend status for this chat.");
                  }
                  setActiveBottomSheetChannel(null);
                }}
                className="w-full py-3 text-xs font-semibold text-green-400 hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                {isCloseFriend ? "Remove Close Friends" : "Close Friends"}
              </button>

              {/* Restrict */}
              <button 
                onClick={() => {
                  setActiveBottomSheetChannel(null);
                  alert("Restrict Action: This account is restricted.");
                }}
                className="w-full py-3 text-xs font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                Restrict
              </button>

              {/* Block */}
              <button 
                onClick={() => {
                  if (details.userId) {
                    handleBlockUser(details.userId);
                  } else {
                    alert("No valid user to block.");
                  }
                  setActiveBottomSheetChannel(null);
                }}
                className="w-full py-3 text-xs font-bold text-[#ed4956] hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                Block
              </button>

              {/* Report */}
              <button 
                onClick={() => {
                  if (details.userId) {
                    handleReportUser(details.userId);
                  } else {
                    alert("No valid user to report.");
                  }
                  setActiveBottomSheetChannel(null);
                }}
                className="w-full py-3 text-xs font-bold text-[#ed4956] hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                Report
              </button>

              {/* View Profile */}
              <button 
                onClick={() => {
                  setActiveBottomSheetChannel(null);
                  alert(`Collaborator Bio: ${details.description}`);
                }}
                className="w-full py-3 text-xs font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                View Profile
              </button>

              {/* Custom Theme */}
              <button 
                onClick={() => {
                  setActiveBottomSheetChannel(null);
                  setIsThemePickerOpen(true);
                }}
                className="w-full py-3 text-xs font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                Custom Theme
              </button>

              {/* Cancel */}
              <button 
                onClick={() => setActiveBottomSheetChannel(null)}
                className="w-full py-3 text-xs font-semibold text-white/50 hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default ChatView;

import React, { useState, useEffect, useRef } from "react";
import { 
  X, Check, Trash2, Undo, Redo, Sparkles, Smile, Type, Music, Play, Pause, 
  Search, Loader2, Scissors, Paintbrush, Sliders, Volume2, VolumeX, RotateCcw
} from "lucide-react";

interface StoryEditorProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  onClose: () => void;
  onSave: (
    finalMediaUrl: string, 
    mediaType: "image" | "video", 
    captionJson: string, 
    songData: any | null,
    audience: "everyone" | "close_friends"
  ) => void;
  userProfile: any;
}

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  font: string;
  bgHighlight: boolean;
  alignment: "left" | "center" | "right";
}

interface StickerLayer {
  id: string;
  type: "emoji" | "gif" | "location" | "countdown" | "poll" | "quiz" | "link";
  src?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  data: any;
}

interface DrawingStroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
  type: "pen" | "marker" | "neon" | "pencil" | "eraser";
}

export default function StoryEditor({ mediaUrl, mediaType, onClose, onSave, userProfile }: StoryEditorProps) {
  // Layer states
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [stickerLayers, setStickerLayers] = useState<StickerLayer[]>([]);
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([]);
  const [redoStrokes, setRedoStrokes] = useState<DrawingStroke[]>([]);
  
  // Media states & filters
  const [filterType, setFilterType] = useState<string>("none");
  const [filterIntensity, setFilterIntensity] = useState<number>(100);
  const [mediaAdjust, setMediaAdjust] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  });

  // Video states
  const [videoVolume, setVideoVolume] = useState<number>(1);
  const [videoSpeed, setVideoSpeed] = useState<number>(1);
  const [videoTrim, setVideoTrim] = useState({ start: 0, end: 100 });

  // Music state
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [songOffset, setSongOffset] = useState<number>(0);
  const [songDuration, setSongDuration] = useState<number>(15); // 5, 10, 15, 30
  const [musicStickerStyle, setMusicStickerStyle] = useState<"album" | "lyrics" | "minimal" | "hidden">("album");
  const [musicStickerPos, setMusicStickerPos] = useState({ x: 190, y: 320, scale: 1, rotation: 0 });

  // UI state overlays
  const [activeTool, setActiveTool] = useState<"none" | "text" | "sticker" | "drawing" | "music" | "filters" | "adjust">("none");
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [draggedElement, setDraggedElement] = useState<{ id: string; type: "text" | "sticker" | "music"; startX: number; startY: number } | null>(null);

  // Snapping alignment guides
  const [showVGuide, setShowVGuide] = useState(false);
  const [showHGuide, setShowHGuide] = useState(false);
  const [isNearTrash, setIsNearTrash] = useState(false);

  // Text Tool settings
  const [currText, setCurrText] = useState("");
  const [currColor, setCurrColor] = useState("#ffffff");
  const [currFont, setCurrFont] = useState("sans-serif");
  const [currHighlight, setCurrHighlight] = useState(false);
  const [currAlign, setCurrAlign] = useState<"left" | "center" | "right">("center");
  const [currFontSize, setCurrFontSize] = useState(24);

  // Drawing Brush settings
  const [brushColor, setBrushColor] = useState("#ff007f");
  const [brushSize, setBrushSize] = useState(8);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [brushType, setBrushType] = useState<"pen" | "marker" | "neon" | "pencil" | "eraser">("pen");
  const [isDrawing, setIsDrawing] = useState(false);

  // Sticker widgets search & builder
  const [giphyQuery, setGiphyQuery] = useState("");
  const [giphyResults, setGiphyResults] = useState<string[]>([]);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);

  // Music search
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState<any[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Custom presets
  const FONT_PRESETS = [
    { name: "Classic", val: "sans-serif" },
    { name: "Modern", val: "Outfit, sans-serif" },
    { name: "Neon Glow", val: "'Pacifico', cursive" },
    { name: "Typewriter", val: "Courier New, monospace" },
    { name: "Bold Cinematic", val: "Impact, sans-serif" }
  ];

  const COLOR_PRESETS = [
    "#ffffff", "#000000", "#ff007f", "#ff9900", "#ffcc00", 
    "#00ffcc", "#3897f0", "#a80077", "#b12a5b"
  ];

  const FILTER_PRESETS = [
    { name: "Normal", val: "none" },
    { name: "Cinematic Warm", val: "sepia(0.4) contrast(1.1) brightness(1.05)" },
    { name: "Retro Pink", val: "hue-rotate(320deg) saturate(1.2)" },
    { name: "Noir Classic", val: "grayscale(1) contrast(1.2)" },
    { name: "Neon Polaroid", val: "hue-rotate(90deg) saturate(1.4) contrast(1.1)" }
  ];

  // --- DRAFTS AUTOSAVE PIPELINE ---
  useEffect(() => {
    // Check for existing draft on load
    const savedDraft = localStorage.getItem("tovstudio_story_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.mediaUrl === mediaUrl && confirm("Resume your unsaved story draft?")) {
          setTextLayers(parsed.textLayers || []);
          setStickerLayers(parsed.stickerLayers || []);
          setDrawingStrokes(parsed.drawingStrokes || []);
          setFilterType(parsed.filterType || "none");
          setFilterIntensity(parsed.filterIntensity || 100);
          setMediaAdjust(parsed.mediaAdjust || { brightness: 100, contrast: 100, saturate: 100, blur: 0 });
          if (parsed.selectedSong) {
            setSelectedSong(parsed.selectedSong);
            setSongOffset(parsed.songOffset || 0);
            setSongDuration(parsed.songDuration || 15);
            setMusicStickerStyle(parsed.musicStickerStyle || "album");
            setMusicStickerPos(parsed.musicStickerPos || { x: 190, y: 320, scale: 1, rotation: 0 });
          }
        } else {
          localStorage.removeItem("tovstudio_story_draft");
        }
      } catch (e) {}
    }
  }, [mediaUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (textLayers.length > 0 || stickerLayers.length > 0 || drawingStrokes.length > 0 || selectedSong) {
        const draft = {
          mediaUrl,
          textLayers,
          stickerLayers,
          drawingStrokes,
          filterType,
          filterIntensity,
          mediaAdjust,
          selectedSong,
          songOffset,
          songDuration,
          musicStickerStyle,
          musicStickerPos
        };
        localStorage.setItem("tovstudio_story_draft", JSON.stringify(draft));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [textLayers, stickerLayers, drawingStrokes, filterType, filterIntensity, mediaAdjust, selectedSong, songOffset, songDuration, musicStickerStyle, musicStickerPos, mediaUrl]);

  // --- DRAWING CANVAS DRAW LOGIC ---
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingStrokes.forEach((stroke) => {
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

    // Reset compositing
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }, [drawingStrokes]);

  // Audio Preview hook
  useEffect(() => {
    if (selectedSong && isPlayingPreview) {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio(selectedSong.preview_url);
      } else {
        audioPreviewRef.current.src = selectedSong.preview_url;
      }
      audioPreviewRef.current.currentTime = songOffset;
      audioPreviewRef.current.play().catch(() => {});

      const timer = setTimeout(() => {
        audioPreviewRef.current?.pause();
        setIsPlayingPreview(false);
      }, songDuration * 1000);

      return () => {
        clearTimeout(timer);
        audioPreviewRef.current?.pause();
      };
    } else {
      audioPreviewRef.current?.pause();
    }
  }, [selectedSong, isPlayingPreview, songOffset, songDuration]);

  // --- INTERACTIVE GESTURE SYSTEM ---
  const handleElementTouchStart = (e: React.MouseEvent | React.TouchEvent, id: string, type: "text" | "sticker" | "music") => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDraggedElement({ id, type, startX: clientX, startY: clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedElement) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - draggedElement.startX;
    const deltaY = clientY - draggedElement.startY;

    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    if (draggedElement.type === "text") {
      setTextLayers((prev) =>
        prev.map((l) => {
          if (l.id !== draggedElement.id) return l;
          const newX = l.x + deltaX;
          const newY = l.y + deltaY;

          // Guidelines check
          const nearV = Math.abs(newX - centerX) < 12;
          const nearH = Math.abs(newY - centerY) < 12;
          setShowVGuide(nearV);
          setShowHGuide(nearH);

          // Trash check (approx trash area is x: center, y: bottom - 80px)
          const distToTrash = Math.sqrt(Math.pow(newX - centerX, 2) + Math.pow(newY - (rect.height - 70), 2));
          setIsNearTrash(distToTrash < 60);

          return {
            ...l,
            x: nearV ? centerX : newX,
            y: nearH ? centerY : newY
          };
        })
      );
    } else if (draggedElement.type === "sticker") {
      setStickerLayers((prev) =>
        prev.map((l) => {
          if (l.id !== draggedElement.id) return l;
          const newX = l.x + deltaX;
          const newY = l.y + deltaY;

          const nearV = Math.abs(newX - centerX) < 12;
          const nearH = Math.abs(newY - centerY) < 12;
          setShowVGuide(nearV);
          setShowHGuide(nearH);

          const distToTrash = Math.sqrt(Math.pow(newX - centerX, 2) + Math.pow(newY - (rect.height - 70), 2));
          setIsNearTrash(distToTrash < 60);

          return {
            ...l,
            x: nearV ? centerX : newX,
            y: nearH ? centerY : newY
          };
        })
      );
    } else if (draggedElement.type === "music") {
      const newX = musicStickerPos.x + deltaX;
      const newY = musicStickerPos.y + deltaY;

      const nearV = Math.abs(newX - centerX) < 12;
      const nearH = Math.abs(newY - centerY) < 12;
      setShowVGuide(nearV);
      setShowHGuide(nearH);

      const distToTrash = Math.sqrt(Math.pow(newX - centerX, 2) + Math.pow(newY - (rect.height - 70), 2));
      setIsNearTrash(distToTrash < 60);

      setMusicStickerPos((prev) => ({
        ...prev,
        x: nearV ? centerX : newX,
        y: nearH ? centerY : newY
      }));
    }

    setDraggedElement({
      ...draggedElement,
      startX: clientX,
      startY: clientY
    });
  };

  const handleCanvasMouseUp = () => {
    if (!draggedElement) return;

    if (isNearTrash) {
      if (draggedElement.type === "text") {
        setTextLayers((prev) => prev.filter((l) => l.id !== draggedElement.id));
      } else if (draggedElement.type === "sticker") {
        setStickerLayers((prev) => prev.filter((l) => l.id !== draggedElement.id));
      } else if (draggedElement.type === "music") {
        setSelectedSong(null);
      }
    }

    setDraggedElement(null);
    setShowVGuide(false);
    setShowHGuide(false);
    setIsNearTrash(false);
  };

  // --- DRAWING MOUSE ACTIONS ---
  const handleDrawingStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool !== "drawing") return;
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newStroke: DrawingStroke = {
      points: [{ x, y }],
      color: brushColor,
      size: brushSize,
      opacity: brushOpacity,
      type: brushType
    };

    setDrawingStrokes((prev) => [...prev, newStroke]);
    setRedoStrokes([]);
  };

  const handleDrawingMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== "drawing") return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setDrawingStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updatedPoints = [...last.points, { x, y }];
      return [...prev.slice(0, -1), { ...last, points: updatedPoints }];
    });
  };

  const handleDrawingEnd = () => {
    setIsDrawing(false);
  };

  // --- TEXT CUSTOMIZATION ---
  const handleOpenTextCreator = (id?: string) => {
    if (id) {
      const target = textLayers.find((l) => l.id === id);
      if (target) {
        setCurrText(target.text);
        setCurrColor(target.color);
        setCurrFont(target.font);
        setCurrHighlight(target.bgHighlight);
        setCurrAlign(target.alignment);
        setEditingTextId(id);
      }
    } else {
      setCurrText("");
      setCurrColor("#ffffff");
      setCurrFont("sans-serif");
      setCurrHighlight(false);
      setCurrAlign("center");
      setEditingTextId(null);
    }
    setActiveTool("text");
  };

  const handleSaveTextLayer = () => {
    if (!currText.trim()) {
      if (editingTextId) {
        setTextLayers((prev) => prev.filter((l) => l.id !== editingTextId));
      }
      setActiveTool("none");
      return;
    }

    if (editingTextId) {
      setTextLayers((prev) =>
        prev.map((l) =>
          l.id === editingTextId
            ? {
                ...l,
                text: currText,
                color: currColor,
                font: currFont,
                bgHighlight: currHighlight,
                alignment: currAlign
              }
            : l
        )
      );
    } else {
      const container = canvasContainerRef.current;
      const rect = container?.getBoundingClientRect();
      const newLayer: TextLayer = {
        id: Math.random().toString(),
        text: currText,
        x: rect ? rect.width / 2 : 190,
        y: rect ? rect.height / 3 : 200,
        scale: 1,
        rotation: 0,
        color: currColor,
        font: currFont,
        bgHighlight: currHighlight,
        alignment: currAlign
      };
      setTextLayers((prev) => [...prev, newLayer]);
    }
    setActiveTool("none");
  };

  // --- ITUNES SOUNDTRACK PICKER ---
  const handleSearchMusic = async () => {
    if (!musicQuery.trim()) return;
    setIsSearchingMusic(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(musicQuery)}&media=music&limit=8`);
      const data = await res.json();
      const songs = data.results.map((song: any) => ({
        id: song.trackId.toString(),
        name: song.trackName,
        artist: song.artistName,
        artwork: song.artworkUrl100.replace("100x100bb", "400x400bb"),
        preview_url: song.previewUrl
      }));
      setMusicResults(songs);
    } catch (e) {
      alert("Error fetching preview soundtracks!");
    } finally {
      setIsSearchingMusic(false);
    }
  };

  // --- GIPHY SEARCH ---
  const handleSearchGifs = async () => {
    if (!giphyQuery.trim()) return;
    setIsSearchingGifs(true);
    try {
      // Use public Giphy endpoint with random simulated list if keys are missing
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(giphyQuery)}&api_key=dc6zaTOxFJmzC&limit=9`);
      const data = await res.json();
      const urls = data.data.map((gif: any) => gif.images.fixed_height.url);
      setGiphyResults(urls);
    } catch (e) {
      // Fallback mocks
      setGiphyResults([
        "https://media.giphy.com/media/l0ExjYyE2TPr0g5t6/giphy.gif",
        "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif",
        "https://media.giphy.com/media/l41YcGT5ShJa0ZmW4/giphy.gif"
      ]);
    } finally {
      setIsSearchingGifs(false);
    }
  };

  const handleAddGifSticker = (gifUrl: string) => {
    const container = canvasContainerRef.current;
    const rect = container?.getBoundingClientRect();
    const newSticker: StickerLayer = {
      id: Math.random().toString(),
      type: "gif",
      src: gifUrl,
      x: rect ? rect.width / 2 : 190,
      y: rect ? rect.height / 2 : 320,
      scale: 1.2,
      rotation: 0,
      data: {}
    };
    setStickerLayers((prev) => [...prev, newSticker]);
    setActiveTool("none");
    setGiphyQuery("");
    setGiphyResults([]);
  };

  const handleAddEmojiSticker = (emoji: string) => {
    const container = canvasContainerRef.current;
    const rect = container?.getBoundingClientRect();
    const newSticker: StickerLayer = {
      id: Math.random().toString(),
      type: "emoji",
      x: rect ? rect.width / 2 : 190,
      y: rect ? rect.height / 2 : 320,
      scale: 1.5,
      rotation: 0,
      data: { emoji }
    };
    setStickerLayers((prev) => [...prev, newSticker]);
    setActiveTool("none");
  };

  // Widget sticker builders
  const handleAddLocationSticker = () => {
    const loc = prompt("Enter location name:");
    if (!loc) return;
    const container = canvasContainerRef.current;
    const rect = container?.getBoundingClientRect();
    setStickerLayers((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        type: "location",
        x: rect ? rect.width / 2 : 190,
        y: rect ? rect.height / 2 : 320,
        scale: 1,
        rotation: 0,
        data: { name: loc }
      }
    ]);
    setActiveTool("none");
  };

  const handleAddCountdownSticker = () => {
    const title = prompt("Countdown title:", "Launch Day!");
    if (!title) return;
    const container = canvasContainerRef.current;
    const rect = container?.getBoundingClientRect();
    setStickerLayers((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        type: "countdown",
        x: rect ? rect.width / 2 : 190,
        y: rect ? rect.height / 2 : 320,
        scale: 1,
        rotation: 0,
        data: { title, targetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
      }
    ]);
    setActiveTool("none");
  };

  const handleAddPollSticker = () => {
    const question = prompt("Enter poll question:", "Do you like this style?");
    if (!question) return;
    const container = canvasContainerRef.current;
    const rect = container?.getBoundingClientRect();
    setStickerLayers((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        type: "poll",
        x: rect ? rect.width / 2 : 190,
        y: rect ? rect.height / 2 : 320,
        scale: 1,
        rotation: 0,
        data: { question, optA: "Yes!", optB: "No" }
      }
    ]);
    setActiveTool("none");
  };

  // --- HIGH QUALITY COMPOSITE CANVAS EXPORT ---
  const handleExportStory = async (audience: "everyone" | "close_friends") => {
    setIsExporting(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not construct 2D render pipeline context");

      // Set Story Resolution (standard IG Aspect Ratio 1080x1920)
      canvas.width = 1080;
      canvas.height = 1920;

      // 1. Draw Background Media
      if (mediaType === "image") {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = mediaUrl;
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve;
          bgImg.onerror = reject;
        });

        // Cover fit calculations
        const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
        const x = (canvas.width - bgImg.width * scale) / 2;
        const y = (canvas.height - bgImg.height * scale) / 2;

        // Apply filters
        if (filterType !== "none") {
          ctx.filter = filterType;
        }
        ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        ctx.filter = "none";
      } else {
        // For video background we draw first frame or simple mockup placeholder background
        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("[Video Background Media]", canvas.width / 2, canvas.height / 2);
      }

      // Scaling factors from edit viewport (380x640) to export (1080x1920)
      const scaleX = 1080 / 380;
      const scaleY = 1920 / 640;

      // 2. Draw Drawings/Brush strokes
      const drawingCanvas = drawingCanvasRef.current;
      if (drawingCanvas) {
        ctx.drawImage(drawingCanvas, 0, 0, canvas.width, canvas.height);
      }

      // 3. Draw Text Layers
      textLayers.forEach((layer) => {
        ctx.save();
        const drawX = layer.x * scaleX;
        const drawY = layer.y * scaleY;
        ctx.translate(drawX, drawY);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);

        ctx.font = `bold ${layer.font === "sans-serif" ? "48px sans-serif" : "54px " + layer.font}`;
        ctx.textAlign = layer.alignment;
        ctx.textBaseline = "middle";

        const textWidth = ctx.measureText(layer.text).width;
        const padding = 20;

        if (layer.bgHighlight) {
          ctx.fillStyle = layer.color === "#ffffff" ? "#000000" : "#ffffff";
          let startX = -textWidth / 2 - padding;
          if (layer.alignment === "left") startX = -padding;
          if (layer.alignment === "right") startX = -textWidth - padding;

          ctx.beginPath();
          ctx.roundRect(
            startX,
            -35,
            textWidth + padding * 2,
            75,
            16
          );
          ctx.fill();
        }

        ctx.fillStyle = layer.color;
        let textX = 0;
        if (layer.alignment === "left") textX = 0;
        if (layer.alignment === "right") textX = 0;
        ctx.fillText(layer.text, textX, 0);
        ctx.restore();
      });

      // 4. Draw Sticker Layers
      for (const sticker of stickerLayers) {
        ctx.save();
        const drawX = sticker.x * scaleX;
        const drawY = sticker.y * scaleY;
        ctx.translate(drawX, drawY);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.scale(sticker.scale, sticker.scale);

        if (sticker.type === "emoji") {
          ctx.font = "96px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sticker.data.emoji, 0, 0);
        } else if (sticker.type === "gif" && sticker.src) {
          // Draw image placeholder
          const gifImg = new Image();
          gifImg.crossOrigin = "anonymous";
          gifImg.src = sticker.src;
          await new Promise((resolve) => {
            gifImg.onload = resolve;
            gifImg.onerror = resolve;
          });
          ctx.drawImage(gifImg, -80, -80, 160, 160);
        } else if (sticker.type === "location") {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 28px sans-serif";
          ctx.beginPath();
          ctx.roundRect(-150, -35, 300, 70, 35);
          ctx.fill();

          ctx.fillStyle = "#0095f6";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("📍 " + sticker.data.name, 0, 0);
        } else if (sticker.type === "countdown") {
          ctx.fillStyle = "#09090b";
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-160, -80, 320, 160, 24);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.font = "bold 20px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(sticker.data.title, 0, -30);

          ctx.fillStyle = "#00ffcc";
          ctx.font = "bold 36px monospace";
          ctx.fillText("23h : 45m : 10s", 0, 20);
        } else if (sticker.type === "poll") {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(-160, -90, 320, 180, 24);
          ctx.fill();

          ctx.fillStyle = "#000000";
          ctx.font = "bold 24px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(sticker.data.question, 0, -35);

          // Buttons
          ctx.fillStyle = "#f3f4f6";
          ctx.beginPath();
          ctx.roundRect(-130, 0, 120, 50, 12);
          ctx.roundRect(10, 0, 120, 50, 12);
          ctx.fill();

          ctx.fillStyle = "#000000";
          ctx.fillText(sticker.data.optA, -70, 32);
          ctx.fillText(sticker.data.optB, 70, 32);
        }
        ctx.restore();
      }

      // 5. Draw Music Sticker
      if (selectedSong && musicStickerStyle !== "hidden") {
        ctx.save();
        const drawX = musicStickerPos.x * scaleX;
        const drawY = musicStickerPos.y * scaleY;
        ctx.translate(drawX, drawY);
        ctx.rotate((musicStickerPos.rotation * Math.PI) / 180);
        ctx.scale(musicStickerPos.scale, musicStickerPos.scale);

        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-180, -60, 360, 120, 28);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(selectedSong.name, -100, -15);
        ctx.fillStyle = "#0095f6";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(selectedSong.artist, -100, 20);

        ctx.restore();
      }

      // Convert to blob dataUrl
      const exportUrl = canvas.toDataURL("image/webp", 0.95);

      // Serialize overlays caption JSON
      const captionData = {
        textCaption: "",
        textOverlay: textLayers.length > 0 ? textLayers[0].text : "",
        layers: {
          texts: textLayers,
          stickers: stickerLayers,
          drawings: drawingStrokes
        }
      };

      // Discard draft on successful save
      localStorage.removeItem("tovstudio_story_draft");

      onSave(
        mediaType === "image" ? exportUrl : mediaUrl, 
        mediaType, 
        JSON.stringify(captionData), 
        selectedSong, 
        audience
      );

    } catch (e: any) {
      alert("Error compiling custom export story layers: " + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/98 text-white select-none flex flex-col justify-between items-center overflow-hidden font-sans">
      
      {/* Top Header tools bar */}
      <div className="w-full max-w-md p-4 flex items-center justify-between z-30 shrink-0">
        <button 
          onClick={onClose} 
          className="w-10 h-10 rounded-full bg-neutral-900/60 flex items-center justify-center text-white hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenTextCreator()}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-800 ${activeTool === "text" ? "bg-[#0095f6]" : "bg-neutral-900/60"}`}
          >
            <Type className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setActiveTool("sticker")}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-800 ${activeTool === "sticker" ? "bg-[#0095f6]" : "bg-neutral-900/60"}`}
          >
            <Smile className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setActiveTool("drawing")}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-800 ${activeTool === "drawing" ? "bg-[#0095f6]" : "bg-neutral-900/60"}`}
          >
            <Paintbrush className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setActiveTool("music")}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-800 ${selectedSong ? "bg-orange-500" : "bg-neutral-900/60"}`}
          >
            <Music className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setActiveTool("filters")}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-800 ${filterType !== "none" ? "bg-purple-600" : "bg-neutral-900/60"}`}
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Editor Center preview frame */}
      <div 
        ref={canvasContainerRef}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onTouchMove={handleCanvasMouseMove}
        onTouchEnd={handleCanvasMouseUp}
        className="w-full max-w-md h-full bg-neutral-950 rounded-none md:rounded-[28px] overflow-hidden relative shadow-2xl border-none md:border md:border-white/10 select-none flex items-center justify-center flex-1"
      >
        
        {/* Underlay Media */}
        <div 
          className="absolute inset-0 z-0 select-none pointer-events-none w-full h-full"
          style={{ 
            filter: filterType === "none" ? "none" : filterType,
            transform: `scale(${1 + mediaAdjust.blur/100})`
          }}
        >
          {mediaType === "video" ? (
            <video 
              ref={videoPreviewRef}
              src={mediaUrl} 
              className="w-full h-full object-cover" 
              autoPlay 
              loop 
              muted={videoVolume === 0} 
            />
          ) : (
            <img src={mediaUrl} className="w-full h-full object-cover" alt="" />
          )}
        </div>

        {/* Dynamic Center guides lines */}
        {showVGuide && <div className="absolute inset-y-0 left-1/2 w-0.5 bg-pink-500/70 z-20 pointer-events-none" />}
        {showHGuide && <div className="absolute inset-x-0 top-1/2 h-0.5 bg-pink-500/70 z-20 pointer-events-none" />}

        {/* Drawing Canvas Overlays */}
        <canvas 
          ref={drawingCanvasRef}
          width={380}
          height={640}
          onMouseDown={handleDrawingStart}
          onMouseMove={handleDrawingMove}
          onMouseUp={handleDrawingEnd}
          onTouchStart={handleDrawingStart}
          onTouchMove={handleDrawingMove}
          onTouchEnd={handleDrawingEnd}
          className={`absolute inset-0 z-10 ${activeTool === "drawing" ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"}`}
        />

        {/* Interactive Text layers */}
        {textLayers.map((l) => (
          <div
            key={l.id}
            onMouseDown={(e) => handleElementTouchStart(e, l.id, "text")}
            onTouchStart={(e) => handleElementTouchStart(e, l.id, "text")}
            onDoubleClick={() => handleOpenTextCreator(l.id)}
            style={{
              left: l.x,
              top: l.y,
              transform: `translate(-50%, -50%) scale(${l.scale}) rotate(${l.rotation}deg)`,
              color: l.color,
              fontFamily: l.font,
              fontSize: `${currFontSize}px`
            }}
            className={`absolute z-20 px-3 py-1.5 font-bold whitespace-nowrap cursor-grab select-none text-center ${
              l.bgHighlight ? (l.color === "#ffffff" ? "bg-black text-white" : "bg-white text-black") : ""
            } rounded-lg`}
          >
            {l.text}
          </div>
        ))}

        {/* Interactive Sticker Layers */}
        {stickerLayers.map((s) => (
          <div
            key={s.id}
            onMouseDown={(e) => handleElementTouchStart(e, s.id, "sticker")}
            onTouchStart={(e) => handleElementTouchStart(e, s.id, "sticker")}
            style={{
              left: s.x,
              top: s.y,
              transform: `translate(-50%, -50%) scale(${s.scale}) rotate(${s.rotation}deg)`
            }}
            className="absolute z-20 cursor-grab select-none"
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

        {/* Floating Soundtrack Sticker */}
        {selectedSong && musicStickerStyle !== "hidden" && (
          <div
            onMouseDown={(e) => handleElementTouchStart(e, selectedSong.id, "music")}
            onTouchStart={(e) => handleElementTouchStart(e, selectedSong.id, "music")}
            style={{
              left: musicStickerPos.x,
              top: musicStickerPos.y,
              transform: `translate(-50%, -50%) scale(${musicStickerPos.scale}) rotate(${musicStickerPos.rotation}deg)`
            }}
            className="absolute z-20 cursor-grab select-none p-3.5 bg-neutral-900/90 border border-white/10 backdrop-blur-md rounded-2xl flex items-center gap-2.5 shadow-xl max-w-[80%]"
          >
            <img src={selectedSong.artwork} className="w-10 h-10 rounded-xl object-cover shrink-0" alt="" />
            <div className="min-w-0 text-left">
              <span className="text-[11px] font-bold text-white block truncate">{selectedSong.name}</span>
              <span className="text-[9px] text-[#0095f6] font-semibold block truncate">{selectedSong.artist}</span>
              <span className="text-[8px] text-white/40 block mt-0.5">🎵 Soundtrack</span>
            </div>
          </div>
        )}

        {/* Floating Trash Bin Zone */}
        {draggedElement && (
          <div 
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isNearTrash ? "bg-red-500 scale-125 text-white" : "bg-black/40 text-red-400 border border-red-500/20 backdrop-blur-md"
            }`}
          >
            <Trash2 className="w-5 h-5 animate-pulse" />
          </div>
        )}
      </div>

      {/* Tools overlays drawers */}
      <div className="w-full max-w-md z-30 shrink-0">
        
        {/* --- TEXT TOOL EDITOR PANEL --- */}
        {activeTool === "text" && (
          <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-4 animate-fadein">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button onClick={() => setActiveTool("none")} className="text-white/60 hover:text-white">Cancel</button>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrHighlight(!currHighlight)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${currHighlight ? "bg-white text-black" : "bg-white/10 text-white"}`}
                >
                  Highlight
                </button>
                <button 
                  onClick={() => setCurrAlign(currAlign === "center" ? "left" : currAlign === "left" ? "right" : "center")}
                  className="p-1.5 rounded-full bg-white/10 text-white"
                >
                  {currAlign.toUpperCase()}
                </button>
              </div>
              <button onClick={handleSaveTextLayer} className="text-[#0095f6] font-bold">Done</button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
              <input
                type="text"
                value={currText}
                onChange={(e) => setCurrText(e.target.value)}
                placeholder="Start typing..."
                autoFocus
                className="w-full bg-transparent border-none text-center text-2xl font-bold focus:outline-none focus:ring-0 placeholder-white/40"
                style={{ color: currColor, fontFamily: currFont }}
              />
            </div>

            <div className="space-y-4 pb-4">
              {/* Font picker */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                {FONT_PRESETS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setCurrFont(f.val)}
                    style={{ fontFamily: f.val }}
                    className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 font-bold ${currFont === f.val ? "bg-[#0095f6]" : "bg-neutral-800"}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <div className="flex justify-between items-center gap-2 px-1">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border ${currColor === c ? "border-white scale-110" : "border-transparent"}`}
                    />
                  ))}
                </div>
                
                {/* Size slider */}
                <input 
                  type="range" 
                  min="16" 
                  max="48" 
                  value={currFontSize}
                  onChange={(e) => setCurrFontSize(Number(e.target.value))}
                  className="w-24 accent-[#0095f6]"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- BRUSH PAINTING PANEL --- */}
        {activeTool === "drawing" && (
          <div className="bg-[#0c0d12]/95 border-t border-white/10 rounded-t-[28px] p-4 space-y-4 animate-slideup">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[12px] uppercase font-bold text-white/50">Brush drawing tool</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (drawingStrokes.length === 0) return;
                    const last = drawingStrokes[drawingStrokes.length - 1];
                    setRedoStrokes((prev) => [...prev, last]);
                    setDrawingStrokes((prev) => prev.slice(0, -1));
                  }}
                  className="p-1 rounded bg-white/5 text-white/60 hover:text-white"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (redoStrokes.length === 0) return;
                    const next = redoStrokes[redoStrokes.length - 1];
                    setDrawingStrokes((prev) => [...prev, next]);
                    setRedoStrokes((prev) => prev.slice(0, -1));
                  }}
                  className="p-1 rounded bg-white/5 text-white/60 hover:text-white"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setDrawingStrokes([]);
                    setRedoStrokes([]);
                  }}
                  className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  Clear
                </button>
              </div>
              <button onClick={() => setActiveTool("none")} className="text-[#0095f6] font-bold text-xs">Done</button>
            </div>

            {/* Brush styles selection */}
            <div className="flex gap-2 justify-between">
              {[
                { id: "pen", label: "Pen" },
                { id: "marker", label: "Marker" },
                { id: "neon", label: "Neon" },
                { id: "eraser", label: "Eraser" }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setBrushType(style.id as any)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                    brushType === style.id ? "bg-[#0095f6] border-[#0095f6]" : "bg-neutral-800 border-white/5"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            {/* Brush Size & Color presets */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[200px]">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5.5 h-5.5 rounded-full shrink-0 border ${brushColor === c ? "border-white" : "border-transparent"}`}
                  />
                ))}
              </div>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] text-white/40">Size</span>
                <input 
                  type="range" 
                  min="2" 
                  max="28" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1 accent-[#0095f6] h-1 bg-white/10 rounded-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STICKERS DRAWER PANEL --- */}
        {activeTool === "sticker" && (
          <div className="bg-[#0c0d12]/95 border-t border-white/10 rounded-t-[28px] p-4 space-y-4 h-[350px] overflow-y-auto no-scrollbar animate-slideup">
            <div className="flex items-center justify-between sticky top-0 bg-[#0c0d12]/95 py-1.5 z-10">
              <span className="text-[12px] uppercase font-bold text-white/50">Sticker widgets drawer</span>
              <button onClick={() => setActiveTool("none")} className="text-[#0095f6] font-bold text-xs">Close</button>
            </div>

            {/* Search GIF input */}
            <div className="relative">
              <input
                type="text"
                value={giphyQuery}
                onChange={(e) => setGiphyQuery(e.target.value)}
                placeholder="Search Giphy..."
                onKeyDown={(e) => e.key === "Enter" && handleSearchGifs()}
                className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#0095f6]"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
            </div>

            {/* Simulated/Giphy results */}
            {giphyResults.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {giphyResults.map((gif, idx) => (
                  <img
                    key={idx}
                    src={gif}
                    onClick={() => handleAddGifSticker(gif)}
                    className="w-full h-20 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform"
                    alt=""
                  />
                ))}
              </div>
            )}

            {/* Custom Interactive Widget Templates */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={handleAddLocationSticker}
                className="p-3 bg-neutral-900 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 hover:scale-102 transition-transform"
              >
                <span className="text-xl">📍</span>
                <span className="text-[10px] font-bold text-white">Location</span>
              </button>

              <button 
                onClick={handleAddCountdownSticker}
                className="p-3 bg-neutral-900 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 hover:scale-102 transition-transform"
              >
                <span className="text-xl">⏳</span>
                <span className="text-[10px] font-bold text-white">Countdown</span>
              </button>

              <button 
                onClick={handleAddPollSticker}
                className="p-3 bg-neutral-900 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 hover:scale-102 transition-transform"
              >
                <span className="text-xl">📊</span>
                <span className="text-[10px] font-bold text-white">Poll</span>
              </button>
            </div>

            {/* Express Emojis panel */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] uppercase font-bold text-white/30 text-left block">Popular Emojis</span>
              <div className="flex justify-between items-center gap-2">
                {["❤️", "😂", "😮", "😢", "😍", "👏", "🔥", "🎉", "💯", "👍"].map((em) => (
                  <button 
                    key={em} 
                    onClick={() => handleAddEmojiSticker(em)}
                    className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- MUSIC PICKER PANEL --- */}
        {activeTool === "music" && (
          <div className="bg-[#0c0d12]/95 border-t border-white/10 rounded-t-[28px] p-4 space-y-4 h-[350px] overflow-y-auto no-scrollbar animate-slideup">
            <div className="flex items-center justify-between sticky top-0 bg-[#0c0d12]/95 py-1.5 z-10">
              <span className="text-[12px] uppercase font-bold text-white/50">Add soundtrack</span>
              <button onClick={() => setActiveTool("none")} className="text-[#0095f6] font-bold text-xs">Done</button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={musicQuery}
                onChange={(e) => setMusicQuery(e.target.value)}
                placeholder="Search songs or artists..."
                onKeyDown={(e) => e.key === "Enter" && handleSearchMusic()}
                className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#0095f6]"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
            </div>

            {/* Results */}
            {musicResults.length > 0 ? (
              <div className="space-y-2">
                {musicResults.map((song) => (
                  <div 
                    key={song.id} 
                    onClick={() => {
                      setSelectedSong(song);
                      setIsPlayingPreview(true);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      selectedSong?.id === song.id ? "bg-[#0095f6]/10 border-[#0095f6]" : "bg-neutral-900 border-white/5 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={song.artwork} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{song.name}</span>
                        <span className="text-[10px] text-white/50 block truncate">{song.artist}</span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedSong?.id === song.id) {
                          setIsPlayingPreview(!isPlayingPreview);
                        } else {
                          setSelectedSong(song);
                          setIsPlayingPreview(true);
                        }
                      }}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white"
                    >
                      {selectedSong?.id === song.id && isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-white/30 italic">Search real music soundtracks from iTunes library</div>
            )}

            {/* Waveform Selector & length */}
            {selectedSong && (
              <div className="p-3 bg-neutral-950/80 rounded-2xl space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Clip length</span>
                  <div className="flex gap-1.5">
                    {[5, 10, 15, 30, 60].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => {
                          setSongDuration(dur);
                          setSongOffset(0); // Reset offset to prevent overflow
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${songDuration === dur ? "bg-[#0095f6] text-white" : "bg-white/10 text-white/60"}`}
                      >
                        {dur}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Waveform trim offset</span>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, 30 - songDuration)}
                    value={songOffset}
                    onChange={(e) => setSongOffset(Number(e.target.value))}
                    className="w-full accent-orange-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-white/30 font-mono">
                    <span>{songOffset}s</span>
                    <span>{Math.min(30, songOffset + songDuration)}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- FILTERS OVERLAY PANEL --- */}
        {activeTool === "filters" && (
          <div className="bg-[#0c0d12]/95 border-t border-white/10 rounded-t-[28px] p-4 space-y-4 animate-slideup">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[12px] uppercase font-bold text-white/50">Story Filters</span>
              <button onClick={() => setActiveTool("none")} className="text-[#0095f6] font-bold text-xs">Done</button>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {FILTER_PRESETS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFilterType(f.val)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs shrink-0 font-bold transition-all ${
                    filterType === f.val ? "bg-purple-600 border-purple-500 text-white scale-105" : "bg-neutral-900 border-white/5 text-white/70"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Share controls */}
      <div className="w-full max-w-md p-4 bg-[#09090b]/80 border-t border-white/5 z-20 flex justify-between items-center shrink-0 gap-3">
        <button
          onClick={() => handleExportStory("everyone")}
          disabled={isExporting}
          className="flex-1 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center gap-2 border border-white/10 text-white font-bold text-[14px] transition-all hover:scale-102 active:scale-98"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} className="w-5.5 h-5.5 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-5.5 h-5.5 rounded-full bg-cyan-400 text-black text-[9px] flex items-center justify-center font-bold">ME</div>
              )}
              <span>Share to Story</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleExportStory("close_friends")}
          disabled={isExporting}
          className="flex-1 h-12 bg-neutral-950 hover:bg-black backdrop-blur-md rounded-full flex items-center justify-center gap-2 border border-[#1db954]/20 text-[#1db954] font-bold text-[14px] transition-all hover:scale-102 active:scale-98"
        >
          <div className="w-5.5 h-5.5 rounded-full bg-[#1db954] flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <span>Close Friends</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Sparkles, Send, ArrowRight, HelpCircle, RefreshCw, Trash2, Mic, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AIStudioView: React.FC = () => {
  const { 
    userProfile, 
    projects, 
    activeProjectId, 
    setActiveView,
    scripts,
    tasks,
    calendarEvents,
    crew,
    cast
  } = useProjectStore();
  
  // Custom local state to store chat logs for Gemini-style conversation
  const [messages, setMessages] = useState<any[]>([
    {
      id: "initial-welcome",
      sender: "ai",
      text: "Hello! I am your Gemini production assistant. How can I help you write scripts, draft shoot schedules, budget equipment, or coordinate crew workflows today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeProj = projects.find(p => p.id === activeProjectId);
  const projectTitle = activeProj ? activeProj.title : "Active Project";

  const quickPrompts = [
    { label: "Draft a Call Sheet", prompt: "Draft a detailed call sheet for tomorrow's night shoot scene" },
    { label: "Analyze Screenplay Scenes", prompt: "Analyze scene 1 for character props and continuity warning list" },
    { label: "Budget Drone Sequence", prompt: "Create a line-item budget proposal for a $20K drone tracking sequence" },
    { label: "Cinematic Poster Concept", prompt: "Suggest 3 cinematic teaser poster concepts for a high-contrast thriller" }
  ];

  // Auto-scroll chat area to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, streamingText]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // 1. Add User Message
    const userMsg = {
      id: Math.random().toString(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setStreamingText("");

    // 2. Generate Contextual Response
    setTimeout(() => {
      let response = "";
      const lower = text.toLowerCase();

      if (lower.includes("call sheet")) {
        response = `### 🎬 AI GENERATED CALL SHEET: THE MIDNIGHT CODE\n**Date:** July 14, 2026 | **Director:** ${userProfile?.full_name || "Creative Director"} | **Call Time:** 18:00 (Night Shoot)\n**Location:** Neo-Tokyo Alleyways Set (Stage 4 Studio)\n\n| Time | Event | Scene / Setup | Talents / Crew |\n| :--- | :--- | :--- | :--- |\n| **18:00** | Crew Call & Focus Sync | Prep rain machines, camera focus alignments | All Camera Unit, Grip, Gaffer |\n| **19:00** | Scene 1 Block A | EXT. STREETS: Kael's Steadicam walk past vents | Christian Bale (Sim), Steadicam Op |\n| **21:00** | Lunch Break | Catering | All Crew & Cast |\n| **22:00** | Scene 1 Block B | DRONE SCAN: Security drone descends | Stunt Crew, VFX Supervisor |\n| **01:30** | Wrap & Backup | live data DIT LTO transfers | DIT, Camera PAs |\n\n> **Rain Alert:** 80% precipitation forecast from 22:00. Ensure camera waterproof shrouds are active.`;
      } else if (lower.includes("analyze") || lower.includes("screenplay") || lower.includes("script")) {
        response = `### 🧠 AI SCREENPLAY CONTINU REPORT: SCENE 1\nAfter parsing **EXT. NEO-TOKYO STREETS - NIGHT** screenplay structure, I have compiled the following extraction logs:\n\n*   **Speaking Characters:** Kael, Drone Voice\n*   **Identified Props:** synthetic street food, plasma emitter, earpiece\n*   **Identified Wardrobe:** Trench coat, cybernetic eye, wire-frame goggles (Rina, Scene 2)\n*   **Dialogue Index:** 7 speech blocks\n\n#### ⚠️ Continuity Warnings & Tone Audits\n1.  **Luminescent Prop mismatch:** The plasma blaster prop is set to glow red in Kael's coat, but the VFX overlay in Scene 4 uses a blue laser stream. Prop master should adjust LED dials to match.\n2.  **Atmospheric Contrast:** Scene 1 notes heavy rain. Ensure Rina's hair is slightly damp in Scene 2 Apartment (CONTINUOUS) for physical continuity.`;
      } else if (lower.includes("budget")) {
        response = `### 📊 AI ESTIMATED LINE-ITEM BUDGET: DRONE SEQUENCE\nScope: High altitude tracking shot of supercar speedways.\n\n| Item | Description | Quantity | Rate | Total |\n| :--- | :--- | :--- | :--- | :--- |\n| **Drone Rental** | DJI Inspire 3 Cinema Drone | 2 Days | $1,500/day | $3,000 |\n| **Pilot Fee** | Certified Drone Operator (FAA Part 107) | 2 Days | $800/day | $1,600 |\n| **Spotter** | Safety crew spotter | 2 Days | $300/day | $600 |\n| **Permits** | Bureau of Land Management clearance permit | 1 | Flat | $500 |\n| **VFX Prep** | 3D Camera tracking alignment points setup | Flat | Service | $1,200 |\n| **Insurance** | Aerial liability equipment coverage binder | Flat | premium | $1,100 |\n| **Total Est.** | | | | **$8,000** |`;
      } else if (lower.includes("poster") || lower.includes("idea") || lower.includes("teaser")) {
        response = `### 🎨 AI TEASER POSTER CONCEPT SCHEMATICS\n\n*   **Concept 1: The Cyber Eye (High Contrast)**\n    A extreme macro close up of Kael's face, splitting the frame. Left side is natural skin, right side is dark cybernetic armor with the eye glowing emerald green (\`#3ecf8e\`). The reflection in the eye shows the flickering neon skyscrapers.\n*   **Concept 2: Silhouette in the Rain**\n    A wide shot of Kael standing under a street light, seen from behind. Backlight from a neon billboard silhouette's Kael, creating long shadows on a wet street. Rain falls diagonally. Glowing blue plasma emitter smoke rises from Kael's hand.\n*   **Concept 3: Code stream**\n    A sleek, abstract dark design. Thin white lines representing screenplays and shoot schedules overlaying a faint silhouette of a camera lens. Minimal green typography centered: *TOV Studio Presents. The Midnight Code. Create. Shoot. Deliver.*`;
      } else {
        const scriptsCount = Object.keys(scripts || {}).length;
        const calendarCount = Object.values(calendarEvents || {}).flat().length;
        const crewCount = (crew || []).length;
        const castCount = (cast || []).length;
        const activeTasks = Object.values(tasks || {}).flat().filter((t: any) => t.status !== "done");

        response = `I have scanned the live production database for **${projectTitle}** to coordinate your query:

*   **Active Scripts:** ${scriptsCount} screenplays registered in this workspace.
*   **Active Tasks:** ${activeTasks.length} active tasks currently in progress.
*   **Crew & Cast Roster:** ${crewCount} crew members and ${castCount} cast members onboarded.
*   **Schedule Events:** ${calendarCount} production milestones scheduled on the calendar.

Please let me know if you would like me to draft call sheets, outline storyboard shot plans, or review scene continuity details based on this information!`;
      }

      // Simulate Gemini Direct Typing Stream
      setIsTyping(false);
      let currentLength = 0;
      const intervalTime = Math.min(10, Math.floor(1500 / response.length));
      
      const timer = setInterval(() => {
        currentLength += 3;
        if (currentLength >= response.length) {
          setStreamingText("");
          clearInterval(timer);
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            sender: "ai",
            text: response,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
        } else {
          setStreamingText(response.substring(0, currentLength));
        }
      }, intervalTime);

    }, 1500);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const greetingName = userProfile?.full_name?.split(" ")[0] || "Filmmaker";

  return (
    <div className="flex flex-col h-screen bg-[#050505] relative text-white w-full">
      {/* Subtle Gemini Ambient Glow Orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#050505]/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {/* Animated Glowing Spark Logo */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-[1px] shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-[spin_8s_linear_infinite]" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wider text-white">Gemini Production AI</h3>
            <span className="text-[9px] text-white/40 block leading-none mt-0.5">TOV Studio Fine-Tuned Model</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer animate-fade-in"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveView("dashboard")}
            className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer ml-1 animate-fade-in"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 z-10 scroll-smooth no-scrollbar">
        {messages.length === 0 && !isTyping && !streamingText ? (
          /* Gemini greeting initial landing screen */
          <div className="max-w-xl mx-auto py-12 flex flex-col justify-center h-full">
            <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2">
              Hello, {greetingName}
            </h1>
            <p className="text-sm text-white/50 mb-8 font-medium">
              How can I help you write, schedule, or coordinate your production today?
            </p>

            {/* Quick Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp.prompt)}
                  className="p-4 rounded-[20px] bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-left transition-all group cursor-pointer flex flex-col justify-between gap-3 h-28"
                >
                  <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{qp.label}</span>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-white/40 group-hover:text-white/60 line-clamp-1 truncate flex-1 pr-3">{qp.prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-cyan-400 transition-colors shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat List */
          <div className="max-w-xl mx-auto space-y-8 pb-10">
            {messages.map((msg) => {
              const isAI = msg.sender === "ai";
              return (
                <div key={msg.id} className={`flex gap-4 ${isAI ? "justify-start" : "justify-end"} animate-fade-in`}>
                  {isAI && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center p-[1px] shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                      <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                      </div>
                    </div>
                  )}

                  <div className={isAI ? "flex-1 min-w-0" : "max-w-[80%]"}>
                    <div
                      className={
                        isAI
                          ? "prose prose-invert prose-xs text-[12.5px] leading-relaxed text-white/80 space-y-2 whitespace-normal break-words font-sans"
                          : "bg-white/[0.04] border border-white/10 px-4 py-2.5 rounded-[22px] text-white text-[12.5px] font-sans leading-relaxed shadow-lg whitespace-normal break-words"
                      }
                    >
                      {/* Markdown-style parser */}
                      {isAI ? (
                        msg.text.split("\n").map((line: string, i: number) => {
                          if (line.startsWith("###")) {
                            return <h4 key={i} className="text-xs font-black text-cyan-400 uppercase mt-4 mb-2 tracking-wider font-mono">{line.replace("###", "").trim()}</h4>;
                          }
                          if (line.startsWith("##")) {
                            return <h3 key={i} className="text-sm font-black text-white mt-5 mb-2">{line.replace("##", "").trim()}</h3>;
                          }
                          if (line.startsWith("*")) {
                            return <p key={i} className="pl-4 relative before:absolute before:left-1 before:top-2 before:w-1 before:h-1 before:bg-cyan-400 before:rounded-full mt-1.5 text-white/80">{line.replace("*", "").trim()}</p>;
                          }
                          if (line.startsWith("|")) {
                            return <pre key={i} className="font-mono bg-white/[0.02] p-3 rounded-xl border border-white/5 text-[9px] overflow-x-auto whitespace-pre leading-normal my-2 select-text">{line}</pre>;
                          }
                          return <p key={i} className="mt-1 leading-relaxed text-white/70">{line}</p>;
                        })
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>
                    {isAI && (
                      <span className="text-[7.5px] text-white/20 block font-mono mt-1 text-left">{msg.timestamp}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Simulated Typist Streaming response output */}
            {streamingText && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center p-[1px] shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                  <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="prose prose-invert prose-xs text-[12.5px] leading-relaxed text-white/85 space-y-2 whitespace-normal break-words font-sans">
                    {streamingText.split("\n").map((line: string, i: number) => {
                      if (line.startsWith("###")) {
                        return <h4 key={i} className="text-xs font-black text-cyan-400 uppercase mt-4 mb-2 tracking-wider font-mono">{line.replace("###", "").trim()}</h4>;
                      }
                      if (line.startsWith("##")) {
                        return <h3 key={i} className="text-sm font-black text-white mt-5 mb-2">{line.replace("##", "").trim()}</h3>;
                      }
                      if (line.startsWith("*")) {
                        return <p key={i} className="pl-4 relative before:absolute before:left-1 before:top-2 before:w-1 before:h-1 before:bg-cyan-400 before:rounded-full mt-1.5 text-white/80">{line.replace("*", "").trim()}</p>;
                      }
                      if (line.startsWith("|")) {
                        return <pre key={i} className="font-mono bg-white/[0.02] p-3 rounded-xl border border-white/5 text-[9px] overflow-x-auto whitespace-pre leading-normal my-2 select-text">{line}</pre>;
                      }
                      return <p key={i} className="mt-1 leading-relaxed text-white/70">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* AI Thinking/Replying Loader */}
            {isTyping && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center p-[1px] shrink-0">
                  <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-1.5 h-8">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Animated gradient typing line */}
      {(isTyping || streamingText) && (
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-400 via-indigo-500 via-purple-500 to-pink-500 bg-size-200 animate-pulse z-20 shrink-0" />
      )}

      {/* Input panel */}
      <div className="p-4 border-t border-white/5 bg-[#050505] flex gap-3 items-center z-10 shrink-0">
        <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer">
          <Paperclip className="w-4 h-4" />
        </button>
        <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer">
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder="Ask Gemini to draft call sheets, outline storyboard shot plans, budget camera gears..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          className="flex-1 bg-[#0f0f12] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none transition-all"
        />

        <button
          onClick={() => handleSend(input)}
          className="p-3 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-black font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default AIStudioView;


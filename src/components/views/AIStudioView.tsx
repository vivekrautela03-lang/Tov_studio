"use client";

import React, { useState, useRef, useEffect } from "react";
import { useProjectStore, ChatMessage } from "@/store/useProjectStore";
import { Sparkles, Send, BrainCircuit, ArrowDown, FileText, BarChart3, HelpCircle, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AIStudioView: React.FC = () => {
  const { chatLogs, addChatMessage, userProfile } = useProjectStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickCommands = [
    { label: "Generate Call Sheet", command: "draft a shoot call sheet for tomorrow's night scene" },
    { label: "Analyze Screenplay", command: "analyze scene 1 for character, prop and continuity issues" },
    { label: "Create Budget Line", command: "create a line-item budget proposal for a $20K drone sequence" },
    { label: "Generate Poster Ideas", command: "suggest 3 cinematic poster design ideas for a cyberpunk film" },
    { label: "Plan Shoot Schedule", command: "optimize our shot schedule timeline based on rain predictions" }
  ];

  // Auto-scroll chat to bottom on updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLogs, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    addChatMessage({
      sender: "user",
      text: text
    });
    setInput("");
    setIsTyping(true);

    // 2. Simulate AI thinking delay
    setTimeout(() => {
      let aiResponse = "";
      const lower = text.toLowerCase();

      if (lower.includes("call sheet")) {
        const directorName = userProfile?.full_name || "Creative Director";
        aiResponse = `### 🎬 AI GENERATED CALL SHEET: THE MIDNIGHT CODE
**Date:** July 5, 2026 | **Director:** ${directorName} | **Call Time:** 18:00 (Night Shoot)
**Location:** Neo-Tokyo Alleyways Set (Stage 4 Studio)

| Time | Event | Scene / Setup | Talents / Crew |
| :--- | :--- | :--- | :--- |
| **18:00** | Crew Call & Focus Sync | Prep rain machines, camera focus alignments | All Camera Unit, Grip, Gaffer |
| **19:00** | Scene 1 Block A | EXT. STREETS: Kael's Steadicam walk past vents | Christian Bale (Sim), Steadicam Op |
| **21:00** | Lunch Break | Catering | All Crew & Cast |
| **22:00** | Scene 1 Block B | DRONE SCAN: Security drone descends | Stunt Crew, VFX Supervisor |
| **01:30** | Wrap & Backup | live data DIT LTO transfers | DIT, Camera PAs |

> [!WARNING]
> **Rain Alert:** 80% precipitation forecast from 22:00. Ensure camera waterproof shrouds are active.`;
      } else if (lower.includes("analyze") || lower.includes("screenplay") || lower.includes("script")) {
        aiResponse = `### 🧠 AI SCREENPLAY CONTINUITY REPORT: SCENE 1
After parsing **EXT. NEO-TOKYO STREETS - NIGHT** screenplay structure, I have compiled the following extraction logs:

*   **Speaking Characters:** Kael, Drone Voice
*   **Identified Props:** synthetic street food, plasma emitter, earpiece earpiece
*   **Identified Wardrobe:** Trench coat, cybernetic eye, wire-frame goggles (Rina, Scene 2)
*   **Dialogue Index:** 7 speech blocks

#### ⚠️ Continuity Warnings & Tone Audits
1.  **Luminescent Prop mismatch:** The plasma blaster prop is set to glow red in Kael's coat, but the VFX overlay in Scene 4 uses a blue laser stream. Prop master should adjust LED dials to match.
2.  **Atmospheric Contrast:** Scene 1 notes heavy rain. Ensure Rina's hair is slightly damp in Scene 2 Apartment (CONTINUOUS) for physical continuity.`;
      } else if (lower.includes("budget")) {
        aiResponse = `### 📊 AI ESTIMATED LINE-ITEM BUDGET: DRONE SEQUENCE
Scope: High altitude tracking shot of supercar speedways.

| Item | Description | Quantity | Rate | Total |
| :--- | :--- | :--- | :--- | :--- |
| **Drone Rental** | DJI Inspire 3 Cinema Drone | 2 Days | $1,500/day | $3,000 |
| **Pilot Fee** | Certified Drone Operator (FAA Part 107) | 2 Days | $800/day | $1,600 |
| **Spotter** | Safety crew spotter | 2 Days | $300/day | $600 |
| **Permits** | Bureau of Land Management clearance permit | 1 | Flat | $500 |
| **VFX Prep** | 3D Camera tracking alignment points setup | Flat | Service | $1,200 |
| **Insurance** | Aerial liability equipment coverage binder | Flat | premium | $1,100 |
| **Total Est.** | | | | **$8,000** |`;
      } else if (lower.includes("poster") || lower.includes("idea")) {
        aiResponse = `### 🎨 AI TEASER POSTER CONCEPT SCHEMATICS

*   **Concept 1: The Cyber Eye (High Contrast)**
    A extreme macro close up of Kael's face, splitting the frame. Left side is natural skin, right side is dark cybernetic armor with the eye glowing emerald green (\`#3ecf8e\`). The reflection in the eye shows the flickering neon skyscrapers of Neo Tokyo.
*   **Concept 2: Silhouette in the Rain**
    A wide shot of Kael standing under a street light, seen from behind. Backlight from a neon billboard silhouette's Kael, creating long shadows on a wet street. Rain falls diagonally. Glowing blue plasma emitter smoke rises from Kael's hand.
*   **Concept 3: Code stream**
    A sleek, abstract dark design. Thin white lines representing screenplays and shoot schedules overlaying a faint silhouette of a camera lens. Minimal green typography centered: *TOV Studio Presents. The Midnight Code. Create. Shoot. Deliver.*`;
      } else {
        aiResponse = `### 🤖 ASSISTANT ANALYSIS COMPLETE
I've analyzed your prompt regarding: "${text}". 

Based on our active production database for **"${useProjectStore.getState().projects.find(p => p.id === useProjectStore.getState().activeProjectId)?.title}"**:
- Active schedule: Scene 1 blocks are currently filming.
- Cast roster: Christian Bale (Sim) is marked "On Set".
- Equipment: CS15 LED panels are available in Grip Truck 1.

How would you like to update our scheduling timeline or shoot setups to accommodate this request? I can automatically write a new Shot Setup Plan to our calendar schedule.`;
      }

      addChatMessage({
        sender: "ai",
        text: aiResponse
      });
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* AI Assistant header console */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>TOV AI Studio Engine</span>
            </h3>
            <p className="text-[10px] text-text-secondary">GPT-4o Cinematic Fine-Tuning Module active</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-success/20 text-success border border-success/30 px-2 py-0.5 rounded uppercase font-bold">
          System Live
        </span>
      </div>

      {/* Quick Commands Chips */}
      <div className="px-6 py-3 bg-[#15171d] border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
        {quickCommands.map((qc, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qc.command)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary/10 hover:text-primary border border-white/5 hover:border-primary/20 text-[10px] font-medium text-text-secondary cursor-pointer shrink-0 transition-all select-none"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            {qc.label}
          </button>
        ))}
      </div>

      {/* Chat Messages scroll area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0e1014] scrollbar-thin">
        {chatLogs.map((msg) => {
          const isAI = msg.sender === "ai";
          return (
            <div
              key={msg.id}
              className={`flex gap-4 ${isAI ? "justify-start" : "justify-end"}`}
            >
              {/* Avatar on left for AI */}
              {isAI && (
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 select-none">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-xl text-xs leading-relaxed space-y-2 border ${
                  isAI
                    ? "bg-[#111318] border-white/5 text-text-secondary"
                    : "bg-primary text-white border-primary/20"
                }`}
              >
                {/* Simulated Markdown renderer */}
                <div className="prose prose-invert prose-xs text-xs">
                  {/* Clean parser for headings, bullet points and bold formatting */}
                  {msg.text.split("\n").map((line, i) => {
                    if (line.startsWith("###")) {
                      return <h4 key={i} className="text-sm font-extrabold text-white mt-3 mb-1.5 uppercase tracking-wide font-mono">{line.replace("###", "").trim()}</h4>;
                    }
                    if (line.startsWith("##")) {
                      return <h3 key={i} className="text-base font-extrabold text-white mt-4 mb-2 tracking-wide">{line.replace("##", "").trim()}</h3>;
                    }
                    if (line.startsWith("*")) {
                      return <p key={i} className="pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full mt-1">{line.replace("*", "").trim()}</p>;
                    }
                    if (line.startsWith("> [!WARNING]")) {
                      return null; // Handle banner below
                    }
                    if (line.startsWith("**Rain Alert:")) {
                      return (
                        <div key={i} className="bg-warning/15 border border-warning/35 text-warning p-2.5 rounded-lg mt-3 text-[10px]">
                          <strong>Alert: </strong>{line.replace("**Rain Alert:**", "").trim()}
                        </div>
                      );
                    }
                    if (line.startsWith("|")) {
                      // Render as custom text tables or plain monospaced block
                      return <pre key={i} className="font-mono bg-black/30 p-2.5 rounded border border-white/5 text-[9px] overflow-x-auto whitespace-pre leading-normal my-2">{line}</pre>;
                    }
                    return <p key={i} className="mt-1 leading-relaxed">{line}</p>;
                  })}
                </div>
                <span className="text-[8px] text-text-secondary text-right block font-mono mt-2">{msg.timestamp}</span>
              </div>

              {/* Avatar on right for User */}
              {!isAI && (
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none">
                  V
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 select-none">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#111318] border border-white/5 p-4 rounded-xl flex items-center gap-1.5">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Message Panel */}
      <div className="p-4 border-t border-white/5 bg-[#15171d] flex gap-3 shrink-0">
        <input
          type="text"
          placeholder="Ask AI assistant to draft scripts, optimize shot setups, build lists..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          className="flex-1 bg-[#09090B] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
        />
        <Button
          onClick={() => handleSend(input)}
          variant="primary"
          className="px-4 py-3 h-10 rounded-xl cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
};
export default AIStudioView;

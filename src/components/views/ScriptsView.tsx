"use client";

import React, { useState } from "react";
import { useProjectStore, ScriptScene } from "@/store/useProjectStore";
import { Sparkles, BrainCircuit, AlertCircle, Clock, Film, FileEdit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ScriptsViewProps {
  projectScope?: string;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({ projectScope }) => {
  const { activeProjectId, scripts, updateScriptContent } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;

  const projectScenes = scripts[targetProjectId] || [];
  const [selectedSceneIdx, setSelectedSceneIdx] = useState(0);
  const activeScene = projectScenes[selectedSceneIdx];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeScene) return;
    updateScriptContent(targetProjectId, activeScene.id, e.target.value);
  };

  if (!activeScene) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-white/5">
        <FileEdit className="w-10 h-10 text-text-secondary mb-3" />
        <h3 className="text-sm font-semibold text-white">No screenplay scenes drafted</h3>
        <p className="text-xs text-text-secondary mt-1">Select or create a screenplay in this production workspace.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* Left side: Scenes list & Screenplay editor (7 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Scene Selector Row */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {projectScenes.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => setSelectedSceneIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer shrink-0 border transition-all ${
                selectedSceneIdx === idx
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/5 border-white/5 text-text-secondary hover:text-white"
              }`}
            >
              Scene {scene.sceneNumber}: {scene.title.split(" - ")[0]}
            </button>
          ))}
        </div>

        {/* Screenplay Document */}
        <div className="bg-[#111318] border border-white/5 rounded-xl flex-1 flex flex-col min-h-[500px] shadow-2xl relative">
          
          {/* Editor Header */}
          <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-text-secondary font-mono">
            <span className="text-white font-semibold">{activeScene.title}</span>
            <span>Draft v4.0 • Draft Locked</span>
          </div>

          {/* Screenplay Content Textarea */}
          <div className="flex-1 p-8 flex justify-center bg-[#15171d] overflow-y-auto">
            <textarea
              value={activeScene.content}
              onChange={handleTextChange}
              className="w-full max-w-xl bg-transparent text-white font-mono screenplay-line text-sm leading-relaxed tracking-wide resize-none focus:outline-none min-h-[400px] screenplay-editor-textarea"
              placeholder="Start writing screenplay format here..."
              style={{
                tabSize: 4,
                lineHeight: "1.8em"
              }}
            />
          </div>
        </div>
      </div>

      {/* Right side: AI Extractor Panel (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Core AI status card */}
        <Card className="border-primary/20 bg-gradient-to-b from-[#111318] to-primary/5">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  AI Extractor Core
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-warning" />
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed">
              Analyzing script content in real-time. Automatically indexing props, character logs, and checking continuity.
            </p>

            <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-xs font-mono">
              <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                <span className="text-[9px] text-text-secondary block">Complexity</span>
                <span className={`text-xs font-bold ${
                  activeScene.aiExtracted.complexity === "High" ? "text-danger" :
                  activeScene.aiExtracted.complexity === "Medium" ? "text-warning" : "text-success"
                }`}>
                  {activeScene.aiExtracted.complexity}
                </span>
              </div>
              <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col justify-between">
                <span className="text-[9px] text-text-secondary block">Est. Duration</span>
                <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-primary" /> {activeScene.aiExtracted.duration} min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extracted Metadata list */}
        <Card>
          <CardContent className="p-5 space-y-4 text-xs">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Film className="w-4 h-4 text-secondary" /> Extracted Elements
            </h4>
            
            {/* Characters */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Speaking Characters ({activeScene.aiExtracted.dialogueCount} Dialogues)</span>
              <div className="flex flex-wrap gap-1">
                {activeScene.aiExtracted.characters.map((char, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-mono border border-secondary/10">
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* Props */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Scene Props</span>
              <div className="flex flex-wrap gap-1">
                {activeScene.aiExtracted.props.map((prop, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-text-secondary text-[10px] font-mono border border-white/5">
                    {prop}
                  </span>
                ))}
              </div>
            </div>

            {/* Costumes */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Costume Notes</span>
              <div className="text-xs text-text-secondary leading-relaxed space-y-1 bg-white/[0.01] p-2 rounded border border-white/5">
                {activeScene.aiExtracted.costumes.map((cos, i) => (
                  <p key={i}>• {cos}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continuity & Warning block */}
        <Card>
          <CardContent className="p-5 space-y-4 text-xs">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-white/5 pb-2">
              <AlertCircle className="w-4 h-4 text-warning" /> Continuity Audits
            </h4>
            <div className="space-y-2.5">
              {activeScene.aiExtracted.continuityWarnings.length === 0 ? (
                <div className="text-success text-xs font-mono">
                  ✓ No continuity errors flagged.
                </div>
              ) : (
                activeScene.aiExtracted.continuityWarnings.map((warn, i) => (
                  <div key={i} className="flex gap-2 items-start text-xs leading-relaxed text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                    <p>{warn}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
      
    </div>
  );
};
export default ScriptsView;

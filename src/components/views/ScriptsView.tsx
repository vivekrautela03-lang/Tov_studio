"use client";

import React, { useState } from "react";
import { useProjectStore, ScriptScene } from "@/store/useProjectStore";
import { Sparkles, BrainCircuit, AlertCircle, Clock, Film, FileEdit, Plus, Trash2, UploadCloud, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, cn } from "@/components/ui/button";

interface ScriptsViewProps {
  projectScope?: string;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({ projectScope }) => {
  const { activeProjectId, scripts, updateScriptContent, addScriptScene, deleteScriptScene } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;

  const projectScenes = scripts[targetProjectId] || [];
  const [selectedSceneIdx, setSelectedSceneIdx] = useState(0);
  const activeScene = projectScenes[selectedSceneIdx];

  // Mobile Columns Switcher State
  const [mobileActiveTab, setMobileActiveTab] = useState<"editor" | "ai">("editor");

  // Empty State options
  const [emptyStateTab, setEmptyStateTab] = useState<"upload" | "manual">("upload");
  const [newSceneTitle, setNewSceneTitle] = useState("");
  const [newSceneNum, setNewSceneNum] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeScene) return;
    updateScriptContent(targetProjectId, activeScene.id, e.target.value);
  };

  const handleCreateFirstScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSceneTitle.trim()) return;
    setIsCreating(true);
    try {
      await addScriptScene(targetProjectId, newSceneTitle.trim(), newSceneNum);
      setNewSceneTitle("");
      setNewSceneNum((prev) => prev + 1);
      setSelectedSceneIdx(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCreating(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setIsCreating(false);
        return;
      }
      
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
      try {
        const nextNum = projectScenes.length + 1;
        await addScriptScene(targetProjectId, cleanName, nextNum);
        
        // Query latest state to set content
        const latestScenes = useProjectStore.getState().scripts[targetProjectId] || [];
        const createdScene = latestScenes.find(s => s.title === cleanName);
        if (createdScene) {
          await updateScriptContent(targetProjectId, createdScene.id, text);
        }
        setSelectedSceneIdx(latestScenes.length - 1);
      } catch (err) {
        console.error("Error exchanging uploaded script:", err);
      } finally {
        setIsCreating(false);
      }
    };
    reader.readAsText(file);
  };

  const handleAddAdditionalScene = async () => {
    const title = prompt("Enter scene title (e.g., EXT. PARKING LOT - DAY):");
    if (!title || !title.trim()) return;
    const nextNum = projectScenes.length > 0 
      ? Math.max(...projectScenes.map(s => s.sceneNumber)) + 1 
      : 1;
    
    try {
      await addScriptScene(targetProjectId, title.trim(), nextNum);
      setSelectedSceneIdx(projectScenes.length); // switch to newly created scene
    } catch (err) {
      console.error(err);
    }
  };

  if (projectScenes.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in max-w-lg mx-auto py-8">
        <Card className="border-white/5 bg-card">
          <CardContent className="p-8 text-center space-y-6">
            
            {/* Header */}
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-text-secondary">
              <FileEdit className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">No screenplay scenes drafted</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
                Begin by uploading an existing screenplay file or draft your scenes manually in the editor console.
              </p>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex bg-black/40 border border-white/5 p-1 rounded-lg gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setEmptyStateTab("upload")}
                className={cn(
                  "flex-1 py-1.5 text-center rounded-md font-semibold cursor-pointer transition-all",
                  emptyStateTab === "upload" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
                )}
              >
                Upload Screenplay (.txt)
              </button>
              <button
                type="button"
                onClick={() => setEmptyStateTab("manual")}
                className={cn(
                  "flex-1 py-1.5 text-center rounded-md font-semibold cursor-pointer transition-all",
                  emptyStateTab === "manual" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
                )}
              >
                Create Scene Manually
              </button>
            </div>

            {/* Tab Body Contents */}
            {emptyStateTab === "upload" ? (
              <div className="space-y-4 pt-2">
                <div className="border border-dashed border-white/10 hover:border-primary/20 rounded-xl p-8 transition-colors bg-black/20 flex flex-col items-center justify-center gap-3 relative">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleUploadScript}
                    disabled={isCreating}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-text-secondary animate-pulse" />
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-white block">
                      {isCreating ? "Reading document..." : "Choose Screenplay File"}
                    </span>
                    <span className="text-[10px] text-text-secondary block">
                      Supports plain text files (.txt)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateFirstScene} className="space-y-3.5 text-left pt-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-text-secondary text-[10px] uppercase font-semibold mb-1">Scene No.</label>
                    <input
                      type="number"
                      value={newSceneNum}
                      onChange={(e) => setNewSceneNum(Number(e.target.value))}
                      className="w-full bg-[#09090B] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-text-secondary text-[10px] uppercase font-semibold mb-1">Scene Heading</label>
                    <input
                      type="text"
                      required
                      value={newSceneTitle}
                      onChange={(e) => setNewSceneTitle(e.target.value)}
                      placeholder="e.g., INT. ALLEY - NIGHT"
                      className="w-full bg-[#09090B] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary" disabled={isCreating} className="w-full text-xs py-2 h-9">
                  {isCreating ? "Creating..." : "Initialize Scene"}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Columns Switcher Tabs (Visible only on <lg viewports) */}
      <div className="flex lg:hidden bg-card border border-white/5 rounded-lg p-1 gap-1 text-xs">
        <button
          type="button"
          onClick={() => setMobileActiveTab("editor")}
          className={cn(
            "flex-1 py-2 text-center rounded-md font-semibold transition-all cursor-pointer",
            mobileActiveTab === "editor"
              ? "bg-primary text-black"
              : "text-text-secondary hover:text-white"
          )}
        >
          Screenplay Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab("ai")}
          className={cn(
            "flex-1 py-2 text-center rounded-md font-semibold transition-all cursor-pointer",
            mobileActiveTab === "ai"
              ? "bg-primary text-black"
              : "text-text-secondary hover:text-white"
          )}
        >
          AI Analytics & Insights
        </button>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        
        {/* Left side: Scenes list & Screenplay editor (7 cols) */}
        <div className={cn("lg:col-span-8 flex flex-col gap-4", mobileActiveTab !== "editor" && "max-lg:hidden")}>
          
          {/* Scene Selector Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
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
            
            <button
              onClick={handleAddAdditionalScene}
              title="Add Manual Scene"
              className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-dashed border-white/10 hover:border-white/20 text-text-secondary hover:text-white transition-all shrink-0 cursor-pointer flex items-center justify-center h-8"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Screenplay Document */}
          <div className="bg-[#111318] border border-white/5 rounded-xl flex-1 flex flex-col min-h-[500px] shadow-2xl relative">
            
            {/* Editor Header */}
            <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-text-secondary font-mono">
              <span className="text-white font-semibold">{activeScene.title}</span>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-6 px-2 text-[10px] relative cursor-pointer flex items-center gap-1">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (evt) => {
                        const txt = evt.target?.result as string;
                        if (txt) {
                          updateScriptContent(targetProjectId, activeScene.id, txt);
                        }
                      };
                      reader.readAsText(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-3 h-3" />
                  <span>Upload File Content</span>
                </Button>
                
                <button
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete Scene ${activeScene.sceneNumber}?`)) {
                      await deleteScriptScene(targetProjectId, activeScene.id);
                      setSelectedSceneIdx(0);
                    }
                  }}
                  className="p-1 hover:bg-danger/10 text-text-secondary hover:text-danger rounded cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Fenced Text Area */}
            <textarea
              value={activeScene.content}
              onChange={handleTextChange}
              placeholder={`Write or paste Scene ${activeScene.sceneNumber} script here...`}
              className="flex-1 w-full p-6 md:p-8 bg-transparent text-sm md:text-base font-mono text-white placeholder-white/15 focus:outline-none resize-none leading-relaxed border-0 select-text"
              style={{ minHeight: "450px" }}
            />
          </div>

        </div>

        {/* Right side: AI Continuity Insights (4 cols) */}
        <div className={cn("lg:col-span-4 flex flex-col gap-6", mobileActiveTab !== "ai" && "max-lg:hidden")}>
          
          {/* AI Metrics summary */}
          <Card className="border-primary/20 bg-gradient-to-b from-card to-primary/[0.02]">
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-1 text-[10px] text-primary uppercase font-mono font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Breakdown Engine</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">Scene Continuity Cards</h4>

              <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 space-y-1">
                  <span className="text-text-secondary">Dialogue Lines</span>
                  <div className="text-base font-bold text-white">{activeScene.aiExtracted.dialogueCount}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 space-y-1">
                  <span className="text-text-secondary">Estimated Duration</span>
                  <div className="text-base font-bold text-white">{activeScene.aiExtracted.duration}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 space-y-1">
                  <span className="text-text-secondary">Shoot Complexity</span>
                  <div className="text-base font-bold text-white">{activeScene.aiExtracted.complexity}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 space-y-1">
                  <span className="text-text-secondary">Characters Count</span>
                  <div className="text-base font-bold text-white">{activeScene.aiExtracted.characters.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Elements */}
          <Card>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">Extracted Entities</span>
                <span className="text-[10px] text-text-secondary">Auto-sync active</span>
              </div>

              {/* Characters */}
              <div className="space-y-1.5">
                <span className="text-text-secondary text-[10px] uppercase font-semibold">Characters Present</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeScene.aiExtracted.characters.length === 0 ? (
                    <span className="text-text-secondary italic">None detected. Type character names in caps (e.g. KAEL).</span>
                  ) : (
                    activeScene.aiExtracted.characters.map((char, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/5 rounded px-2 py-0.5 font-medium text-white">
                        {char}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Props */}
              <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                <span className="text-text-secondary text-[10px] uppercase font-semibold">Props / Set Decors</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeScene.aiExtracted.props.length === 0 ? (
                    <span className="text-text-secondary italic text-[11px]">No props logged yet.</span>
                  ) : (
                    activeScene.aiExtracted.props.map((prop, idx) => (
                      <span key={idx} className="bg-secondary/10 border border-secondary/20 rounded px-2 py-0.5 font-medium text-secondary">
                        {prop}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                <span className="text-text-secondary text-[10px] uppercase font-semibold">Shoot Location Ref</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeScene.aiExtracted.locations.map((loc, idx) => (
                    <span key={idx} className="bg-primary/10 border border-primary/20 rounded px-2 py-0.5 font-medium text-primary">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Continuity alerts */}
          {activeScene.aiExtracted.continuityWarnings && activeScene.aiExtracted.continuityWarnings.length > 0 && (
            <Card className="border-danger/20 bg-gradient-to-b from-card to-danger/[0.01]">
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="flex items-center gap-1.5 text-danger font-bold text-[10px] uppercase tracking-wider font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>Continuity Alerts</span>
                </div>
                <div className="space-y-2">
                  {activeScene.aiExtracted.continuityWarnings.map((warning, idx) => (
                    <p key={idx} className="text-text-secondary leading-relaxed pl-2.5 border-l border-danger/40">
                      {warning}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
};
export default ScriptsView;

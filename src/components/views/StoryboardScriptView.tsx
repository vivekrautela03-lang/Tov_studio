"use client";

import React, { useState } from "react";
import { ScriptsView } from "./ScriptsView";
import { StoryboardView } from "./StoryboardView";
import { FileText, Image } from "lucide-react";

interface StoryboardScriptViewProps {
  projectScope: string;
}

export const StoryboardScriptView: React.FC<StoryboardScriptViewProps> = ({ projectScope }) => {
  const [subTab, setSubTab] = useState<"script" | "storyboard">("script");

  return (
    <div className="space-y-4 text-xs">
      <div className="flex border-b border-white/5 pb-2 gap-2">
        <button
          onClick={() => setSubTab("script")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            subTab === "script" ? "bg-white/5 text-[#22d3ee] border border-[#22d3ee]/20" : "text-text-secondary hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Screenplay & Scripts</span>
        </button>
        <button
          onClick={() => setSubTab("storyboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            subTab === "storyboard" ? "bg-white/5 text-[#22d3ee] border border-[#22d3ee]/20" : "text-text-secondary hover:text-white"
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Sequenced Storyboard</span>
        </button>
      </div>

      <div className="mt-2">
        {subTab === "script" ? (
          <ScriptsView projectScope={projectScope} />
        ) : (
          <StoryboardView projectScope={projectScope} />
        )}
      </div>
    </div>
  );
};
export default StoryboardScriptView;

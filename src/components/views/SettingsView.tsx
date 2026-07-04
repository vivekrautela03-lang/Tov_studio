"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Settings, Shield, Cpu, RefreshCw, Key, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const SettingsView: React.FC = () => {
  const [frameIOSync, setFrameIOSync] = useState(true);
  const [arriSync, setArriSync] = useState(true);
  const [redLink, setRedLink] = useState(false);
  
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Studio Profile</CardTitle>
          <CardDescription>Personal credentials and production workspace details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-black text-lg select-none">
              V
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Vivek Roy</h4>
              <p className="text-text-secondary text-[11px] mt-0.5">Primary Producer & Director • vivek@tovstudio.ai</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
            <div>
              <label className="block text-text-secondary mb-1.5 font-medium">Default Studio Studio</label>
              <input
                type="text"
                disabled
                value="TOV Studio Main HQ"
                className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-white font-mono opacity-50"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1.5 font-medium">Access Tier Level</label>
              <input
                type="text"
                disabled
                value="Executive Administrator"
                className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-white font-mono opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Hardware & Cloud Integrations</CardTitle>
          <CardDescription>Hook camera telemetry and dailies upload pipes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 text-xs">
          {/* Frame IO */}
          <div className="flex justify-between items-center p-3 rounded-lg bg-black/10 border border-white/5">
            <div>
              <h4 className="font-bold text-white">Frame.io Dailies Auto-Sync</h4>
              <p className="text-[10px] text-text-secondary mt-0.5">Upload proxies instantly on camera CUT triggers.</p>
            </div>
            <button onClick={() => setFrameIOSync(!frameIOSync)} className="cursor-pointer">
              {frameIOSync ? <ToggleRight className="w-9 h-9 text-primary" /> : <ToggleLeft className="w-9 h-9 text-text-secondary" />}
            </button>
          </div>

          {/* ARRI */}
          <div className="flex justify-between items-center p-3 rounded-lg bg-black/10 border border-white/5">
            <div>
              <h4 className="font-bold text-white">ARRI Alexa Telemetry Hook</h4>
              <p className="text-[10px] text-text-secondary mt-0.5">Log lenses focal lengths and metadata into shot plans.</p>
            </div>
            <button onClick={() => setArriSync(!arriSync)} className="cursor-pointer">
              {arriSync ? <ToggleRight className="w-9 h-9 text-primary" /> : <ToggleLeft className="w-9 h-9 text-text-secondary" />}
            </button>
          </div>

          {/* RED */}
          <div className="flex justify-between items-center p-3 rounded-lg bg-black/10 border border-white/5">
            <div>
              <h4 className="font-bold text-white">RED Link Cloud LiveGrade</h4>
              <p className="text-[10px] text-text-secondary mt-0.5">Stream color grade profiles to director monitors.</p>
            </div>
            <button onClick={() => setRedLink(!redLink)} className="cursor-pointer">
              {redLink ? <ToggleRight className="w-9 h-9 text-primary" /> : <ToggleLeft className="w-9 h-9 text-text-secondary" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* AI Fine-tuning models details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1 text-[10px] text-primary uppercase font-mono font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Continuity Config</span>
          </div>
          <CardTitle>AI Script Assistant Weights</CardTitle>
          <CardDescription>Select model weights for screenplay extraction audits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div>
            <label className="block text-text-secondary mb-1.5 font-medium">Screenplay Model Parser</label>
            <select className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary">
              <option value="tov-screenplay-v4-fine-tuned">TOV-Screenplay-V4-Cinema (Recommended)</option>
              <option value="gpt-4o">General OpenAI GPT-4o Engine</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
export default SettingsView;

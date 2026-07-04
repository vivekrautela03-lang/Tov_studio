"use client";

import React, { useState } from "react";
import { useProjectStore, MarketingCampaign } from "@/store/useProjectStore";
import { Megaphone, Plus, Share2, Sparkles, Eye, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface MarketingViewProps {
  projectScope?: string;
}

export const MarketingView: React.FC<MarketingViewProps> = ({ projectScope }) => {
  const { activeProjectId, marketing, generateAICaption } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;

  const campaigns = marketing[targetProjectId] || [];

  // Local state to simulate adding new campaigns
  const [localCampaigns, setLocalCampaigns] = useState<MarketingCampaign[]>(campaigns.length > 0 ? campaigns : [
    { id: "m-1", platform: "Instagram", title: "Character Reveal Reel: Kael", type: "Reels", releaseDate: "2026-07-10", status: "Draft" },
    { id: "m-2", platform: "YouTube", title: "Behind the Scenes: Designing Neo-Tokyo", type: "Trailer", releaseDate: "2026-07-20", status: "Scheduled" },
    { id: "m-3", platform: "Twitter", title: "Official Movie Teaser Poster Release", type: "Poster", releaseDate: "2026-07-05", status: "Published", aiCaption: "Look into the future. It's glowing, but it's cold. The official poster for #TheMidnightCode has arrived. Directed by Vivek Roy. In theaters December.", views: "145K views" }
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    platform: "Instagram" as MarketingCampaign["platform"],
    title: "",
    type: "Reels" as MarketingCampaign["type"],
    releaseDate: "2026-07-15",
    status: "Draft" as MarketingCampaign["status"]
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title.trim()) return;

    const campaign: MarketingCampaign = {
      ...newCampaign,
      id: `m-${localCampaigns.length + 1}`
    };
    setLocalCampaigns([...localCampaigns, campaign]);
    setIsAddOpen(false);
    setNewCampaign({
      platform: "Instagram",
      title: "",
      type: "Reels",
      releaseDate: "2026-07-15",
      status: "Draft"
    });
  };

  const runAICaption = (campId: string) => {
    // Simulate store action on local state
    setLocalCampaigns(
      localCampaigns.map((c) => {
        if (c.id !== campId) return c;
        const platformCaptions: Record<string, string> = {
          Instagram: `Cinematic frame preview. Kael walks the fluorescent lines of Sector 4. The camera rigs, rain plates, and ARRI Alexa 35 capturing the cyber-grit of #TheMidnightCode. Directed by Vivek Roy. Coming Winter 2026. 🎬`,
          YouTube: `Go behind the lenses: Designing Neo-Tokyo. Explore how our lighting crew deployed Aputure CS15 led panels to project pulsing atmospheric hues. Subscribe for full production vlogs. 🎥`,
          Twitter: `A plasma flash in Apartment 404. What is Kael escaping? Preview the screenplay details extracted in our AI studio. #VFX #Filmmaking ⚡`,
          TikTok: `Director Vivek Roy setting up the extreme wide shot crane. Ready, set, slate it! 🎬 #filmmaker #cyberpunk #onset`
        };
        return {
          ...c,
          aiCaption: platformCaptions[c.platform] || "Production notes: Scene setup complete. Ready for distribution."
        };
      })
    );
  };

  const publishCampaign = (campId: string) => {
    setLocalCampaigns(
      localCampaigns.map((c) =>
        c.id === campId
          ? { ...c, status: "Published", views: c.views || "1.2K views" }
          : c
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-white">Campaign & Release Planner</h3>
          <span className="text-[10px] text-text-secondary mt-0.5 block">
            Schedule trailers, poster releases, and social reels
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Plan Campaign</span>
        </Button>
      </div>

      {/* Grid of campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {localCampaigns.map((c) => (
          <Card key={c.id} className="border border-white/5 bg-[#111318] flex flex-col justify-between overflow-hidden">
            <CardContent className="p-5 space-y-4">
              
              {/* Header: Platform & status */}
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded">
                  {c.platform}
                </span>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  c.status === "Published" ? "bg-success/20 text-success" :
                  c.status === "Scheduled" ? "bg-primary/20 text-primary" :
                  "bg-white/10 text-text-secondary"
                }`}>
                  {c.status}
                </span>
              </div>

              {/* Title & Type */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white leading-snug">{c.title}</h4>
                <p className="text-[10px] text-text-secondary">Type: <span className="text-white font-medium">{c.type}</span></p>
              </div>

              {/* Date / Metrics */}
              <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono border-t border-white/5 pt-3">
                <span>Release: {c.releaseDate}</span>
                {c.views && (
                  <span className="flex items-center gap-1 text-success">
                    <Eye className="w-3.5 h-3.5" /> {c.views}
                  </span>
                )}
              </div>

              {/* AI Caption Box */}
              {c.aiCaption ? (
                <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2 relative">
                  <div className="flex justify-between items-center text-[8px] font-mono text-primary font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Generated Caption</span>
                    <button onClick={() => runAICaption(c.id)} className="hover:text-white cursor-pointer"><RefreshCw className="w-2.5 h-2.5" /></button>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    {c.aiCaption}
                  </p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runAICaption(c.id)}
                  className="w-full text-[10px] py-1.5 flex items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:text-white"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>Generate AI Caption</span>
                </Button>
              )}

              {/* Quick Publish simulation */}
              {c.status !== "Published" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => publishCampaign(c.id)}
                  className="w-full text-xs cursor-pointer border border-white/5 bg-white/5"
                >
                  Publish Campaign Live
                </Button>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

      {/* PLAN CAMPAIGN DIALOG */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Plan Marketing Campaign Block"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Social Platform</label>
              <select
                value={newCampaign.platform}
                onChange={(e) => setNewCampaign({ ...newCampaign, platform: e.target.value as MarketingCampaign["platform"] })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              >
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitter">Twitter / X</option>
                <option value="TikTok">TikTok</option>
                <option value="Press">Press Release</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Asset Type</label>
              <select
                value={newCampaign.type}
                onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as MarketingCampaign["type"] })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              >
                <option value="Poster">Poster Release</option>
                <option value="Trailer">Trailer Release</option>
                <option value="Reels">Reels / TikTok Clip</option>
                <option value="Behind the Scenes">Behind the Scenes Video</option>
                <option value="Teaser">Teaser Poster</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Campaign Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Cyberpunk City Trailer Launch"
              value={newCampaign.title}
              onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Publish Date</label>
              <input
                type="date"
                value={newCampaign.releaseDate}
                onChange={(e) => setNewCampaign({ ...newCampaign, releaseDate: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Publish Status</label>
              <select
                value={newCampaign.status}
                onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value as MarketingCampaign["status"] })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary"
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Published">Published Live</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Campaign Campaign</Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
};
export default MarketingView;

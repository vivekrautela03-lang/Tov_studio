"use client";

import React from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { BarChart3, TrendingUp, TrendingDown, Users, Camera, DollarSign, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const AnalyticsView: React.FC = () => {
  const { projects, activeProjectId } = useProjectStore();
  const project = projects.find((p) => p.id === activeProjectId) || projects[0];

  // custom SVG Bar Chart coordinates for Crew Performance (4 crew members)
  const barChartWidth = 400;
  const barChartHeight = 150;
  const barData = [
    { label: "Cam Op", score: 96 },
    { label: "Lighting", score: 92 },
    { label: "DIT", score: 89 },
    { label: "Key Grip", score: 95 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <Card>
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Production Performance</span>
            <div className="text-xl font-black text-white">93.4%</div>
            <span className="text-[9px] text-success font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-success" /> +1.2% above baseline standard
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Equipment Usage Hours</span>
            <div className="text-xl font-black text-white">182 hrs</div>
            <span className="text-[9px] text-text-secondary font-mono">Camera / lens lens runtime logged</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Milestone Completion Rate</span>
            <div className="text-xl font-black text-white">4 of 5 met</div>
            <span className="text-[9px] text-text-secondary font-mono">1 minor delay (holographic rig)</span>
          </CardContent>
        </Card>

      </div>

      {/* SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SVG Bar Chart for Crew Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Crew Performance Index</CardTitle>
            <CardDescription>Average productivity ratings by on-set department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-44 bg-black/10 border border-white/5 rounded-lg flex items-end p-4">
              <svg
                viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}
                className="w-full h-full overflow-visible"
              >
                {barData.map((b, idx) => {
                  const barWidth = 40;
                  const gap = 55;
                  const x = idx * (barWidth + gap) + 40;
                  const barHeight = (b.score / 100) * (barChartHeight - 30);
                  const y = barChartHeight - barHeight - 20;

                  return (
                    <g key={idx}>
                      {/* Grid Line */}
                      <line x1="0" y1={barChartHeight - 20} x2={barChartWidth} y2={barChartHeight - 20} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        className="fill-primary/80 hover:fill-primary transition-colors cursor-pointer"
                      />

                      {/* Score label above bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {b.score}%
                      </text>

                      {/* Label under bar */}
                      <text
                        x={x + barWidth / 2}
                        y={barChartHeight - 5}
                        textAnchor="middle"
                        fill="#9CA3AF"
                        fontSize="9"
                        fontWeight="semibold"
                      >
                        {b.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Operational Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Health Parameters</CardTitle>
            <CardDescription>Live diagnostics for "{project.title}"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-secondary">Camera Sensor Runtime Limit</span>
                <span className="text-white font-bold">82%</span>
              </div>
              <Progress value={82} color="secondary" size="sm" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-secondary">DIT Storage Capacity</span>
                <span className="text-white font-bold">45%</span>
              </div>
              <Progress value={45} color="success" size="sm" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-secondary">VFX Pre-compositing Render Progression</span>
                <span className="text-white font-bold">65%</span>
              </div>
              <Progress value={65} color="primary" size="sm" />
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
export default AnalyticsView;

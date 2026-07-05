"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { DollarSign, FileText, ArrowUpRight, ArrowDownRight, CreditCard, Plus, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FinanceViewProps {
  projectScope?: string;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ projectScope }) => {
  const { activeProjectId, projects } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;
  const project = projects.find((p) => p.id === targetProjectId) || projects[0];

  // Invoices mock data
  const [invoices, setInvoices] = useState([
    { id: "inv-1", recipient: "ARRI Rental Europe", amount: "$45,000", category: "Camera Gear", date: "2026-07-02", status: "Paid" },
    { id: "inv-2", recipient: "Sarah Chen (ADR)", amount: "$8,500", category: "Cast Salary", date: "2026-07-03", status: "Pending" },
    { id: "inv-3", recipient: "DoubleNegative VFX Studio", amount: "$150,000", category: "VFX / Post", date: "2026-06-28", status: "Paid" },
    { id: "inv-4", recipient: "Tokyo Catering Inc.", amount: "$12,000", category: "On-Set Crew Catering", date: "2026-07-04", status: "Pending" }
  ]);

  const toggleInvoiceStatus = (invId: string) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === invId
          ? { ...inv, status: inv.status === "Paid" ? "Pending" : "Paid" }
          : inv
      )
    );
  };

  // Mock points for SVG Area Chart (Spent progression over 5 months)
  const chartPoints = [
    { label: "Mar", spent: 10 },
    { label: "Apr", spent: 25 },
    { label: "May", spent: 48 },
    { label: "Jun", spent: 70 },
    { label: "Jul", spent: Math.round((project.spentVal / project.budgetVal) * 100) }
  ];

  const maxVal = 100;
  const chartWidth = 500;
  const chartHeight = 150;

  // Calculate coordinates for SVG path
  const pointsString = chartPoints
    .map((p, idx) => {
      const x = (idx / (chartPoints.length - 1)) * chartWidth;
      const y = chartHeight - (p.spent / maxVal) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  // Create closed area under chart for gradient fill
  const areaPointsString = `${pointsString} ${chartWidth},${chartHeight} 0,${chartHeight}`;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Cards: Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        
        <Card>
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Total Production Budget</span>
            <div className="text-xl font-black text-white">{project.budget}</div>
            <span className="text-[9px] text-text-secondary font-mono flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3 text-success" /> +8% from draft phase</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Total Spent to Date</span>
            <div className="text-xl font-black text-white">${(project.spentVal / 1000000).toFixed(2)}M</div>
            <span className="text-[9px] text-text-secondary font-mono">
              {Math.round((project.spentVal / project.budgetVal) * 100)}% of total allocated
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Committed / POs</span>
            <div className="text-xl font-black text-white">
              ${((project.budgetVal - project.spentVal) * 0.4 / 1000000).toFixed(2)}M
            </div>
            <span className="text-[9px] text-text-secondary font-mono">Reserved in vendors orders</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Available Funds</span>
            <div className="text-xl font-black text-success">
              ${((project.budgetVal - project.spentVal) / 1000000).toFixed(2)}M
            </div>
            <span className="text-[9px] text-success font-mono">Healthy status</span>
          </CardContent>
        </Card>

      </div>

      {/* SVG Interactive Chart & Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Area Chart Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget Burndown Trend</CardTitle>
            <CardDescription>Visual tracker representing cumulative expenses (%) over time</CardDescription>
          </CardHeader>
          <CardContent>
            {/* SVG Plot */}
            <div className="w-full h-44 bg-black/10 border border-white/5 rounded-lg relative overflow-hidden flex items-end p-4">
              
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3ecf8e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3ecf8e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal gridlines */}
                <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

                {/* Filled Area */}
                <polygon points={areaPointsString} fill="url(#chartGradient)" />

                {/* Line Path */}
                <polyline
                  fill="none"
                  stroke="#3ecf8e"
                  strokeWidth="2.5"
                  points={pointsString}
                />

                {/* Dots on points */}
                {chartPoints.map((p, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * chartWidth;
                  const y = chartHeight - (p.spent / maxVal) * chartHeight;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-black stroke-primary stroke-2 hover:r-6 cursor-pointer transition-all"
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* Chart X Labels */}
            <div className="flex justify-between px-2.5 mt-2.5 text-[10px] text-text-secondary font-mono">
              {chartPoints.map((p, idx) => (
                <span key={idx}>{p.label} ({p.spent}%)</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Share List */}
        <Card>
          <CardHeader>
            <CardTitle>Expenditure Breakdown</CardTitle>
            <CardDescription>Top spending categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Cast & Director Salaries</span>
                  <span className="text-white font-bold">35%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "35%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-secondary">VFX & Post Services</span>
                  <span className="text-white font-bold">28%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full" style={{ width: "28%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Camera & Lighting Rental</span>
                  <span className="text-white font-bold">18%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-success h-full" style={{ width: "18%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Studio Sets / Location permits</span>
                  <span className="text-white font-bold">12%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-warning h-full" style={{ width: "12%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Invoice management list */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Invoices & In-Flows</CardTitle>
          <CardDescription>Accounts payable logs for this project workspace</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-text-secondary text-[10px] uppercase font-bold tracking-wider bg-white/[0.01]">
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.01]">
                    <td className="p-4 font-bold text-white">{inv.recipient}</td>
                    <td className="p-4 text-text-secondary font-mono">{inv.category}</td>
                    <td className="p-4 text-text-secondary font-mono">{inv.date}</td>
                    <td className="p-4 font-bold text-white">{inv.amount}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        inv.status === "Paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleInvoiceStatus(inv.id)}
                        className="text-[10px] px-2 py-1 h-7 cursor-pointer"
                      >
                        {inv.status === "Paid" ? "Mark Unpaid" : "Execute Payment"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
export default FinanceView;

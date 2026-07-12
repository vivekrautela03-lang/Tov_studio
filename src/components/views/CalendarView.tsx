"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore, CalendarEvent, Task, Subtask } from "@/store/useProjectStore";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  X, 
  Trash2, 
  HelpCircle, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  Check, 
  User, 
  Tag, 
  Globe, 
  CalendarDays 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface CalendarViewProps {
  projectScope?: string;
}

// ---------------- NLP Parser utility ----------------
function parseNaturalLanguage(text: string) {
  const now = new Date();
  let date = new Date("2026-07-12"); // default relative to our user time
  if (isNaN(date.getTime())) {
    date = new Date();
  }
  let time = "10:00 - 11:00";
  let type: "shoot" | "meeting" | "deadline" | "marketing" | "release" = "meeting";
  let title = text;

  const lower = text.toLowerCase();

  // Detect type
  if (lower.includes("shoot") || lower.includes("filming") || lower.includes("production")) {
    type = "shoot";
  } else if (lower.includes("meeting") || lower.includes("sync") || lower.includes("discussion")) {
    type = "meeting";
  } else if (lower.includes("deadline") || lower.includes("due") || lower.includes("milestone")) {
    type = "deadline";
  } else if (lower.includes("marketing") || lower.includes("social") || lower.includes("campaign")) {
    type = "marketing";
  } else if (lower.includes("release") || lower.includes("launch") || lower.includes("distribution")) {
    type = "release";
  }

  // Detect relative date
  if (lower.includes("tomorrow")) {
    date.setDate(now.getDate() + 1);
  } else if (lower.includes("yesterday")) {
    date.setDate(now.getDate() - 1);
  } else if (lower.includes("next week")) {
    date.setDate(now.getDate() + 7);
  } else if (lower.includes("next monday")) {
    const day = now.getDay();
    const daysToAdd = (8 - day) % 7 || 7;
    date.setDate(now.getDate() + daysToAdd);
  } else if (lower.includes("next friday")) {
    const day = now.getDay();
    const daysToAdd = (12 - day) % 7 || 7;
    date.setDate(now.getDate() + daysToAdd);
  } else {
    // Check for days of week
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < 7; i++) {
      if (lower.includes(`on ${daysOfWeek[i]}`) || lower.includes(`this ${daysOfWeek[i]}`)) {
        const currentDay = now.getDay();
        const targetDay = i;
        let diff = targetDay - currentDay;
        if (diff <= 0) diff += 7;
        date.setDate(now.getDate() + diff);
        break;
      }
    }
  }

  // Detect time
  const timeRegex = /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = lower.match(timeRegex);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const ampm = match[3];

    if (ampm) {
      if (ampm.toLowerCase() === "pm" && hours < 12) hours += 12;
      if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;
    }

    const startHourStr = String(hours).padStart(2, "0");
    const startMinStr = String(minutes).padStart(2, "0");
    const endHourStr = String((hours + 1) % 24).padStart(2, "0");
    const endMinStr = String(minutes).padStart(2, "0");

    time = `${startHourStr}:${startMinStr} - ${endHourStr}:${endMinStr}`;
  }

  // Clean title
  let cleanTitle = text
    .replace(/tomorrow/i, "")
    .replace(/yesterday/i, "")
    .replace(/today/i, "")
    .replace(/next monday/i, "")
    .replace(/next friday/i, "")
    .replace(/next week/i, "")
    .replace(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i, "")
    .replace(/on\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTitle) {
    cleanTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Event`;
  }

  return {
    title: cleanTitle,
    date: date.toISOString().split("T")[0],
    time,
    type
  };
}

// ---------------- Conflict Checker utilities ----------------
const parseTimeRange = (timeStr: string) => {
  if (!timeStr) return null;
  let startStr = timeStr;
  let endStr = "";
  
  if (timeStr.includes("-")) {
    const parts = timeStr.split("-").map(p => p.trim());
    startStr = parts[0];
    endStr = parts[1];
  }
  
  const parseToMinutes = (str: string) => {
    if (!str) return 0;
    const clean = str.toLowerCase().trim();
    const match = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const ampm = match[3];
    
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };
  
  const startMin = parseToMinutes(startStr);
  const endMin = endStr ? parseToMinutes(endStr) : startMin + 60;
  
  return { startMin, endMin };
};

const checkConflicts = (eventList: CalendarEvent[]) => {
  const conflicts: { eventA: CalendarEvent; eventB: CalendarEvent; reason: string }[] = [];
  
  for (let i = 0; i < eventList.length; i++) {
    for (let j = i + 1; j < eventList.length; j++) {
      const a = eventList[i];
      const b = eventList[j];
      
      if (a.date === b.date) {
        const timeA = parseTimeRange(a.time);
        const timeB = parseTimeRange(b.time);
        
        if (timeA && timeB) {
          if (timeA.startMin < timeB.endMin && timeB.startMin < timeA.endMin) {
            conflicts.push({
              eventA: a,
              eventB: b,
              reason: `Overlap on ${a.date} between ${a.time} and ${b.time}`
            });
          }
        }
      }
    }
  }
  return conflicts;
};

export const CalendarView: React.FC<CalendarViewProps> = ({ projectScope }) => {
  const { 
    activeProjectId, 
    calendarEvents, 
    addCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent,
    tasks,
    addTask,
    updateTaskStatus,
    deleteTask,
    addSubtask,
    toggleSubtask,
    crewMembers
  } = useProjectStore();

  const targetProjectId = projectScope || activeProjectId;
  const events = calendarEvents[targetProjectId] || [];
  const projectTasks = tasks[targetProjectId] || [];

  // Core Calendar States
  const [currentDate, setCurrentDate] = useState<Date>(new Date("2026-07-12"));
  const [miniCalendarDate, setMiniCalendarDate] = useState<Date>(new Date("2026-07-12"));
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "year" | "agenda">("month");
  const [timezone, setTimezone] = useState<string>("local");
  const [tzTime, setTzTime] = useState<string>("");

  // Filters State
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "shoot", "meeting", "deadline", "marketing", "release"
  ]);

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [nlpText, setNlpText] = useState("");

  // Form states for Event
  const [eventForm, setEventForm] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    date: "2026-07-12",
    type: "shoot",
    time: "10:00 - 11:00",
    end_date: "",
    end_time: "",
    color: "#22d3ee",
    is_recurring: false,
    recurrence_pattern: "none",
    description: "",
    location: "",
    reminders: [],
    assigned_members: []
  });

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<Record<string, string>>({});
  const [selectedTaskTab, setSelectedTaskTab] = useState<"All" | "Todo" | "In Progress" | "Delayed" | "Completed">("All");

  // Dynamic Timezone clock
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const options: Intl.DateTimeFormatOptions = {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        };
        if (timezone !== "local") {
          options.timeZone = timezone;
        }
        setTzTime(new Date().toLocaleTimeString("en-US", options));
      } catch (e) {
        setTzTime(new Date().toLocaleTimeString());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case "m":
          setViewMode("month");
          break;
        case "w":
          setViewMode("week");
          break;
        case "d":
          setViewMode("day");
          break;
        case "y":
          setViewMode("year");
          break;
        case "a":
          setViewMode("agenda");
          break;
        case "t":
          setCurrentDate(new Date("2026-07-12"));
          break;
        case "n":
        case "arrowright":
          navigateTime(1);
          break;
        case "p":
        case "arrowleft":
          navigateTime(-1);
          break;
        case "c":
          e.preventDefault();
          setEventForm({
            title: "",
            date: formatDateString(currentDate),
            type: "shoot",
            time: "10:00 - 11:00",
            end_date: "",
            end_time: "",
            color: "#22d3ee",
            is_recurring: false,
            recurrence_pattern: "none",
            description: "",
            location: "",
            reminders: [],
            assigned_members: []
          });
          setIsAddOpen(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, currentDate]);

  const navigateTime = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (viewMode === "year") {
      newDate.setFullYear(currentDate.getFullYear() + direction);
    } else if (viewMode === "agenda") {
      newDate.setDate(currentDate.getDate() + direction * 7);
    }
    setCurrentDate(newDate);
  };

  // Helper date conversions
  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      numDays: lastDay.getDate(),
      startOffset: firstDay.getDay(),
    };
  };

  const generateMonthGrid = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const { numDays, startOffset } = getDaysInMonth(d);
    const grid: { date: Date; isCurrentMonth: boolean; label: string }[] = [];
    
    // Prev Month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      grid.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        label: String(prevMonthLastDay - i)
      });
    }
    
    // Current Month days
    for (let i = 1; i <= numDays; i++) {
      grid.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        label: String(i)
      });
    }
    
    // Next Month days
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        label: String(i)
      });
    }
    
    return grid;
  };

  const handleMiniPrevMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(miniCalendarDate.getMonth() - 1);
    setMiniCalendarDate(newDate);
  };

  const handleMiniNextMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(miniCalendarDate.getMonth() + 1);
    setMiniCalendarDate(newDate);
  };

  const getWeekDays = (d: Date) => {
    const day = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - day);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData("text/plain", eventId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string, targetTime?: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain");
    const eventToUpdate = events.find(evt => evt.id === eventId);
    if (eventToUpdate) {
      const updates: Partial<CalendarEvent> = { date: targetDate };
      if (targetTime) {
        updates.time = targetTime;
      }
      await updateCalendarEvent(targetProjectId, eventId, updates);
    }
  };

  // NLP Form Submit
  const handleNlpAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpText.trim()) return;
    const parsed = parseNaturalLanguage(nlpText);
    await addCalendarEvent(targetProjectId, parsed);
    setNlpText("");
  };

  // Add Event Form Submit
  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    await addCalendarEvent(targetProjectId, {
      ...eventForm,
      end_date: eventForm.end_date || undefined,
      end_time: eventForm.end_time || undefined
    });
    setIsAddOpen(false);
  };

  // Edit Event Form Submit
  const handleEventUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    await updateCalendarEvent(targetProjectId, selectedEvent.id, {
      ...eventForm,
      end_date: eventForm.end_date || undefined,
      end_time: eventForm.end_time || undefined
    });
    setIsEditOpen(false);
    setSelectedEvent(null);
  };

  // Open Edit Event Dialog
  const openEditEvent = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setEventForm({
      title: evt.title,
      date: evt.date,
      type: evt.type,
      time: evt.time,
      end_date: evt.end_date || "",
      end_time: evt.end_time || "",
      color: evt.color || "#22d3ee",
      is_recurring: evt.is_recurring ?? false,
      recurrence_pattern: evt.recurrence_pattern || "none",
      description: evt.description || "",
      location: evt.location || "",
      reminders: evt.reminders || [],
      assigned_members: evt.assigned_members || []
    });
    setIsEditOpen(true);
  };

  // Tasks actions
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await addTask(targetProjectId, {
      title: taskTitle,
      priority: taskPriority,
      status: "Todo",
      due_date: formatDateString(currentDate)
    });
    setTaskTitle("");
  };

  const handleAddSubtaskSubmit = async (taskId: string) => {
    const title = newSubtaskTitle[taskId];
    if (!title || !title.trim()) return;
    await addSubtask(targetProjectId, taskId, title);
    setNewSubtaskTitle(prev => ({ ...prev, [taskId]: "" }));
  };

  // Filter events by color type selection
  const filteredEvents = events.filter(e => selectedTypes.includes(e.type));
  const conflicts = checkConflicts(filteredEvents);

  const getEventBgColor = (type: string) => {
    switch (type) {
      case "shoot": return "bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/30";
      case "meeting": return "bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/30";
      case "deadline": return "bg-[#f43f5e]/20 text-[#fda4af] border-[#f43f5e]/30";
      case "marketing": return "bg-[#f59e0b]/20 text-[#fde047] border-[#f59e0b]/30";
      case "release": return "bg-[#10b981]/20 text-[#34d399] border-[#10b981]/30";
      default: return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const getEventMarkerColor = (type: string) => {
    switch (type) {
      case "shoot": return "bg-[#22d3ee]";
      case "meeting": return "bg-[#a855f7]";
      case "deadline": return "bg-[#f43f5e]";
      case "marketing": return "bg-[#f59e0b]";
      case "release": return "bg-[#10b981]";
      default: return "bg-zinc-500";
    }
  };

  // Filter tasks based on view tab
  const filteredTasks = projectTasks.filter(t => {
    if (selectedTaskTab === "All") return true;
    return t.status === selectedTaskTab;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs text-white">
      {/* Schedule Conflicts Banner */}
      {conflicts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Production Overlap Warnings ({conflicts.length})</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 opacity-90 leading-relaxed text-[11px]">
            {conflicts.slice(0, 3).map((c, i) => (
              <li key={i}>
                <strong>"{c.eventA.title}"</strong> clashes with <strong>"{c.eventB.title}"</strong> on {c.eventA.date} ({c.eventA.time}).
              </li>
            ))}
            {conflicts.length > 3 && (
              <li className="list-none text-rose-500/80 font-medium">And {conflicts.length - 3} other overlap conflicts...</li>
            )}
          </ul>
        </div>
      )}

      {/* Main Grid: Left Sidebar, Calendar Area, Right Tasks Pane */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR PANEL */}
        <div className="col-span-12 lg:col-span-3 space-y-5">
          {/* Quick NLP Add Box */}
          <Card className="border border-white/5 bg-[#111318] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-[#22d3ee]" />
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">AI Scheduling Parse</span>
            </div>
            <form onSubmit={handleNlpAdd} className="space-y-3">
              <input
                type="text"
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                placeholder="e.g. Shoot Scene 3 tomorrow at 4 PM"
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white focus:border-[#22d3ee] focus:outline-none"
              />
              <div className="flex justify-between items-center text-[10px]">
                <button
                  type="button"
                  onClick={() => setNlpText("Meeting next Monday at 2 PM")}
                  className="text-text-secondary hover:text-white underline cursor-pointer"
                >
                  Try example
                </button>
                <Button type="submit" variant="primary" size="sm" className="px-3 py-1 text-[10px]">
                  Parse
                </Button>
              </div>
            </form>
          </Card>

          {/* Mini Calendar View */}
          <Card className="border border-white/5 bg-[#111318] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                {miniCalendarDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={handleMiniPrevMonth} 
                  className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleMiniNextMonth} 
                  className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono text-text-secondary mb-1">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {generateMonthGrid(miniCalendarDate).map((cell, idx) => {
                const isSelected = formatDateString(currentDate) === formatDateString(cell.date);
                const hasEvents = events.some(e => e.date === formatDateString(cell.date));
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentDate(cell.date);
                      setMiniCalendarDate(cell.date);
                    }}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                      cell.isCurrentMonth ? "text-white" : "text-white/20"
                    } ${isSelected ? "bg-[#22d3ee] text-[#111318] font-bold" : "hover:bg-white/5"} ${
                      hasEvents && !isSelected ? "border-b border-[#22d3ee]" : ""
                    }`}
                  >
                    {cell.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Timezone Selector */}
          <Card className="border border-white/5 bg-[#111318] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#22d3ee]" />
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">Zone Selector</span>
              </div>
              <span className="text-[9px] font-mono text-[#22d3ee] bg-[#22d3ee]/10 px-1.5 py-0.5 rounded">
                {tzTime || "00:00:00"}
              </span>
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:border-[#22d3ee]"
            >
              <option value="local">System Local Time</option>
              <option value="UTC">UTC (Universal Coordinated)</option>
              <option value="America/New_York">New York (EST/EDT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Kolkata">Dehradun/Delhi (IST)</option>
            </select>
          </Card>

          {/* Category Color Labels */}
          <Card className="border border-white/5 bg-[#111318] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#22d3ee]" />
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">Color Categories</span>
            </div>
            <div className="space-y-2">
              {[
                { type: "shoot", label: "Shoot Schedule", colorClass: "bg-[#22d3ee]" },
                { type: "meeting", label: "Production Meetings", colorClass: "bg-[#a855f7]" },
                { type: "deadline", label: "Deliverable Deadlines", colorClass: "bg-[#f43f5e]" },
                { type: "marketing", label: "Marketing Campaigns", colorClass: "bg-[#f59e0b]" },
                { type: "release", label: "Distribution Releases", colorClass: "bg-[#10b981]" }
              ].map(item => {
                const isSelected = selectedTypes.includes(item.type);
                return (
                  <label key={item.type} className="flex items-center gap-2.5 cursor-pointer text-text-secondary hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTypeFilter(item.type)}
                      className="rounded border-white/10 bg-[#09090B] text-primary focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Keyboard Shortcuts Hint */}
          <Card className="border border-white/5 bg-[#111318]/50 p-4 text-[10px] text-text-secondary leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-white mb-1.5 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-[#22d3ee]" />
              <span>Keyboard Shortcuts</span>
            </div>
            <p><strong>M</strong> / <strong>W</strong> / <strong>D</strong> : Month/Week/Day view</p>
            <p><strong>Y</strong> / <strong>A</strong> : Year/Agenda view</p>
            <p><strong>T</strong> : Back to Today</p>
            <p><strong>N</strong> or <strong>→</strong> : Next calendar frame</p>
            <p><strong>P</strong> or <strong>←</strong> : Previous calendar frame</p>
            <p><strong>C</strong> : Schedule new event</p>
          </Card>
        </div>

        {/* CENTER CALENDAR AREA */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          
          {/* Header Controls bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-[#22d3ee]" />
              <h3 className="text-sm font-semibold text-white">
                {viewMode === "month" && currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                {viewMode === "week" && `Week of ${getWeekDays(currentDate)[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                {viewMode === "day" && currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                {viewMode === "year" && `Year ${currentDate.getFullYear()}`}
                {viewMode === "agenda" && `Agenda from ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </h3>
              
              <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 ml-2 bg-[#09090B]">
                <button 
                  onClick={() => navigateTime(-1)} 
                  className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date("2026-07-12"))}
                  className="px-2 py-0.5 text-[10px] hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer font-bold uppercase tracking-wider"
                >
                  Today
                </button>
                <button 
                  onClick={() => navigateTime(1)} 
                  className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex border border-white/10 rounded-lg p-0.5 text-xs bg-[#09090B]">
              {(["day", "week", "month", "year", "agenda"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-all uppercase tracking-wider text-[9px] font-bold ${
                    viewMode === mode ? "bg-white/5 text-[#22d3ee]" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW DISPLAY CONTAINER */}
          <Card className="border border-white/5 bg-[#111318] min-h-[550px] overflow-hidden">
            <CardContent className="p-0">
              
              {/* MONTH VIEW */}
              {viewMode === "month" && (
                <div>
                  <div className="grid grid-cols-7 border-b border-white/5 text-center text-[9px] uppercase font-bold text-text-secondary py-3.5 bg-white/[0.01]">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                  </div>
                  <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-white/5 border-t border-white/5">
                    {generateMonthGrid(currentDate).map((dayCell, idx) => {
                      const dateStr = formatDateString(dayCell.date);
                      const isToday = formatDateString(new Date("2026-07-12")) === dateStr;
                      const dayEvents = filteredEvents.filter(e => e.date === dateStr);
                      return (
                        <div
                          key={idx}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dateStr)}
                          onClick={() => {
                            setEventForm(prev => ({ ...prev, date: dateStr }));
                            setIsAddOpen(true);
                          }}
                          className={`min-h-[90px] p-1.5 flex flex-col justify-between transition-colors relative cursor-pointer select-none ${
                            dayCell.isCurrentMonth ? "hover:bg-white/[0.01] bg-[#111318]" : "bg-black/20 opacity-30"
                          } ${isToday ? "bg-primary/5" : ""}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                              isToday ? "bg-[#22d3ee] text-[#111318]" : "text-text-secondary"
                            }`}>
                              {dayCell.label}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="text-[8px] text-[#22d3ee]/80 font-bold bg-[#22d3ee]/10 px-1 rounded-sm">
                                {dayEvents.length} events
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-1 justify-end mt-1.5 overflow-hidden">
                            {dayEvents.slice(0, 3).map((evt) => (
                              <div
                                key={evt.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, evt.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditEvent(evt);
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded truncate font-mono border hover:scale-[1.02] transition-transform ${getEventBgColor(evt.type)}`}
                              >
                                {evt.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-[8px] text-text-secondary text-right font-semibold">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WEEK VIEW */}
              {viewMode === "week" && (
                <div>
                  <div className="grid grid-cols-8 border-b border-white/5 text-center text-[9px] uppercase font-bold text-text-secondary bg-white/[0.01] divide-x divide-white/5">
                    <div className="py-3">Time</div>
                    {getWeekDays(currentDate).map((day, idx) => {
                      const isToday = formatDateString(day) === formatDateString(new Date("2026-07-12"));
                      return (
                        <div key={idx} className={`py-2 flex flex-col items-center justify-center ${isToday ? "text-[#22d3ee]" : ""}`}>
                          <span>{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 font-bold ${
                            isToday ? "bg-[#22d3ee] text-[#111318]" : ""
                          }`}>
                            {day.getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Hourly grid */}
                  <div className="h-[450px] overflow-y-auto divide-y divide-white/5">
                    {Array.from({ length: 15 }, (_, i) => i + 8).map(hour => {
                      const hourLabel = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
                      return (
                        <div key={hour} className="grid grid-cols-8 divide-x divide-white/5 min-h-[50px] relative">
                          <div className="text-[9px] text-text-secondary text-right pr-2 py-1 font-mono">{hourLabel}</div>
                          {getWeekDays(currentDate).map((day, idx) => {
                            const dateStr = formatDateString(day);
                            const hourEvents = filteredEvents.filter(e => {
                              if (e.date !== dateStr) return false;
                              const startHour = parseInt(e.time.split(":")[0]);
                              return startHour === hour;
                            });
                            return (
                              <div
                                key={idx}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, dateStr, `${String(hour).padStart(2, "0")}:00 - ${String((hour + 1) % 24).padStart(2, "0")}:00`)}
                                onClick={() => {
                                  setEventForm(prev => ({
                                    ...prev,
                                    date: dateStr,
                                    time: `${String(hour).padStart(2, "0")}:00 - ${String((hour + 1) % 24).padStart(2, "0")}:00`
                                  }));
                                  setIsAddOpen(true);
                                }}
                                className="p-1 hover:bg-white/[0.02] transition-colors relative flex flex-col gap-1 justify-start cursor-pointer"
                              >
                                {hourEvents.map(evt => (
                                  <div
                                    key={evt.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, evt.id)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditEvent(evt);
                                    }}
                                    className={`p-1 rounded text-[9px] truncate font-mono border hover:scale-[1.02] transition-transform ${getEventBgColor(evt.type)}`}
                                  >
                                    {evt.title}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DAY VIEW */}
              {viewMode === "day" && (
                <div>
                  <div className="p-3 bg-white/[0.01] border-b border-white/5 text-[10px] uppercase font-bold text-text-secondary flex justify-between items-center">
                    <span>Active Daily Time Slots</span>
                    <span className="text-[#22d3ee] font-mono">{formatDateString(currentDate)}</span>
                  </div>
                  <div className="h-[450px] overflow-y-auto divide-y divide-white/5">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const hourLabel = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
                      const dateStr = formatDateString(currentDate);
                      const hourEvents = filteredEvents.filter(e => {
                        if (e.date !== dateStr) return false;
                        const startHour = parseInt(e.time.split(":")[0]);
                        return startHour === hour;
                      });
                      return (
                        <div key={hour} className="grid grid-cols-12 divide-x divide-white/5 min-h-[50px] relative">
                          <div className="col-span-2 text-[9px] text-text-secondary text-right pr-3 py-2.5 font-mono bg-white/[0.01]">{hourLabel}</div>
                          <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, dateStr, `${String(hour).padStart(2, "0")}:00 - ${String((hour + 1) % 24).padStart(2, "0")}:00`)}
                            onClick={() => {
                              setEventForm(prev => ({
                                ...prev,
                                date: dateStr,
                                time: `${String(hour).padStart(2, "0")}:00 - ${String((hour + 1) % 24).padStart(2, "0")}:00`
                              }));
                              setIsAddOpen(true);
                            }}
                            className="col-span-10 p-1.5 hover:bg-white/[0.02] transition-colors relative flex flex-wrap gap-2 items-center cursor-pointer"
                          >
                            {hourEvents.length === 0 && (
                              <span className="text-white/10 text-[9px] ml-1 select-none">Free slot</span>
                            )}
                            {hourEvents.map(evt => (
                              <div
                                key={evt.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, evt.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditEvent(evt);
                                }}
                                className={`px-2 py-1 rounded text-[9px] font-mono border hover:scale-[1.02] transition-transform ${getEventBgColor(evt.type)}`}
                              >
                                <strong>{evt.time}</strong> : {evt.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* YEAR VIEW */}
              {viewMode === "year" && (
                <div className="p-4 grid grid-cols-3 gap-4">
                  {Array.from({ length: 12 }, (_, m) => {
                    const year = currentDate.getFullYear();
                    const monthDate = new Date(year, m, 1);
                    const { numDays, startOffset } = getDaysInMonth(monthDate);
                    const days = Array.from({ length: 42 }, (_, idx) => {
                      const dNum = idx - startOffset + 1;
                      return dNum > 0 && dNum <= numDays ? dNum : null;
                    });
                    const monthName = monthDate.toLocaleString("en-US", { month: "short" });
                    
                    return (
                      <div key={m} className="border border-white/5 rounded-lg p-2.5 bg-white/[0.01]">
                        <div className="text-[10px] font-bold text-white mb-2 uppercase tracking-wider text-center border-b border-white/5 pb-1">
                          {monthName}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] text-text-secondary font-mono">
                          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                          {days.map((d, idx) => {
                            if (d === null) return <div key={idx} />;
                            const cellDateString = `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                            const dayEvents = filteredEvents.filter(e => e.date === cellDateString);
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setCurrentDate(new Date(year, m, d));
                                  setViewMode("day");
                                }}
                                className={`w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/30 transition-all ${
                                  dayEvents.length > 0 ? "border border-[#22d3ee] text-[#22d3ee] font-bold" : "text-text-secondary"
                                }`}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* AGENDA VIEW */}
              {viewMode === "agenda" && (
                <div className="p-4 space-y-3">
                  <div className="text-[10px] uppercase font-bold text-[#22d3ee] border-b border-white/5 pb-2">
                    Agenda Timeline Listing
                  </div>
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary italic">
                      No calendar events schedule found.
                    </div>
                  ) : (
                    filteredEvents
                      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                      .map(evt => (
                        <div
                          key={evt.id}
                          onClick={() => openEditEvent(evt)}
                          className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-10 rounded-full shrink-0 ${getEventMarkerColor(evt.type)}`} />
                            <div>
                              <h5 className="font-semibold text-white text-xs">{evt.title}</h5>
                              <p className="text-[10px] text-text-secondary mt-0.5 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {evt.date} @ {evt.time}
                              </p>
                              {evt.location && (
                                <p className="text-[9px] text-text-secondary/80 flex items-center gap-1.5 mt-0.5">
                                  <MapPin className="w-3 h-3 text-rose-500" />
                                  {evt.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-secondary" />
                        </div>
                      ))
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDEBAR PANEL: TASKS & SUBTASKS */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card className="border border-white/5 bg-[#111318] p-4 flex flex-col h-[600px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3.5">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-[#22d3ee]" />
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">Tasks Checklist</span>
              </div>
              <span className="text-[9px] font-bold bg-[#22d3ee]/10 text-[#22d3ee] px-2 py-0.5 rounded-full">
                {projectTasks.length} total
              </span>
            </div>

            {/* Quick Task Add Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-3">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Add new task title..."
                className="flex-1 bg-[#09090B] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:border-[#22d3ee] focus:outline-none"
              />
              <Button type="submit" variant="primary" size="sm" className="px-2.5 shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </form>

            {/* Task View Filter Tabs */}
            <div className="grid grid-cols-5 border border-white/10 rounded-lg p-0.5 text-[9px] bg-[#09090B] mb-3">
              {(["All", "Todo", "In Progress", "Delayed", "Completed"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTaskTab(tab)}
                  className={`py-1 rounded text-center truncate cursor-pointer transition-colors ${
                    selectedTaskTab === tab ? "bg-white/5 text-[#22d3ee] font-bold" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tasks list */}
            <div className="flex-1 overflow-y-auto space-y-3.5 scrollbar-none pr-1">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-text-secondary italic">
                  No tasks matching criteria.
                </div>
              ) : (
                filteredTasks.map(task => {
                  const subtasks = task.subtasks || [];
                  const compCount = subtasks.filter(s => s.completed).length;
                  
                  return (
                    <div key={task.id} className="border border-white/5 rounded-xl p-3 bg-white/[0.01] space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            task.priority === "High" ? "bg-rose-500" : 
                            task.priority === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                          }`} title={`${task.priority} Priority`} />
                          <h6 className={`font-semibold text-xs text-white ${task.status === "Completed" ? "line-through opacity-55" : ""}`}>
                            {task.title}
                          </h6>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Task Status Dropdown */}
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(targetProjectId, task.id, { status: e.target.value as any })}
                            className="bg-[#09090B] border border-white/10 text-[9px] rounded-lg p-1 text-white focus:outline-none"
                          >
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                          <button
                            onClick={() => deleteTask(targetProjectId, task.id)}
                            className="p-1 hover:bg-white/5 text-text-secondary hover:text-rose-500 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtasks Render block */}
                      <div className="border-l border-white/5 pl-2.5 ml-1.5 space-y-1.5">
                        {subtasks.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between text-[10px] gap-2.5">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary hover:text-white">
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={(e) => toggleSubtask(targetProjectId, task.id, sub.id, e.target.checked)}
                                className="rounded border-white/10 bg-[#09090B] text-primary focus:ring-0 w-3 h-3 cursor-pointer"
                              />
                              <span className={sub.completed ? "line-through opacity-50" : ""}>
                                {sub.title}
                              </span>
                            </label>
                          </div>
                        ))}

                        {/* Add subtask input */}
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            value={newSubtaskTitle[task.id] || ""}
                            onChange={(e) => setNewSubtaskTitle(prev => ({ ...prev, [task.id]: e.target.value }))}
                            placeholder="Add checklist subtask..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSubtaskSubmit(task.id);
                              }
                            }}
                            className="flex-1 bg-transparent border-b border-white/10 px-1 py-0.5 text-[9px] text-white focus:border-[#22d3ee] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSubtaskSubmit(task.id)}
                            className="text-[9px] font-bold text-[#22d3ee] hover:underline cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {subtasks.length > 0 && (
                        <div className="space-y-1 pt-1 text-[9px] text-text-secondary">
                          <div className="flex justify-between font-mono">
                            <span>Checklist progress</span>
                            <span>{compCount}/{subtasks.length} ({Math.round((compCount/subtasks.length)*100)}%)</span>
                          </div>
                          <div className="w-full bg-[#09090B] h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#22d3ee] h-full rounded-full transition-all duration-300"
                              style={{ width: `${(compCount/subtasks.length)*100}%` }}
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* SCHEDULE EVENT DIALOG */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Production Event"
        size="md"
      >
        <form onSubmit={handleEventFormSubmit} className="space-y-4 text-xs text-white">
          <div>
            <label className="block text-text-secondary mb-1">Event Title</label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Action Scene 1 Filming"
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1">Start Date</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={eventForm.end_date}
                onChange={(e) => setEventForm(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1">Start Time (e.g. 10:00)</label>
              <input
                type="text"
                required
                value={eventForm.time}
                onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                placeholder="10:00"
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1">End Time (Optional)</label>
              <input
                type="text"
                value={eventForm.end_time}
                onChange={(e) => setEventForm(prev => ({ ...prev, end_time: e.target.value }))}
                placeholder="12:00"
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1">Category Type</label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              >
                <option value="shoot">Shoot Schedule</option>
                <option value="meeting">Team Meeting</option>
                <option value="deadline">Deliverable Deadline</option>
                <option value="marketing">Marketing Campaign</option>
                <option value="release">Distribution Release</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary mb-1">Recurrence Pattern</label>
              <select
                value={eventForm.recurrence_pattern}
                onChange={(e) => setEventForm(prev => ({ 
                  ...prev, 
                  recurrence_pattern: e.target.value,
                  is_recurring: e.target.value !== "none"
                }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              >
                <option value="none">No Recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary mb-1">Filming Location</label>
            <input
              type="text"
              value={eventForm.location}
              onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. stage A / Outdoor park"
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-1">Description Notes</label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Write production scene details or guidelines..."
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none min-h-[60px]"
            />
          </div>

          <div className="flex justify-end gap-3.5 pt-3.5 border-t border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Event
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT EVENT DIALOG */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modify Scheduled Event"
        size="md"
      >
        <form onSubmit={handleEventUpdateSubmit} className="space-y-4 text-xs text-white">
          <div>
            <label className="block text-text-secondary mb-1">Event Title</label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1">Start Date</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1">End Date</label>
              <input
                type="date"
                value={eventForm.end_date}
                onChange={(e) => setEventForm(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1">Start Time (e.g. 10:00)</label>
              <input
                type="text"
                required
                value={eventForm.time}
                onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1">End Time</label>
              <input
                type="text"
                value={eventForm.end_time}
                onChange={(e) => setEventForm(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1">Category Type</label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] focus:outline-none"
              >
                <option value="shoot">Shoot Schedule</option>
                <option value="meeting">Team Meeting</option>
                <option value="deadline">Deliverable Deadline</option>
                <option value="marketing">Marketing Campaign</option>
                <option value="release">Distribution Release</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary mb-1">Recurrence Pattern</label>
              <select
                value={eventForm.recurrence_pattern}
                onChange={(e) => setEventForm(prev => ({ 
                  ...prev, 
                  recurrence_pattern: e.target.value,
                  is_recurring: e.target.value !== "none"
                }))}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee]"
              >
                <option value="none">No Recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary mb-1">Filming Location</label>
            <input
              type="text"
              value={eventForm.location}
              onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee]"
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-1">Description Notes</label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#22d3ee] min-h-[60px]"
            />
          </div>

          <div className="flex justify-between items-center pt-3.5 border-t border-white/5">
            <button
              type="button"
              onClick={async () => {
                if (selectedEvent) {
                  await deleteCalendarEvent(targetProjectId, selectedEvent.id);
                  setIsEditOpen(false);
                  setSelectedEvent(null);
                }
              }}
              className="flex items-center gap-1.5 text-rose-500 hover:text-rose-400 hover:underline font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Event</span>
            </button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Schedule
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

    </div>
  );
};

export default CalendarView;

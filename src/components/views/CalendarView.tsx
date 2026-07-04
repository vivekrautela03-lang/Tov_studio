"use client";

import React, { useState } from "react";
import { useProjectStore, CalendarEvent } from "@/store/useProjectStore";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface CalendarViewProps {
  projectScope?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ projectScope }) => {
  const { activeProjectId, calendarEvents, addCalendarEvent, deleteCalendarEvent } = useProjectStore();
  const targetProjectId = projectScope || activeProjectId;
  const events = calendarEvents[targetProjectId] || [];

  const [activeTab, setActiveTab] = useState<"month" | "week" | "timeline">("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // New Event Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "2026-07-05",
    type: "shoot" as CalendarEvent["type"],
    time: "10:00 - 12:00"
  });

  // Calendar parameters for July 2026
  // July 1, 2026 is a Wednesday.
  // There are 31 days in July.
  const daysInMonth = 31;
  const startDayOffset = 3; // Wednesday (0=Sun, 1=Mon, 2=Tue, 3=Wed...)

  const calendarDays = Array.from({ length: 42 }, (_, idx) => {
    const dayNumber = idx - startDayOffset + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const dateString = `2026-07-${String(dayNumber).padStart(2, "0")}`;
      const dayEvents = events.filter((e) => e.date === dateString);
      return { dayNumber, dateString, dayEvents, isCurrentMonth: true };
    }
    return { dayNumber: null, dateString: null, dayEvents: [], isCurrentMonth: false };
  });

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "shoot": return "bg-primary border-primary/20 text-white";
      case "meeting": return "bg-secondary border-secondary/20 text-white";
      case "deadline": return "bg-danger border-danger/20 text-white";
      case "marketing": return "bg-warning border-warning/20 text-white";
      default: return "bg-success border-success/20 text-white";
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    addCalendarEvent(targetProjectId, newEvent);
    setIsAddOpen(false);
    setNewEvent({
      title: "",
      date: selectedDate || "2026-07-05",
      type: "shoot",
      time: "10:00 - 12:00"
    });
  };

  const handleDayClick = (dateString: string | null) => {
    if (!dateString) return;
    setSelectedDate(dateString);
    setNewEvent((prev) => ({ ...prev, date: dateString }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Calendar Header with toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-white">July 2026</h3>
          <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 ml-2">
            <button className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"><ChevronLeft className="w-4.5 h-4.5" /></button>
            <button className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white cursor-pointer"><ChevronRight className="w-4.5 h-4.5" /></button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Month / Week / Timeline toggle */}
          <div className="flex border border-white/10 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("month")}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${activeTab === "month" ? "bg-white/5 text-white font-medium" : "text-text-secondary"}`}
            >
              Month
            </button>
            <button
              onClick={() => setActiveTab("week")}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${activeTab === "week" ? "bg-white/5 text-white font-medium" : "text-text-secondary"}`}
            >
              Week
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${activeTab === "timeline" ? "bg-white/5 text-white font-medium" : "text-text-secondary"}`}
            >
              Timeline
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedDate("2026-07-05");
              setIsAddOpen(true);
            }}
            className="flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </Button>
        </div>
      </div>

      {activeTab === "month" && (
        <Card className="border border-white/5 bg-[#111318]">
          <CardContent className="p-0">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-white/5 text-center text-[10px] uppercase font-bold text-text-secondary py-3.5 bg-white/[0.01]">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Monthly Grid */}
            <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-white/5 border-t border-white/5">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate === day.dateString;
                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day.dateString)}
                    className={`min-h-[100px] p-2 flex flex-col justify-between transition-colors relative cursor-pointer select-none ${
                      day.isCurrentMonth ? "hover:bg-white/[0.01]" : "bg-black/10 opacity-30 pointer-events-none"
                    } ${isSelected ? "bg-primary/5 border border-primary/20" : ""}`}
                  >
                    {/* Day Number */}
                    <span className={`text-[10px] font-bold font-mono ${
                      isSelected ? "text-primary" : "text-text-secondary"
                    }`}>
                      {day.dayNumber}
                    </span>

                    {/* Day events indicator pills */}
                    <div className="flex-1 flex flex-col gap-1 justify-end mt-2 overflow-y-auto max-h-[70px] scrollbar-none">
                      {day.dayEvents.slice(0, 3).map((evt) => (
                        <div
                          key={evt.id}
                          className={`text-[9px] px-1.5 py-0.5 rounded truncate font-mono ${getEventColor(evt.type)}`}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {day.dayEvents.length > 3 && (
                        <span className="text-[8px] text-text-secondary text-right pr-1 block">+{day.dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline view list */}
      {(activeTab === "timeline" || activeTab === "week") && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-secondary">
                No scheduled calendar events.
              </div>
            ) : (
              events
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full shrink-0 ${
                        evt.type === "shoot" ? "bg-primary" : 
                        evt.type === "meeting" ? "bg-secondary" : 
                        evt.type === "deadline" ? "bg-danger" : "bg-warning"
                      }`} />
                      <div>
                        <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                        <div className="flex gap-4 text-[10px] text-text-secondary font-mono mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {evt.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.time}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCalendarEvent(targetProjectId, evt.id)}
                      className="text-text-secondary hover:text-danger p-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Date Specific Details Side-Panel / Dialog */}
      {selectedDate && (
        <Card className="border border-primary/20 bg-primary/[0.01]">
          <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-primary font-bold uppercase">Schedule detail</span>
              <h4 className="text-xs font-bold text-white">Events for date: {selectedDate}</h4>
              <div className="space-y-1 mt-2 text-xs">
                {events.filter((e) => e.date === selectedDate).length === 0 ? (
                  <span className="text-text-secondary italic">No events scheduled.</span>
                ) : (
                  events
                    .filter((e) => e.date === selectedDate)
                    .map((e) => (
                      <div key={e.id} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          e.type === "shoot" ? "bg-primary" : 
                          e.type === "meeting" ? "bg-secondary" : "bg-white/40"
                        }`} />
                        <span className="text-white font-medium">{e.title}</span>
                        <span className="text-text-secondary font-mono">({e.time})</span>
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setSelectedDate(null)}>Close panel</Button>
              <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>Add Event</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ADD CALENDAR EVENT DIALOG */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Production Event"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Shoot Scene 1B: Kael Encounter"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Scheduled Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">Event Type</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent["type"] })}
                className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary"
              >
                <option value="shoot">Production Shoot</option>
                <option value="meeting">Team Meeting</option>
                <option value="deadline">Milestone / Deadline</option>
                <option value="marketing">Marketing Publish</option>
                <option value="release">Distribution Release</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Time Frame</label>
            <input
              type="text"
              placeholder="e.g., 18:00 - 02:00"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="w-full bg-[#09090B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Schedule Event</Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
};
export default CalendarView;

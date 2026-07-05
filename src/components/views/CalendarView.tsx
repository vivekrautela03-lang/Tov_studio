"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore, CalendarEvent } from "@/store/useProjectStore";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, X, Trash2, HelpCircle } from "lucide-react";
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
  
  // Google Sync States
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New Event Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "2026-07-05",
    type: "shoot" as CalendarEvent["type"],
    time: "10:00 - 12:00"
  });

  // Calendar parameters for July 2026
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

  // OAuth token listener check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        if (token) {
          // Clear hash parameters from URL bar
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          importGoogleCalendarEvents(token);
        }
      }
    }
  }, []);

  const importGoogleCalendarEvents = async (token: string) => {
    setSyncLoading(true);
    setSyncStatus(null);
    try {
      console.log("Fetching primary calendar events from Google API...");
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=15&timeMin=2026-07-01T00:00:00Z&orderBy=startTime&singleEvents=true",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const googleEvents = data.items || [];
        
        let addedCount = 0;
        googleEvents.forEach((evt: any) => {
          const startStr = evt.start?.dateTime || evt.start?.date || "";
          if (!startStr) return;
          
          const datePart = startStr.substring(0, 10); // "YYYY-MM-DD"
          const timePart = evt.start?.dateTime
            ? new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            : "10:00 - 12:00";

          // Avoid duplicating same calendar event titles on the same date
          const exists = events.some(e => e.title === evt.summary && e.date === datePart);
          if (!exists) {
            addCalendarEvent(targetProjectId, {
              title: evt.summary || "Google Calendar Event",
              date: datePart,
              type: "meeting", // Default category
              time: timePart
            });
            addedCount++;
          }
        });

        setSyncStatus({
          type: "success",
          message: `Successfully synchronized and imported ${addedCount} events directly from Google Calendar.`
        });
      } else {
        const errData = await response.json().catch(() => ({}));
        setSyncStatus({
          type: "error",
          message: errData.error?.message || "Google Authentication key refused. Double check Authorized redirect domains."
        });
      }
    } catch (err: any) {
      console.error("Google Calendar Sync error details:", err);
      setSyncStatus({
        type: "error",
        message: err.message || "Network exception. Google connection timed out."
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleGoogleSyncRedirect = () => {
    setSyncLoading(true);
    setSyncStatus(null);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "816922124665-sdgbpt8jlq2cbh3n927s6duu1d96agib.apps.googleusercontent.com";
    const redirectUri = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=https://www.googleapis.com/auth/calendar.readonly`;

    console.log("Redirecting to Google OAuth2 consent portal...");
    window.location.href = authUrl;
  };

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

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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

          {/* Sync Google Calendar Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoogleSyncRedirect}
            disabled={syncLoading}
            className="flex items-center gap-1.5 cursor-pointer border-white/10 hover:border-primary/50 text-white p-2 sm:px-3 sm:py-1.5 text-xs"
          >
            {syncLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />
            )}
            <span>Sync Google Calendar</span>
          </Button>

          {/* Add Local Event Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedDate("2026-07-05");
              setIsAddOpen(true);
            }}
            className="flex items-center gap-1.5 cursor-pointer text-xs p-2 sm:px-3 sm:py-1.5"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Event</span>
          </Button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className={`p-3 rounded-lg text-xs flex gap-2.5 items-start ${
          syncStatus.type === "success" 
            ? "bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 text-[#3ecf8e]" 
            : "bg-danger/10 border border-danger/20 text-danger"
        }`}>
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{syncStatus.type === "success" ? "Google Calendar Synchronized" : "Sync Error Notification"}</p>
            <p className="mt-0.5 opacity-90 leading-relaxed">{syncStatus.message}</p>
          </div>
          <button onClick={() => setSyncStatus(null)} className="text-text-secondary hover:text-white ml-auto cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === "month" && (
        <Card className="border border-white/5 bg-[#111318] overflow-hidden">
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

      {/* Timeline view fallback */}
      {activeTab !== "month" && (
        <Card>
          <CardContent className="p-6 text-center text-xs text-text-secondary py-12">
            The full {activeTab} timeline is generated locally. Use the Month grid overview to review active shoot slots.
          </CardContent>
        </Card>
      )}

      {/* Selected Day Agenda Panel drawer */}
      {selectedDate && (
        <Card className="border border-white/5 bg-[#111318]">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Agenda: {selectedDate}</h4>
              </div>
              <button onClick={() => setSelectedDate(null)} className="text-text-secondary hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="space-y-2">
                {events.filter((e) => e.date === selectedDate).length === 0 ? (
                  <div className="text-text-secondary text-xs italic py-2">No production schedule booked.</div>
                ) : (
                  events
                    .filter((e) => e.date === selectedDate)
                    .map((evt) => (
                      <div
                        key={evt.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-1.5 h-6 rounded-full shrink-0 ${
                            evt.type === "shoot" ? "bg-primary" : 
                            evt.type === "meeting" ? "bg-secondary" : 
                            evt.type === "deadline" ? "bg-danger" : "bg-success"
                          }`} />
                          <div>
                            <div className="font-semibold text-white">{evt.title}</div>
                            <div className="text-[10px] text-text-secondary mt-0.5">{evt.time}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteCalendarEvent(targetProjectId, evt.id)}
                          className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-danger cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

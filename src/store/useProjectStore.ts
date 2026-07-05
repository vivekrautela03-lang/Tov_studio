import { create } from "zustand";

// --- TYPES ---
export interface Project {
  id: string;
  title: string;
  tagline: string;
  status: "Pre-Production" | "Production" | "Post-Production" | "Completed";
  progress: number;
  budget: string;
  budgetVal: number; // numeric value for charts
  spentVal: number;
  crewCount: number;
  castCount: number;
  deadline: string;
  completion: number;
  coverImage: string;
  director: string;
  location: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  title: string;
  content: string;
  aiExtracted: {
    characters: string[];
    props: string[];
    costumes: string[];
    locations: string[];
    dialogueCount: number;
    duration: string;
    complexity: "Low" | "Medium" | "High";
    continuityWarnings: string[];
  };
}

export interface StoryboardShot {
  id: string;
  shotNumber: string;
  previewImage: string;
  shotType: string;
  lens: string;
  camera: string;
  lighting: string;
  notes: string;
  status: "Draft" | "Approved" | "Revision";
}

export interface ShotPlan {
  id: string;
  scene: string;
  setup: string;
  props: string[];
  crew: string[];
  duration: string;
  location: string;
  weather: "Indoor" | "Outdoor - Sun" | "Outdoor - Rain Contingency" | "Outdoor - Night";
  status: "Todo" | "In Progress" | "Completed" | "Delayed";
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: "shoot" | "meeting" | "deadline" | "marketing" | "release";
  time: string;
}

export interface CrewMember {
  id: string;
  name: string;
  photo: string;
  role: string;
  phone: string;
  experience: string;
  skills: string[];
  attendance: "Present" | "Absent" | "Late" | "Off-Duty";
  paymentStatus: "Paid" | "Pending" | "Invoiced";
  availability: "Available" | "On Set" | "Unavailable";
  performance: number; // 0-100
  rate: string;
}

export interface CastMember {
  id: string;
  name: string;
  photo: string;
  character: string;
  availability: "Available" | "On Set" | "Unavailable";
  measurements: string;
  costumeNotes: string;
  contractStatus: "Signed" | "In Negotiation" | "Pending Review";
  auditionStatus: "Passed" | "Scheduled" | "Callback";
  payment: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: "Camera" | "Lens" | "Lighting" | "Audio" | "Grip" | "Power";
  photo: string;
  qrCode: string;
  status: "Available" | "In Use" | "Maintenance" | "Reserved";
  assignedTo: string;
  battery: number | null; // percentage, null if not electric
  maintenanceDate: string;
  location: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  extension?: string;
  size?: string;
  modified: string;
  version: number;
  url?: string;
  children?: string[]; // for mock directory traversal
}

export interface MarketingCampaign {
  id: string;
  platform: "Instagram" | "YouTube" | "Twitter" | "TikTok" | "Press";
  title: string;
  type: "Poster" | "Trailer" | "Reels" | "Behind the Scenes" | "Teaser";
  releaseDate: string;
  status: "Draft" | "Scheduled" | "Published";
  aiCaption?: string;
  views?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  actions?: { label: string; action: string }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
}

// --- STATE DEFINITION ---
interface ProjectStoreState {
  // Navigation
  activeView: string;
  sidebarCollapsed: boolean;
  activeProjectTab: string;
  mobileSidebarOpen: boolean;
  memberRole: string;
  
  // Projects
  projects: Project[];
  activeProjectId: string;
  
  // Data linked to projects (keyed by project ID)
  scripts: Record<string, ScriptScene[]>;
  storyboards: Record<string, StoryboardShot[]>;
  shotPlans: Record<string, ShotPlan[]>;
  calendarEvents: Record<string, CalendarEvent[]>;
  crew: Record<string, CrewMember[]>;
  cast: Record<string, CastMember[]>;
  equipment: Record<string, Equipment[]>;
  files: Record<string, FileItem[]>;
  marketing: Record<string, MarketingCampaign[]>;
  
  // Global Systems
  chatLogs: ChatMessage[];
  notifications: NotificationItem[];
  searchQuery: string;
  isSearchOpen: boolean;

  // Actions
  setActiveView: (view: string) => void;
  toggleSidebar: () => void;
  setActiveProjectTab: (tab: string) => void;
  setActiveProjectId: (id: string) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setMemberRole: (role: string) => void;
  
  // Data Modifying Actions
  addProject: (project: Omit<Project, "id" | "progress" | "completion" | "crewCount" | "castCount">) => void;
  updateScriptContent: (projectId: string, sceneId: string, content: string) => void;
  addStoryboardShot: (projectId: string, shot: Omit<StoryboardShot, "id">) => void;
  updateStoryboardOrder: (projectId: string, newShots: StoryboardShot[]) => void;
  updateStoryboardShotStatus: (projectId: string, shotId: string, status: StoryboardShot["status"]) => void;
  addShotPlan: (projectId: string, plan: Omit<ShotPlan, "id">) => void;
  updateShotPlanStatus: (projectId: string, planId: string, status: ShotPlan["status"]) => void;
  addCalendarEvent: (projectId: string, event: Omit<CalendarEvent, "id">) => void;
  deleteCalendarEvent: (projectId: string, id: string) => void;
  toggleCrewAttendance: (projectId: string, crewId: string) => void;
  toggleCastAvailability: (projectId: string, castId: string) => void;
  updateEquipmentStatus: (projectId: string, equipId: string, status: Equipment["status"], assignedTo?: string) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  generateAICaption: (projectId: string, campaignId: string) => void;
}

// --- INITIAL CLEAN SLATE ---

// --- INITIAL MOCK DATA ---
const initialProjects: Project[] = [];
const initialScripts: Record<string, ScriptScene[]> = {};
const initialStoryboards: Record<string, StoryboardShot[]> = {};
const initialShotPlans: Record<string, ShotPlan[]> = {};
const initialCalendarEvents: Record<string, CalendarEvent[]> = {};
const initialCrew: Record<string, CrewMember[]> = {};
const initialCast: Record<string, CastMember[]> = {};
const initialEquipment: Record<string, Equipment[]> = {};
const initialFiles: Record<string, FileItem[]> = {};
const initialMarketing: Record<string, MarketingCampaign[]> = {};
const initialChatLogs: ChatMessage[] = [
  {
    id: "m-1",
    sender: "ai",
    text: "Good evening. Welcome to your clean slate at TOV Studio. Initialize your first production workspace to start collaborating.",
    timestamp: "20:30"
  }
];
const initialNotifications: NotificationItem[] = [];

// --- ZUSTAND STORE ---
export const useProjectStore = create<ProjectStoreState>((set) => ({
  // Navigation Defaults
  activeView: "dashboard",
  sidebarCollapsed: false,
  activeProjectTab: "Overview",
  mobileSidebarOpen: false,
  memberRole: "Owner",
  
  // Projects Lists
  projects: initialProjects,
  activeProjectId: "proj-1",
  
  // Scoped Data
  scripts: initialScripts,
  storyboards: initialStoryboards,
  shotPlans: initialShotPlans,
  calendarEvents: initialCalendarEvents,
  crew: initialCrew,
  cast: initialCast,
  equipment: initialEquipment,
  files: initialFiles,
  marketing: initialMarketing,
  
  // Global components state
  chatLogs: initialChatLogs,
  notifications: initialNotifications,
  searchQuery: "",
  isSearchOpen: false,

  // Actions
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveProjectTab: (tab) => set({ activeProjectTab: tab }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setMemberRole: (role) => set({ memberRole: role }),
  
  addProject: (proj) => set((state) => {
    const newId = `proj-${state.projects.length + 1}`;
    const newProject: Project = {
      ...proj,
      id: newId,
      progress: 0,
      completion: 0,
      crewCount: 0,
      castCount: 0
    };
    return {
      projects: [...state.projects, newProject],
      activeProjectId: newId,
      scripts: { ...state.scripts, [newId]: [] },
      storyboards: { ...state.storyboards, [newId]: [] },
      shotPlans: { ...state.shotPlans, [newId]: [] },
      calendarEvents: { ...state.calendarEvents, [newId]: [] },
      crew: { ...state.crew, [newId]: [] },
      cast: { ...state.cast, [newId]: [] },
      equipment: { ...state.equipment, [newId]: [] },
      files: { ...state.files, [newId]: [
        { id: "f-1", name: "Scripts", type: "folder", modified: new Date().toISOString().split("T")[0], version: 1 },
        { id: "f-2", name: "Contracts", type: "folder", modified: new Date().toISOString().split("T")[0], version: 1 }
      ] },
      marketing: { ...state.marketing, [newId]: [] }
    };
  }),

  updateScriptContent: (projectId, sceneId, content) => set((state) => {
    const scenes = state.scripts[projectId] || [];
    const updatedScenes = scenes.map((sc) => {
      if (sc.id !== sceneId) return sc;
      
      // Perform a mock AI extraction to make it look active!
      const lines = content.split("\n");
      const characters = Array.from(new Set(
        lines
          .filter(l => l.toUpperCase() === l && l.trim().length > 1 && !l.includes("(") && !l.includes("EXT.") && !l.includes("INT."))
          .map(l => l.trim())
      )).slice(0, 4);

      const dialogueCount = lines.filter(l => l.trim().length > 0 && l === l.toUpperCase()).length;
      
      return {
        ...sc,
        content,
        aiExtracted: {
          ...sc.aiExtracted,
          characters: characters.length > 0 ? characters : sc.aiExtracted.characters,
          dialogueCount: dialogueCount > 0 ? dialogueCount : sc.aiExtracted.dialogueCount,
          duration: `${Math.floor(content.length / 500) + 1}:${String(Math.floor((content.length % 500) / 10)).padStart(2, '0')}`
        }
      };
    });

    return {
      scripts: {
        ...state.scripts,
        [projectId]: updatedScenes
      }
    };
  }),

  addStoryboardShot: (projectId, shot) => set((state) => {
    const shots = state.storyboards[projectId] || [];
    const newShot: StoryboardShot = {
      ...shot,
      id: `shot-${shots.length + 1}`
    };
    return {
      storyboards: {
        ...state.storyboards,
        [projectId]: [...shots, newShot]
      }
    };
  }),

  updateStoryboardOrder: (projectId, newShots) => set((state) => ({
    storyboards: {
      ...state.storyboards,
      [projectId]: newShots
    }
  })),

  updateStoryboardShotStatus: (projectId, shotId, status) => set((state) => {
    const shots = state.storyboards[projectId] || [];
    const updatedShots = shots.map((sh) => (sh.id === shotId ? { ...sh, status } : sh));
    return {
      storyboards: {
        ...state.storyboards,
        [projectId]: updatedShots
      }
    };
  }),

  addShotPlan: (projectId, plan) => set((state) => {
    const plans = state.shotPlans[projectId] || [];
    const newPlan: ShotPlan = {
      ...plan,
      id: `plan-${plans.length + 1}`
    };
    return {
      shotPlans: {
        ...state.shotPlans,
        [projectId]: [...plans, newPlan]
      }
    };
  }),

  updateShotPlanStatus: (projectId, planId, status) => set((state) => {
    const plans = state.shotPlans[projectId] || [];
    return {
      shotPlans: {
        ...state.shotPlans,
        [projectId]: plans.map((p) => (p.id === planId ? { ...p, status } : p))
      }
    };
  }),

  addCalendarEvent: (projectId, event) => set((state) => {
    const events = state.calendarEvents[projectId] || [];
    const newEvent: CalendarEvent = {
      ...event,
      id: `cal-${events.length + 1}`
    };
    return {
      calendarEvents: {
        ...state.calendarEvents,
        [projectId]: [...events, newEvent]
      }
    };
  }),

  deleteCalendarEvent: (projectId, id) => set((state) => {
    const events = state.calendarEvents[projectId] || [];
    return {
      calendarEvents: {
        ...state.calendarEvents,
        [projectId]: events.filter((e) => e.id !== id)
      }
    };
  }),

  toggleCrewAttendance: (projectId, crewId) => set((state) => {
    const members = state.crew[projectId] || [];
    const updatedMembers = members.map((m) => {
      if (m.id !== crewId) return m;
      const statusMap: Record<CrewMember["attendance"], CrewMember["attendance"]> = {
        "Present": "Late",
        "Late": "Off-Duty",
        "Off-Duty": "Absent",
        "Absent": "Present"
      };
      return { ...m, attendance: statusMap[m.attendance] };
    });
    return {
      crew: { ...state.crew, [projectId]: updatedMembers }
    };
  }),

  toggleCastAvailability: (projectId, castId) => set((state) => {
    const members = state.cast[projectId] || [];
    const updatedMembers = members.map((m) => {
      if (m.id !== castId) return m;
      const statusMap: Record<CastMember["availability"], CastMember["availability"]> = {
        "Available": "On Set",
        "On Set": "Unavailable",
        "Unavailable": "Available"
      };
      return { ...m, availability: statusMap[m.availability] };
    });
    return {
      cast: { ...state.cast, [projectId]: updatedMembers }
    };
  }),

  updateEquipmentStatus: (projectId, equipId, status, assignedTo = "") => set((state) => {
    const items = state.equipment[projectId] || [];
    return {
      equipment: {
        ...state.equipment,
        [projectId]: items.map((eq) => eq.id === equipId ? { ...eq, status, assignedTo } : eq)
      }
    };
  }),

  addChatMessage: (msg) => set((state) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-${state.chatLogs.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    return {
      chatLogs: [...state.chatLogs, newMsg]
    };
  }),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  })),

  clearNotifications: () => set({ notifications: [] }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  generateAICaption: (projectId, campaignId) => set((state) => {
    const campaigns = state.marketing[projectId] || [];
    const updatedCampaigns = campaigns.map((c) => {
      if (c.id !== campaignId) return c;
      const platformCaptions: Record<string, string> = {
        Instagram: `Cinematic frame preview. Kael walks the fluorescent lines of Sector 4. The camera rigs, rain plates, and ARRI Alexa 35 capturing the cyber-grit of #TheMidnightCode. Directed by Vivek Roy. Coming Winter 2026.`,
        YouTube: `Go behind the lenses: Designing Neo-Tokyo. Explore how our lighting crew deployed Aputure Electro Storm led panels to project pulsing atmospheric hues. Subscribe for full production vlogs.`,
        Twitter: `A plasma flash in Apartment 404. What is Kael escaping? Preview the screenplay details extracted in our AI studio. #VFX #Filmmaking`,
        TikTok: `Director Vivek Roy setting up the extreme wide shot crane. Ready, set, slate it! 🎬 #filmmaker #cyberpunk #onset`
      };
      return {
        ...c,
        aiCaption: platformCaptions[c.platform] || "Production notes: Scene setup complete. Ready for distribution."
      };
    });
    return {
      marketing: {
        ...state.marketing,
        [projectId]: updatedCampaigns
      }
    };
  })
}));

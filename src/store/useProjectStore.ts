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

// --- INITIAL MOCK DATA ---
const initialProjects: Project[] = [
  {
    id: "proj-1",
    title: "The Midnight Code",
    tagline: "Cyberpunk Sci-Fi thriller exploring the boundaries of AI and consciousness.",
    status: "Production",
    progress: 68,
    budget: "$4.2M",
    budgetVal: 4200000,
    spentVal: 2980000,
    crewCount: 42,
    castCount: 12,
    deadline: "2026-12-15",
    completion: 68,
    coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
    director: "Vivek Roy",
    location: "Neo Tokyo Sets, Stage 4"
  },
  {
    id: "proj-2",
    title: "Echoes of Silence",
    tagline: "Dramatic indie feature following a deaf pianist rediscovering sound in nature.",
    status: "Post-Production",
    progress: 85,
    budget: "$1.8M",
    budgetVal: 1800000,
    spentVal: 1650000,
    crewCount: 24,
    castCount: 6,
    deadline: "2026-09-30",
    completion: 85,
    coverImage: "https://images.unsplash.com/photo-1512495039889-52a3b799c9bc?w=800&q=80",
    director: "Elena Rostova",
    location: "Rainforest Soundstage B"
  },
  {
    id: "proj-3",
    title: "Veloce",
    tagline: "High-octane commercial campaign for the new custom carbon hybrid supercar.",
    status: "Pre-Production",
    progress: 20,
    budget: "$850K",
    budgetVal: 850000,
    spentVal: 120000,
    crewCount: 18,
    castCount: 3,
    deadline: "2026-10-10",
    completion: 20,
    coverImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
    director: "Marcus Lin",
    location: "Mojave Desert Speedway"
  }
];

// Scripts Mock Data
const initialScripts: Record<string, ScriptScene[]> = {
  "proj-1": [
    {
      id: "sc-1",
      sceneNumber: 1,
      title: "EXT. NEO-TOKYO STREETS - NIGHT",
      content: `Rain beats down on the glowing neon asphalt. Kael (30s, trench coat, cybernetic eye) walks past vendors selling synthetic street food. High above, holographic ads flicker.

KAEL
(whispering into earpiece)
The signal is active. Channel 9.

A mechanical hum builds behind him. A security drone descends.

DRONE VOICE
Halt. Scan compliance.

Kael reaches into his coat. Not for an ID. A plasma emitter clicks.`,
      aiExtracted: {
        characters: ["Kael", "Drone Voice"],
        props: ["Earpiece", "Synthetic street food", "Plasma emitter"],
        costumes: ["Cybernetic eye", "Dark trench coat"],
        locations: ["Neo-Tokyo Streets (Ext)"],
        dialogueCount: 3,
        duration: "1:45",
        complexity: "High",
        continuityWarnings: ["Plasma gun must glow blue to match scene 4 color scheme", "Verify Kael's cybernetic eye LED is set to red tint"]
      }
    },
    {
      id: "sc-2",
      sceneNumber: 2,
      title: "INT. APARTMENT 404 - CONTINUOUS",
      content: `Kael slams the door behind him. The room is dark, lit only by server racks blinking. RINA (20s, wire-frame goggles) turns from three screens.

RINA
Did you get scanned?

KAEL
Briefly. The drone is fried.

RINA
(sighs)
That's the third one this week. Corporate will trace the electromagnetic signature.`,
      aiExtracted: {
        characters: ["Kael", "Rina"],
        props: ["Server racks", "Wire-frame goggles", "Flickering monitors"],
        costumes: ["Rina's oversized tech hoodie"],
        locations: ["Apartment 404 (Int)"],
        dialogueCount: 4,
        duration: "1:15",
        complexity: "Medium",
        continuityWarnings: ["Smoke from plasma emitter must clear by line 5"]
      }
    }
  ],
  "proj-2": [
    {
      id: "sc-1",
      sceneNumber: 1,
      title: "INT. CONCERT HALL - DAY",
      content: `MAYA (28, elegant, exhaustion in her eyes) sits at the grand Steinway piano. The hall is silent. She presses a key. Silence. She presses a chord. Nothing.
She rests her hands on the polished wood. She closes her eyes.`,
      aiExtracted: {
        characters: ["Maya"],
        props: ["Steinway Grand Piano"],
        costumes: ["Concert dress"],
        locations: ["Grand Concert Hall"],
        dialogueCount: 0,
        duration: "2:00",
        complexity: "Low",
        continuityWarnings: ["Piano reflections must avoid showing the camera crew"]
      }
    }
  ]
};

// Storyboard Mock Data
const initialStoryboards: Record<string, StoryboardShot[]> = {
  "proj-1": [
    {
      id: "shot-1",
      shotNumber: "1A",
      previewImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
      shotType: "Extreme Wide Shot (EWS)",
      lens: "24px Anamorphic",
      camera: "ARRI Alexa 35",
      lighting: "Neon Pink & Cyan Rim, Artificial Rain Backlit",
      notes: "Establishing shot of the skyline. Huge holographic girl rotating.",
      status: "Approved"
    },
    {
      id: "shot-2",
      shotNumber: "1B",
      previewImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
      shotType: "Medium Close Up (MCU)",
      lens: "50px Prime",
      camera: "ARRI Alexa 35",
      lighting: "Soft warm key on cyber eye, cool fill on background",
      notes: "Focus on Kael's cybernetic eye blinking. Reflections of neon in the lens.",
      status: "Approved"
    },
    {
      id: "shot-3",
      shotNumber: "1C",
      previewImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
      shotType: "Low Angle Tracking Shot",
      lens: "35px Anamorphic",
      camera: "RED V-Raptor",
      lighting: "Strobe flares from security drone",
      notes: "Track Kael's boots walking fast. Puddles splashing with colorful reflections.",
      status: "Revision"
    }
  ],
  "proj-2": [
    {
      id: "shot-1",
      shotNumber: "1A",
      previewImage: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80",
      shotType: "Macro Close Up",
      lens: "85mm Macro",
      camera: "Sony Venice 2",
      lighting: "Natural soft side light through dusty window",
      notes: "Close up on piano strings vibrating slowly as she presses the key.",
      status: "Approved"
    }
  ]
};

// Shot Planner Mock Data
const initialShotPlans: Record<string, ShotPlan[]> = {
  "proj-1": [
    {
      id: "plan-1",
      scene: "Scene 1: Ext. Street",
      setup: "ARRI on Steadicam tracking Kael's walk",
      props: ["Synthetic food stand", "Neon signs"],
      crew: ["A. Camera Op", "Key Grip", "Gaffer"],
      duration: "3 hours",
      location: "Neo Tokyo backlot",
      weather: "Outdoor - Rain Contingency",
      status: "Todo"
    },
    {
      id: "plan-2",
      scene: "Scene 1: Drone Encounter",
      setup: "Crane shot descending. Security drone mockup on rig.",
      props: ["Drone mockup", "Plasma blaster"],
      crew: ["VFX Supervisor", "Stunt Coordinator"],
      duration: "4 hours",
      location: "Neo Tokyo Stage 4",
      weather: "Indoor",
      status: "In Progress"
    },
    {
      id: "plan-3",
      scene: "Scene 2: Apartment Racks",
      setup: "Static 50mm on Rina looking at screens",
      props: ["Server racks", "Holographic goggles"],
      crew: ["A. Camera Op", "DIT"],
      duration: "2 hours",
      location: "Stage 2 Studio",
      weather: "Indoor",
      status: "Completed"
    }
  ],
  "proj-2": [
    {
      id: "plan-1",
      scene: "Scene 1: Concert Hall Piano",
      setup: "Jib arm sweep across rows to Steinway piano",
      props: ["Steinway piano", "Maya concert dress"],
      crew: ["DP", "Jib Operator", "Gaffer"],
      duration: "5 hours",
      location: "Symphony Hall",
      weather: "Indoor",
      status: "Todo"
    }
  ]
};

// Calendar Events Mock Data
const initialCalendarEvents: Record<string, CalendarEvent[]> = {
  "proj-1": [
    { id: "cal-1", title: "Shoot: Ext. Neon Alley (Scene 1)", date: "2026-07-05", type: "shoot", time: "18:00 - 02:00" },
    { id: "cal-2", title: "Visual Effects Review w/ DoubleNegative", date: "2026-07-06", type: "meeting", time: "11:00 - 12:30" },
    { id: "cal-3", title: "Cast Table Read (Scenes 5 - 12)", date: "2026-07-08", type: "meeting", time: "14:00 - 17:00" },
    { id: "cal-4", title: "Teaser Poster Draft Deadline", date: "2026-07-12", type: "deadline", time: "23:59" },
    { id: "cal-5", title: "Behind the Scenes Reel Release", date: "2026-07-15", type: "marketing", time: "09:00" }
  ],
  "proj-2": [
    { id: "cal-1", title: "ADR Session with Maya (Sarah Chen)", date: "2026-07-07", type: "shoot", time: "09:00 - 13:00" },
    { id: "cal-2", title: "Color Grading Review - DaVinci Suite", date: "2026-07-10", type: "meeting", time: "15:00 - 18:00" }
  ]
};

// Crew Mock Data
const initialCrew: Record<string, CrewMember[]> = {
  "proj-1": [
    {
      id: "crew-1",
      name: "Alex Sterling",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
      role: "Director of Photography",
      phone: "+1 (555) 382-9018",
      experience: "12 Years (ARRI Certified)",
      skills: ["Anamorphic Lenses", "Steadicam Rigging", "HDR Color Profiling"],
      attendance: "Present",
      paymentStatus: "Paid",
      availability: "On Set",
      performance: 96,
      rate: "$1,800 / day"
    },
    {
      id: "crew-2",
      name: "Marcus Vance",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
      role: "Gaffer / Lighting Lead",
      phone: "+1 (555) 839-2041",
      experience: "8 Years",
      skills: ["DMX Board Ops", "LED Panels", "Atmospheric Haze"],
      attendance: "Present",
      paymentStatus: "Invoiced",
      availability: "On Set",
      performance: 92,
      rate: "$1,200 / day"
    },
    {
      id: "crew-3",
      name: "Takahiro Sato",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
      role: "Digital Imaging Technician (DIT)",
      phone: "+1 (555) 201-9481",
      experience: "6 Years",
      skills: ["Silverstack", "DaVinci LiveGrade", "LTO Tape Backup"],
      attendance: "Late",
      paymentStatus: "Pending",
      availability: "Available",
      performance: 89,
      rate: "$950 / day"
    },
    {
      id: "crew-4",
      name: "Chloe Dubois",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
      role: "Key Grip",
      phone: "+1 (555) 732-1920",
      experience: "10 Years",
      skills: ["Dolly Rigs", "Technocrane", "Vehicle Mounts"],
      attendance: "Off-Duty",
      paymentStatus: "Paid",
      availability: "Unavailable",
      performance: 95,
      rate: "$1,300 / day"
    }
  ],
  "proj-2": [
    {
      id: "crew-1",
      name: "Alex Sterling",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
      role: "Director of Photography",
      phone: "+1 (555) 382-9018",
      experience: "12 Years",
      skills: ["Venice Venice 2 Specialist", "Natural Light Gradients"],
      attendance: "Present",
      paymentStatus: "Paid",
      availability: "On Set",
      performance: 96,
      rate: "$1,800 / day"
    }
  ]
};

// Cast Mock Data
const initialCast: Record<string, CastMember[]> = {
  "proj-1": [
    {
      id: "cast-1",
      name: "Christian Bale (Sim)",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
      character: "Kael",
      availability: "On Set",
      measurements: "Height: 6'0\", Chest: 42\", Waist: 32\"",
      costumeNotes: "Trench coat requires internal batteries for cybernetic panel glow.",
      contractStatus: "Signed",
      auditionStatus: "Passed",
      payment: "$150,000"
    },
    {
      id: "cast-2",
      name: "Hannah Min-Ah",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80",
      character: "Rina",
      availability: "Available",
      measurements: "Height: 5'6\", Size 4, Shoe: 7.5",
      costumeNotes: "Custom copper wire goggles. Adjust nose bridge for comfort.",
      contractStatus: "Signed",
      auditionStatus: "Passed",
      payment: "$80,000"
    },
    {
      id: "cast-3",
      name: "Lawrence Fishburne (Sim)",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
      character: "Agent Vance",
      availability: "Unavailable",
      measurements: "Height: 6'2\", Suit: 46R",
      costumeNotes: "Charcoal corporate tactical suit, matte black shades.",
      contractStatus: "In Negotiation",
      auditionStatus: "Callback",
      payment: "$120,000"
    }
  ],
  "proj-2": [
    {
      id: "cast-1",
      name: "Sarah Chen",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
      character: "Maya",
      availability: "On Set",
      measurements: "Height: 5'5\", Size 2, Shoe: 7",
      costumeNotes: "Flowing velvet concert gown, dark emerald green.",
      contractStatus: "Signed",
      auditionStatus: "Passed",
      payment: "$65,000"
    }
  ]
};

// Equipment Mock Data
const initialEquipment: Record<string, Equipment[]> = {
  "proj-1": [
    {
      id: "eq-1",
      name: "ARRI Alexa 35 Camera Body",
      category: "Camera",
      photo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80",
      qrCode: "QR-AR35-0091",
      status: "In Use",
      assignedTo: "Alex Sterling",
      battery: 84,
      maintenanceDate: "2026-08-01",
      location: "Set A (Neo Tokyo)"
    },
    {
      id: "eq-2",
      name: "Cooke Anamorphic/i 50mm T2.3 Lens",
      category: "Lens",
      photo: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=300&q=80",
      qrCode: "QR-CO50-1123",
      status: "In Use",
      assignedTo: "Alex Sterling",
      battery: null,
      maintenanceDate: "2026-09-15",
      location: "Set A (Neo Tokyo)"
    },
    {
      id: "eq-3",
      name: "Aputure Electro Storm CS15 LED",
      category: "Lighting",
      photo: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80",
      qrCode: "QR-APCS-8831",
      status: "Available",
      assignedTo: "Marcus Vance",
      battery: 100,
      maintenanceDate: "2026-07-20",
      location: "Grip Truck 1"
    },
    {
      id: "eq-4",
      name: "DJI Inspire 3 Cinema Drone",
      category: "Grip",
      photo: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=300&q=80",
      qrCode: "QR-DJI3-4402",
      status: "Maintenance",
      assignedTo: "Chloe Dubois",
      battery: 12,
      maintenanceDate: "2026-07-04",
      location: "Maintenance Bay 2"
    }
  ],
  "proj-2": [
    {
      id: "eq-1",
      name: "Sony Venice 2 8K Cinema",
      category: "Camera",
      photo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80",
      qrCode: "QR-SV28-0491",
      status: "Available",
      assignedTo: "Alex Sterling",
      battery: 95,
      maintenanceDate: "2026-07-10",
      location: "Soundstage Vault"
    }
  ]
};

// Files Mock Data
const initialFiles: Record<string, FileItem[]> = {
  "proj-1": [
    { id: "f-1", name: "Scripts", type: "folder", modified: "2026-07-03", version: 4 },
    { id: "f-2", name: "RAW Footage", type: "folder", modified: "2026-07-04", version: 12 },
    { id: "f-3", name: "Contracts", type: "folder", modified: "2026-06-20", version: 2 },
    { id: "f-4", name: "Moodboards & Concept Art", type: "folder", modified: "2026-07-02", version: 5 },
    { id: "f-5", name: "midnight_code_shooting_script_v4.pdf", type: "file", extension: "pdf", size: "2.4 MB", modified: "2026-07-03", version: 4 },
    { id: "f-6", name: "concept_teaser_edit_h264.mp4", type: "file", extension: "mp4", size: "142 MB", modified: "2026-07-01", version: 2 },
    { id: "f-7", name: "insurance_clearance_tokyo_signed.pdf", type: "file", extension: "pdf", size: "890 KB", modified: "2026-06-25", version: 1 }
  ],
  "proj-2": [
    { id: "f-1", name: "Scripts", type: "folder", modified: "2026-06-15", version: 2 },
    { id: "f-2", name: "Audio Masters", type: "folder", modified: "2026-07-01", version: 8 }
  ]
};

// Marketing Mock Data
const initialMarketing: Record<string, MarketingCampaign[]> = {
  "proj-1": [
    { id: "m-1", platform: "Instagram", title: "Character Reveal Reel: Kael", type: "Reels", releaseDate: "2026-07-10", status: "Draft" },
    { id: "m-2", platform: "YouTube", title: "Behind the Scenes: Designing Neo-Tokyo", type: "Trailer", releaseDate: "2026-07-20", status: "Scheduled" },
    { id: "m-3", platform: "Twitter", title: "Official Movie Teaser Poster Release", type: "Poster", releaseDate: "2026-07-05", status: "Published", aiCaption: "Look into the future. It's glowing, but it's cold. The official poster for #TheMidnightCode has arrived. Directed by Vivek Roy. In theaters December.", views: "145K views" }
  ],
  "proj-2": []
};

// AI Chat Logs
const initialChatLogs: ChatMessage[] = [
  {
    id: "m-1",
    sender: "ai",
    text: "Good evening, Vivek. I'm your TOV Studio production assistant. I can help analyze scripts, draft call sheets, optimize shooting schedules, or build casting decks. What are we producing today?",
    timestamp: "20:30"
  }
];

// Notifications Mock Data
const initialNotifications: NotificationItem[] = [
  { id: "n-1", title: "Drone Battery Critically Low", message: "DJI Inspire 3 drone battery is at 12% in Maintenance Bay 2. Charging required before tomorrow's shoot.", time: "10 mins ago", type: "warning", read: false },
  { id: "n-2", title: "Storyboard Approved", message: "Director Vivek Roy approved storyboard shots 1A and 1B for Project: The Midnight Code.", time: "1 hour ago", type: "success", read: false },
  { id: "n-3", title: "Weather Alert: Heavy Rain Forecast", message: "Expect 80% rain chance on Sunday night during scheduled outdoor shoot of scene 1. Prepare rain rigs or shift to soundstage.", time: "3 hours ago", type: "error", read: false },
  { id: "n-4", title: "Final Cut Uploaded", message: "Editor Sarah Chen uploaded v2 draft for Project: Echoes of Silence.", time: "Yesterday", type: "info", read: true }
];

// --- ZUSTAND STORE ---
export const useProjectStore = create<ProjectStoreState>((set) => ({
  // Navigation Defaults
  activeView: "dashboard",
  sidebarCollapsed: false,
  activeProjectTab: "Overview",
  
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

import { create } from "zustand";
import { supabase } from "@/utils/supabaseClient";

// --- TYPES ---
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  location: string;
  website: string;
  phone?: string;
  dob?: string;
  languages: string[];
  interests: string[];
  favorite_genres: string[];
  experience_years: number;
  company_name: string;
  completeness: number;
  created_at?: string;
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  behance?: string;
  dribbble?: string;
  youtube?: string;
  imdb?: string;
  website?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  asset_type: "video" | "image" | "document" | "audio";
  url: string;
  thumbnail_url?: string;
}

export interface UserPreference {
  theme: string;
  notifications_enabled: boolean;
  profile_visibility: string;
}

export interface UserStatistic {
  projects_count: number;
  scripts_count: number;
  storyboards_count: number;
  ai_generations_count: number;
  files_uploaded_count: number;
  storage_used_bytes: number;
  hours_worked: number;
  production_days: number;
}

export interface UserActivity {
  id: string;
  title: string;
  description: string;
  created_at: string;
}
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
  attendance: "Present" | "Absent" | "Late" | "Off-Duty";
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

export interface CallSheet {
  id: string;
  production_id: string;
  date: string;
  call_time: string;
  weather_notes: string;
  instructions: string;
  created_at?: string;
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
  callSheets: Record<string, CallSheet[]>;
  
  // Global Systems
  chatLogs: ChatMessage[];
  notifications: NotificationItem[];
  searchQuery: string;
  isSearchOpen: boolean;

  // Filmmaker User Profile States
  userProfile: UserProfile | null;
  socialLinks: SocialLinks | null;
  portfolio: PortfolioItem[];
  userPreferences: UserPreference | null;
  statistics: UserStatistic | null;
  activities: UserActivity[];
  skillsList: string[];
  userTagsList: string[];
  castMembers: any[];
  crewMembers: any[];
  departmentsList: any[];
  chatChannels: any[];
  chatMessages: Record<string, any[]>;
  activeChannelId: string;

  // Actions
  setActiveView: (view: string) => void;
  toggleSidebar: () => void;
  setActiveProjectTab: (tab: string) => void;
  setActiveProjectId: (id: string) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setMemberRole: (role: string) => void;
  
  // Data Modifying Actions
  fetchWorkspaceData: () => Promise<void>;
  addProject: (project: Omit<Project, "id" | "progress" | "completion" | "crewCount" | "castCount">) => void;
  addScriptScene: (projectId: string, title: string, sceneNumber: number) => Promise<void>;
  deleteScriptScene: (projectId: string, sceneId: string) => Promise<void>;
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
  setCrewAttendance: (projectId: string, crewId: string, attendance: CrewMember["attendance"]) => Promise<void>;
  setCastAttendance: (projectId: string, castId: string, attendance: CastMember["attendance"]) => Promise<void>;
  updateEquipmentStatus: (projectId: string, equipId: string, status: Equipment["status"], assignedTo?: string) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  addNotification: (notification: Omit<NotificationItem, "id" | "read" | "time">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  generateAICaption: (projectId: string, campaignId: string) => void;
  addCallSheet: (projectId: string, callSheet: Omit<CallSheet, "id" | "production_id">) => Promise<void>;
  deleteCallSheet: (projectId: string, callSheetId: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Omit<Project, "id" | "progress" | "completion" | "crewCount" | "castCount">>) => Promise<void>;
  deleteStoryboardShot: (projectId: string, shotId: string) => Promise<void>;
  updateStoryboardShot: (projectId: string, shotId: string, updates: Partial<StoryboardShot>) => Promise<void>;
  addCastMember: (member: any) => Promise<void>;
  updateCastMember: (id: string, updates: any) => Promise<void>;
  deleteCastMember: (id: string) => Promise<void>;
  fetchChatChannels: () => Promise<void>;
  fetchChatMessages: (channelId: string) => Promise<void>;
  sendChatMessage: (channelId: string, content: string, attachmentUrl?: string, replyToMessageId?: string, forwardedFromSenderId?: string, isAnnouncement?: boolean) => Promise<void>;
  createChatChannel: (name: string | null, isGroup: boolean, members: string[]) => Promise<string | null>;
  setActiveChannelId: (channelId: string) => void;
  toggleLikeMessage: (channelId: string, messageId: string) => Promise<void>;
  deleteChatMessage: (channelId: string, messageId: string) => Promise<void>;
  editChatMessage: (channelId: string, messageId: string, newContent: string) => Promise<void>;
  markMessagesAsRead: (channelId: string) => Promise<void>;
  toggleMessageReaction: (channelId: string, messageId: string, emoji: string) => Promise<void>;
  toggleMuteChannel: (channelId: string) => Promise<void>;
  togglePinChannel: (channelId: string) => Promise<void>;
  toggleArchiveChannel: (channelId: string) => Promise<void>;
  blockUser: (blockedUserId: string) => Promise<void>;
  unblockUser: (blockedUserId: string) => Promise<void>;
  reportUser: (reportedUserId: string, reason: string) => Promise<void>;
  updateGroupDetails: (channelId: string, name: string, description: string, avatarUrl: string) => Promise<void>;
  updateGroupMemberRole: (channelId: string, userId: string, role: string) => Promise<void>;
  addGroupMembers: (channelId: string, userIds: string[]) => Promise<void>;
  removeGroupMember: (channelId: string, userId: string) => Promise<void>;
  leaveGroup: (channelId: string) => Promise<void>;
  uploadChatAttachment: (file: File) => Promise<string>;
  updateProfilePrivacySettings: (settings: { message_privacy?: string; online_privacy?: string; pfp_privacy?: string; add_to_groups_privacy?: string }) => Promise<void>;

  // Profile Mutations
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSocialLinks: (links: Partial<SocialLinks>) => Promise<void>;
  addPortfolioItem: (item: Omit<PortfolioItem, "id">) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  addUserSkill: (skill: string) => Promise<void>;
  removeUserSkill: (skill: string) => Promise<void>;
  addUserTag: (tag: string) => Promise<void>;
  removeUserTag: (tag: string) => Promise<void>;
  deleteUserProfile: () => Promise<void>;
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
const initialCallSheets: Record<string, CallSheet[]> = {};
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
  callSheets: initialCallSheets,
  
  // Global components state
  chatLogs: initialChatLogs,
  notifications: initialNotifications,
  searchQuery: "",
  isSearchOpen: false,

  userProfile: null,
  socialLinks: null,
  portfolio: [],
  userPreferences: null,
  statistics: null,
  activities: [],
  skillsList: [],
  userTagsList: [],
  castMembers: [],
  crewMembers: [],
  departmentsList: [],
  chatChannels: [],
  chatMessages: {},
  activeChannelId: "",

  // Actions
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveProjectTab: (tab) => set({ activeProjectTab: tab }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setMemberRole: (role) => set({ memberRole: role }),
  
  fetchWorkspaceData: async () => {
    // Fetch profile identity datasets
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Core Profile
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (!profile) {
        const genUser = (user.email || "creator").split("@")[0] + "_" + user.id.slice(0, 4);
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || genUser,
            username: genUser,
            bio: "Cinematographer & Filmmaker. Welcome to my creative studio.",
            avatar_url: user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
            completeness: 45
          })
          .select()
          .single();
        profile = newProfile;
      }
      
      // 2. Social Links
      let { data: social } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!social) {
        const username = profile?.username || "creator";
        const { data: newSocial } = await supabase
          .from("social_links")
          .insert({
            user_id: user.id,
            instagram: "https://instagram.com/" + username,
            linkedin: "https://linkedin.com/in/" + username,
            youtube: "https://youtube.com/@" + username,
            website: "https://tov.studio/" + username
          })
          .select()
          .single();
        social = newSocial;
      }

      // 3. Portfolio
      const { data: portfolioItems } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // 4. Skills
      let { data: skillsData } = await supabase
        .from("skills")
        .select("name")
        .eq("user_id", user.id);

      if (!skillsData || skillsData.length === 0) {
        await supabase.from("skills").insert([
          { user_id: user.id, name: "Direction" },
          { user_id: user.id, name: "Lighting" },
          { user_id: user.id, name: "Editing" }
        ]);
        const { data: refetchedSkills } = await supabase
          .from("skills")
          .select("name")
          .eq("user_id", user.id);
        skillsData = refetchedSkills || [];
      }

      // 5. Tags
      let { data: tagsData } = await supabase
        .from("user_tags")
        .select("tag")
        .eq("user_id", user.id);

      if (!tagsData || tagsData.length === 0) {
        await supabase.from("user_tags").insert([
          { user_id: user.id, tag: "🎬 Director" },
          { user_id: user.id, tag: "🎥 Cinematographer" }
        ]);
        const { data: refetchedTags } = await supabase
          .from("user_tags")
          .select("tag")
          .eq("user_id", user.id);
        tagsData = refetchedTags || [];
      }

      // 6. Preferences
      let { data: preferences } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!preferences) {
        const { data: newPref } = await supabase
          .from("user_preferences")
          .insert({ user_id: user.id })
          .select()
          .single();
        preferences = newPref;
      }

      // 7. Stats
      let { data: stats } = await supabase
        .from("statistics")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!stats) {
        const { data: newStats } = await supabase
          .from("statistics")
          .insert({ user_id: user.id })
          .select()
          .single();
        stats = newStats;
      }

      // 8. Activities
      const { data: activitiesData } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      // Count actual projects/scripts/storyboards from Supabase to keep stats synchronized
      const { count: projsCount } = await supabase
        .from("productions")
        .select("*", { count: "exact", head: true });

      const { count: scsCount } = await supabase
        .from("scenes")
        .select("*", { count: "exact", head: true });

      const { count: sbCount } = await supabase
        .from("storyboard_shots")
        .select("*", { count: "exact", head: true });

      const { count: filesCount } = await supabase
        .from("files")
        .select("*", { count: "exact", head: true });

      const calculatedStats = {
        projects_count: projsCount || 0,
        scripts_count: scsCount || 0,
        storyboards_count: sbCount || 0,
        ai_generations_count: stats?.ai_generations_count || 12,
        files_uploaded_count: filesCount || 0,
        storage_used_bytes: stats?.storage_used_bytes || 1500000000,
        hours_worked: stats?.hours_worked || 48,
        production_days: stats?.production_days || 5
      };

      // 9. Fetch cast & crew database tables
      const { data: castData } = await supabase
        .from("cast_members")
        .select("*")
        .order("full_name");
      
      const { data: depts } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      const { data: crewData } = await supabase
        .from("crew_members")
        .select(`
          *,
          departments (
            id,
            name
          )
        `)
        .order("full_name");

      set({
        userProfile: profile || null,
        socialLinks: social || null,
        portfolio: portfolioItems || [],
        skillsList: (skillsData || []).map((s) => s.name),
        userTagsList: (tagsData || []).map((t) => t.tag),
        userPreferences: preferences || null,
        statistics: calculatedStats,
        activities: activitiesData || [],
        castMembers: castData || [],
        crewMembers: crewData || [],
        departmentsList: depts || []
      });
      useProjectStore.getState().fetchChatChannels();
    }

    // 1. Fetch productions from Supabase
    const { data: prods, error: pError } = await supabase
      .from("productions")
      .select("*");
    
    if (pError) {
      console.error("Error fetching productions from Supabase:", pError);
      return;
    }

    if (!prods || prods.length === 0) {
      set({ projects: [], activeProjectId: "" });
      return;
    }

    // Map database productions to store projects format
    const mappedProjects: Project[] = prods.map((p) => {
      const budgetVal = Number(p.budget) || 2500000;
      const budgetText = p.budget ? `$${(budgetVal / 1000000).toFixed(1)}M` : "$2.5M";
      return {
        id: p.id,
        title: p.title,
        tagline: p.description || "A premium film production campaign.",
        status: (p.status as Project["status"]) || "Pre-Production",
        progress: 35,
        budget: budgetText,
        budgetVal: budgetVal,
        spentVal: 0,
        crewCount: 4,
        castCount: 2,
        deadline: p.end_date || new Date(Date.now() + 180*24*60*60*1000).toISOString().split("T")[0],
        completion: 35,
        coverImage: p.cover_image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
        director: p.director || "Director Name",
        location: p.location || "Neo Tokyo Sets, Stage 4"
      };
    });

    set({ projects: mappedProjects });

    // Set first project as active if not already set or invalid
    const currentActiveId = useProjectStore.getState().activeProjectId;
    const exists = mappedProjects.some((p) => p.id === currentActiveId);
    const targetActiveId = exists ? currentActiveId : (mappedProjects[0]?.id || "");
    set({ activeProjectId: targetActiveId });

    // Fetch related detail datasets
    const newScripts: Record<string, ScriptScene[]> = {};
    const newStoryboards: Record<string, StoryboardShot[]> = {};
    const newShotPlans: Record<string, ShotPlan[]> = {};
    const newCalendarEvents: Record<string, CalendarEvent[]> = {};
    const newCrew: Record<string, CrewMember[]> = {};
    const newCast: Record<string, CastMember[]> = {};
    const newEquipment: Record<string, Equipment[]> = {};
    const newFiles: Record<string, FileItem[]> = {};
    const newCallSheets: Record<string, CallSheet[]> = {};

    for (const proj of mappedProjects) {
      const prodId = proj.id;

      // 1. Fetch scenes
      const { data: scenes } = await supabase
        .from("scenes")
        .select("*")
        .eq("production_id", prodId);
      
      newScripts[prodId] = (scenes || []).map((sc) => ({
        id: sc.id,
        sceneNumber: sc.scene_number,
        title: sc.title,
        content: sc.content || "",
        aiExtracted: {
          characters: [],
          props: [],
          costumes: [],
          locations: [sc.title],
          dialogueCount: 0,
          duration: "0:00",
          complexity: "Low",
          continuityWarnings: []
        }
      }));

      // 2. Fetch storyboard shots
      const { data: shots } = await supabase
        .from("storyboard_shots")
        .select("*")
        .eq("production_id", prodId);
      
      newStoryboards[prodId] = (shots || []).map((sh) => ({
        id: sh.id,
        shotNumber: sh.shot_number,
        previewImage: sh.photo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
        shotType: "Medium Close Up (MCU)",
        lens: sh.lens || "50mm Prime",
        camera: sh.camera || "ARRI Alexa 35",
        lighting: sh.lighting || "Ambient soft key",
        notes: sh.notes || "",
        status: (sh.status as StoryboardShot["status"]) || "Draft"
      }));

      // 3. Fetch shot plans
      const { data: plans } = await supabase
        .from("shot_plans")
        .select("*")
        .eq("production_id", prodId);
      
      newShotPlans[prodId] = (plans || []).map((p) => ({
        id: p.id,
        scene: p.scene,
        setup: p.setup,
        props: p.props || [],
        crew: p.crew || [],
        duration: p.duration || "2 hours",
        location: p.location || "Soundstage B",
        weather: (p.weather as ShotPlan["weather"]) || "Indoor",
        status: (p.status as ShotPlan["status"]) || "Todo"
      }));

      // 4. Fetch calendar events
      const { data: calEvents } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("production_id", prodId);
      
      newCalendarEvents[prodId] = (calEvents || []).map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date ? e.date.substring(0, 10) : "2026-07-05",
        type: (e.type as CalendarEvent["type"]) || "shoot",
        time: e.time || "10:00 - 18:00"
      }));

      // 5. Fetch crew members joined with profiles
      const { data: crewData } = await supabase
        .from("production_members")
        .select(`
          id,
          role,
          attendance,
          profiles (
            id,
            email,
            full_name,
            avatar_url,
            phone,
            experience,
            skills
          )
        `)
        .eq("production_id", prodId);
      
      newCrew[prodId] = (crewData || []).map((c: any) => ({
        id: c.id,
        name: c.profiles?.full_name || c.profiles?.email || "Crew Member",
        photo: c.profiles?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
        role: c.role || "Crew",
        phone: c.profiles?.phone || "+1 555-0100",
        experience: c.profiles?.experience || "Professional",
        skills: c.profiles?.skills || [],
        attendance: (c.attendance as CrewMember["attendance"]) || "Present",
        availability: "On Set",
        rate: "$800/day",
        paymentStatus: "Paid",
        performance: 90
      }));

      // 6. Fetch cast members
      const { data: castData } = await supabase
        .from("cast_members")
        .select("*")
        .eq("production_id", prodId);
      
      newCast[prodId] = (castData || []).map((c) => ({
        id: c.id,
        name: c.name,
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
        character: c.character_name,
        availability: "Available",
        measurements: "Standard",
        costumeNotes: "",
        contractStatus: c.contract_status || "Pending Review",
        auditionStatus: c.audition_status || "Scheduled",
        payment: c.payment || "$1,500/day",
        attendance: (c.attendance as CastMember["attendance"]) || "Present"
      }));

      // 7. Fetch equipment
      const { data: equipData } = await supabase
        .from("equipment")
        .select("*")
        .eq("production_id", prodId);
      
      newEquipment[prodId] = (equipData || []).map((e) => ({
        id: e.id,
        name: e.name,
        category: (e.category as Equipment["category"]) || "Camera",
        photo: e.photo || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=150&q=80",
        qrCode: e.qr_code || "QR-1002",
        status: (e.status as Equipment["status"]) || "Available",
        assignedTo: e.assigned_to_name || "",
        battery: e.battery_level || null,
        maintenanceDate: e.maintenance_date || "2026-12-31",
        location: "Studio Soundstage B"
      }));

      // 8. Fetch files
      const { data: filesData } = await supabase
        .from("files")
        .select("*")
        .eq("production_id", prodId);
      
      newFiles[prodId] = (filesData || []).map((f) => {
        const nameParts = (f.name || "").split(".");
        const ext = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : "";
        return {
          id: f.id,
          name: f.name,
          type: f.type || "file",
          size: f.size || "1.2 MB",
          extension: ext,
          modified: f.created_at ? f.created_at.substring(0, 10) : "2026-07-05",
          version: 1
        };
      });

      // 9. Fetch call sheets
      const { data: callSheetsData } = await supabase
        .from("call_sheets")
        .select("*")
        .eq("production_id", prodId);

      newCallSheets[prodId] = (callSheetsData || []).map((cs) => ({
        id: cs.id,
        production_id: cs.production_id,
        date: cs.date,
        call_time: cs.call_time,
        weather_notes: cs.weather_notes || "",
        instructions: cs.instructions || "",
        created_at: cs.created_at
      }));
    }

    set({
      scripts: newScripts,
      storyboards: newStoryboards,
      shotPlans: newShotPlans,
      calendarEvents: newCalendarEvents,
      crew: newCrew,
      cast: newCast,
      equipment: newEquipment,
      files: newFiles,
      callSheets: newCallSheets
    });
  },

  addProject: async (proj) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Insert production into Supabase database
    const budgetVal = proj.budgetVal || 2500000;
    const { data: data, error: error } = await supabase
      .from("productions")
      .insert({
        title: proj.title,
        description: proj.tagline,
        status: proj.status,
        budget: budgetVal,
        user_id: user.id,
        cover_image: proj.coverImage,
        director: proj.director,
        location: proj.location
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating production in Supabase:", error);
      alert(error.message);
      return;
    }

    // 2. Seed production membership for the owner
    if (user) {
      await supabase.from("production_members").insert({
        production_id: data.id,
        user_id: user.id,
        role: "Owner"
      });
    }

    // 3. Update Zustand store state
    const newProject: Project = {
      ...proj,
      id: data.id,
      progress: 0,
      completion: 0,
      crewCount: 1,
      castCount: 0
    };

    set((state) => ({
      projects: [...state.projects, newProject],
      activeProjectId: data.id,
      scripts: { ...state.scripts, [data.id]: [] },
      storyboards: { ...state.storyboards, [data.id]: [] },
      shotPlans: { ...state.shotPlans, [data.id]: [] },
      calendarEvents: { ...state.calendarEvents, [data.id]: [] },
      crew: { ...state.crew, [data.id]: [
        { id: "owner-member", name: "You", photo: "", role: "Owner", phone: "", experience: "", skills: [], attendance: "Present", availability: "On Set", rate: "", paymentStatus: "Paid", performance: 100 }
      ] },
      cast: { ...state.cast, [data.id]: [] },
      equipment: { ...state.equipment, [data.id]: [] },
      files: { ...state.files, [data.id]: [] },
      marketing: { ...state.marketing, [data.id]: [] },
      callSheets: { ...state.callSheets, [data.id]: [] }
    }));

    // Trigger complete data refresh from Supabase to load default seeded data
    useProjectStore.getState().fetchWorkspaceData();
  },

  addScriptScene: async (projectId, title, sceneNumber) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("scenes")
      .insert({
        production_id: projectId,
        scene_number: sceneNumber,
        title,
        content: "",
        user_id: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating scene:", error);
      alert(error.message);
      return;
    }

    const newScene: ScriptScene = {
      id: data.id,
      sceneNumber: data.scene_number,
      title: data.title,
      content: "",
      aiExtracted: {
        characters: [],
        props: [],
        costumes: [],
        locations: [data.title],
        dialogueCount: 0,
        duration: "0:00",
        complexity: "Low",
        continuityWarnings: []
      }
    };

    set((state) => {
      const scenes = state.scripts[projectId] || [];
      return {
        scripts: {
          ...state.scripts,
          [projectId]: [...scenes, newScene]
        }
      };
    });
  },

  deleteScriptScene: async (projectId, sceneId) => {
    const { error } = await supabase
      .from("scenes")
      .delete()
      .eq("id", sceneId);

    if (error) {
      console.error("Error deleting scene:", error);
      alert(error.message);
      return;
    }

    set((state) => {
      const scenes = state.scripts[projectId] || [];
      return {
        scripts: {
          ...state.scripts,
          [projectId]: scenes.filter((sc) => sc.id !== sceneId)
        }
      };
    });
  },

  updateScriptContent: async (projectId, sceneId, content) => {
    const { error } = await supabase
      .from("scenes")
      .update({ content })
      .eq("id", sceneId);

    if (error) console.error("Error updating scene content:", error);

    set((state) => {
      const scenes = state.scripts[projectId] || [];
      const updatedScenes = scenes.map((sc) => {
        if (sc.id !== sceneId) return sc;
        
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
    });
  },

  addStoryboardShot: async (projectId, shot) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("storyboard_shots")
      .insert({
        production_id: projectId,
        shot_number: shot.shotNumber,
        camera: shot.camera,
        lens: shot.lens,
        lighting: shot.lighting,
        notes: shot.notes,
        status: shot.status,
        photo: shot.previewImage,
        user_id: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating storyboard shot:", error);
      alert(error.message);
      return;
    }

    const newShot: StoryboardShot = {
      ...shot,
      id: data.id
    };

    set((state) => {
      const shots = state.storyboards[projectId] || [];
      return {
        storyboards: {
          ...state.storyboards,
          [projectId]: [...shots, newShot]
        }
      };
    });
  },

  updateStoryboardOrder: (projectId, newShots) => set((state) => ({
    storyboards: {
      ...state.storyboards,
      [projectId]: newShots
    }
  })),

  updateStoryboardShotStatus: async (projectId, shotId, status) => {
    const { error } = await supabase
      .from("storyboard_shots")
      .update({ status })
      .eq("id", shotId);

    if (error) console.error("Error updating storyboard shot status:", error);

    set((state) => {
      const shots = state.storyboards[projectId] || [];
      const updatedShots = shots.map((sh) => (sh.id === shotId ? { ...sh, status } : sh));
      return {
        storyboards: {
          ...state.storyboards,
          [projectId]: updatedShots
        }
      };
    });
  },

  addShotPlan: async (projectId, plan) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("shot_plans")
      .insert({
        production_id: projectId,
        scene: plan.scene,
        setup: plan.setup,
        props: plan.props,
        crew: plan.crew,
        duration: plan.duration,
        location: plan.location,
        weather: plan.weather,
        status: plan.status,
        user_id: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating shot plan:", error);
      alert(error.message);
      return;
    }

    const newPlan: ShotPlan = {
      ...plan,
      id: data.id
    };

    set((state) => {
      const plans = state.shotPlans[projectId] || [];
      return {
        shotPlans: {
          ...state.shotPlans,
          [projectId]: [...plans, newPlan]
        }
      };
    });
  },

  updateShotPlanStatus: async (projectId, planId, status) => {
    const { error } = await supabase
      .from("shot_plans")
      .update({ status })
      .eq("id", planId);

    if (error) console.error("Error updating shot plan status:", error);

    set((state) => {
      const plans = state.shotPlans[projectId] || [];
      return {
        shotPlans: {
          ...state.shotPlans,
          [projectId]: plans.map((p) => (p.id === planId ? { ...p, status } : p))
        }
      };
    });
  },

  addCalendarEvent: async (projectId, event) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        production_id: projectId,
        title: event.title,
        date: event.date,
        type: event.type,
        time: event.time,
        user_id: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating calendar event:", error);
      alert(error.message);
      return;
    }

    const newEvent: CalendarEvent = {
      ...event,
      id: data.id
    };

    set((state) => {
      const events = state.calendarEvents[projectId] || [];
      return {
        calendarEvents: {
          ...state.calendarEvents,
          [projectId]: [...events, newEvent]
        }
      };
    });
  },

  deleteCalendarEvent: async (projectId, id) => {
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id);

    if (error) console.error("Error deleting calendar event:", error);

    set((state) => {
      const events = state.calendarEvents[projectId] || [];
      return {
        calendarEvents: {
          ...state.calendarEvents,
          [projectId]: events.filter((e) => e.id !== id)
        }
      };
    });
  },

  toggleCrewAttendance: async (projectId, crewId) => {
    const members = useProjectStore.getState().crew[projectId] || [];
    const target = members.find((m) => m.id === crewId);
    if (!target) return;

    const statusMap: Record<CrewMember["attendance"], CrewMember["attendance"]> = {
      "Present": "Late",
      "Late": "Off-Duty",
      "Off-Duty": "Absent",
      "Absent": "Present"
    };
    const nextAttendance = statusMap[target.attendance];

    const { error } = await supabase
      .from("production_members")
      .update({ attendance: nextAttendance })
      .eq("id", crewId);

    if (error) console.error("Error updating crew attendance:", error);

    set((state) => ({
      crew: {
        ...state.crew,
        [projectId]: (state.crew[projectId] || []).map((m) =>
          m.id === crewId ? { ...m, attendance: nextAttendance } : m
        )
      }
    }));
  },

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

  setCrewAttendance: async (projectId, crewId, attendance) => {
    const { error } = await supabase
      .from("production_members")
      .update({ attendance })
      .eq("id", crewId);

    if (error) console.error("Error setting crew attendance:", error);

    set((state) => ({
      crew: {
        ...state.crew,
        [projectId]: (state.crew[projectId] || []).map((m) =>
          m.id === crewId ? { ...m, attendance } : m
        )
      }
    }));
  },

  setCastAttendance: async (projectId, castId, attendance) => {
    const { error } = await supabase
      .from("cast_members")
      .update({ attendance })
      .eq("id", castId);

    if (error) console.error("Error setting cast attendance:", error);

    set((state) => ({
      cast: {
        ...state.cast,
        [projectId]: (state.cast[projectId] || []).map((m) =>
          m.id === castId ? { ...m, attendance } : m
        )
      }
    }));
  },

  updateEquipmentStatus: async (projectId, equipId, status, assignedTo = "") => {
    const { error } = await supabase
      .from("equipment")
      .update({
        status,
        assigned_to_name: assignedTo
      })
      .eq("id", equipId);

    if (error) console.error("Error updating equipment status:", error);

    set((state) => {
      const items = state.equipment[projectId] || [];
      return {
        equipment: {
          ...state.equipment,
          [projectId]: items.map((eq) => eq.id === equipId ? { ...eq, status, assignedTo } : eq)
        }
      };
    });
  },

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

  addNotification: (notification) => set((state) => {
    const newNotif: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    return {
      notifications: [newNotif, ...state.notifications]
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
  }),

  addCallSheet: async (projectId, callSheet) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("call_sheets")
      .insert({
        production_id: projectId,
        date: callSheet.date,
        call_time: callSheet.call_time,
        weather_notes: callSheet.weather_notes,
        instructions: callSheet.instructions,
        user_id: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating call sheet in Supabase:", error);
      throw error;
    }

    if (data) {
      // Log activity
      await supabase.from("activity_logs").insert({
        production_id: projectId,
        message: `Call Sheet created for date ${callSheet.date}`
      });

      set((state) => {
        const currentList = state.callSheets[projectId] || [];
        const newCS: CallSheet = {
          id: data.id,
          production_id: projectId,
          date: data.date,
          call_time: data.call_time,
          weather_notes: data.weather_notes || "",
          instructions: data.instructions || "",
          created_at: data.created_at
        };
        return {
          callSheets: {
            ...state.callSheets,
            [projectId]: [...currentList, newCS]
          }
        };
      });
    }
  },

  deleteCallSheet: async (projectId, callSheetId) => {
    const { error } = await supabase
      .from("call_sheets")
      .delete()
      .eq("id", callSheetId);

    if (error) {
      console.error("Error deleting call sheet in Supabase:", error);
      throw error;
    }

    set((state) => {
      const currentList = state.callSheets[projectId] || [];
      return {
        callSheets: {
          ...state.callSheets,
          [projectId]: currentList.filter((cs) => cs.id !== callSheetId)
        }
      };
    });
  },

  deleteProject: async (id) => {
    const { error } = await supabase
      .from("productions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting production:", error);
      alert(error.message);
      return;
    }

    set((state) => {
      const updatedProjects = state.projects.filter((p) => p.id !== id);
      const currentActiveId = state.activeProjectId;
      const targetActiveId = currentActiveId === id 
        ? (updatedProjects[0]?.id || "") 
        : currentActiveId;
      return {
        projects: updatedProjects,
        activeProjectId: targetActiveId
      };
    });
  },

  updateProject: async (id, updates) => {
    const budgetVal = updates.budgetVal;
    const { error } = await supabase
      .from("productions")
      .update({
        title: updates.title,
        description: updates.tagline,
        status: updates.status,
        budget: budgetVal,
        cover_image: updates.coverImage,
        director: updates.director,
        location: updates.location
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating production:", error);
      alert(error.message);
      return;
    }

    set((state) => {
      const updatedProjects = state.projects.map((p) => {
        if (p.id === id) {
          const budgetValNew = Number(budgetVal) || p.budgetVal;
          const budgetTextNew = budgetValNew ? `$${(budgetValNew / 1000000).toFixed(1)}M` : p.budget;
          return {
            ...p,
            ...updates,
            budget: budgetTextNew,
            budgetVal: budgetValNew
          };
        }
        return p;
      });
      return { projects: updatedProjects };
    });
  },

  deleteStoryboardShot: async (projectId, shotId) => {
    const { error } = await supabase
      .from("storyboard_shots")
      .delete()
      .eq("id", shotId);

    if (error) {
      console.error("Error deleting storyboard shot:", error);
      alert(error.message);
      return;
    }

    set((state) => {
      const shots = state.storyboards[projectId] || [];
      return {
        storyboards: {
          ...state.storyboards,
          [projectId]: shots.filter((s) => s.id !== shotId)
        }
      };
    });
  },

  updateStoryboardShot: async (projectId, shotId, updates) => {
    const { error } = await supabase
      .from("storyboard_shots")
      .update({
        shot_number: updates.shotNumber,
        camera: updates.camera,
        lens: updates.lens,
        lighting: updates.lighting,
        notes: updates.notes,
        status: updates.status,
        photo: updates.previewImage
      })
      .eq("id", shotId);

    if (error) {
      console.error("Error updating storyboard shot:", error);
      alert(error.message);
      return;
    }

    set((state) => {
      const shots = state.storyboards[projectId] || [];
      const updatedShots = shots.map((sh) => (sh.id === shotId ? { ...sh, ...updates } : sh));
      return {
        storyboards: {
          ...state.storyboards,
          [projectId]: updatedShots
        }
      };
    });
  },

  addCastMember: async (member) => {
    const { data, error } = await supabase
      .from("cast_members")
      .insert({
        full_name: member.full_name,
        gender: member.gender,
        phone: member.phone,
        email: member.email,
        college: member.college,
        status: member.status,
        skills: member.skills,
        languages: member.languages,
        age: member.age ? Number(member.age) : null,
        experience: member.experience,
        instagram: member.instagram,
        portfolio: member.portfolio,
        notes: member.notes,
        photo_url: member.photo_url
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating cast member:", error);
      alert(error.message);
      return;
    }

    set((state) => ({
      castMembers: [...state.castMembers, data]
    }));
  },

  updateCastMember: async (id, updates) => {
    const { error } = await supabase
      .from("cast_members")
      .update({
        full_name: updates.full_name,
        gender: updates.gender,
        phone: updates.phone,
        email: updates.email,
        college: updates.college,
        status: updates.status,
        skills: updates.skills,
        languages: updates.languages,
        age: updates.age ? Number(updates.age) : null,
        experience: updates.experience,
        instagram: updates.instagram,
        portfolio: updates.portfolio,
        notes: updates.notes,
        photo_url: updates.photo_url
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating cast member:", error);
      alert(error.message);
      return;
    }

    set((state) => ({
      castMembers: state.castMembers.map((m) => m.id === id ? { ...m, ...updates } : m)
    }));
  },

  deleteCastMember: async (id) => {
    const { error } = await supabase
      .from("cast_members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting cast member:", error);
      alert(error.message);
      return;
    }

    set((state) => ({
      castMembers: state.castMembers.filter((m) => m.id !== id)
    }));
  },

  updateUserProfile: async (profile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calculate profile completeness
    let filledCount = 0;
    const fieldsToVerify = ['full_name', 'username', 'bio', 'location', 'website', 'cover_url', 'avatar_url', 'company_name', 'phone'];
    fieldsToVerify.forEach((field) => {
      const val = (profile as any)[field] !== undefined ? (profile as any)[field] : (useProjectStore.getState().userProfile as any)?.[field];
      if (val && String(val).trim().length > 0) {
        filledCount++;
      }
    });
    
    const skills = useProjectStore.getState().skillsList;
    if (skills && skills.length > 0) filledCount++;
    const tags = useProjectStore.getState().userTagsList;
    if (tags && tags.length > 0) filledCount++;

    const totalCompleteness = Math.min(100, Math.round((filledCount / (fieldsToVerify.length + 2)) * 100));

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...profile, completeness: totalCompleteness })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      alert(error.message);
      return;
    }

    set({ userProfile: data });

    // Log Activity
    await supabase.from("activities").insert({
      user_id: user.id,
      title: "Updated Profile",
      description: "Successfully updated biography and professional background information."
    });
    
    useProjectStore.getState().fetchWorkspaceData();
  },

  deleteUserProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!confirm("Are you sure you want to delete your filmmaker profile? This will remove your portfolio, bio details, and social links, but your uploaded project files and productions will be kept. This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (error) {
      console.error("Error deleting profile:", error);
      alert(error.message);
      return;
    }

    set({
      userProfile: null,
      socialLinks: null,
      portfolio: [],
      skillsList: [],
      userTagsList: [],
      userPreferences: null,
      activities: []
    });

    await supabase.auth.signOut();
  },

  updateSocialLinks: async (links) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("social_links")
      .update(links)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating social links:", error);
      alert(error.message);
      return;
    }

    set({ socialLinks: data });
    useProjectStore.getState().fetchWorkspaceData();
  },

  addPortfolioItem: async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("portfolio")
      .insert({
        ...item,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding portfolio item:", error);
      alert(error.message);
      return;
    }

    set((state) => ({ portfolio: [data, ...state.portfolio] }));

    // Log Activity
    await supabase.from("activities").insert({
      user_id: user.id,
      title: "Added Portfolio Asset",
      description: `Uploaded "${item.title}" showreel file to portfolio workspace.`
    });
    
    useProjectStore.getState().fetchWorkspaceData();
  },

  deletePortfolioItem: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting portfolio item:", error);
      alert(error.message);
      return;
    }

    set((state) => ({ portfolio: state.portfolio.filter((item) => item.id !== id) }));
    useProjectStore.getState().fetchWorkspaceData();
  },

  addUserSkill: async (skill) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("skills")
      .insert({ user_id: user.id, name: skill });

    if (error && !error.message.includes("duplicate key")) {
      console.error("Error adding skill:", error);
      alert(error.message);
      return;
    }

    useProjectStore.getState().fetchWorkspaceData();
  },

  removeUserSkill: async (skill) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("user_id", user.id)
      .eq("name", skill);

    if (error) {
      console.error("Error removing skill:", error);
      alert(error.message);
      return;
    }

    useProjectStore.getState().fetchWorkspaceData();
  },

  addUserTag: async (tag) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_tags")
      .insert({ user_id: user.id, tag: tag });

    if (error && !error.message.includes("duplicate key")) {
      console.error("Error adding tag:", error);
      alert(error.message);
      return;
    }

    useProjectStore.getState().fetchWorkspaceData();
  },

  removeUserTag: async (tag) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_tags")
      .delete()
      .eq("user_id", user.id)
      .eq("tag", tag);

    if (error) {
      console.error("Error removing tag:", error);
      alert(error.message);
      return;
    }

    useProjectStore.getState().fetchWorkspaceData();
  },

  fetchChatChannels: async () => {
    const { data, error } = await supabase
      .from("chat_channels")
      .select(`
        *,
        chat_channel_members (
          user_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          )
        )
      `);

    if (error) {
      console.error("Error fetching chat channels:", error);
      return;
    }

    set({ chatChannels: data || [] });
  },

  fetchChatMessages: async (channelId) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        profiles:sender_id (
          id,
          full_name,
          avatar_url
        ),
        message_reactions (
          id,
          emoji,
          user_id
        )
      `)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching chat messages:", error);
      return;
    }

    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [channelId]: data || []
      }
    }));
  },

  sendChatMessage: async (channelId, content, attachmentUrl, replyToMessageId, forwardedFromSenderId, isAnnouncement) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        channel_id: channelId,
        sender_id: user.id,
        content: content.trim(),
        attachment_url: attachmentUrl || null,
        reply_to_message_id: replyToMessageId || null,
        forwarded_from_sender_id: forwardedFromSenderId || null,
        is_announcement: isAnnouncement || false
      })
      .select(`
        *,
        profiles:sender_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error("Error sending chat message:", error);
      alert(error.message);
      return;
    }

    set((state) => {
      const currentMsgs = state.chatMessages[channelId] || [];
      return {
        chatMessages: {
          ...state.chatMessages,
          [channelId]: [...currentMsgs, data]
        }
      };
    });
  },

  createChatChannel: async (name, isGroup, members) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    if (!isGroup && members.length > 0) {
      const targetUserId = members[0];
      const { data: dmChannels, error: dmErr } = await supabase
        .from("chat_channels")
        .select(`
          id,
          chat_channel_members (
            user_id
          )
        `)
        .eq("is_group", false);

      if (!dmErr && dmChannels) {
        const existing = dmChannels.find((ch) => {
          const mIds = ch.chat_channel_members?.map((m: any) => m.user_id) || [];
          return mIds.length === 2 && mIds.includes(user.id) && mIds.includes(targetUserId);
        });

        if (existing) {
          return existing.id;
        }
      }
    }

    const { data: channel, error: cErr } = await supabase
      .from("chat_channels")
      .insert({
        name: name || null,
        is_group: isGroup,
        created_by: user.id
      })
      .select()
      .single();

    if (cErr) {
      console.error("Error creating chat channel:", cErr);
      alert(cErr.message);
      return null;
    }

    const uniqueMembers = Array.from(new Set([...members, user.id]));
    const memberRows = uniqueMembers.map((mId) => ({
      channel_id: channel.id,
      user_id: mId
    }));

    const { error: mErr } = await supabase
      .from("chat_channel_members")
      .insert(memberRows);

    if (mErr) {
      console.error("Error adding channel members:", mErr);
      alert(mErr.message);
      return null;
    }

    await useProjectStore.getState().fetchChatChannels();
    return channel.id;
  },

  setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),

  toggleLikeMessage: async (channelId, messageId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: msg } = await supabase
      .from("chat_messages")
      .select("likes")
      .eq("id", messageId)
      .single();

    if (!msg) return;

    const likesList = msg.likes || [];
    const newLikes = likesList.includes(user.id)
      ? likesList.filter((id: string) => id !== user.id)
      : [...likesList, user.id];

    const { error } = await supabase
      .from("chat_messages")
      .update({ likes: newLikes })
      .eq("id", messageId);

    if (error) {
      console.error("Error toggling message like:", error);
      return;
    }

    await useProjectStore.getState().fetchChatMessages(channelId);
  },

  deleteChatMessage: async (channelId, messageId) => {
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting chat message:", error);
      alert(error.message);
      return;
    }

    await useProjectStore.getState().fetchChatMessages(channelId);
  },

  editChatMessage: async (channelId, messageId, newContent) => {
    const { error } = await supabase
      .from("chat_messages")
      .update({ content: newContent.trim() })
      .eq("id", messageId);

    if (error) {
      console.error("Error editing chat message:", error);
      alert(error.message);
      return;
    }

    await useProjectStore.getState().fetchChatMessages(channelId);
  },

  markMessagesAsRead: async (channelId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc("mark_messages_read", { p_channel_id: channelId, p_user_id: user.id });
    await useProjectStore.getState().fetchChatMessages(channelId);
  },

  toggleMessageReaction: async (channelId, messageId, emoji) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("message_reactions")
      .select("id")
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .eq("emoji", emoji)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existing.id);
      if (error) console.error("Error deleting reaction:", error);
    } else {
      const { error } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji: emoji
        });
      if (error) console.error("Error inserting reaction:", error);
    }

    await useProjectStore.getState().fetchChatMessages(channelId);
  },

  toggleMuteChannel: async (channelId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: channel } = await supabase.from("chat_channels").select("muted_by").eq("id", channelId).single();
    if (!channel) return;
    const list = channel.muted_by || [];
    const newList = list.includes(user.id) ? list.filter((id: string) => id !== user.id) : [...list, user.id];
    await supabase.from("chat_channels").update({ muted_by: newList }).eq("id", channelId);
    await useProjectStore.getState().fetchChatChannels();
  },

  togglePinChannel: async (channelId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: channel } = await supabase.from("chat_channels").select("pinned_by").eq("id", channelId).single();
    if (!channel) return;
    const list = channel.pinned_by || [];
    const newList = list.includes(user.id) ? list.filter((id: string) => id !== user.id) : [...list, user.id];
    await supabase.from("chat_channels").update({ pinned_by: newList }).eq("id", channelId);
    await useProjectStore.getState().fetchChatChannels();
  },

  toggleArchiveChannel: async (channelId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: channel } = await supabase.from("chat_channels").select("archived_by").eq("id", channelId).single();
    if (!channel) return;
    const list = channel.archived_by || [];
    const newList = list.includes(user.id) ? list.filter((id: string) => id !== user.id) : [...list, user.id];
    await supabase.from("chat_channels").update({ archived_by: newList }).eq("id", channelId);
    await useProjectStore.getState().fetchChatChannels();
  },

  blockUser: async (blockedUserId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("blocked_users").insert({ user_id: user.id, blocked_user_id: blockedUserId });
    if (error) {
      console.error("Error blocking user:", error);
      alert(error.message);
    }
  },

  unblockUser: async (blockedUserId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("blocked_users").delete().eq("user_id", user.id).eq("blocked_user_id", blockedUserId);
    if (error) {
      console.error("Error unblocking user:", error);
      alert(error.message);
    }
  },

  reportUser: async (reportedUserId, reason) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("reported_users").insert({ reporter_id: user.id, reported_user_id: reportedUserId, reason });
    if (error) {
      console.error("Error reporting user:", error);
      alert(error.message);
    } else {
      alert("Report submitted successfully.");
    }
  },

  updateGroupDetails: async (channelId, name, description, avatarUrl) => {
    const { error } = await supabase.from("chat_channels").update({ name, description, avatar_url: avatarUrl }).eq("id", channelId);
    if (error) {
      console.error("Error updating group details:", error);
      alert(error.message);
    }
    await useProjectStore.getState().fetchChatChannels();
  },

  updateGroupMemberRole: async (channelId, userId, role) => {
    const { error } = await supabase.from("chat_channel_members").update({ role }).eq("channel_id", channelId).eq("user_id", userId);
    if (error) {
      console.error("Error updating member role:", error);
      alert(error.message);
    }
    await useProjectStore.getState().fetchChatChannels();
  },

  addGroupMembers: async (channelId, userIds) => {
    const rows = userIds.map(uId => ({ channel_id: channelId, user_id: uId }));
    const { error } = await supabase.from("chat_channel_members").insert(rows);
    if (error) {
      console.error("Error adding members:", error);
      alert(error.message);
    }
    await useProjectStore.getState().fetchChatChannels();
  },

  removeGroupMember: async (channelId, userId) => {
    const { error } = await supabase.from("chat_channel_members").delete().eq("channel_id", channelId).eq("user_id", userId);
    if (error) {
      console.error("Error removing member:", error);
      alert(error.message);
    }
    await useProjectStore.getState().fetchChatChannels();
  },

  leaveGroup: async (channelId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("chat_channel_members").delete().eq("channel_id", channelId).eq("user_id", user.id);
    if (error) {
      console.error("Error leaving group:", error);
      alert(error.message);
    }
    await useProjectStore.getState().fetchChatChannels();
  },

  uploadChatAttachment: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `attachments/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("chat_attachments")
        .upload(filePath, file);

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from("chat_attachments")
          .getPublicUrl(filePath);
        return urlData.publicUrl;
      }
    } catch (err) {
      console.warn("Storage upload failed, falling back to base64 encoding", err);
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  },

  updateProfilePrivacySettings: async (settings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update(settings).eq("id", user.id);
    if (error) {
      console.error("Error updating privacy settings:", error);
      alert(error.message);
    } else {
      await useProjectStore.getState().fetchWorkspaceData();
    }
  }
}));

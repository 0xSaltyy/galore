export type DiscordStatus = "online" | "idle" | "dnd" | "offline" | "unknown";

export type ServerStats = {
  totalMembers: number;
  onlineMembers: number;
  peopleInVc: number;
  openPublicVcs: number;
  updatedAt?: string;
};

export type VoiceMember = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  status: DiscordStatus;
  selfMute: boolean;
  selfDeaf: boolean;
  serverMute: boolean;
  serverDeaf: boolean;
  streaming: boolean;
  video: boolean;
};

export type VoiceChannel = {
  id: string;
  name: string;
  position: number;
  parentId: string | null;
  userLimit: number | null;
  isPublic: boolean;
  members: VoiceMember[];
};

export type StaffRank = "Owner" | "Admin" | "Moderator" | "Trial Staff";

export type StaffMember = {
  id: string;
  discordUserId: string;
  displayName: string;
  avatarUrl: string | null;
  rank: StaffRank;
  status: DiscordStatus;
  bio: string;
  sortOrder: number;
};

export type StaffApplication = {
  id: string;
  discordUsername: string;
  discordUserId: string;
  age: number;
  timezone: string;
  activityLevel: string;
  whyStaff: string;
  vcProblemResponse: string;
  argumentResponse: string;
  previousExperience: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type ReportSubmission = {
  id: string;
  type: "report" | "ban_appeal";
  discordUsername: string;
  discordUserId: string;
  subject: string;
  details: string;
  evidenceUrl: string | null;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
};

export type ServerEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  host: string | null;
  eventType: string;
  isActive: boolean;
};

export type AdminSummary = {
  stats: ServerStats;
  applications: StaffApplication[];
  reports: ReportSubmission[];
  staff: StaffMember[];
  events: ServerEvent[];
};

export type AdminSession = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  roles: string[];
  issuedAt: number;
};

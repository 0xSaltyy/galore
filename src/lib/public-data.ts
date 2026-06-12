import "server-only";

import { fetchDiscordGuildCounts, hydrateStaffFromDiscord } from "@/lib/discord";
import { getReadableSupabaseClient, getSupabaseAdminClient } from "@/lib/supabase";
import type {
  AdminSummary,
  ReportSubmission,
  ServerEvent,
  ServerStats,
  StaffApplication,
  StaffMember,
  StaffRank,
  VoiceChannel,
  VoiceMember,
} from "@/lib/types";

const rankOrder: StaffRank[] = ["Owner", "Admin", "Moderator", "Trial Staff"];

function mapStats(row: Record<string, unknown>): ServerStats {
  return {
    totalMembers: Number(row.total_members ?? 0),
    onlineMembers: Number(row.online_members ?? 0),
    peopleInVc: Number(row.people_in_vc ?? 0),
    openPublicVcs: Number(row.open_public_vcs ?? 0),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapApplication(row: Record<string, unknown>): StaffApplication {
  return {
    id: String(row.id),
    discordUsername: String(row.discord_username),
    discordUserId: String(row.discord_user_id),
    age: Number(row.age),
    timezone: String(row.timezone),
    activityLevel: String(row.activity_level),
    whyStaff: String(row.why_staff),
    vcProblemResponse: String(row.vc_problem_response),
    argumentResponse: String(row.argument_response),
    previousExperience: String(row.previous_experience),
    status: row.status as StaffApplication["status"],
    createdAt: String(row.created_at),
  };
}

function mapReport(row: Record<string, unknown>): ReportSubmission {
  return {
    id: String(row.id),
    type: row.type as ReportSubmission["type"],
    discordUsername: String(row.discord_username),
    discordUserId: String(row.discord_user_id),
    subject: String(row.subject),
    details: String(row.details),
    evidenceUrl: row.evidence_url ? String(row.evidence_url) : null,
    status: row.status as ReportSubmission["status"],
    createdAt: String(row.created_at),
  };
}

function mapStaff(row: Record<string, unknown>): StaffMember {
  return {
    id: String(row.id),
    discordUserId: String(row.discord_user_id),
    displayName: String(row.display_name),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    rank: row.rank as StaffRank,
    status: (row.status ?? "unknown") as StaffMember["status"],
    bio: String(row.bio ?? ""),
    sortOrder: Number(row.sort_order ?? 50),
  };
}

function mapEvent(row: Record<string, unknown>): ServerEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    startsAt: String(row.starts_at),
    host: row.host ? String(row.host) : null,
    eventType: String(row.event_type),
    isActive: Boolean(row.is_active),
  };
}

export async function getVoiceSnapshot(): Promise<VoiceChannel[]> {
  const supabase = getReadableSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: channels } = await supabase
    .from("voice_channels")
    .select("*")
    .order("position", { ascending: true });

  const channelRows = channels ?? [];

  if (channelRows.length === 0) {
    return [];
  }

  const { data: members } = await supabase.from("voice_members").select("*");
  const membersByChannel = new Map<string, VoiceMember[]>();

  for (const member of members ?? []) {
    const channelId = String(member.channel_id);
    const voiceMember: VoiceMember = {
      userId: String(member.user_id),
      displayName: String(member.display_name),
      avatarUrl: member.avatar_url ? String(member.avatar_url) : null,
      status: (member.status ?? "unknown") as VoiceMember["status"],
      selfMute: Boolean(member.self_mute),
      selfDeaf: Boolean(member.self_deaf),
      serverMute: Boolean(member.server_mute),
      serverDeaf: Boolean(member.server_deaf),
      streaming: Boolean(member.streaming),
      video: Boolean(member.video),
    };

    membersByChannel.set(channelId, [...(membersByChannel.get(channelId) ?? []), voiceMember]);
  }

  return channelRows.map((channel) => ({
    id: String(channel.channel_id ?? channel.id),
    name: String(channel.name),
    position: Number(channel.position ?? 0),
    parentId: channel.parent_id ? String(channel.parent_id) : null,
    userLimit: channel.user_limit ? Number(channel.user_limit) : null,
    isPublic: channel.is_public !== false,
    members: membersByChannel.get(String(channel.channel_id ?? channel.id)) ?? [],
  }));
}

export async function getServerStats(): Promise<ServerStats> {
  const supabase = getReadableSupabaseClient();

  if (supabase) {
    const { data } = await supabase
      .from("server_stats")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return mapStats(data);
    }
  }

  const channels = await getVoiceSnapshot();
  const counts = await fetchDiscordGuildCounts().catch(() => null);
  const peopleInVc = channels.reduce((count, channel) => count + channel.members.length, 0);
  const openPublicVcs = channels.filter((channel) => channel.isPublic).length;

  return {
    totalMembers: counts?.totalMembers ?? 0,
    onlineMembers: counts?.onlineMembers ?? 0,
    peopleInVc,
    openPublicVcs,
    updatedAt: new Date().toISOString(),
  };
}

export async function getStaffMembers() {
  const supabase = getReadableSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("staff_members")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!data || data.length === 0) {
    return [];
  }

  const staff = data.map(mapStaff);
  return hydrateStaffFromDiscord(staff);
}

export async function getEvents() {
  const supabase = getReadableSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .gte("starts_at", new Date(Date.now() - 1000 * 60 * 60).toISOString())
    .order("starts_at", { ascending: true });

  return data && data.length > 0 ? data.map(mapEvent) : [];
}

export function groupStaffByRank(staff: StaffMember[]) {
  return rankOrder.map((rank) => ({
    rank,
    members: staff.filter((member) => member.rank === rank),
  }));
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      stats: await getServerStats(),
      applications: [],
      reports: [],
      staff: await getStaffMembers(),
      events: await getEvents(),
    };
  }

  const [stats, applications, reports, staff, events] = await Promise.all([
    getServerStats(),
    supabase
      .from("staff_applications")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
    supabase.from("staff_members").select("*").order("sort_order", { ascending: true }),
    supabase.from("events").select("*").order("starts_at", { ascending: true }),
  ]);

  return {
    stats,
    applications: (applications.data ?? []).map(mapApplication),
    reports: (reports.data ?? []).map(mapReport),
    staff: await hydrateStaffFromDiscord((staff.data ?? []).map(mapStaff)),
    events: (events.data ?? []).map(mapEvent),
  };
}

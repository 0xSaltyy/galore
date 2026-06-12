import "server-only";

import {
  DISCORD_API_BASE_URL,
  getDiscordRedirectUri,
} from "@/lib/discord-config";
import { env } from "@/lib/env";
import type { DiscordStatus, StaffMember } from "@/lib/types";

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator?: string;
  avatar?: string | null;
};

export type DiscordGuildMember = {
  user?: DiscordUser;
  nick?: string | null;
  avatar?: string | null;
  roles?: string[];
};

type DiscordChannel = {
  id: string;
  name: string;
  type: number;
  position?: number;
  parent_id?: string | null;
  user_limit?: number;
};

export type OAuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export type OAuthUser = {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator?: string;
  avatar?: string | null;
};

function botHeaders() {
  const token = env("DISCORD_BOT_TOKEN");
  return token ? { Authorization: `Bot ${token}` } : null;
}

function guildId() {
  return env("DISCORD_GUILD_ID");
}

async function discordBotFetch<T>(path: string, init?: RequestInit) {
  const headers = botHeaders();
  if (!headers) {
    return null;
  }

  const response = await fetch(`${DISCORD_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord API ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

export function discordAvatarUrl(
  userId: string,
  avatarHash?: string | null,
  discriminator?: string,
) {
  if (!avatarHash) {
    const index = discriminator && discriminator !== "0" ? Number(discriminator) % 5 : 0;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }

  const extension = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=128`;
}

export function guildMemberAvatarUrl(
  userId: string,
  memberAvatar?: string | null,
  fallbackAvatar?: string | null,
  discriminator?: string,
) {
  const guild = guildId();
  if (guild && memberAvatar) {
    const extension = memberAvatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/guilds/${guild}/users/${userId}/avatars/${memberAvatar}.${extension}?size=128`;
  }

  return discordAvatarUrl(userId, fallbackAvatar, discriminator);
}

export function displayNameFromDiscord(member: DiscordGuildMember) {
  const user = member.user;
  return (
    member.nick ??
    user?.global_name ??
    user?.username ??
    "Unknown member"
  );
}

export async function fetchDiscordGuildMember(userId: string) {
  const guild = guildId();
  if (!guild) {
    return null;
  }

  return discordBotFetch<DiscordGuildMember>(`/guilds/${guild}/members/${userId}`);
}

export async function fetchDiscordVoiceChannels() {
  const guild = guildId();
  if (!guild) {
    return [];
  }

  const channels = await discordBotFetch<DiscordChannel[]>(`/guilds/${guild}/channels`);
  return (channels ?? [])
    .filter((channel) => channel.type === 2 || channel.type === 13)
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      position: channel.position ?? 0,
      parentId: channel.parent_id ?? null,
      userLimit: channel.user_limit && channel.user_limit > 0 ? channel.user_limit : null,
      isPublic: true,
    }));
}

export async function fetchDiscordGuildCounts() {
  const guild = guildId();
  if (!guild) {
    return null;
  }

  const data = await discordBotFetch<{
    approximate_member_count?: number;
    approximate_presence_count?: number;
  }>(`/guilds/${guild}?with_counts=true`);

  if (!data) {
    return null;
  }

  return {
    totalMembers: data.approximate_member_count ?? 0,
    onlineMembers: data.approximate_presence_count ?? 0,
  };
}

export async function hydrateStaffFromDiscord(staff: StaffMember[]) {
  await Promise.all(
    staff.map(async (member) => {
      try {
        const discordMember = await fetchDiscordGuildMember(member.discordUserId);
        if (!discordMember?.user) {
          return;
        }

        member.displayName = displayNameFromDiscord(discordMember);
        member.avatarUrl = guildMemberAvatarUrl(
          discordMember.user.id,
          discordMember.avatar,
          discordMember.user.avatar,
          discordMember.user.discriminator,
        );
      } catch {
        // Keep Supabase data when Discord hydration is unavailable.
      }
    }),
  );

  return staff;
}

export async function sendStaffWebhook(payload: unknown) {
  const url = env("DISCORD_STAFF_WEBHOOK_URL");
  if (!url) {
    return { ok: false, skipped: true };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord webhook ${response.status}: ${body}`);
  }

  return { ok: true, skipped: false };
}

export async function exchangeDiscordCode(code: string) {
  const clientId = env("DISCORD_CLIENT_ID");
  const clientSecret = env("DISCORD_CLIENT_SECRET");
  const redirectUri = getDiscordRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Discord OAuth environment variables are not configured.");
  }

  const response = await fetch(`${DISCORD_API_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord OAuth token exchange failed: ${body}`);
  }

  return (await response.json()) as OAuthTokenResponse;
}

export async function fetchDiscordOAuthUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API_BASE_URL}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord OAuth user fetch failed: ${body}`);
  }

  return (await response.json()) as OAuthUser;
}

export async function fetchDiscordOAuthGuildMember(accessToken: string) {
  const guild = guildId();
  if (!guild) {
    return null;
  }

  const response = await fetch(`${DISCORD_API_BASE_URL}/users/@me/guilds/${guild}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (response.status === 403 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord OAuth guild member fetch failed: ${body}`);
  }

  return (await response.json()) as DiscordGuildMember;
}

export function statusFromPresence(status?: string | null): DiscordStatus {
  if (status === "online" || status === "idle" || status === "dnd" || status === "offline") {
    return status;
  }

  return "unknown";
}

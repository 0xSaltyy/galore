import "server-only";

import crypto from "node:crypto";

import { cookies } from "next/headers";

import { csvEnv, env } from "@/lib/env";
import {
  fetchDiscordGuildMember,
  guildMemberAvatarUrl,
  type DiscordGuildMember,
} from "@/lib/discord";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { AdminSession } from "@/lib/types";

export const SESSION_COOKIE = "galore_admin";
export const OAUTH_STATE_COOKIE = "galore_oauth_state";

function secret() {
  return (
    env("SESSION_SECRET") ??
    env("DISCORD_CLIENT_SECRET") ??
    env("SUPABASE_SERVICE_ROLE_KEY")
  );
}

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function fromBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payload: string) {
  const key = secret();
  if (!key) {
    throw new Error("SESSION_SECRET or DISCORD_CLIENT_SECRET is required for admin login.");
  }

  return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

export function createSessionToken(session: AdminSession) {
  const payload = base64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  try {
    const expected = sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const session = JSON.parse(fromBase64Url(payload)) as AdminSession;
    const maxAgeMs = 1000 * 60 * 60 * 24 * 7;
    if (!session.issuedAt || Date.now() - session.issuedAt > maxAgeMs) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function isDiscordAdminAllowed(userId: string, roleIds: string[]) {
  const allowedIds = csvEnv("DISCORD_ALLOWED_USER_IDS");
  const staffRoleIds = csvEnv("DISCORD_STAFF_ROLE_IDS");

  if (allowedIds.has(userId)) {
    return true;
  }

  if (roleIds.some((roleId) => staffRoleIds.has(roleId))) {
    return true;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return false;
  }

  const { data } = await supabase
    .from("staff_members")
    .select("discord_user_id")
    .eq("discord_user_id", userId)
    .maybeSingle();

  return Boolean(data);
}

export async function sessionFromDiscordUser(user: {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator?: string;
  avatar?: string | null;
}, oauthGuildMember?: DiscordGuildMember | null) {
  const member = oauthGuildMember ?? await fetchDiscordGuildMember(user.id);
  const roles = member?.roles ?? [];
  const allowed = await isDiscordAdminAllowed(user.id, roles);

  if (!allowed) {
    return null;
  }

  return {
    userId: user.id,
    username: user.username,
    displayName: member?.nick ?? user.global_name ?? user.username,
    avatarUrl: guildMemberAvatarUrl(user.id, member?.avatar, user.avatar, user.discriminator),
    roles,
    issuedAt: Date.now(),
  } satisfies AdminSession;
}

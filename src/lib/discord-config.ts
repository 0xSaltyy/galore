import { env, siteUrl } from "./env";

export const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
export const DISCORD_OAUTH_AUTHORIZE_URL = "https://discord.com/oauth2/authorize";
export const DISCORD_OAUTH_CALLBACK_PATH = "/api/auth/discord/callback";
export const DISCORD_OAUTH_START_PATH = "/api/auth/discord/start";

export type InviteValidation =
  | { ok: true; url: string; error: null }
  | { ok: false; url: null; error: string };

export function getDiscordRedirectUri() {
  return env("DISCORD_REDIRECT_URI") ?? `${siteUrl()}${DISCORD_OAUTH_CALLBACK_PATH}`;
}

export function validateDiscordInviteUrl(value: string | undefined): InviteValidation {
  const raw = value?.trim();

  if (!raw) {
    return {
      ok: false,
      url: null,
      error: "NEXT_PUBLIC_DISCORD_INVITE_URL is missing.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return {
      ok: false,
      url: null,
      error: "NEXT_PUBLIC_DISCORD_INVITE_URL must be a valid URL.",
    };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  const isDiscordGg = host === "discord.gg" && pathParts.length >= 1;
  const isDiscordInvite =
    (host === "discord.com" || host === "discordapp.com") &&
    pathParts[0] === "invite" &&
    pathParts.length >= 2;

  if (!isDiscordGg && !isDiscordInvite) {
    return {
      ok: false,
      url: null,
      error:
        "NEXT_PUBLIC_DISCORD_INVITE_URL must be a complete Discord invite URL like https://discord.gg/code or https://discord.com/invite/code.",
    };
  }

  return { ok: true, url: parsed.toString(), error: null };
}

export function getDiscordInviteConfig() {
  return validateDiscordInviteUrl(env("NEXT_PUBLIC_DISCORD_INVITE_URL"));
}

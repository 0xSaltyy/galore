import { loadEnvConfig } from "@next/env";

import {
  DISCORD_OAUTH_CALLBACK_PATH,
  validateDiscordInviteUrl,
} from "../src/lib/discord-config";

loadEnvConfig(process.cwd());

type Check = {
  name: string;
  required: boolean;
  validate?: (value: string) => string | null;
};

const snowflakePattern = /^\d{15,25}$/;

function isPlaceholder(value: string) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("your-") ||
    normalized.includes("replace-") ||
    normalized.includes("change-me") ||
    normalized.includes("example")
  );
}

function present(value: string) {
  if (isPlaceholder(value)) {
    return "replace the placeholder value";
  }

  return null;
}

function snowflake(value: string) {
  return present(value) ?? (snowflakePattern.test(value) ? null : "must be a Discord snowflake ID");
}

function csvSnowflakes(value: string) {
  const placeholderError = present(value);
  if (placeholderError) {
    return placeholderError;
  }

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return "must contain at least one Discord snowflake ID";
  }

  const invalid = items.filter((item) => !snowflakePattern.test(item));
  return invalid.length > 0 ? "must contain only comma-separated Discord snowflake IDs" : null;
}

function httpUrl(value: string) {
  const placeholderError = present(value);
  if (placeholderError) {
    return placeholderError;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? null
      : "must use http:// or https://";
  } catch {
    return "must be a valid URL";
  }
}

function supabaseUrl(value: string) {
  return httpUrl(value);
}

function redirectUri(value: string) {
  const urlError = httpUrl(value);
  if (urlError) {
    return urlError;
  }

  const url = new URL(value);
  return url.pathname === DISCORD_OAUTH_CALLBACK_PATH
    ? null
    : `must end with ${DISCORD_OAUTH_CALLBACK_PATH}`;
}

function inviteUrl(value: string) {
  const placeholderError = present(value);
  if (placeholderError) {
    return placeholderError;
  }

  const result = validateDiscordInviteUrl(value);
  return result.ok ? null : result.error;
}

function longSecret(value: string) {
  const placeholderError = present(value);
  if (placeholderError) {
    return placeholderError;
  }

  return value.length >= 32 ? null : "must be at least 32 characters";
}

const checks: Check[] = [
  { name: "DISCORD_BOT_TOKEN", required: true, validate: present },
  { name: "DISCORD_GUILD_ID", required: true, validate: snowflake },
  { name: "DISCORD_CLIENT_ID", required: true, validate: snowflake },
  { name: "DISCORD_CLIENT_SECRET", required: true, validate: present },
  { name: "DISCORD_REDIRECT_URI", required: true, validate: redirectUri },
  { name: "DISCORD_STAFF_WEBHOOK_URL", required: true, validate: httpUrl },
  { name: "NEXT_PUBLIC_DISCORD_INVITE_URL", required: true, validate: inviteUrl },
  { name: "NEXT_PUBLIC_SITE_URL", required: true, validate: httpUrl },
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, validate: supabaseUrl },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, validate: present },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, validate: present },
  { name: "SESSION_SECRET", required: true, validate: longSecret },
  { name: "DISCORD_ALLOWED_USER_IDS", required: true, validate: csvSnowflakes },
  { name: "DISCORD_STAFF_ROLE_IDS", required: true, validate: csvSnowflakes },
];

console.log("[galore] Environment check");
console.log(`[galore] Discord OAuth callback route: ${DISCORD_OAUTH_CALLBACK_PATH}`);

const failures: string[] = [];

for (const check of checks) {
  const value = process.env[check.name]?.trim() ?? "";

  if (!value) {
    const message = `${check.name} is missing`;
    failures.push(message);
    console.log(`✗ ${message}`);
    continue;
  }

  const validationError = check.validate?.(value) ?? null;

  if (validationError) {
    const message = `${check.name} is invalid: ${validationError}`;
    failures.push(message);
    console.log(`✗ ${message}`);
    continue;
  }

  console.log(`✓ ${check.name} is present`);
}

if (failures.length > 0) {
  console.error(`[galore] ${failures.length} environment issue(s) found. No secret values were printed.`);
  process.exit(1);
}

console.log("[galore] Environment looks ready. No secret values were printed.");

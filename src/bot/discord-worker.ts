import { loadEnvConfig } from "@next/env";
import {
  ChannelType,
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  type Guild,
  type GuildBasedChannel,
  type VoiceBasedChannel,
} from "discord.js";
import { createClient } from "@supabase/supabase-js";

import { env, httpUrlEnv } from "../lib/env";

loadEnvConfig(process.cwd());

const required = [
  "DISCORD_BOT_TOKEN",
  "DISCORD_GUILD_ID",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const envPresence = Object.fromEntries(
  required.map((key) => [key, process.env[key] ? "present" : "missing"]),
);
console.info("[galore] required environment variables", envPresence);

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[galore] missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const supabaseUrl = httpUrlEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseServiceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("[galore] Supabase configuration is invalid. No secret values were printed.");
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
];

if (process.env.DISCORD_ENABLE_GUILD_MEMBERS_INTENT === "true") {
  intents.push(GatewayIntentBits.GuildMembers);
}

if (process.env.DISCORD_ENABLE_PRESENCE_INTENT === "true") {
  intents.push(GatewayIntentBits.GuildPresences);
}

const client = new Client({ intents });
let syncTimer: NodeJS.Timeout | null = null;
let syncing = false;
let initialSyncComplete = false;

function isVoiceChannel(channel: GuildBasedChannel): channel is VoiceBasedChannel {
  return channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;
}

function isPublicVoice(channel: VoiceBasedChannel) {
  const permissions = channel.permissionsFor(channel.guild.roles.everyone);
  return Boolean(permissions?.has(PermissionFlagsBits.Connect));
}

async function fetchConfiguredGuild() {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!);
  console.log(`[galore] Fetched guild ${guild.name}`);
  return guild;
}

async function fetchVoiceChannels(guild: Guild) {
  await guild.channels.fetch();

  const voiceChannels = Array.from(guild.channels.cache
    .filter(isVoiceChannel)
    .sort((a, b) => a.position - b.position)
    .values());

  console.log(`[galore] Found ${voiceChannels.length} voice channels`);
  return voiceChannels;
}

async function buildVoiceMemberRows(guild: Guild, voiceChannels: VoiceBasedChannel[]) {
  const voiceChannelIds = new Set(voiceChannels.map((channel) => channel.id));
  const activeVoiceStates = Array.from(guild.voiceStates.cache.values()).filter(
    (voiceState) => voiceState.channelId && voiceChannelIds.has(voiceState.channelId),
  );

  return Promise.all(
    activeVoiceStates.map(async (voiceState) => {
      const member =
        voiceState.member ??
        (await guild.members.fetch(voiceState.id).catch(() => null));
      const presence = guild.presences.cache.get(voiceState.id);

      return {
        guild_id: guild.id,
        user_id: voiceState.id,
        channel_id: voiceState.channelId!,
        display_name: member?.displayName ?? voiceState.id,
        avatar_url: member?.displayAvatarURL({ extension: "png", size: 128 }) ?? null,
        status: presence?.status ?? "unknown",
        self_mute: voiceState.selfMute ?? false,
        self_deaf: voiceState.selfDeaf ?? false,
        server_mute: voiceState.serverMute ?? false,
        server_deaf: voiceState.serverDeaf ?? false,
        streaming: voiceState.streaming ?? false,
        video: voiceState.selfVideo ?? false,
        updated_at: new Date().toISOString(),
      };
    }),
  );
}

async function syncGuildSnapshot(reason: string, options: { initial?: boolean } = {}) {
  if (syncing) {
    scheduleSync("queued while syncing");
    return;
  }

  syncing = true;
  const started = Date.now();

  try {
    const guild = await fetchConfiguredGuild();
    const voiceChannels = await fetchVoiceChannels(guild);

    const channelRows = voiceChannels.map((channel) => ({
      guild_id: guild.id,
      channel_id: channel.id,
      name: channel.name,
      position: channel.position,
      parent_id: channel.parentId,
      user_limit: "userLimit" in channel && channel.userLimit > 0 ? channel.userLimit : null,
      is_public: isPublicVoice(channel),
      last_seen_at: new Date().toISOString(),
    }));

    if (channelRows.length > 0) {
      const { error } = await supabase
        .from("voice_channels")
        .upsert(channelRows, { onConflict: "channel_id" });
      if (error) {
        throw error;
      }
    }

    const memberRows = await buildVoiceMemberRows(guild, voiceChannels);

    const { error: deleteError } = await supabase
      .from("voice_members")
      .delete()
      .eq("guild_id", guild.id);

    if (deleteError) {
      throw deleteError;
    }

    if (memberRows.length > 0) {
      const { error } = await supabase.from("voice_members").insert(memberRows);
      if (error) {
        throw error;
      }
    }

    console.log(`[galore] Synced ${memberRows.length} active voice members`);

    const onlineMembers = process.env.DISCORD_ENABLE_PRESENCE_INTENT === "true"
      ? guild.presences.cache.filter((presence) => presence.status !== "offline").size
      : 0;

    const { error: statsError } = await supabase.from("server_stats").upsert(
      {
        guild_id: guild.id,
        total_members: guild.memberCount ?? 0,
        online_members: onlineMembers,
        people_in_vc: memberRows.length,
        open_public_vcs: channelRows.filter((channel) => channel.is_public).length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "guild_id" },
    );

    if (statsError) {
      throw statsError;
    }

    console.log(`[galore] VC sync finished in ${Date.now() - started}ms (${reason})`);

    if (options.initial && !initialSyncComplete) {
      initialSyncComplete = true;
      console.log("[galore] Initial VC sync complete");
      console.log("[galore] Listening for voiceStateUpdate");
    }
  } catch (error) {
    console.error("[galore] sync failed", error);
  } finally {
    syncing = false;
  }
}

function scheduleSync(reason: string) {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(() => {
    syncGuildSnapshot(reason);
  }, 750);
}

client.once("ready", () => {
  console.log(`[galore] Logged in as ${client.user?.tag}`);
  void syncGuildSnapshot("ready", { initial: true });
  setInterval(() => scheduleSync("interval"), 60_000);
});

client.on("voiceStateUpdate", () => scheduleSync("voiceStateUpdate"));
client.on("channelCreate", () => scheduleSync("channelCreate"));
client.on("channelUpdate", () => scheduleSync("channelUpdate"));
client.on("channelDelete", () => scheduleSync("channelDelete"));
client.on("guildMemberAdd", () => scheduleSync("guildMemberAdd"));
client.on("guildMemberRemove", () => scheduleSync("guildMemberRemove"));
client.on("presenceUpdate", () => scheduleSync("presenceUpdate"));

client.login(process.env.DISCORD_BOT_TOKEN);

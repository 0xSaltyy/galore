"use client";

import { useEffect, useMemo, useState } from "react";
import { Circle, Headphones, Mic, MicOff, Radio, RefreshCcw, Volume2, VolumeX, Video } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { StatusDot } from "@/components/status";
import { StatCard } from "@/components/stat-card";
import type { ServerStats, VoiceChannel } from "@/lib/types";

export function VoiceChannelList({
  initialChannels,
  initialStats,
}: {
  initialChannels: VoiceChannel[];
  initialStats: ServerStats;
}) {
  const [channels, setChannels] = useState(initialChannels);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/voice", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        channels: VoiceChannel[];
        stats: ServerStats;
      };
      setChannels(data.channels);
      setStats(data.stats);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const interval = window.setInterval(refresh, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const totalInVoice = useMemo(
    () => channels.reduce((count, channel) => count + channel.members.length, 0),
    [channels],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="members" value={stats.totalMembers} icon={Radio} tone="zinc" />
        <StatCard label="online" value={stats.onlineMembers} icon={Volume2} tone="blue" />
        <StatCard label="in vc" value={totalInVoice} icon={Headphones} tone="red" />
        <StatCard label="open rooms" value={stats.openPublicVcs} icon={Mic} tone="zinc" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#1b1b1d] bg-[#070708] px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#747571]">
          <span className="mr-2 inline-flex items-center gap-1.5 text-[#aeb4b8]">
            <Circle className="size-2 fill-current" aria-hidden="true" />
            live
          </span>
          sync{" "}
          <span className="text-[#d5d2cb]">{lastUpdated.toLocaleTimeString()}</span>
        </p>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex h-8 items-center gap-2 border border-[#2a2a2d] bg-[#0a0a0b] px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c7c5bd] transition hover:border-[#666b70]"
        >
          <RefreshCcw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          refresh
        </button>
      </div>

      {channels.length === 0 ? (
        <div className="border border-dashed border-[#242427] bg-[#050505] px-4 py-8 font-mono text-[10px] uppercase tracking-[0.18em] text-[#555651]">
          no voice data
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <article
              key={channel.id}
              className="border border-[#1b1b1d] bg-[#070708]"
            >
            <div className="flex items-center justify-between gap-4 border-b border-[#1b1b1d] px-4 py-3">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <Headphones
                    className={`size-3.5 ${channel.members.length > 0 ? "text-[#aeb4b8]" : "text-[#555651]"}`}
                    aria-hidden="true"
                  />
                  <h2 className="truncate text-sm font-medium tracking-[-0.02em] text-[#e2dfd8]">{channel.name}</h2>
                  {channel.members.length > 0 ? (
                    <span className="inline-flex items-center gap-1 border border-[#303236] bg-[#0b0d0f] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#aeb4b8]">
                      <Circle className="size-1.5 fill-current" aria-hidden="true" />
                      live
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#696a65]">
                  {channel.members.length} in voice
                  {channel.userLimit ? ` / ${channel.userLimit} limit` : ""}
                </p>
              </div>
              <span className="border border-[#242427] bg-[#0b0b0c] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7d7d78]">
                {channel.isPublic ? "PUBLIC" : "LOCKED"}
              </span>
            </div>

            {channel.members.length === 0 ? (
              <div className="px-4 py-5">
                <div className="border border-dashed border-[#1f1f22] bg-[#050505] px-3 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#555651]">
                  empty
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#151517]">
                {channel.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={member.avatarUrl} name={member.displayName} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <StatusDot status={member.status} />
                          <p className="truncate text-sm font-medium tracking-[-0.02em] text-[#dedbd4]">{member.displayName}</p>
                          <span className="border border-[#242427] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#73746f]">
                            member
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-[#5b5c57]">{member.userId}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-[#72736e]">
                      {member.selfMute || member.serverMute ? (
                        <span className="grid size-6 place-items-center border border-[#393134] bg-[#100d0e] text-[#bda5aa]">
                          <MicOff className="size-3" aria-label="Muted" />
                        </span>
                      ) : (
                        <span className="grid size-6 place-items-center border border-[#242427]">
                          <Mic className="size-3" aria-label="Unmuted" />
                        </span>
                      )}
                      {member.selfDeaf || member.serverDeaf ? (
                        <span className="grid size-6 place-items-center border border-[#393134] bg-[#100d0e] text-[#bda5aa]">
                          <VolumeX className="size-3" aria-label="Deafened" />
                        </span>
                      ) : (
                        <span className="grid size-6 place-items-center border border-[#242427]">
                          <Volume2 className="size-3" aria-label="Listening" />
                        </span>
                      )}
                      {member.video ? (
                        <span className="grid size-6 place-items-center border border-[#26313a] bg-[#0d1115] text-[#8fa2b2]">
                          <Video className="size-3" aria-label="Video on" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

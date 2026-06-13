import Image from "next/image";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Radio,
  Shield,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Avatar } from "@/components/avatar";
import { DiscordInviteLink } from "@/components/discord-invite-link";
import { SiteShell } from "@/components/site-shell";
import { StatusDot } from "@/components/status";
import {
  getServerStats,
  getStaffMembers,
  getVoiceSnapshot,
} from "@/lib/public-data";
import type { ServerStats, StaffMember, VoiceChannel } from "@/lib/types";

export const dynamic = "force-dynamic";

const actionLinks = [
  { href: "/applications", label: "apply" },
  { href: "/report", label: "reports" },
];

export default async function Home() {
  const [stats, channels, staff] = await Promise.all([
    getServerStats(),
    getVoiceSnapshot(),
    getStaffMembers(),
  ]);

  const liveChannels = [...channels].sort((a, b) => b.members.length - a.members.length).slice(0, 5);
  const staffPreview = staff.slice(0, 5);

  return (
    <SiteShell>
      <section className="relative isolate min-h-[620px] overflow-hidden border-b border-[#17171a]">
        <Image
          src="/images/galore-profile.jpeg"
          alt="# galore"
          fill
          priority
          className="object-cover object-[55%_34%] opacity-72 grayscale brightness-[0.4] contrast-125 saturate-[0.55]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#030303_0%,rgba(3,3,3,0.9)_38%,rgba(3,3,3,0.48)_100%),linear-gradient(180deg,rgba(3,3,3,0.08),#030303_96%)]" />
        <div className="grain-overlay absolute inset-0 opacity-80" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-[clamp(4rem,9vw,7.25rem)] font-semibold leading-[0.84] tracking-[-0.07em] text-[#f0ede7]">
                # galore
              </h1>
              <div className="mt-7 flex flex-wrap gap-2">
                <DiscordInviteLink />
                <Link
                  href="/live-vc"
                  className="inline-flex h-9 items-center gap-2 rounded-sm border border-[#2a2a2d] bg-[#08090a]/82 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c7c5bd] transition hover:border-[#5d6268] hover:bg-[#101113]"
                >
                  <Radio className="size-3.5" aria-hidden="true" />
                  rooms
                </Link>
              </div>
            </div>

            <StatusPanel stats={stats} channels={liveChannels} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr_0.55fr] lg:px-8">
        <Panel label="rooms">
          {liveChannels.length === 0 ? (
            <EmptyState label="no rooms" />
          ) : (
            <div className="space-y-2">
              {liveChannels.map((channel) => (
                <RoomSession key={channel.id} channel={channel} />
              ))}
            </div>
          )}
        </Panel>

        <Panel label="staff">
          {staffPreview.length === 0 ? (
            <EmptyState label="empty" />
          ) : (
            <div className="space-y-3">
              {staffPreview.map((member) => (
                <StaffLine key={member.id} member={member} />
              ))}
            </div>
          )}
        </Panel>

        <Panel label="links">
          <div className="space-y-2">
            {actionLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-10 items-center justify-between border border-[#1c1c1f] bg-[#0a0a0b] px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c7c5bd] transition hover:border-[#5d6268]"
              >
                {item.label}
                <span className="h-px w-5 bg-[#4c4d50]" />
              </Link>
            ))}
          </div>
        </Panel>
      </section>
    </SiteShell>
  );
}

function StatusPanel({ stats, channels }: { stats: ServerStats; channels: VoiceChannel[] }) {
  return (
    <aside className="border-l border-[#29292c] bg-[#050505]/52 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-[#1d1d20] pb-4">
        <div className="relative size-14 overflow-hidden rounded-[3px] border border-[#242427] bg-[#070707]">
          <Image
            src="/images/galore-profile.jpeg"
            alt="# galore"
            fill
            sizes="56px"
            className="object-cover object-[55%_34%] opacity-85 grayscale brightness-[0.48] contrast-125 saturate-[0.6]"
          />
          <div className="absolute inset-0 bg-black/32" />
          <div className="grain-overlay absolute inset-0 opacity-70" />
        </div>
        <p className="text-sm font-medium tracking-[-0.02em] text-[#e2dfd8]"># galore</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="members" value={stats.totalMembers} />
        <Metric label="online" value={stats.onlineMembers} />
        <Metric label="in vc" value={stats.peopleInVc} />
        <Metric label="open rooms" value={stats.openPublicVcs} />
      </div>

      <div className="mt-5 border-t border-[#1d1d20] pt-3">
        <div className="space-y-2">
          {channels.length === 0 ? (
            <EmptyState label="no rooms" />
          ) : (
            channels.slice(0, 3).map((channel) => (
              <RoomSession key={channel.id} channel={channel} compact />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6c6d69]">{label}</p>
      <p className="mt-1 font-mono text-2xl text-[#eeeae2]">{value.toLocaleString()}</p>
    </div>
  );
}

function Panel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#18181a] bg-[#070707]/88 p-4 sm:p-5">
      <p className="mb-5 border-b border-[#1b1b1d] pb-4 font-mono text-[10px] uppercase tracking-[0.34em] text-[#70716d]">
        {label}
      </p>
      {children}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-[#242427] bg-[#050505] px-3 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#555651]">
      {label}
    </div>
  );
}

function RoomSession({ channel, compact = false }: { channel: VoiceChannel; compact?: boolean }) {
  const active = channel.members.length > 0;

  return (
    <article className="border border-[#1c1c1f] bg-[#0b0b0c] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${active ? "bg-[#aeb4b8]" : "bg-[#38393b]"}`} />
          <p className={`truncate text-sm font-medium tracking-[-0.02em] ${active ? "text-[#e2dfd8]" : "text-[#676762]"}`}>
            {channel.name}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#747571]">
          {active ? channel.members.length : "empty"}
        </span>
      </div>
      {active && !compact ? (
        <div className="mt-3 space-y-2">
          {channel.members.slice(0, 3).map((member) => (
            <div key={member.userId} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar src={member.avatarUrl} name={member.displayName} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={member.status} />
                    <p className="truncate text-xs text-[#d5d2cb]">{member.displayName}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 text-[#7b7c78]">
                {member.selfMute || member.serverMute ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                {member.selfDeaf || member.serverDeaf ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function StaffLine({ member }: { member: StaffMember }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#18181a] pb-3 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar src={member.avatarUrl} name={member.displayName} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#dedbd4]">{member.displayName}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#73746f]">{member.rank}</p>
        </div>
      </div>
      <Shield className="size-3.5 text-[#737a80]" aria-hidden="true" />
    </div>
  );
}

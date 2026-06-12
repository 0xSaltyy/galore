import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  FileText,
  Headphones,
  Mic,
  MicOff,
  Radio,
  Shield,
  Users,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/avatar";
import { DiscordInviteLink } from "@/components/discord-invite-link";
import { SiteShell } from "@/components/site-shell";
import { StatusDot } from "@/components/status";
import {
  getEvents,
  getServerStats,
  getStaffMembers,
  getVoiceSnapshot,
} from "@/lib/public-data";
import type { ServerEvent, ServerStats, StaffMember, VoiceChannel } from "@/lib/types";

export const dynamic = "force-dynamic";

const notices = [
  "private voice spaces.",
  "voice first, text second.",
  "late rooms stay open.",
];

export default async function Home() {
  const [stats, channels, events, staff] = await Promise.all([
    getServerStats(),
    getVoiceSnapshot(),
    getEvents(),
    getStaffMembers(),
  ]);

  const liveChannels = [...channels].sort((a, b) => b.members.length - a.members.length).slice(0, 4);
  const staffPreview = staff.slice(0, 5);
  const nextEvent = events[0];

  return (
    <SiteShell>
      <section className="relative isolate min-h-[650px] overflow-hidden border-b border-[#17171a]">
        <Image
          src="/images/galore-profile.jpeg"
          alt="# galore profile"
          fill
          priority
          className="object-cover object-[55%_34%] opacity-70 grayscale brightness-[0.42] contrast-125 saturate-[0.55]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/58" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#030303_0%,rgba(3,3,3,0.9)_36%,rgba(3,3,3,0.5)_100%),linear-gradient(180deg,rgba(3,3,3,0.16),#030303_96%)]" />
        <div className="grain-overlay absolute inset-0 opacity-80" />

        <div className="relative mx-auto flex min-h-[650px] max-w-7xl flex-col justify-end px-4 pb-9 pt-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.42em] text-[#aaa9a3]">
                private after dark
              </p>
              <h1 className="mt-4 max-w-4xl text-[clamp(3.8rem,9vw,7.25rem)] font-semibold leading-[0.84] tracking-[-0.07em] text-[#f0ede7]">
                # galore
              </h1>
              <p className="mt-6 max-w-xl text-xl font-medium tracking-[-0.03em] text-[#dad7d0] sm:text-2xl">
                late-night calls, cool people, live rooms.
              </p>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#8e8c86]">
                A private voice floor with low light, real calls, and no lobby noise.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <DiscordInviteLink />
                <Link
                  href="/live-vc"
                  className="inline-flex h-9 items-center gap-2 rounded-sm border border-[#2a2a2d] bg-[#08090a]/82 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c7c5bd] transition hover:border-[#5d6268] hover:bg-[#101113]"
                >
                  <Radio className="size-3.5" aria-hidden="true" />
                  live now
                </Link>
              </div>
            </div>

            <aside className="border-l border-[#29292c] bg-[#050505]/52 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 border-b border-[#1d1d20] pb-4">
                <div className="relative size-14 overflow-hidden rounded-[3px] border border-[#242427] bg-[#070707]">
                  <Image
                    src="/images/galore-profile.jpeg"
                    alt="# galore server profile"
                    fill
                    sizes="56px"
                    className="object-cover object-[55%_34%] opacity-85 grayscale brightness-[0.48] contrast-125 saturate-[0.6]"
                  />
                  <div className="absolute inset-0 bg-black/32" />
                  <div className="grain-overlay absolute inset-0 opacity-70" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#777873]">live now</p>
                  <p className="mt-1 text-sm font-medium tracking-[-0.02em] text-[#e2dfd8]"># galore</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Metric label="online" value={stats.onlineMembers} />
                <Metric label="in vc" value={stats.peopleInVc} />
                <Metric label="rooms" value={stats.openPublicVcs} />
              </div>
              <div className="mt-5 space-y-2">
                {notices.map((notice) => (
                  <p key={notice} className="border-t border-[#1d1d20] pt-2 text-sm tracking-[-0.02em] text-[#aaa8a1]">
                    {notice}
                  </p>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <EditorialBlock eyebrow="live now" title="server profile.">
          <ProfileMoodCard stats={stats} nextEvent={nextEvent} />
        </EditorialBlock>

        <EditorialBlock eyebrow="rooms" title="live rooms.">
          {liveChannels.length === 0 ? (
            <EmptyVoiceState />
          ) : (
            <div className="space-y-2">
              {liveChannels.map((channel) => (
                <RoomSession key={channel.id} channel={channel} />
              ))}
            </div>
          )}
        </EditorialBlock>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <EditorialBlock eyebrow="inner circle" title="roster.">
          {staffPreview.length === 0 ? (
            <p className="text-sm leading-6 text-[#84827d]">No public roster yet.</p>
          ) : (
            <div className="space-y-3">
              {staffPreview.map((member) => (
                <StaffLine key={member.id} member={member} />
              ))}
            </div>
          )}
        </EditorialBlock>

        <EditorialBlock eyebrow="applications" title="keys to the room.">
          <ApplicationPanel />
        </EditorialBlock>

        <EditorialBlock eyebrow="notices" title="posted up.">
          {nextEvent ? (
            <EventLine event={nextEvent} />
          ) : (
            <p className="text-sm leading-6 text-[#84827d]">No event posted yet.</p>
          )}
          <div className="mt-5 space-y-2 border-t border-[#1b1b1d] pt-4">
            {notices.map((notice) => (
              <div key={notice} className="flex items-center gap-2 text-sm text-[#aaa8a1]">
                <span className="h-px w-5 bg-[#3b3b3f]" />
                {notice}
              </div>
            ))}
          </div>
        </EditorialBlock>
      </section>
    </SiteShell>
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

function EditorialBlock({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#18181a] bg-[#070707]/88 p-4 sm:p-5">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#1b1b1d] pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#70716d]">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-medium tracking-[-0.04em] text-[#e7e4dd]">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function ProfileMoodCard({
  stats,
  nextEvent,
}: {
  stats: ServerStats;
  nextEvent?: ServerEvent;
}) {
  return (
    <div>
      <div className="relative min-h-[310px] overflow-hidden border border-[#1b1b1d] bg-[#050505]">
        <Image
          src="/images/galore-profile.jpeg"
          alt="# galore low-light profile"
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          className="object-cover object-[55%_34%] opacity-82 grayscale brightness-[0.45] contrast-125 saturate-[0.6]"
        />
        <div className="absolute inset-0 bg-black/48" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.05),#050505_92%),linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.28)_68%)]" />
        <div className="grain-overlay absolute inset-0 opacity-80" />
        <div className="relative flex min-h-[310px] flex-col justify-end p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#8b8b86]">server profile</p>
          <p className="mt-2 text-3xl font-medium tracking-[-0.06em] text-[#f0ede7]"># galore</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-[#aaa8a1]">
            Private calls, low light, and rooms that stay moving after dark.
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MoodStat icon={Users} label="online" value={stats.onlineMembers} />
        <MoodStat icon={Headphones} label="in voice" value={stats.peopleInVc} />
      </div>
      <div className="mt-3 border border-[#1c1c1f] bg-[#0a0a0b] p-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#777873]">
          <Bell className="size-3.5" aria-hidden="true" />
          next
        </div>
        <p className="mt-2 text-sm text-[#dedbd4]">{nextEvent ? nextEvent.title : "No event posted yet."}</p>
      </div>
    </div>
  );
}

function EmptyVoiceState() {
  return (
    <div className="border border-dashed border-[#242427] bg-[#050505] px-4 py-6 text-sm leading-6 text-[#898782]">
      No live voice data yet. Start the Discord bot with{" "}
      <code className="border border-[#27272a] bg-[#0d0d0e] px-1.5 py-0.5 font-mono text-[12px] text-[#d5d2cb]">
        npm run bot:dev
      </code>{" "}
      and join a voice channel.
    </div>
  );
}

function RoomSession({ channel }: { channel: VoiceChannel }) {
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
          {active ? `${channel.members.length} live` : "closed"}
        </span>
      </div>
      {active ? (
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

function ApplicationPanel() {
  return (
    <div className="space-y-4">
      <div className="border border-[#1c1c1f] bg-[#0a0a0b] p-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#777873]">
          <FileText className="size-3.5" aria-hidden="true" />
          staff applications
        </div>
        <p className="mt-3 text-sm leading-6 text-[#aaa8a1]">
          Applications stay open for people who can keep calls calm without killing the room.
        </p>
      </div>
      <Link
        href="/applications"
        className="inline-flex h-9 items-center gap-2 border border-[#2a2a2d] bg-[#08090a]/82 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c7c5bd] transition hover:border-[#5d6268] hover:bg-[#101113]"
      >
        application form
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

function EventLine({ event }: { event: ServerEvent }) {
  return (
    <div className="flex items-start gap-3">
      <CalendarDays className="mt-0.5 size-4 text-[#858c92]" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-[#dedbd4]">{event.title}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#747571]">
          {new Date(event.startsAt).toLocaleString()}
        </p>
        <p className="mt-3 text-sm leading-6 text-[#8f8d87]">{event.description}</p>
      </div>
    </div>
  );
}

function MoodStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="border border-[#1c1c1f] bg-[#0a0a0b] p-3">
      <Icon className="size-4 text-[#737a80]" aria-hidden="true" />
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6d6e69]">{label}</p>
      <p className="mt-1 font-mono text-xl text-[#e2dfd8]">{value.toLocaleString()}</p>
    </div>
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

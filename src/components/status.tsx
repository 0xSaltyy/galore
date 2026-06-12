import type { DiscordStatus } from "@/lib/types";

const labels: Record<DiscordStatus, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "DND",
  offline: "Offline",
  unknown: "Unknown",
};

const colors: Record<DiscordStatus, string> = {
  online: "bg-[#5f8a70]",
  idle: "bg-[#8c7b55]",
  dnd: "bg-[#8f4d58]",
  offline: "bg-[#505158]",
  unknown: "bg-[#5c5d64]",
};

export function StatusDot({ status }: { status: DiscordStatus }) {
  return (
    <span
      className={`inline-block size-2 rounded-full ${colors[status]}`}
      aria-label={labels[status]}
    />
  );
}

export function StatusPill({ status }: { status: DiscordStatus }) {
  return (
    <span className="inline-flex items-center gap-2 rounded border border-[#24242a] bg-[#101014] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b9ca2]">
      <StatusDot status={status} />
      {labels[status]}
    </span>
  );
}

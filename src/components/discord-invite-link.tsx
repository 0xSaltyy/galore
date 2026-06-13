import { Signal } from "lucide-react";

import { getDiscordInviteConfig } from "@/lib/discord-config";

const baseClass =
  "inline-flex h-9 items-center gap-2 rounded-sm border px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] transition";

export function DiscordInviteLink({ compact = false }: { compact?: boolean }) {
  const invite = getDiscordInviteConfig();

  if (!invite.ok) {
    return (
      <span
        aria-disabled="true"
        aria-label="Discord invite unavailable"
        title="Discord invite unavailable"
        className={`${baseClass} cursor-not-allowed border-[#252528] bg-[#08090a]/70 text-[#6f706b] opacity-70`}
      >
        <Signal className="size-3.5" aria-hidden="true" />
        {compact ? "" : "enter"}
      </span>
    );
  }

  return (
    <a
      href={invite.url}
      className={`${baseClass} border-[#2a2a2d] bg-[#0a0a0b]/80 text-[#d8d5cf] hover:border-[#686b70] hover:bg-[#121214]`}
    >
      <Signal className="size-3.5" aria-hidden="true" />
      enter
    </a>
  );
}

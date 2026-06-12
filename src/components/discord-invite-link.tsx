import { Signal } from "lucide-react";

import { getDiscordInviteConfig } from "@/lib/discord-config";

const baseClass =
  "inline-flex h-9 items-center gap-2 rounded-sm border px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] transition";

export function DiscordInviteLink({ compact = false }: { compact?: boolean }) {
  const invite = getDiscordInviteConfig();

  if (!invite.ok) {
    const label = invite.error.includes("missing") ? "Invite env missing" : "Invite env invalid";

    return (
      <span
        aria-disabled="true"
        aria-label={invite.error}
        title={invite.error}
        className={`${baseClass} cursor-not-allowed border-[#35282b] bg-[#100d0e] text-[#bda5aa]`}
      >
        <Signal className="size-3.5" aria-hidden="true" />
        {compact ? label.replace(" env", "") : label}
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

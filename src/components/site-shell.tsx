import Link from "next/link";
import Image from "next/image";

import { DiscordInviteLink } from "@/components/discord-invite-link";
import { NavLinks } from "@/components/nav-links";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#030303] text-[#e6e4df]">
      <div className="grid-floor pointer-events-none fixed inset-0 opacity-25" />
      <div className="grain-overlay pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(104,112,120,0.16),transparent_30%),linear-gradient(180deg,rgba(3,3,3,0.18),#030303_84%)]" />
      <header className="sticky top-0 z-40 border-b border-[#18181a] bg-[#030303]/82 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex h-14 items-center gap-3 py-4">
            <span className="relative size-7 overflow-hidden rounded-[3px] border border-[#232326] bg-[#070707]">
              <Image
                src="/images/galore-profile.jpeg"
                alt="# galore profile"
                fill
                sizes="28px"
                className="object-cover object-[54%_34%] opacity-80 grayscale brightness-[0.48] contrast-125 saturate-[0.6]"
              />
              <span className="absolute inset-0 bg-black/38" />
              <span className="grain-overlay absolute inset-0 opacity-60" />
            </span>
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[#d8d5cf]">
              # galore
            </span>
            <span className="hidden h-px w-9 bg-[#3a3a3d] sm:block" />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-[#666762] group-hover:text-[#9b9b96] sm:block">
              private rooms
            </span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            <NavLinks />
          </div>
          <DiscordInviteLink compact />
        </nav>
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-[#111116] px-4 sm:px-6 lg:hidden lg:px-8">
          <NavLinks compact />
        </div>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 border-t border-[#18181a] px-4 py-7 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#555550]">
        # galore / private voice spaces / live rooms
      </footer>
    </div>
  );
}

export function PageSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 ${className}`}>{children}</section>;
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 max-w-3xl">
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8c8e8b]">{eyebrow}</p>
      <h1 className="text-3xl font-medium tracking-[-0.06em] text-[#f0ede7] sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8d8b85] sm:text-base">{description}</p>
    </div>
  );
}

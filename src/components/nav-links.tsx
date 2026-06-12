"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CalendarDays, FileText, LayoutDashboard, MessageSquareWarning, Radio, Shield, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Activity },
  { href: "/live-vc", label: "Live", icon: Radio },
  { href: "/staff", label: "Staff", icon: Shield },
  { href: "/applications", label: "Apply", icon: FileText },
  { href: "/report", label: "Report", icon: MessageSquareWarning },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
];

export function NavLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative inline-flex shrink-0 items-center gap-2 border-b px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] transition ${
              compact ? "h-9" : "h-14"
            } ${
              active
                ? "border-[#a2a5a7] text-[#e6e4df]"
                : "border-transparent text-[#74736f] hover:border-[#3c3c3f] hover:text-[#c8c6bf]"
            }`}
          >
            <item.icon className="size-3.5 opacity-70" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

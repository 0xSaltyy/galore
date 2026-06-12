import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "red",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "red" | "blue" | "zinc";
}) {
  const toneClass = {
    red: "border-[#2b2d31] bg-[#0b0c0d] text-[#b4bbc0]",
    blue: "border-[#242b31] bg-[#090b0d] text-[#a6b0b7]",
    zinc: "border-[#252527] bg-[#0b0b0c] text-[#b8b6b0]",
  }[tone];

  return (
    <div className="border border-[#1b1b1d] bg-[#070708] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6d6e69]">{label}</p>
          <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-[#e6e4df]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <span className={`grid size-8 place-items-center border ${toneClass}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

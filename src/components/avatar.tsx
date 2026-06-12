import Image from "next/image";
import { UserRound } from "lucide-react";

export function Avatar({
  src,
  name,
  size = "md",
}: {
  src: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "size-9",
    md: "size-11",
    lg: "size-14",
  }[size];
  const pixels = {
    sm: 36,
    md: 44,
    lg: 56,
  }[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={`${name} avatar`}
        width={pixels}
        height={pixels}
        className={`${sizeClass} shrink-0 rounded-md border border-[#24242a] bg-[#101014] object-cover`}
        unoptimized
      />
    );
  }

  return (
    <div
      className={`${sizeClass} grid shrink-0 place-items-center rounded-md border border-[#24242a] bg-[#101014] text-[#686970]`}
      aria-label={`${name} avatar fallback`}
    >
      <UserRound className="size-5" aria-hidden="true" />
    </div>
  );
}

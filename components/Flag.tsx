/* eslint-disable @next/next/no-img-element */
import type { SideDisplay } from "@/lib/teams";

/**
 * Renders a team flag: an image URL if present, otherwise an emoji flag,
 * otherwise a neutral placeholder for TBD knockout slots.
 */
export default function Flag({
  side,
  className = "",
  size = "text-2xl",
}: {
  side: Pick<SideDisplay, "flag" | "flagUrl" | "isTbd">;
  className?: string;
  size?: string;
}) {
  if (side.flagUrl) {
    return (
      <img
        src={side.flagUrl}
        alt=""
        className={`inline-block h-6 w-9 rounded-sm object-cover ${className}`}
      />
    );
  }
  if (side.flag) {
    return (
      <span className={`${size} leading-none ${className}`} aria-hidden>
        {side.flag}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs text-white/40 ${className}`}
      aria-hidden
    >
      ?
    </span>
  );
}

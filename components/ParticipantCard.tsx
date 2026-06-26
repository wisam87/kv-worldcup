/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import CountUp from "./CountUp";
import type { LeaderboardRow } from "@/lib/types";

const RANK_STYLES: Record<
  number,
  { ring: string; badge: string; medal: string; glow: string }
> = {
  1: {
    ring: "ring-2 ring-gold-400",
    badge: "bg-gradient-to-br from-gold-300 to-gold-500 text-pitch-950",
    medal: "🥇",
    glow: "shadow-[0_0_40px_-8px_rgba(245,197,66,0.55)]",
  },
  2: {
    ring: "ring-2 ring-slate-300/70",
    badge: "bg-gradient-to-br from-slate-100 to-slate-400 text-pitch-950",
    medal: "🥈",
    glow: "shadow-[0_0_30px_-10px_rgba(203,213,225,0.5)]",
  },
  3: {
    ring: "ring-2 ring-amber-600/70",
    badge: "bg-gradient-to-br from-amber-400 to-amber-700 text-pitch-950",
    medal: "🥉",
    glow: "shadow-[0_0_30px_-10px_rgba(217,119,6,0.5)]",
  },
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ParticipantCard({
  row,
  rank,
  index,
}: {
  row: LeaderboardRow;
  rank: number;
  index: number;
}) {
  const top = RANK_STYLES[rank];

  return (
    <Link
      href={`/participants/${row.id}`}
      className={`rise group relative flex flex-col items-center gap-3 rounded-2xl card-glass p-4 text-center transition duration-300 hover:-translate-y-1 hover:border-white/25 ${
        top ? top.glow : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      {/* Rank chip */}
      <span
        className={`absolute left-3 top-3 grid h-7 min-w-7 place-items-center rounded-full px-2 text-xs font-700 ${
          top ? top.badge : "bg-white/10 text-white/70"
        }`}
      >
        {top ? top.medal : `#${rank}`}
      </span>

      {/* Avatar */}
      <div
        className={`relative mt-3 h-20 w-20 overflow-hidden rounded-full bg-pitch-700 ${
          top ? top.ring : "ring-1 ring-white/15"
        }`}
      >
        {row.photo_url ? (
          <img
            src={row.photo_url}
            alt={row.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-2xl font-700 text-gold-300">
            {initials(row.name) || "?"}
          </span>
        )}
      </div>

      <h3 className="line-clamp-1 font-display text-base font-600 uppercase tracking-wide text-white">
        {row.name}
      </h3>

      <div className="flex items-baseline gap-1">
        <CountUp
          value={row.total_points}
          className="font-display text-4xl font-700 leading-none text-gold-400"
        />
        <span className="text-xs font-600 uppercase tracking-widest text-white/50">
          pts
        </span>
      </div>

      <div className="flex items-center gap-2.5 text-[11px] font-500 text-white/55">
        <span title="Exact scores (3 pts)">🎯 {row.exact_hits}</span>
        <span className="h-3 w-px bg-white/15" />
        <span title="Right outcomes (1 pt)">
          ✅ {row.correct_hits - row.exact_hits}
        </span>
        <span className="h-3 w-px bg-white/15" />
        <span title="Submissions">📝 {row.predictions_made}</span>
      </div>
    </Link>
  );
}

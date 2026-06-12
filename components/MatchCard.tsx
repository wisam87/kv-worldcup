import Flag from "./Flag";
import { homeSide, awaySide } from "@/lib/teams";
import { formatTime } from "@/lib/format";
import type { MatchWithTeams } from "@/lib/types";

function Side({
  side,
  align,
}: {
  side: ReturnType<typeof homeSide>;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <Flag side={side} />
      <span
        className={`line-clamp-2 text-sm font-600 ${
          side.isTbd ? "text-white/45" : "text-white"
        }`}
      >
        {side.name}
      </span>
    </div>
  );
}

export default function MatchCard({ match }: { match: MatchWithTeams }) {
  const home = homeSide(match);
  const away = awaySide(match);
  const finished = match.status === "finished";

  return (
    <div className="flex items-center gap-3 rounded-xl card-glass px-3 py-3">
      <Side side={home} align="left" />

      <div className="flex shrink-0 flex-col items-center">
        {finished ? (
          <div className="flex items-center gap-1 font-display text-xl font-700 tabular-nums text-gold-400">
            <span>{match.home_score}</span>
            <span className="text-white/30">·</span>
            <span>{match.away_score}</span>
          </div>
        ) : (
          <div className="font-display text-sm font-600 tabular-nums text-white/70">
            {formatTime(match.kickoff_time)}
          </div>
        )}
        <span
          className={`mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-700 uppercase tracking-wider ${
            finished
              ? "bg-gold-500/15 text-gold-300"
              : "bg-white/10 text-white/50"
          }`}
        >
          {finished ? "FT" : match.group_name ? `Group ${match.group_name}` : "TBD"}
        </span>
      </div>

      <Side side={away} align="right" />
    </div>
  );
}

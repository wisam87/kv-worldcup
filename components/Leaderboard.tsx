import ParticipantCard from "./ParticipantCard";
import type { LeaderboardRow } from "@/lib/types";

export default function Leaderboard({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl card-glass px-6 py-16 text-center">
        <div className="mb-3 text-4xl">⚽️</div>
        <p className="font-display text-lg font-600 uppercase tracking-wide text-white">
          No participants yet
        </p>
        <p className="mt-1 text-sm text-white/60">
          An admin can add participants and predictions to get the board
          rolling.
        </p>
      </div>
    );
  }

  // Dense ranking: players share a rank only when both points and exact-score
  // hits match — more exact scores breaks a points tie in your favour.
  let lastPoints: number | null = null;
  let lastExact: number | null = null;
  let lastRank = 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {rows.map((row, i) => {
        if (
          lastPoints === null ||
          row.total_points !== lastPoints ||
          row.exact_hits !== lastExact
        ) {
          lastRank = i + 1;
          lastPoints = row.total_points;
          lastExact = row.exact_hits;
        }
        return (
          <ParticipantCard key={row.id} row={row} rank={lastRank} index={i} />
        );
      })}
    </div>
  );
}

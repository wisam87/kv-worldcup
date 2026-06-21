/* eslint-disable @next/next/no-img-element */
import type { Participant } from "@/lib/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PendingPredictors({
  participants,
}: {
  participants: Participant[];
}) {
  if (participants.length === 0) return null;

  return (
    <div className="rounded-2xl card-glass p-5">
      <h2 className="mb-1 font-display text-lg font-600 uppercase tracking-wide text-white">
        Awaiting predictions
      </h2>
      <p className="mb-4 text-xs text-white/50">
        Scoring participants who haven’t submitted a prediction for this match
        yet.
      </p>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {participants.map((p) => (
          <li key={p.id} className="flex flex-col items-center gap-1.5">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-pitch-700 ring-1 ring-white/15">
              {p.photo_url ? (
                <img
                  src={p.photo_url}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center font-display text-sm font-700 text-gold-300">
                  {initials(p.name) || "?"}
                </span>
              )}
            </div>
            <span className="line-clamp-1 max-w-[5rem] text-center text-[11px] font-500 text-white/70">
              {p.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

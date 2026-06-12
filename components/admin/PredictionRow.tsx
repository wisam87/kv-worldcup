"use client";

import { useState } from "react";
import PredictionForm from "./PredictionForm";
import { deletePrediction } from "@/app/admin/matches/actions";
import type { PredictionWithParticipant } from "@/lib/types";

const POINT_STYLES: Record<number, string> = {
  3: "bg-gold-500/20 text-gold-300 border-gold-500/40",
  1: "bg-azure-500/20 text-azure-100 border-azure-500/40",
  0: "bg-white/5 text-white/40 border-white/10",
};

export default function PredictionRow({
  prediction,
  matchId,
  finished,
}: {
  prediction: PredictionWithParticipant;
  matchId: string;
  finished: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const name = prediction.participant?.name ?? "Unknown";

  if (editing) {
    return (
      <li className="rounded-xl card-glass p-3">
        <PredictionForm
          matchId={matchId}
          fixedParticipant={{ id: prediction.participant_id, name }}
          defaultHome={prediction.predicted_home}
          defaultAway={prediction.predicted_away}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-xl card-glass px-3 py-2.5">
      <span className="flex-1 truncate text-sm font-600 text-white">
        {name}
      </span>

      <span className="font-display text-lg font-700 tabular-nums text-white/90">
        {prediction.predicted_home}–{prediction.predicted_away}
      </span>

      {finished && (
        <span
          className={`w-12 rounded-full border px-2 py-0.5 text-center text-[11px] font-700 ${
            POINT_STYLES[prediction.points_awarded] ?? POINT_STYLES[0]
          }`}
        >
          +{prediction.points_awarded}
        </span>
      )}

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg px-2.5 py-1.5 text-xs font-600 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Edit
        </button>
        <form action={deletePrediction}>
          <input type="hidden" name="id" value={prediction.id} />
          <input type="hidden" name="matchId" value={matchId} />
          <button className="rounded-lg px-2.5 py-1.5 text-xs font-600 text-flame-300 transition hover:bg-flame-600/15">
            ✕
          </button>
        </form>
      </div>
    </li>
  );
}

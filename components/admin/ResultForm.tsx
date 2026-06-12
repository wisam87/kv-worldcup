"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveResult, clearResult, type ActionState } from "@/app/admin/matches/actions";

function Save({ locked }: { locked: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || locked}
      className="rounded-xl bg-gold-500 px-6 py-3 font-display text-sm font-700 uppercase tracking-widest text-pitch-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save result"}
    </button>
  );
}

export default function ResultForm({
  matchId,
  homeName,
  awayName,
  homeScore,
  awayScore,
  finished,
  locked,
  unlockLabel,
}: {
  matchId: string;
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  finished: boolean;
  locked: boolean;
  unlockLabel: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveResult, {
    error: null,
  });

  return (
    <div className="space-y-3">
      {locked && (
        <p className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70">
          🔒 Results unlock 2 hours after kickoff — available {unlockLabel}.
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="matchId" value={matchId} />

        <div className="flex items-end justify-center gap-3 sm:gap-5">
          <ScoreInput
            name="home_score"
            label={homeName}
            defaultValue={homeScore}
            disabled={locked}
          />
          <span className="pb-3 font-display text-2xl text-white/30">–</span>
          <ScoreInput
            name="away_score"
            label={awayName}
            defaultValue={awayScore}
            disabled={locked}
          />
        </div>

        {state.error && (
          <p className="rounded-lg border border-flame-500/40 bg-flame-600/15 px-3 py-2 text-center text-sm text-flame-100">
            {state.error}
          </p>
        )}

        <div className="flex items-center justify-center gap-2">
          <Save locked={locked} />
        </div>
      </form>

      {finished && (
        <form action={clearResult} className="text-center">
          <input type="hidden" name="matchId" value={matchId} />
          <button className="text-xs font-600 text-white/50 underline-offset-2 transition hover:text-flame-300 hover:underline">
            Clear result
          </button>
        </form>
      )}
    </div>
  );
}

function ScoreInput({
  name,
  label,
  defaultValue,
  disabled,
}: {
  name: string;
  label: string;
  defaultValue: number | null;
  disabled: boolean;
}) {
  return (
    <label className="flex flex-col items-center gap-2">
      <span className="line-clamp-1 max-w-[7rem] text-center text-xs font-600 uppercase tracking-wide text-white/60">
        {label}
      </span>
      <input
        name={name}
        type="number"
        min={0}
        max={99}
        inputMode="numeric"
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        placeholder="0"
        className="h-20 w-20 rounded-2xl border border-white/15 bg-white/5 text-center font-display text-4xl font-700 text-white outline-none transition placeholder:text-white/20 focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20 disabled:opacity-40"
      />
    </label>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { savePrediction, type ActionState } from "@/app/admin/matches/actions";
import type { Participant } from "@/lib/types";

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-gold-500 px-4 py-2 font-display text-xs font-700 uppercase tracking-widest text-pitch-950 transition hover:bg-gold-400 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function PredictionForm({
  matchId,
  availableParticipants,
  fixedParticipant,
  defaultHome,
  defaultAway,
  onDone,
}: {
  matchId: string;
  /** Participants selectable when adding a new prediction. */
  availableParticipants?: Participant[];
  /** When editing, the participant is fixed. */
  fixedParticipant?: Pick<Participant, "id" | "name">;
  defaultHome?: number;
  defaultAway?: number;
  onDone?: () => void;
}) {
  const editing = Boolean(fixedParticipant);
  const [state, formAction] = useActionState<ActionState, FormData>(
    savePrediction,
    { error: null }
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      if (editing) onDone?.();
      else formRef.current?.reset();
    }
  }, [state.ok, editing, onDone]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="matchId" value={matchId} />

      {fixedParticipant ? (
        <>
          <input
            type="hidden"
            name="participant_id"
            value={fixedParticipant.id}
          />
          <span className="flex-1 py-2 text-sm font-600 text-white">
            {fixedParticipant.name}
          </span>
        </>
      ) : (
        <label className="min-w-[10rem] flex-1">
          <span className="mb-1 block text-[11px] font-600 uppercase tracking-widest text-white/55">
            Participant
          </span>
          <select
            name="participant_id"
            required
            defaultValue=""
            className="w-full rounded-xl border border-white/15 bg-pitch-900 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
          >
            <option value="" disabled>
              Select…
            </option>
            {availableParticipants?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex items-end gap-1.5">
        <ScoreBox name="predicted_home" defaultValue={defaultHome} />
        <span className="pb-2 text-white/40">–</span>
        <ScoreBox name="predicted_away" defaultValue={defaultAway} />
      </div>

      <Save label={editing ? "Save" : "Add"} />
      {editing && onDone && (
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-600 text-white/60 transition hover:text-white"
        >
          Cancel
        </button>
      )}

      {state.error && (
        <p className="w-full rounded-lg border border-flame-500/40 bg-flame-600/15 px-3 py-1.5 text-xs text-flame-100">
          {state.error}
        </p>
      )}
    </form>
  );
}

function ScoreBox({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: number;
}) {
  return (
    <input
      name={name}
      type="number"
      min={0}
      max={99}
      required
      inputMode="numeric"
      defaultValue={defaultValue ?? ""}
      placeholder="0"
      className="h-11 w-12 rounded-xl border border-white/15 bg-white/5 text-center font-display text-xl font-700 text-white outline-none placeholder:text-white/20 focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
    />
  );
}

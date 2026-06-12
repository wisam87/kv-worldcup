"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createParticipant,
  updateParticipant,
  type ParticipantState,
} from "@/app/admin/participants/actions";
import type { Participant } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-gold-500 px-5 py-2.5 font-display text-sm font-700 uppercase tracking-widest text-pitch-950 transition hover:bg-gold-400 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function ParticipantForm({
  participant,
  onDone,
}: {
  participant?: Participant;
  onDone?: () => void;
}) {
  const editing = Boolean(participant);
  const action = editing ? updateParticipant : createParticipant;
  const [state, formAction] = useActionState<ParticipantState, FormData>(
    action,
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
    <form ref={formRef} action={formAction} className="space-y-3">
      {participant && (
        <input type="hidden" name="id" value={participant.id} />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-600 uppercase tracking-widest text-white/55">
            Name
          </span>
          <input
            name="name"
            defaultValue={participant?.name ?? ""}
            required
            placeholder="Participant name"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none transition placeholder:text-white/30 focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
          />
        </label>

        <label className="flex-1">
          <span className="mb-1 block text-xs font-600 uppercase tracking-widest text-white/55">
            Photo {editing && "(replace)"}
          </span>
          <input
            name="photo"
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-gold-500/90 file:px-3 file:py-1.5 file:font-600 file:text-pitch-950 hover:file:bg-gold-400"
          />
        </label>
      </div>

      {state.error && (
        <p className="rounded-lg border border-flame-500/40 bg-flame-600/15 px-3 py-2 text-sm text-flame-100">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Submit label={editing ? "Save changes" : "Add participant"} />
        {editing && onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-600 text-white/70 transition hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

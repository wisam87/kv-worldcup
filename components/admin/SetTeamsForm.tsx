"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setTeams, type ActionState } from "@/app/admin/matches/actions";
import type { Team } from "@/lib/types";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-600 text-white transition hover:border-gold-400/60 hover:text-gold-300 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save teams"}
    </button>
  );
}

function TeamSelect({
  name,
  teams,
  defaultValue,
  label,
}: {
  name: string;
  teams: Team[];
  defaultValue: string | null;
  label: string;
}) {
  return (
    <label className="flex-1">
      <span className="mb-1 block text-xs font-600 uppercase tracking-widest text-white/55">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl border border-white/15 bg-pitch-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
      >
        <option value="">— TBD —</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.flag ? `${t.flag} ` : ""}
            {t.name}
            {t.group_name ? ` (${t.group_name})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SetTeamsForm({
  matchId,
  teams,
  homeTeamId,
  awayTeamId,
}: {
  matchId: string;
  teams: Team[];
  homeTeamId: string | null;
  awayTeamId: string | null;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(setTeams, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="matchId" value={matchId} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <TeamSelect
          name="home_team_id"
          teams={teams}
          defaultValue={homeTeamId}
          label="Home team"
        />
        <TeamSelect
          name="away_team_id"
          teams={teams}
          defaultValue={awayTeamId}
          label="Away team"
        />
      </div>
      {state.error && (
        <p className="rounded-lg border border-flame-500/40 bg-flame-600/15 px-3 py-2 text-sm text-flame-100">
          {state.error}
        </p>
      )}
      <Save />
    </form>
  );
}

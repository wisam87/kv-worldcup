"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import ParticipantForm from "./ParticipantForm";
import { deleteParticipant, removePhoto } from "@/app/admin/participants/actions";
import { formatShortKickoff } from "@/lib/format";
import type {
  Participant,
  ParticipantMatchBreakdown,
} from "@/lib/types";

function PointsBadge({ points }: { points: number }) {
  const style =
    points === 3
      ? "bg-gold-500/15 text-gold-300"
      : points === 1
        ? "bg-azure-500/20 text-azure-100"
        : "bg-white/10 text-white/45";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-700 uppercase tracking-wider ${style}`}
    >
      +{points}
    </span>
  );
}

function side(name: string, flag: string | null) {
  return flag ? `${name} ${flag}` : name;
}

function Breakdown({ rows }: { rows: ParticipantMatchBreakdown[] }) {
  if (rows.length === 0) {
    return (
      <p className="px-1 py-2 text-xs text-white/45">
        No matches with results yet.
      </p>
    );
  }
  return (
    <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
      {rows.map((r) => (
        <li
          key={r.matchId}
          className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-600 text-white">
              {side(r.home.name, r.home.flag)}{" "}
              <span className="tabular-nums text-gold-400">
                {r.homeScore}–{r.awayScore}
              </span>{" "}
              {side(r.away.name, r.away.flag)}
            </p>
            <p className="text-[11px] text-white/45">
              {r.stageLabel} · {formatShortKickoff(r.kickoff)}
            </p>
          </div>
          {r.predicted ? (
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs font-600 tabular-nums text-white/70">
                {r.predicted.home}–{r.predicted.away}
              </span>
              <PointsBadge points={r.predicted.points} />
            </div>
          ) : (
            <span className="shrink-0 rounded-full bg-flame-600/15 px-2 py-0.5 text-[10px] font-700 uppercase tracking-wider text-flame-300">
              No prediction
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ParticipantRow({
  participant,
  totalPoints,
  breakdown,
}: {
  participant: Participant;
  totalPoints: number;
  breakdown: ParticipantMatchBreakdown[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="rounded-2xl card-glass p-3">
      {editing ? (
        <div className="space-y-3">
          <ParticipantForm
            participant={participant}
            onDone={() => setEditing(false)}
          />
          {participant.photo_url && (
            <form action={removePhoto} className="border-t border-white/10 pt-3">
              <input type="hidden" name="id" value={participant.id} />
              <button className="text-xs font-600 text-flame-300 underline-offset-2 transition hover:text-flame-200 hover:underline">
                Remove picture
              </button>
            </form>
          )}
        </div>
      ) : (
        <>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex flex-1 items-center gap-3 text-left"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-pitch-700 ring-1 ring-white/15">
              {participant.photo_url ? (
                <img
                  src={participant.photo_url}
                  alt={participant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center font-display text-lg text-gold-300">
                  {participant.name[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>

            <span className="font-600 text-white">{participant.name}</span>

            <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-xs font-700 tabular-nums text-gold-300">
              {totalPoints} pts
            </span>

            <span
              className={`text-white/40 transition ${expanded ? "rotate-90" : ""}`}
              aria-hidden
            >
              ›
            </span>
          </button>

          {confirming ? (
            <form action={deleteParticipant} className="flex items-center gap-2">
              <input type="hidden" name="id" value={participant.id} />
              <span className="text-xs text-white/60">Delete?</span>
              <button className="rounded-lg bg-flame-600 px-3 py-1.5 text-xs font-700 text-white transition hover:bg-flame-500">
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-600 text-white/70"
              >
                No
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-600 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirming(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-600 text-flame-300 transition hover:bg-flame-600/15"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        {expanded && <Breakdown rows={breakdown} />}
        </>
      )}
    </li>
  );
}

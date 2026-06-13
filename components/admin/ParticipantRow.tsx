"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import ParticipantForm from "./ParticipantForm";
import { deleteParticipant, removePhoto } from "@/app/admin/participants/actions";
import type { Participant } from "@/lib/types";

export default function ParticipantRow({
  participant,
}: {
  participant: Participant;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

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
        <div className="flex items-center gap-3">
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

          <span className="flex-1 font-600 text-white">{participant.name}</span>

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
      )}
    </li>
  );
}

import ParticipantForm from "@/components/admin/ParticipantForm";
import ParticipantRow from "@/components/admin/ParticipantRow";
import { createClient } from "@/lib/supabase/server";
import type { Participant } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("*")
    .order("name", { ascending: true })
    .returns<Participant[]>();

  const participants = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-700 uppercase tracking-tight text-white">
          Participants
        </h1>
        <p className="mt-1 text-sm text-white/60">
          {participants.length} total · they don&apos;t log in — you enter
          their predictions.
        </p>
      </div>

      <div className="rounded-2xl card-glass p-4">
        <h2 className="mb-3 font-display text-sm font-600 uppercase tracking-widest text-gold-400">
          Add participant
        </h2>
        <ParticipantForm />
      </div>

      {participants.length > 0 ? (
        <ul className="space-y-2">
          {participants.map((p) => (
            <ParticipantRow key={p.id} participant={p} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl card-glass px-4 py-10 text-center text-sm text-white/50">
          No participants yet — add the first one above.
        </p>
      )}
    </div>
  );
}

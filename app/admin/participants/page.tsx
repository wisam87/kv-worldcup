import ParticipantForm from "@/components/admin/ParticipantForm";
import ParticipantRow from "@/components/admin/ParticipantRow";
import { createClient } from "@/lib/supabase/server";
import { MATCH_SELECT, homeSide, awaySide } from "@/lib/teams";
import {
  STAGE_LABELS,
  type Participant,
  type MatchWithTeams,
  type Prediction,
  type LeaderboardRow,
  type ParticipantMatchBreakdown,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const supabase = await createClient();

  const [
    { data: participantsData },
    { data: leaderboardData },
    { data: matchesData },
    { data: predictionsData },
  ] = await Promise.all([
    supabase
      .from("participants")
      .select("*")
      .order("name", { ascending: true })
      .returns<Participant[]>(),
    supabase
      .from("leaderboard")
      .select("id, total_points")
      .returns<{ id: string; total_points: number }[]>(),
    // Only matches with a result entered.
    supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("status", "finished")
      .order("kickoff_time", { ascending: true })
      .returns<MatchWithTeams[]>(),
    supabase
      .from("predictions")
      .select(
        "id, match_id, participant_id, predicted_home, predicted_away, points_awarded"
      )
      .returns<Prediction[]>(),
  ]);

  const pointsById = new Map(
    (leaderboardData ?? []).map((r) => [r.id, r.total_points])
  );

  const finishedMatches = matchesData ?? [];

  // prediction lookup keyed by `${participantId}:${matchId}`
  const predByKey = new Map(
    (predictionsData ?? []).map((p) => [
      `${p.participant_id}:${p.match_id}`,
      p,
    ])
  );

  function breakdownFor(participantId: string): ParticipantMatchBreakdown[] {
    return finishedMatches.map((m) => {
      const home = homeSide(m);
      const away = awaySide(m);
      const pred = predByKey.get(`${participantId}:${m.id}`);
      return {
        matchId: m.id,
        stageLabel: STAGE_LABELS[m.stage],
        kickoff: m.kickoff_time,
        home: { name: home.name, flag: home.flag },
        away: { name: away.name, flag: away.flag },
        homeScore: m.home_score,
        awayScore: m.away_score,
        predicted: pred
          ? {
              home: pred.predicted_home,
              away: pred.predicted_away,
              points: pred.points_awarded,
            }
          : null,
      };
    });
  }

  const participants = (participantsData ?? [])
    .map((p) => ({
      participant: p,
      totalPoints: pointsById.get(p.id) ?? 0,
      breakdown: breakdownFor(p.id),
    }))
    .sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        a.participant.name.localeCompare(b.participant.name)
    );

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
            <ParticipantRow
              key={p.participant.id}
              participant={p.participant}
              totalPoints={p.totalPoints}
              breakdown={p.breakdown}
            />
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

import Link from "next/link";
import { notFound } from "next/navigation";
import Flag from "@/components/Flag";
import ResultForm from "@/components/admin/ResultForm";
import SetTeamsForm from "@/components/admin/SetTeamsForm";
import PredictionForm from "@/components/admin/PredictionForm";
import PredictionRow from "@/components/admin/PredictionRow";
import CopyWinnersButton from "@/components/admin/CopyWinnersButton";
import { createClient } from "@/lib/supabase/server";
import { MATCH_SELECT, homeSide, awaySide } from "@/lib/teams";
import { isResultUnlocked, formatKickoff, formatTime, unlockAt } from "@/lib/format";
import {
  STAGE_LABELS,
  type MatchWithTeams,
  type Team,
  type Participant,
  type PredictionWithParticipant,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: matchData } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .eq("id", id)
    .maybeSingle();

  const match = matchData as MatchWithTeams | null;
  if (!match) notFound();

  const [{ data: teams }, { data: participants }, { data: predictions }] =
    await Promise.all([
      supabase
        .from("teams")
        .select("*")
        .order("group_name", { ascending: true })
        .order("name", { ascending: true })
        .returns<Team[]>(),
      supabase
        .from("participants")
        .select("*")
        .order("name", { ascending: true })
        .returns<Participant[]>(),
      supabase
        .from("predictions")
        .select(
          "*, participant:participants (id, name, photo_url)"
        )
        .eq("match_id", id)
        .returns<PredictionWithParticipant[]>(),
    ]);

  const home = homeSide(match);
  const away = awaySide(match);
  const finished = match.status === "finished";
  const locked = !isResultUnlocked(match.kickoff_time);
  const unlockLabel = formatTime(unlockAt(match.kickoff_time).toISOString());

  const preds = (predictions ?? []).slice().sort((a, b) => {
    if (b.points_awarded !== a.points_awarded)
      return b.points_awarded - a.points_awarded;
    return (a.participant?.name ?? "").localeCompare(b.participant?.name ?? "");
  });
  const predictedIds = new Set(preds.map((p) => p.participant_id));
  const available = (participants ?? []).filter(
    (p) => !predictedIds.has(p.id)
  );

  // People who earned points (for the "Copy Winners List" button).
  const winners = preds
    .filter((p) => p.points_awarded > 0)
    .map((p) => ({
      name: p.participant?.name ?? "Unknown",
      points: p.points_awarded,
    }));

  const teamsKnown = match.home_team_id && match.away_team_id;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/matches"
        className="inline-flex items-center gap-1 text-sm text-white/60 transition hover:text-white"
      >
        ← All matches
      </Link>

      {/* Match header */}
      <div className="rounded-3xl card-glass p-5 text-center">
        <p className="font-display text-xs font-600 uppercase tracking-[0.3em] text-gold-400">
          {STAGE_LABELS[match.stage]}
          {match.group_name ? ` · Group ${match.group_name}` : ""} · #
          {match.match_number}
        </p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex flex-1 flex-col items-center gap-2">
            <Flag side={home} size="text-4xl" />
            <span
              className={`text-sm font-600 ${home.isTbd ? "text-white/45" : "text-white"}`}
            >
              {home.name}
            </span>
          </div>

          <div className="shrink-0">
            {finished ? (
              <span className="font-display text-3xl font-700 tabular-nums text-gold-400">
                {match.home_score}–{match.away_score}
              </span>
            ) : (
              <span className="font-display text-2xl text-white/30">vs</span>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <Flag side={away} size="text-4xl" />
            <span
              className={`text-sm font-600 ${away.isTbd ? "text-white/45" : "text-white"}`}
            >
              {away.name}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/50">
          🗓 {formatKickoff(match.kickoff_time)}
          {match.venue ? ` · 📍 ${match.venue}` : ""}
        </p>
      </div>

      {/* Set teams (for TBD knockout slots or corrections) */}
      <Section
        title="Teams"
        hint={
          teamsKnown
            ? "Adjust if needed."
            : "Set the teams once this slot is known."
        }
      >
        <SetTeamsForm
          matchId={match.id}
          teams={teams ?? []}
          homeTeamId={match.home_team_id}
          awayTeamId={match.away_team_id}
        />
      </Section>

      {/* Result */}
      <Section
        title="Result"
        hint="Saving recomputes points for every prediction."
      >
        <ResultForm
          matchId={match.id}
          homeName={home.name}
          awayName={away.name}
          homeScore={match.home_score}
          awayScore={match.away_score}
          finished={finished}
          locked={locked}
          unlockLabel={unlockLabel}
        />
      </Section>

      {/* Predictions */}
      <Section
        title={`Predictions (${preds.length})`}
        hint={
          finished
            ? "Points are awarded automatically."
            : "Points will be awarded once a result is saved."
        }
        action={finished ? <CopyWinnersButton winners={winners} /> : undefined}
      >
        {(participants ?? []).length === 0 ? (
          <p className="text-sm text-white/50">
            No participants yet —{" "}
            <Link
              href="/admin/participants"
              className="text-gold-400 underline-offset-2 hover:underline"
            >
              add some first
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-4">
            {available.length > 0 && (
              <div className="rounded-xl border border-dashed border-white/15 p-3">
                <p className="mb-2 text-[11px] font-600 uppercase tracking-widest text-white/45">
                  Add prediction
                </p>
                <PredictionForm
                  matchId={match.id}
                  homeName={home.name}
                  awayName={away.name}
                  availableParticipants={available}
                />
              </div>
            )}

            {preds.length > 0 ? (
              <ul className="space-y-2">
                {preds.map((p) => (
                  <PredictionRow
                    key={p.id}
                    prediction={p}
                    matchId={match.id}
                    homeName={home.name}
                    awayName={away.name}
                    finished={finished}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">
                No predictions entered for this match yet.
              </p>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl card-glass p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-600 uppercase tracking-wide text-white">
            {title}
          </h2>
          {hint && <p className="text-xs text-white/50">{hint}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

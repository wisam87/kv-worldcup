/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";
import { createClient } from "@/lib/supabase/server";
import { MATCH_SELECT, homeSide, awaySide } from "@/lib/teams";
import { formatShortKickoff } from "@/lib/format";
import {
  STAGE_LABELS,
  type MatchWithTeams,
  type Participant,
  type Prediction,
  type LeaderboardRow,
} from "@/lib/types";

// Always reflect the latest results.
export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ParticipantHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: participant },
    { data: stats },
    { data: matchData },
    { data: predictionRows },
  ] = await Promise.all([
    supabase
      .from("participants")
      .select("*")
      .eq("id", id)
      .maybeSingle<Participant>(),
    supabase
      .from("leaderboard")
      .select("*")
      .eq("id", id)
      .maybeSingle<LeaderboardRow>(),
    supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("status", "finished")
      .order("kickoff_time", { ascending: false })
      .returns<MatchWithTeams[]>(),
    supabase
      .from("predictions")
      .select("*")
      .eq("participant_id", id)
      .returns<Prediction[]>(),
  ]);

  if (!participant) notFound();

  const matches = matchData ?? [];
  const predByMatch = new Map<string, Prediction>();
  for (const p of predictionRows ?? []) predByMatch.set(p.match_id, p);

  const submitted = matches.filter((m) => predByMatch.has(m.id)).length;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-12">
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1 text-sm text-white/60 transition hover:text-white"
        >
          ← Leaderboard
        </Link>

        {/* Player header */}
        <section className="mt-3 flex items-center gap-4 rounded-3xl card-glass p-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-pitch-700 ring-1 ring-white/15">
            {participant.photo_url ? (
              <img
                src={participant.photo_url}
                alt={participant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full w-full place-items-center font-display text-2xl font-700 text-gold-300">
                {initials(participant.name) || "?"}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-700 uppercase tracking-tight text-white sm:text-3xl">
              {participant.name}
            </h1>
            <p className="mt-1 text-sm text-white/60">Scoring history</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-4xl font-700 leading-none text-gold-400">
              {stats?.total_points ?? 0}
            </div>
            <div className="text-[11px] font-600 uppercase tracking-widest text-white/50">
              points
            </div>
          </div>
        </section>

        {/* Summary stats */}
        <section className="mt-3 grid grid-cols-3 gap-3">
          <SummaryStat label="Exact 🎯" value={stats?.exact_hits ?? 0} />
          <SummaryStat label="Correct ✅" value={stats?.correct_hits ?? 0} />
          <SummaryStat
            label="Submitted"
            value={`${submitted}/${matches.length}`}
          />
        </section>

        {/* Per-match history */}
        <section className="mt-6">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-lg font-600 uppercase tracking-wide text-white">
              Matches played
            </h2>
            <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          {matches.length === 0 ? (
            <div className="rounded-2xl card-glass px-6 py-12 text-center text-sm text-white/60">
              No finished matches yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {matches.map((m) => (
                <HistoryRow
                  key={m.id}
                  match={m}
                  prediction={predByMatch.get(m.id) ?? null}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl card-glass px-4 py-3 text-center">
      <div className="font-display text-2xl font-700 tabular-nums text-white">
        {value}
      </div>
      <div className="text-[10px] font-600 uppercase tracking-widest text-white/50">
        {label}
      </div>
    </div>
  );
}

function HistoryRow({
  match,
  prediction,
}: {
  match: MatchWithTeams;
  prediction: Prediction | null;
}) {
  const home = homeSide(match);
  const away = awaySide(match);
  const points = prediction?.points_awarded ?? 0;

  return (
    <li className="rounded-xl card-glass px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-600">
        <span className="text-white/45">
          {STAGE_LABELS[match.stage]}
          {match.group_name ? ` · Group ${match.group_name}` : ""} ·{" "}
          {formatShortKickoff(match.kickoff_time)}
        </span>
        <PointsBadge prediction={prediction} points={points} />
      </div>

      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex flex-1 items-center justify-end gap-2 text-right">
          <span
            className={`line-clamp-1 text-sm font-600 ${
              home.isTbd ? "text-white/45" : "text-white"
            }`}
          >
            {home.name}
          </span>
          <Flag side={home} size="text-xl" />
        </div>

        {/* Actual result */}
        <div className="min-w-12 shrink-0 text-center font-display text-lg font-700 tabular-nums text-gold-400">
          {match.home_score}–{match.away_score}
        </div>

        {/* Away */}
        <div className="flex flex-1 items-center gap-2">
          <Flag side={away} size="text-xl" />
          <span
            className={`line-clamp-1 text-sm font-600 ${
              away.isTbd ? "text-white/45" : "text-white"
            }`}
          >
            {away.name}
          </span>
        </div>
      </div>

      {/* Their prediction */}
      <div className="mt-1.5 text-center text-[11px] font-600 uppercase tracking-wider">
        {prediction ? (
          <span className="text-white/55">
            Predicted{" "}
            <span className="tabular-nums text-white/80">
              {prediction.predicted_home}–{prediction.predicted_away}
            </span>
          </span>
        ) : (
          <span className="text-rose-300/70">No submission</span>
        )}
      </div>
    </li>
  );
}

function PointsBadge({
  prediction,
  points,
}: {
  prediction: Prediction | null;
  points: number;
}) {
  if (!prediction) {
    return (
      <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-700 uppercase tracking-wider text-white/45">
        Missed
      </span>
    );
  }
  const tone =
    points === 3
      ? "bg-gold-500/15 text-gold-300"
      : points > 0
        ? "bg-azure-500/20 text-azure-100"
        : "bg-white/10 text-white/45";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-700 uppercase tracking-wider tabular-nums ${tone}`}
    >
      +{points} pt{points === 1 ? "" : "s"}
    </span>
  );
}

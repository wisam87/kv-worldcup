import Link from "next/link";
import Flag from "@/components/Flag";
import { createClient } from "@/lib/supabase/server";
import { MATCH_SELECT, homeSide, awaySide } from "@/lib/teams";
import { isResultUnlocked } from "@/lib/format";
import {
  STAGE_LABELS,
  STAGE_ORDER,
  type MatchWithTeams,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .order("kickoff_time", { ascending: true })
    .returns<MatchWithTeams[]>();

  const matches = data ?? [];
  const finishedCount = matches.filter((m) => m.status === "finished").length;

  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    matches: matches.filter((m) => m.stage === stage),
  })).filter((s) => s.matches.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-700 uppercase tracking-tight text-white">
          Matches
        </h1>
        <p className="mt-1 text-sm text-white/60">
          {finishedCount}/{matches.length} results entered · tap a match to
          record the score &amp; predictions.
        </p>
      </div>

      {byStage.map(({ stage, matches }) => (
        <section key={stage}>
          <h2 className="mb-3 font-display text-sm font-600 uppercase tracking-[0.2em] text-gold-400">
            {STAGE_LABELS[stage]}
          </h2>
          <ul className="space-y-2">
            {matches.map((m) => (
              <AdminMatchRow key={m.id} match={m} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function AdminMatchRow({ match }: { match: MatchWithTeams }) {
  const home = homeSide(match);
  const away = awaySide(match);
  const finished = match.status === "finished";
  const unlocked = isResultUnlocked(match.kickoff_time);

  return (
    <li>
      <Link
        href={`/admin/matches/${match.id}`}
        className="flex items-center gap-3 rounded-xl card-glass px-3 py-3 transition hover:-translate-y-0.5 hover:border-white/25"
      >
        <span className="w-8 shrink-0 text-center font-display text-xs text-white/40">
          #{match.match_number ?? "—"}
        </span>

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

        <div className="shrink-0 text-center">
          {finished ? (
            <span className="font-display text-lg font-700 tabular-nums text-gold-400">
              {match.home_score}–{match.away_score}
            </span>
          ) : (
            <span className="text-white/30">v</span>
          )}
        </div>

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

        <span
          className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-700 uppercase tracking-wider sm:inline ${
            finished
              ? "bg-gold-500/15 text-gold-300"
              : unlocked
                ? "bg-azure-500/20 text-azure-100"
                : "bg-white/10 text-white/45"
          }`}
        >
          {finished ? "FT" : unlocked ? "Ready" : "Locked"}
        </span>
      </Link>
    </li>
  );
}

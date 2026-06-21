import Link from "next/link";
import Flag from "@/components/Flag";
import { createClient } from "@/lib/supabase/server";
import { MATCH_SELECT, homeSide, awaySide } from "@/lib/teams";
import {
  isResultUnlocked,
  formatShortKickoff,
  formatCompactTime,
} from "@/lib/format";
import {
  MatchCopyProvider,
  MatchCheckbox,
  CopySelectedBar,
} from "@/components/admin/MatchCopy";
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
    <MatchCopyProvider>
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

        <CopySelectedBar />

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
    </MatchCopyProvider>
  );
}

function AdminMatchRow({ match }: { match: MatchWithTeams }) {
  const home = homeSide(match);
  const away = awaySide(match);
  const finished = match.status === "finished";
  const unlocked = isResultUnlocked(match.kickoff_time);
  const homeText = home.flag ? `${home.name} ${home.flag}` : home.name;
  const awayText = away.flag ? `${away.name} ${away.flag}` : away.name;
  const copyLabel = `${formatCompactTime(match.kickoff_time)} ${homeText} vs ${awayText}`;

  return (
    <li className="flex items-center gap-2">
      {!finished && (
        <MatchCheckbox
          id={match.id}
          sort={new Date(match.kickoff_time).getTime()}
          label={copyLabel}
        />
      )}
      <Link
        href={`/admin/matches/${match.id}`}
        className="block flex-1 rounded-xl card-glass px-3 py-2.5 transition hover:-translate-y-0.5 hover:border-white/25"
      >
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-600">
          <span className="text-white/45">
            #{match.match_number ?? "—"} ·{" "}
            {formatShortKickoff(match.kickoff_time)}
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-700 uppercase tracking-wider ${
              finished
                ? "bg-gold-500/15 text-gold-300"
                : unlocked
                  ? "bg-azure-500/20 text-azure-100"
                  : "bg-white/10 text-white/45"
            }`}
          >
            {finished ? "FT" : unlocked ? "Ready" : "Locked"}
          </span>
        </div>

        <div className="flex items-center gap-3">
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

          <div className="min-w-9 shrink-0 text-center">
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
        </div>
      </Link>
    </li>
  );
}

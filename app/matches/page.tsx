import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MatchCard from "@/components/MatchCard";
import { createClient } from "@/lib/supabase/server";
import { MATCH_SELECT } from "@/lib/teams";
import { STAGE_LABELS, STAGE_ORDER, type MatchWithTeams } from "@/lib/types";
import { formatDay, dayKey } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .order("kickoff_time", { ascending: true })
    .returns<MatchWithTeams[]>();

  const matches = data ?? [];

  // group → stage → matches
  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    matches: matches.filter((m) => m.stage === stage),
  })).filter((s) => s.matches.length > 0);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-10">
        <div className="py-8">
          <h1 className="font-display text-3xl font-700 uppercase tracking-tight text-white sm:text-4xl">
            Fixtures &amp; Results
          </h1>
          <p className="mt-1 text-sm text-white/60">
            All 104 matches of the 2026 World Cup.
          </p>
        </div>

        {byStage.map(({ stage, matches }) => (
          <section key={stage} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-lg font-600 uppercase tracking-[0.2em] text-gold-400">
                {STAGE_LABELS[stage]}
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            {stage === "group" ? (
              <GroupedByDay matches={matches} />
            ) : (
              <div className="space-y-2">
                {matches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}

function GroupedByDay({ matches }: { matches: MatchWithTeams[] }) {
  const days: { key: string; label: string; matches: MatchWithTeams[] }[] = [];
  for (const m of matches) {
    const key = dayKey(m.kickoff_time);
    let day = days.find((d) => d.key === key);
    if (!day) {
      day = { key, label: formatDay(m.kickoff_time), matches: [] };
      days.push(day);
    }
    day.matches.push(m);
  }

  return (
    <div className="space-y-6">
      {days.map((d) => (
        <div key={d.key}>
          <h3 className="mb-2 text-xs font-600 uppercase tracking-widest text-white/40">
            {d.label}
          </h3>
          <div className="space-y-2">
            {d.matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

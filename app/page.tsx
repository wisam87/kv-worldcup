import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow } from "@/lib/types";

// Always reflect the latest results.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("leaderboard")
    .select("*")
    .order("total_points", { ascending: false })
    .order("name", { ascending: true })
    .returns<LeaderboardRow[]>();

  const { count: matchesPlayed } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("status", "finished");

  const allRows = rows ?? [];
  // Only show people who have scored at least one point.
  const leaders = allRows.filter((r) => r.total_points > 0);
  const topScore = leaders[0]?.total_points ?? 0;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-10">
        {/* Hero */}
        <section className="pitch-stripes relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-pitch-800/60 to-pitch-950/40 px-6 py-10 text-center sm:py-14">
          <div className="pointer-events-none absolute -right-6 -top-8 text-[120px] opacity-20 [animation:float-slow_8s_ease-in-out_infinite]">
            🏆
          </div>
          <p className="font-display text-xs font-600 uppercase tracking-[0.4em] text-gold-400">
            United 2026 · USA · Canada · Mexico
          </p>
          <h1 className="mt-3 font-display text-4xl font-700 uppercase leading-tight tracking-tight text-white sm:text-6xl">
            Kokaa Villa <span className="text-white/40">—</span>{" "}
            <span className="shimmer-text">Leaderboard</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70 sm:text-base">
            Exact score = 3 pts · right result = 1 pt. Every saved result
            updates the standings instantly.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Stat label="Participants" value={allRows.length} />
            <Stat label="Matches played" value={matchesPlayed ?? 0} />
            <Stat label="Top score" value={topScore} accent />
          </div>
        </section>

        {/* Board */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-xl font-600 uppercase tracking-wide text-white">
              Standings
            </h2>
            <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          <Leaderboard rows={leaders} />
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl card-glass px-5 py-3">
      <div
        className={`font-display text-2xl font-700 ${
          accent ? "text-gold-400" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] font-600 uppercase tracking-widest text-white/50">
        {label}
      </div>
    </div>
  );
}

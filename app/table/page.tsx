import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "KV — Leaderboard" };

export default async function TablePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leaderboard")
    .select("id, name, total_points")
    .order("total_points", { ascending: false })
    .order("name", { ascending: true })
    .returns<LeaderboardRow[]>();

  const rows = data ?? [];

  const posColor = (pos: number) =>
    pos === 1
      ? "text-gold-400"
      : pos === 2
        ? "text-slate-300"
        : pos === 3
          ? "text-amber-500"
          : "text-white/45";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 pb-12">
        <div className="py-7 text-center">
          <h1 className="font-display text-3xl font-700 uppercase tracking-tight text-white">
            KV <span className="text-white/35">—</span>{" "}
            <span className="shimmer-text">Leaderboard</span>
          </h1>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl card-glass px-6 py-14 text-center text-sm text-white/55">
            No participants yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl card-glass">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-600 uppercase tracking-widest text-white/45">
                  <th className="w-12 px-3 py-3 text-center">#</th>
                  <th className="px-2 py-3">Player</th>
                  <th className="px-4 py-3 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const pos = i + 1;
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-white/[0.06] last:border-0 ${
                        pos === 1 ? "bg-gold-500/[0.07]" : ""
                      }`}
                    >
                      <td
                        className={`px-3 py-3.5 text-center font-display text-base font-700 tabular-nums ${posColor(
                          pos
                        )}`}
                      >
                        {pos}
                      </td>
                      <td className="truncate px-2 py-3.5 font-600 text-white">
                        {r.name}
                      </td>
                      <td className="px-4 py-3.5 text-right font-display text-lg font-700 tabular-nums text-gold-400">
                        {r.total_points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

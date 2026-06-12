import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [participants, matches, finished, predictions, upcoming] =
    await Promise.all([
      supabase.from("participants").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("status", "finished"),
      supabase.from("predictions").select("*", { count: "exact", head: true }),
      supabase
        .from("matches")
        .select("id, match_number, kickoff_time, home_label, away_label, stage")
        .gte("kickoff_time", new Date().toISOString())
        .order("kickoff_time", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  const stats = [
    { label: "Participants", value: participants.count ?? 0, href: "/admin/participants" },
    { label: "Matches", value: matches.count ?? 0, href: "/admin/matches" },
    { label: "Results in", value: finished.count ?? 0, href: "/admin/matches" },
    { label: "Predictions", value: predictions.count ?? 0, href: "/admin/matches" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-700 uppercase tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Enter results and manage predictions for the tournament.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl card-glass p-4 transition hover:-translate-y-0.5 hover:border-white/25"
          >
            <div className="font-display text-3xl font-700 text-gold-400">
              {s.value}
            </div>
            <div className="text-[11px] font-600 uppercase tracking-widest text-white/50">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/matches"
          className="group rounded-2xl card-glass p-5 transition hover:-translate-y-0.5 hover:border-white/25"
        >
          <div className="mb-2 text-2xl">📝</div>
          <h2 className="font-display text-lg font-600 uppercase tracking-wide text-white">
            Enter results &amp; predictions
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Pick a match to record the final score and each participant&apos;s
            prediction.
          </p>
        </Link>

        <Link
          href="/admin/participants"
          className="group rounded-2xl card-glass p-5 transition hover:-translate-y-0.5 hover:border-white/25"
        >
          <div className="mb-2 text-2xl">👥</div>
          <h2 className="font-display text-lg font-600 uppercase tracking-wide text-white">
            Manage participants
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Add people with a photo, edit names, or remove them.
          </p>
        </Link>
      </div>
    </div>
  );
}

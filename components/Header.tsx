import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function TrophyMark() {
  return (
    <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-pitch-950 shadow-lg shadow-gold-500/20">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" />
        <path d="M6 5H3v1a3 3 0 0 0 3 3M18 5h3v1a3 3 0 0 1-3 3" />
        <path d="M12 13v4M9 21h6M10 17h4" />
      </svg>
    </span>
  );
}

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-pitch-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <TrophyMark />
          <span className="leading-none">
            <span className="block font-display text-lg font-700 uppercase tracking-[0.18em] text-white">
              World Cup
            </span>
            <span className="block font-display text-sm font-600 uppercase tracking-[0.32em] text-gold-400">
              2026 · Predictions
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-600">
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Leaderboard
          </Link>
          <Link
            href="/matches"
            className="rounded-full px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Fixtures
          </Link>
          {user ? (
            <Link
              href="/admin"
              className="rounded-full bg-gold-500 px-4 py-2 text-pitch-950 transition hover:bg-gold-400"
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-4 py-2 text-white/90 transition hover:border-white/40 hover:text-white"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

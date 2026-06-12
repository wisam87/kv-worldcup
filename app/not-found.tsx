import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <div className="text-6xl">⚽️</div>
        <h1 className="mt-4 font-display text-4xl font-700 uppercase tracking-tight text-white">
          Off the pitch
        </h1>
        <p className="mt-2 text-white/60">
          That page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-gold-500 px-5 py-2.5 font-display text-sm font-700 uppercase tracking-widest text-pitch-950 transition hover:bg-gold-400"
        >
          Back to leaderboard
        </Link>
      </div>
    </main>
  );
}

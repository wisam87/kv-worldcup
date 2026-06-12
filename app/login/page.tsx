import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Admin Login · World Cup 2026" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const redirectTo =
    typeof sp.redirectTo === "string" ? sp.redirectTo : "/admin";

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          ← Back to leaderboard
        </Link>

        <div className="rounded-3xl card-glass p-7">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 text-2xl">
              🔑
            </div>
            <h1 className="font-display text-2xl font-700 uppercase tracking-wide text-white">
              Admin Login
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Moderators only — enter results &amp; predictions.
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}

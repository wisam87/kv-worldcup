import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proxy already guards this, but verify server-side as defence in depth.
  if (!user) redirect("/login?redirectTo=/admin");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-pitch-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 text-pitch-950">
              ⚙️
            </span>
            <span className="font-display text-sm font-700 uppercase tracking-[0.2em] text-white">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-xs font-600 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              View site ↗
            </Link>
            <form action={signOut}>
              <button className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-600 text-white/80 transition hover:border-flame-500/60 hover:text-flame-100">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

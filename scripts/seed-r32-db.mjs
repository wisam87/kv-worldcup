// Build-time seed: upserts the 16 Round of 32 matches (73–88) straight into
// Supabase. Designed to run during `next build` on Vercel so the R32 fixtures
// land in the live database on every deploy.
//
// Safe to run repeatedly:
//   - upserts by match_number (no duplicate rows)
//   - only writes stage / group_name / labels / kickoff_time / venue
//   - never touches home_team_id, away_team_id, scores, status — so team
//     assignments and results entered later are preserved across redeploys.
//
// Requires two env vars (set them in Vercel → Project → Settings → Environment
// Variables, and in .env.local for local runs):
//   NEXT_PUBLIC_SUPABASE_URL      (already present)
//   SUPABASE_SERVICE_ROLE_KEY     (bypasses RLS — server-only, never expose)
//
// Run manually:  npm run db:seed:r32
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Minimal .env.local loader so local runs work without extra deps. Vercel
// injects env vars into the process directly, so this is a no-op there.
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // No .env.local (e.g. on Vercel) — rely on the real environment.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[seed:r32] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — skipping R32 seed."
  );
  process.exit(0); // Don't fail the build (e.g. local builds / previews w/o the key).
}

const fx = JSON.parse(
  readFileSync(new URL("./fixtures.json", import.meta.url), "utf8")
);

const r32 = fx.matches
  .filter((m) => m.stage === "r32")
  .sort((a, b) => a.match_number - b.match_number);

if (r32.length !== 16) {
  console.error(`[seed:r32] Expected 16 R32 matches, found ${r32.length}.`);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Resolve team names → ids from the live teams table (robust regardless of how
// teams were seeded). R32 fixtures reference teams by name in fixtures.json.
const { data: teams, error: teamsErr } = await supabase
  .from("teams")
  .select("id, name");
if (teamsErr) {
  console.error("[seed:r32] could not load teams:", teamsErr.message);
  process.exit(1);
}
const teamId = new Map(teams.map((t) => [t.name, t.id]));

const lookup = (name) => {
  if (name == null) return null;
  const id = teamId.get(name);
  if (!id) {
    console.error(`[seed:r32] no team row named "${name}" — seed teams first.`);
    process.exit(1);
  }
  return id;
};

// Columns this seed owns. We set home/away team ids now that the R32 is decided.
// home_score/away_score/status stay out of the payload, so (with
// defaultToNull: false) they default on insert and are untouched on update.
const rows = r32.map((m) => ({
  match_number: m.match_number,
  stage: m.stage,
  group_name: m.group ?? null,
  home_team_id: lookup(m.home),
  away_team_id: lookup(m.away),
  home_label: m.home_label ?? null,
  away_label: m.away_label ?? null,
  kickoff_time: m.kickoff_utc, // UTC; the app renders Maldives time (UTC+5)
  venue: m.venue ?? null,
}));

const { error } = await supabase
  .from("matches")
  // defaultToNull: false → missing columns use DB defaults on insert and are
  // left untouched on update (preserves scores/status entered later).
  .upsert(rows, { onConflict: "match_number", defaultToNull: false });

if (error) {
  console.error("[seed:r32] upsert failed:", error.message);
  process.exit(1);
}

console.log(`[seed:r32] upserted ${rows.length} Round of 32 matches (with teams).`);

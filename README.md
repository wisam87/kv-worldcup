# World Cup 2026 Predictions

Admin-managed score-prediction tracker for the 2026 FIFA World Cup. The public
sees a live leaderboard and fixtures; logged-in admins enter every prediction and
result by hand. Built with **Next.js 16** (App Router) + **Supabase**.

- Exact score = **3 pts**, right result only = **1 pt**, wrong = **0**.
- Results unlock **2 hours after kickoff** (soft lock in the app).
- Points recompute automatically whenever a result is saved or edited.

## Stack

- Next.js 16 (App Router, Server Components + Server Actions, Turbopack)
- Supabase (Postgres + Auth + Storage) via `@supabase/ssr`
- Tailwind CSS v4
- Auth guard via `proxy.ts` (Next.js 16's renamed middleware)

---

## Setup

### 1. Environment

`.env.local` needs (the publishable key is the public client key):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

> No secret/service key is required — all writes run as the logged-in admin
> through RLS.

### 2. Database (run once, in order)

In the **Supabase dashboard → SQL Editor**, run:

1. **`supabase/schema.sql`** — creates tables, RLS policies, the `leaderboard`
   view, and the `participant-photos` storage bucket.
2. **`supabase/seed.sql`** — loads 48 teams (12 groups) and all 104 fixtures.

The seed is the **real 2026 World Cup schedule** — the actual final draw (48
teams / 12 groups), official match numbers, venues, and kickoff times stored in
UTC. The fixture data lives in `scripts/fixtures.json`; to regenerate the SQL
after editing it, run:

```bash
node scripts/generate-seed.mjs
```

> Knockout matches (73–104) are seeded with the real dates/venues but TBD teams
> and bracket labels ("Winner Group A", "Winner Match 73", etc.) — set the teams
> in the admin UI as the bracket resolves.

### 3. Create an admin

In **Supabase dashboard → Authentication → Users → Add user**, create an admin
with an email + password (confirm the email). Anyone in `auth.users` is a full
admin — there are no roles. Repeat to add more admins.

### 4. Run

```bash
npm install
npm run dev      # http://localhost:3000
```

---

## How it works

| Route | Who | What |
|---|---|---|
| `/` | public | Leaderboard (participant cards, points, rank medals) |
| `/matches` | public | All fixtures & results grouped by stage |
| `/login` | public | Admin email + password login |
| `/admin` | admin | Dashboard |
| `/admin/participants` | admin | Add / edit / delete participants (+ photo upload) |
| `/admin/matches` | admin | Fixture list |
| `/admin/matches/[id]` | admin | Set teams · enter result · manage predictions |

**Entering a result** (`/admin/matches/[id]`): the score form unlocks 2h after
kickoff. Saving sets the match to `finished` and recomputes `points_awarded` for
every prediction of that match. **Clear result** reverts it.

**Predictions** can be added before or after the result. Each is upserted
(`unique(match_id, participant_id)`) and scored against the current result on
save. Editing a prediction re-scores it immediately.

**Knockout teams**: seeded as TBD. As the bracket resolves, open the match and
pick home/away teams from the dropdown.

## Project structure

```
app/
  page.tsx                  public leaderboard
  matches/page.tsx          public fixtures
  login/                    login page + auth actions
  admin/
    layout.tsx              auth guard + admin chrome
    page.tsx                dashboard
    participants/           list + actions
    matches/                list, [id] detail, actions
components/                 UI + admin form components
lib/
  supabase/{client,server}.ts
  scoring.ts  format.ts  teams.ts  types.ts
proxy.ts                    session refresh + /admin guard
supabase/{schema,seed}.sql
scripts/generate-seed.mjs
```

## Deploy (Vercel)

Push to GitHub, import into Vercel, and set the two `NEXT_PUBLIC_…` env vars.
Keep the app visited during the tournament so Supabase's free tier doesn't pause
the project between sessions.

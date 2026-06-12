# World Cup 2026 Score Predictions — Build Plan

A small, admin-only web app to track participants' match-score predictions for the 2026 FIFA World Cup, award points, and show a live leaderboard. There is **no public submission** — a moderator enters every prediction and every result by hand.

---

## 1. Overview

| Item | Decision |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS, mobile-first, World Cup theme |
| Backend / DB | Supabase (Postgres + Auth + Storage), free tier |
| Auth | Supabase Auth (email + password), admins only, no roles |
| Hosting | Vercel free tier |
| Who uses it | Public can **view** the leaderboard. Only logged-in admins can **edit** anything. |

**Key behaviours**
- Participants are people who made predictions; they do **not** log in.
- Admins log in and do all data entry: add participants, enter predictions, enter results.
- The match list is **seeded in advance**. Group matches have real teams; knockout matches are seeded with placeholder teams that admins fill in later.
- A match's score can only be entered **2 hours after kickoff** (a soft lock enforced in the app).
- Points are recomputed automatically whenever a result is saved or edited.

> **Note on format:** The 2026 World Cup has 48 teams in 12 groups of 4. The knockout stage starts at a **Round of 32**, then Round of 16 → Quarter-finals → Semi-finals → Third-place → Final (104 matches total). The schema below uses a flexible `stage` field so this is handled cleanly even though you mentioned "Round of 16".

---

## 2. Scoring Rules

For each prediction, compare the predicted score to the actual score:

| Condition | Points |
|---|---|
| Exact score matches (e.g. predicted 2–1, actual 2–1) | **3** |
| Correct outcome only (right winner, or both a draw) but wrong score | **1** |
| Wrong outcome | **0** |

"Outcome" = home win / away win / draw.

**Examples**

| Predicted | Actual | Result | Points |
|---|---|---|---|
| 2–1 | 2–1 | exact | 3 |
| 2–1 | 3–0 | right winner, wrong score | 1 |
| 1–1 | 2–2 | both draws, wrong score | 1 |
| 2–1 | 0–0 | predicted home win, got draw | 0 |
| 2–1 | 1–2 | wrong winner | 0 |

**Algorithm** (run on save):
```
function score(ph, pa, ah, aa) {
  if (ph === ah && pa === aa) return 3;        // exact
  const outcome = (h, a) => Math.sign(h - a);   // 1 home, -1 away, 0 draw
  if (outcome(ph, pa) === outcome(ah, aa)) return 1;
  return 0;
}
```

A participant's total = sum of `points_awarded` across all their predictions for matches that have a result.

---

## 3. Data Model

Five tables. Photos live in Supabase Storage; everything else in Postgres.

### `admins`
Managed by Supabase Auth. You don't strictly need a custom table — Supabase keeps users in `auth.users`. Optionally mirror a display name into a small `profiles` table.

```
profiles
  id          uuid  PK  references auth.users(id)
  display_name text
  created_at   timestamptz default now()
```

### `participants`
```
participants
  id         uuid PK default gen_random_uuid()
  name       text not null
  photo_url  text                      -- public URL from Storage bucket
  created_at timestamptz default now()
```

### `teams`
```
teams
  id         uuid PK default gen_random_uuid()
  name       text not null             -- "Brazil"
  code       text                      -- "BRA"
  flag_url   text                      -- or store an emoji flag in `flag` text
  group_name text                      -- "A".."L" (null for knockout-only)
```

### `matches`
Seeded in advance. Knockout teams are nullable so they can be set later.
```
matches
  id           uuid PK default gen_random_uuid()
  match_number int  unique             -- official fixture number, handy for ordering
  stage        text not null           -- 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'
  group_name   text                    -- only for group stage
  home_team_id uuid references teams(id)   -- nullable (TBD for knockouts)
  away_team_id uuid references teams(id)   -- nullable
  home_label   text                    -- fallback label when team unknown, e.g. "Winner Group A"
  away_label   text                    -- e.g. "Runner-up Group B"
  kickoff_time timestamptz not null
  venue        text
  home_score   int                     -- null until result entered
  away_score   int
  status       text default 'scheduled' -- 'scheduled' | 'finished'
  created_at   timestamptz default now()
```

### `predictions`
One prediction per participant per match.
```
predictions
  id             uuid PK default gen_random_uuid()
  match_id       uuid references matches(id) on delete cascade
  participant_id uuid references participants(id) on delete cascade
  predicted_home int not null
  predicted_away int not null
  points_awarded int default 0          -- recomputed when match result changes
  created_at     timestamptz default now()
  unique (match_id, participant_id)
```

### Leaderboard
Compute on the fly with a view (simplest, always correct):
```sql
create view leaderboard as
select p.id, p.name, p.photo_url,
       coalesce(sum(pr.points_awarded), 0) as total_points,
       count(pr.id) as predictions_made
from participants p
left join predictions pr on pr.participant_id = p.id
group by p.id, p.name, p.photo_url
order by total_points desc, p.name asc;
```

---

## 4. Authentication

Supabase Auth uses **email + password**. You asked for "username + password", so pick one:

1. **Recommended — treat email as the login.** Admins sign in with an email + password. Simplest and most secure; Supabase handles hashing, sessions, and reset. Adding an admin = inviting an email from the Supabase dashboard, or building a tiny "create admin" form that calls `supabase.auth.admin.createUser` from a server action (uses the secret key, server-side only).
2. **Username feel.** Keep a `username` column in `profiles` and accept a fake email like `username@yourapp.local` under the hood. Works, but adds friction for little gain.

**No role-based access.** Anyone in `auth.users` is a full admin. The public/anon visitor only gets read access to the leaderboard data.

**Mechanics (current Supabase + Next.js pattern):**
- Install `@supabase/ssr` (the `auth-helpers` package is deprecated).
- Create a browser client and a server client in `lib/supabase/`.
- Add a `middleware.ts` that refreshes the auth token on each request and guards `/admin/**`.
- Use the new **publishable** key (`sb_publishable_…`) client-side and the **secret** key server-side. (Legacy `anon`/`service_role` keys still work during the transition but are being retired — use the new ones.)

---

## 5. Row Level Security (RLS)

Turn RLS **on** for every table. Policy summary:

| Table | Anonymous (public) | Authenticated (admin) |
|---|---|---|
| `participants` | select | all |
| `teams` | select | all |
| `matches` | select | all |
| `predictions` | select | all |
| `profiles` | none | select/update own |

Example policies:
```sql
alter table participants enable row level security;

create policy "public read participants"
  on participants for select using (true);

create policy "admins manage participants"
  on participants for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```
Repeat the same shape for `teams`, `matches`, `predictions`.

> The **2-hour lock** on entering results is enforced in the app (server action), not RLS, because the rule is "now ≥ kickoff + 2h". You *can* also add a Postgres `CHECK`/trigger if you want it bulletproof at the DB layer — optional for a small app.

---

## 6. Storage

- One public bucket: `participant-photos`.
- Admin uploads a photo on the add/edit participant form; store the returned public URL in `participants.photo_url`.
- Optional second bucket `team-flags`, or just use emoji flags / a CDN flag URL to skip uploads entirely.

---

## 7. Pages & Routes

```
/                     Public home — header, logo, participant grid + points (leaderboard)
/matches              Public (optional) — fixture list with results
/login                Admin login

/admin                Admin dashboard (protected)
/admin/participants   List + add/edit/delete participants (with photo upload)
/admin/matches        Fixture list; set knockout teams; enter results
/admin/matches/[id]   Single match: enter result + manage predictions for it
/admin/admins         (optional) invite/create another admin
```

Everything under `/admin` is gated by middleware → redirect to `/login` if not authenticated.

---

## 8. Core User Flows

**Public visitor**
1. Open `/` → see themed header/logo and a responsive grid of participant cards (photo, name, total points), sorted by points.

**Admin — add a participant**
1. Login → `/admin/participants` → "Add participant" → name + photo → save.

**Admin — set knockout teams (later in the tournament)**
1. `/admin/matches` → pick a knockout match → choose `home_team` / `away_team` from the dropdown → save. (Until then it shows the label, e.g. "Winner Group A".)

**Admin — enter a result and predictions** (your described flow)
1. `/admin/matches` → select the match.
2. If it's ≥ 2h after kickoff, the **Enter result** form is enabled → type home/away score → save → status becomes `finished` and points recompute for all that match's predictions.
3. **Add prediction** → select participant from dropdown → enter their predicted score → save. (Repeat per participant.)
4. Each saved prediction immediately gets its `points_awarded` if a result already exists.

> Predictions can be entered before or after the result. On every result save, recompute `points_awarded` for **all** predictions of that match. On every prediction save, compute its points against the existing result (0 if no result yet).

---

## 9. Seeding the Matches

You want the fixtures preloaded. Approach:

1. **Teams:** insert all 48 qualified teams (name, code, flag, group). Once the draw is final, set `group_name`.
2. **Group matches (72):** insert each with real `kickoff_time`, `venue`, `match_number`, `home_team_id`, `away_team_id` from the official FIFA fixture list.
3. **Knockout matches (32):** insert with `stage` set, teams **null**, and `home_label`/`away_label` describing the slot (e.g. "1A", "2B"). Admins fill the teams in as the bracket resolves.

Implement as a SQL seed file (`supabase/seed.sql`) or a one-off Node script (`scripts/seed.ts`) using the secret key. Keep the fixture data in a `fixtures.json` so it's easy to correct kickoff times.

---

## 10. Project Structure

```
worldcup-predictions/
├─ app/
│  ├─ page.tsx                     # public leaderboard home
│  ├─ matches/page.tsx             # public fixtures (optional)
│  ├─ login/page.tsx
│  ├─ admin/
│  │  ├─ layout.tsx                # auth guard wrapper
│  │  ├─ page.tsx                  # dashboard
│  │  ├─ participants/page.tsx
│  │  ├─ matches/page.tsx
│  │  └─ matches/[id]/page.tsx
│  └─ globals.css
├─ components/
│  ├─ ParticipantCard.tsx
│  ├─ Leaderboard.tsx
│  ├─ MatchRow.tsx
│  ├─ ResultForm.tsx
│  ├─ PredictionForm.tsx
│  └─ Header.tsx
├─ lib/
│  ├─ supabase/client.ts           # browser client
│  ├─ supabase/server.ts           # server client
│  └─ scoring.ts                   # the points function
├─ middleware.ts                   # refresh session + guard /admin
├─ supabase/
│  ├─ schema.sql
│  └─ seed.sql
├─ scripts/seed.ts
└─ .env.local
```

Use **Server Components** for reads (leaderboard, fixtures) and **Server Actions** for writes (save result, save prediction, add participant) so the secret key never touches the browser.

---

## 11. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx        # server only — never exposed to client
```

---

## 12. Design / Theming

Goal: clearly "World Cup", clean, fully mobile-friendly.

- **Palette:** deep pitch green + white, with a gold/amber accent for points and a bold accent (red/blue) for buttons. 2026 host trio (USA/Canada/Mexico) can inspire a subtle tri-color accent.
- **Header:** large logo, tournament title, maybe a trophy/ball motif. Sticky on scroll.
- **Participant grid:** responsive cards — `grid-cols-2` on phones, `sm:grid-cols-3`, `lg:grid-cols-4`. Each card: circular photo, name, big point number, rank badge for top 3 (gold/silver/bronze).
- **Typography:** a strong display font for headings (e.g. a condensed sans), readable body font.
- **Touch:** large tap targets, dropdowns instead of tiny inputs on mobile, sticky save buttons in admin forms.
- **Motion:** subtle count-up on points, gentle card hover/press states. Keep it light.

Optional: the `frontend-design` skill in this environment has token/styling guidance if you want a more distinctive look than default Tailwind.

---

## 13. Build Phases

**Phase 0 — Setup (½ day)**
- Create Supabase project, get URL + keys.
- `npx create-next-app@latest` (TypeScript, Tailwind, App Router).
- Install `@supabase/ssr @supabase/supabase-js`.
- Add env vars, build the two Supabase clients + middleware.

**Phase 1 — Database**
- Run `schema.sql` (tables + RLS + leaderboard view).
- Create the `participant-photos` storage bucket.

**Phase 2 — Public home**
- Header/logo + leaderboard grid reading the `leaderboard` view. Mobile-first styling.

**Phase 3 — Auth**
- `/login` with `signInWithPassword`, middleware guard on `/admin`, sign-out.

**Phase 4 — Participants admin**
- List, add (with photo upload), edit, delete.

**Phase 5 — Matches + scoring**
- `schema` seed of teams + fixtures.
- `/admin/matches` list, set knockout teams.
- Enter-result form with the 2-hour lock.
- `lib/scoring.ts` + recompute-on-save logic.

**Phase 6 — Predictions**
- Per-match: add prediction (select participant + score), edit, delete; points compute on save.

**Phase 7 — Polish + deploy**
- Theming pass, empty/loading states, validation (scores ≥ 0, no duplicate prediction).
- Deploy to Vercel, set env vars, smoke test on a phone.

---

## 14. Edge Cases & Validation

- **Duplicate prediction:** the `unique(match_id, participant_id)` constraint blocks it; show a friendly "already predicted — edit instead".
- **Editing a result:** recompute points for every prediction of that match.
- **Negative / silly scores:** validate `>= 0` (and maybe a sane cap) in the form and server action.
- **2-hour lock:** disable the result form and reject the server action if `now < kickoff + 2h`.
- **Knockout TBD:** matches with null teams still appear, showing labels; predictions can still be added once teams are set (your call on whether to allow earlier).
- **Deleting a participant:** cascade removes their predictions; the leaderboard updates automatically.

---

## 15. Free-Tier Notes

The Supabase free tier (Postgres, Auth, Storage, generous row limits) and Vercel free tier are comfortably enough for one tournament with a handful of admins, dozens of participants, and ~104 matches. The main free-tier watch-item is Supabase **pausing inactive projects** — keep the app visited during the tournament, or it may pause between sessions.

---

## 16. Possible Later Additions

- Per-match breakdown view (who predicted what, who got points).
- "Form" indicator or movement arrows on the leaderboard.
- CSV export of standings.
- A read-only public match page showing predictions after kickoff.
- Tie-break rule for equal points (e.g. most exact-score hits).

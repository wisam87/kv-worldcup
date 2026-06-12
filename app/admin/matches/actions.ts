"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { score } from "@/lib/scoring";
import { isResultUnlocked } from "@/lib/format";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export type ActionState = { error: string | null; ok?: boolean };

async function requireAdmin(): Promise<SupabaseServer> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

function revalidateMatch(id: string) {
  revalidatePath(`/admin/matches/${id}`);
  revalidatePath("/admin/matches");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/matches");
}

/** Recompute points_awarded for every prediction of a match. */
async function recomputeMatch(
  supabase: SupabaseServer,
  matchId: string,
  result: { home: number; away: number } | null
) {
  const { data: preds } = await supabase
    .from("predictions")
    .select("id, predicted_home, predicted_away")
    .eq("match_id", matchId);

  if (!preds) return;

  await Promise.all(
    preds.map((p) => {
      const points = result
        ? score(p.predicted_home, p.predicted_away, result.home, result.away)
        : 0;
      return supabase
        .from("predictions")
        .update({ points_awarded: points })
        .eq("id", p.id);
    })
  );
}

function parseScore(value: FormDataEntryValue | null): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 99) return null;
  return n;
}

export async function saveResult(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await requireAdmin();
    const matchId = String(formData.get("matchId") ?? "");
    const home = parseScore(formData.get("home_score"));
    const away = parseScore(formData.get("away_score"));

    if (!matchId) return { error: "Missing match." };
    if (home === null || away === null) {
      return { error: "Enter valid scores (0–99)." };
    }

    const { data: match } = await supabase
      .from("matches")
      .select("kickoff_time")
      .eq("id", matchId)
      .single();
    if (!match) return { error: "Match not found." };

    if (!isResultUnlocked(match.kickoff_time)) {
      return {
        error: "Results unlock 2 hours after kickoff.",
      };
    }

    const { error } = await supabase
      .from("matches")
      .update({ home_score: home, away_score: away, status: "finished" })
      .eq("id", matchId);
    if (error) return { error: error.message };

    await recomputeMatch(supabase, matchId, { home, away });
    revalidateMatch(matchId);
    return { error: null, ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function clearResult(formData: FormData) {
  const supabase = await requireAdmin();
  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) return;
  await supabase
    .from("matches")
    .update({ home_score: null, away_score: null, status: "scheduled" })
    .eq("id", matchId);
  await recomputeMatch(supabase, matchId, null);
  revalidateMatch(matchId);
}

export async function setTeams(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await requireAdmin();
    const matchId = String(formData.get("matchId") ?? "");
    const home = String(formData.get("home_team_id") ?? "");
    const away = String(formData.get("away_team_id") ?? "");
    if (!matchId) return { error: "Missing match." };
    if (home && away && home === away) {
      return { error: "Home and away teams must differ." };
    }

    const { error } = await supabase
      .from("matches")
      .update({
        home_team_id: home || null,
        away_team_id: away || null,
      })
      .eq("id", matchId);
    if (error) return { error: error.message };

    revalidateMatch(matchId);
    return { error: null, ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function savePrediction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await requireAdmin();
    const matchId = String(formData.get("matchId") ?? "");
    const participantId = String(formData.get("participant_id") ?? "");
    const ph = parseScore(formData.get("predicted_home"));
    const pa = parseScore(formData.get("predicted_away"));

    if (!matchId || !participantId) {
      return { error: "Pick a participant." };
    }
    if (ph === null || pa === null) {
      return { error: "Enter valid scores (0–99)." };
    }

    // Compute points against any existing result.
    const { data: match } = await supabase
      .from("matches")
      .select("home_score, away_score, status")
      .eq("id", matchId)
      .single();

    const points =
      match?.status === "finished" &&
      match.home_score !== null &&
      match.away_score !== null
        ? score(ph, pa, match.home_score, match.away_score)
        : 0;

    const { error } = await supabase.from("predictions").upsert(
      {
        match_id: matchId,
        participant_id: participantId,
        predicted_home: ph,
        predicted_away: pa,
        points_awarded: points,
      },
      { onConflict: "match_id,participant_id" }
    );
    if (error) return { error: error.message };

    revalidateMatch(matchId);
    return { error: null, ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function deletePrediction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  if (!id) return;
  await supabase.from("predictions").delete().eq("id", id);
  if (matchId) revalidateMatch(matchId);
}

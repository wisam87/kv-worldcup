"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "participant-photos";

export type ParticipantState = { error: string | null; ok?: boolean };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

function safeName(name: string) {
  return name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase().slice(0, 40);
}

/** Upload a photo file (if present and non-empty) and return its public URL. */
async function maybeUploadPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Photo must be under 5 MB.");
  }
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${Date.now()}-${safeName(file.name || "photo")}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error("Photo upload failed: " + error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createParticipant(
  _prev: ParticipantState,
  formData: FormData
): Promise<ParticipantState> {
  try {
    const supabase = await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Name is required." };

    const photoUrl = await maybeUploadPhoto(
      supabase,
      formData.get("photo") as File | null
    );

    const { error } = await supabase
      .from("participants")
      .insert({ name, photo_url: photoUrl });
    if (error) return { error: error.message };

    revalidatePath("/admin/participants");
    revalidatePath("/");
    return { error: null, ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function updateParticipant(
  _prev: ParticipantState,
  formData: FormData
): Promise<ParticipantState> {
  try {
    const supabase = await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!id) return { error: "Missing participant." };
    if (!name) return { error: "Name is required." };

    const photoUrl = await maybeUploadPhoto(
      supabase,
      formData.get("photo") as File | null
    );

    const patch: Record<string, unknown> = { name };
    if (photoUrl) patch.photo_url = photoUrl;

    const { error } = await supabase
      .from("participants")
      .update(patch)
      .eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/participants");
    revalidatePath("/");
    return { error: null, ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function deleteParticipant(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("participants").delete().eq("id", id);
  revalidatePath("/admin/participants");
  revalidatePath("/");
}

export async function removePhoto(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Best-effort: delete the stored object too, derived from its public URL.
  const { data: p } = await supabase
    .from("participants")
    .select("photo_url")
    .eq("id", id)
    .single();
  const url = p?.photo_url as string | undefined;
  const marker = `/${BUCKET}/`;
  const at = url?.indexOf(marker) ?? -1;
  if (url && at !== -1) {
    await supabase.storage.from(BUCKET).remove([url.slice(at + marker.length)]);
  }

  await supabase.from("participants").update({ photo_url: null }).eq("id", id);
  revalidatePath("/admin/participants");
  revalidatePath("/");
}

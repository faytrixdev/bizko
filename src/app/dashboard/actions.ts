"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_PROFILES_TAG } from "@/lib/supabase/queries";

const MAX_SERVICES = 8;
const MAX_SOCIALS = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Map raw PostgREST/Supabase errors to safe, user-facing codes. Never leak
// internal DB messages to end users.
function dashboardError(err: { code?: string; message?: string } | null): string | null {
  if (!err) return null;
  // 23505 = unique_violation
  if (err.code === "23505") return "duplicate";
  return "generic";
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const display_name = (formData.get("display_name") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim();
  const country = (formData.get("country") as string)?.trim();
  const phone_e164 = (formData.get("phone_e164") as string).replace(/\s/g, "");
  const email_public = (formData.get("email_public") as string)?.trim() || null;
  const template = formData.get("template") as string;
  const locale = formData.get("locale") as string;

  if (!display_name || !tagline || !city || !country || !phone_e164) {
    redirect("/dashboard?error=missing");
  }
  if (bio && bio.length > 280) redirect("/dashboard?error=generic");
  if (email_public && !EMAIL_RE.test(email_public)) redirect("/dashboard?error=invalid_email");

  const { error } = await supabase.from("profiles").update({
    display_name, tagline, bio, city, country, phone_e164, email_public, template, locale,
  }).eq("id", user.id);

  if (error) redirect(`/dashboard?error=${dashboardError(error)}`);
  revalidatePath("/dashboard");
  revalidatePath(`/[username]`, "page");
  updateTag(PUBLIC_PROFILES_TAG);
  redirect("/dashboard?success=profile");
}

export async function addService(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const title = (formData.get("title") as string)?.trim();
  const price = formData.get("price") as string;
  const currency = (formData.get("currency") as string) || "XOF";
  const description = (formData.get("description") as string)?.trim() || null;

  if (!title) redirect("/dashboard?error=missing");
  if (title.length > 60) redirect("/dashboard?error=generic");
  if (price && (Number.isNaN(Number(price)) || Number(price) < 0)) redirect("/dashboard?error=generic");

  const { count } = await supabase.from("services").select("*", { count: "exact", head: true }).eq("profile_id", user.id);
  if ((count ?? 0) >= MAX_SERVICES) redirect("/dashboard?error=services_limit");

  const { data: existing } = await supabase.from("services").select("position").eq("profile_id", user.id).order("position", { ascending: false }).limit(1);
  const nextPos = existing && existing[0] ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("services").insert({
    profile_id: user.id, title, description, price: price ? parseInt(price, 10) : null, currency, position: nextPos,
  });
  if (error) redirect(`/dashboard?error=${dashboardError(error)}`);
  revalidatePath("/dashboard");
  updateTag(PUBLIC_PROFILES_TAG);
  redirect("/dashboard?success=added");
}

export async function deleteService(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = formData.get("id") as string;
  const { error } = await supabase.from("services").delete().eq("id", id).eq("profile_id", user.id);
  if (error) redirect(`/dashboard?error=${dashboardError(error)}`);
  revalidatePath("/dashboard");
  updateTag(PUBLIC_PROFILES_TAG);
}

export async function addSocial(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const platform = (formData.get("platform") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();

  if (!platform || !url) redirect("/dashboard?error=missing");
  if (!/^https?:\/\/\S+$/.test(url)) redirect("/dashboard?error=invalid_url");

  const { count } = await supabase.from("social_links").select("*", { count: "exact", head: true }).eq("profile_id", user.id);
  if ((count ?? 0) >= MAX_SOCIALS) redirect("/dashboard?error=socials_limit");

  const { data: existing } = await supabase.from("social_links").select("position").eq("profile_id", user.id).order("position", { ascending: false }).limit(1);
  const nextPos = existing && existing[0] ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("social_links").insert({ profile_id: user.id, platform, url, position: nextPos });
  if (error) redirect(`/dashboard?error=${dashboardError(error)}`);
  revalidatePath("/dashboard");
  updateTag(PUBLIC_PROFILES_TAG);
  redirect("/dashboard?success=added");
}

export async function deleteSocial(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = formData.get("id") as string;
  const { error } = await supabase.from("social_links").delete().eq("id", id).eq("profile_id", user.id);
  if (error) redirect(`/dashboard?error=${dashboardError(error)}`);
  revalidatePath("/dashboard");
  updateTag(PUBLIC_PROFILES_TAG);
}

export async function deletePortfolio(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = formData.get("id") as string;

  const { data: item, error: fetchError } = await supabase
    .from("portfolio_items")
    .select("media_url, thumbnail_url")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();
  if (fetchError || !item) redirect("/dashboard?error=generic");

  const { error } = await supabase.from("portfolio_items").delete().eq("id", id).eq("profile_id", user.id);
  if (error) redirect(`/dashboard?error=${dashboardError(error)}`);

  const publicUrl = supabase.storage.from("portfolio").getPublicUrl("").data.publicUrl;
  const cleanUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
  for (const url of [item.media_url, item.thumbnail_url]) {
    if (!url) continue;
    // Best-effort: remove the orphaned storage object. Never block the delete.
    try {
      if (url.startsWith(cleanUrl)) {
        const path = url.slice(cleanUrl.length + 1);
        await supabase.storage.from("portfolio").remove([path]);
      }
    } catch {
      /* ignore storage cleanup failures */
    }
  }

  revalidatePath("/dashboard");
  updateTag(PUBLIC_PROFILES_TAG);
}

export async function reorderServices(orderedIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updates = orderedIds.map((id, index) =>
    supabase.from("services").update({ position: index }).eq("id", id).eq("profile_id", user.id)
  );

  await Promise.all(updates);
  revalidatePath("/dashboard");
  updateTag(PUBLIC_PROFILES_TAG);
}

export async function reorderPortfolio(orderedIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updates = orderedIds.map((id, index) =>
    supabase.from("portfolio_items").update({ position: index }).eq("id", id).eq("profile_id", user.id)
  );

  await Promise.all(updates);
  revalidatePath("/dashboard");
  updateTag(PUBLIC_PROFILES_TAG);
}

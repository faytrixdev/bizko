"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_PROFILES_TAG } from "@/lib/supabase/queries";
import { keyFromPublicUrl, deleteR2Object } from "@/lib/r2";
import { getLimits, isBillingInterval } from "@/lib/plans";
import { canUseTemplate } from "@/lib/template-config";
import { createCheckoutConfig, isYearlyProPlanConfigured } from "@/lib/whop";
import { isValidTestimonialInput } from "@/lib/testimonials";
import { getMessages } from "@/lib/i18n/messages";
import { resolveServerLocale } from "@/lib/i18n/messages-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Localize messages returned to the client by server actions. Server actions have
// access to the request's cookie / Accept-Language, matching the page they were
// called from.
async function actionMessages() {
  return getMessages(await resolveServerLocale());
}

// Map raw PostgREST/Supabase errors to safe, user-facing codes. Never leak
// internal DB messages to end users.
function dashboardError(err: { code?: string; message?: string } | null): string | null {
  if (!err) return null;
  // 23505 = unique_violation
  if (err.code === "23505") return "duplicate";
  return "generic";
}

// Resolve the current plan for the authenticated user.
async function currentPlan(supabase: Awaited<ReturnType<typeof createClient>>): Promise<"free" | "pro"> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";
  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  return isPro ? "pro" : "free";
}

// Resolve the current plan's limits for the authenticated user.
async function currentLimits(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getLimits(await currentPlan(supabase));
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

  if (!display_name || !tagline || !city || !country || !phone_e164) {
    redirect("/dashboard?error=missing");
  }
  if (bio && bio.length > 280) redirect("/dashboard?error=generic");
  if (email_public && !EMAIL_RE.test(email_public)) redirect("/dashboard?error=invalid_email");

  // Pro templates are locked for free users server-side (never trust the client).
  if (!canUseTemplate(await currentPlan(supabase), template)) {
    redirect("/dashboard?error=template_locked");
  }

  const { error } = await supabase.from("profiles").update({
    display_name, tagline, bio, city, country, phone_e164, email_public, template,
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

  const limits = await currentLimits(supabase);
  if (!limits) redirect("/login");

  const { count } = await supabase.from("services").select("*", { count: "exact", head: true }).eq("profile_id", user.id);
  if ((count ?? 0) >= limits.services) redirect("/dashboard?error=services_limit");

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

  const limits = await currentLimits(supabase);
  if (!limits) redirect("/login");

  const { count } = await supabase.from("social_links").select("*", { count: "exact", head: true }).eq("profile_id", user.id);
  if ((count ?? 0) >= limits.socials) redirect("/dashboard?error=socials_limit");

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

  const supabaseBase = supabase.storage.from("portfolio").getPublicUrl("").data.publicUrl;
  const cleanSupabaseBase = supabaseBase.endsWith("/") ? supabaseBase.slice(0, -1) : supabaseBase;

  for (const url of [item.media_url, item.thumbnail_url]) {
    if (!url) continue;
    // Best-effort: remove the orphaned object (R2 or Supabase). Never block the delete.
    try {
      const r2Key = keyFromPublicUrl(url);
      if (r2Key) {
        await deleteR2Object(r2Key);
      } else if (url.startsWith(cleanSupabaseBase)) {
        const path = url.slice(cleanSupabaseBase.length + 1);
        await supabase.storage.from("portfolio").remove([path]);
      }
    } catch {
      /* ignore cleanup failures */
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

export async function startSubscription(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  if (isPro) redirect("/dashboard?success=already_pro");

  const interval = (formData.get("interval") as string) ?? "monthly";
  if (!isBillingInterval(interval)) redirect("/dashboard?error=checkout_failed");

  let purchaseUrl: string;
  try {
    const { sessionId, purchaseUrl: url } = await createCheckoutConfig(user.id, interval);
    purchaseUrl = url;
    await supabase.from("pro_checkouts").insert({
      profile_id: user.id,
      checkout_configuration_id: sessionId,
    });
  } catch (err) {
    console.error("[startSubscription]", err);
    redirect("/dashboard?error=checkout_failed");
  }
  redirect(purchaseUrl);
}

/**
 * Lets an already-Pro member start the yearly plan. Intentionally NOT guarded
 * by `is_pro`: a new checkout creates a second Whop membership that bills in
 * parallel, so the monthly subscription keeps running until its period end and
 * must be cancelled by the member from the Whop portal. Only offered when a
 * distinct yearly plan is configured (otherwise "yearly" would silently fall
 * back to the monthly plan and charge a duplicate monthly).
 */
export async function changeSubscription(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const interval = (formData.get("interval") as string) ?? "";
  if (interval !== "yearly" || !isYearlyProPlanConfigured()) {
    redirect("/dashboard/subscription?error=checkout_failed");
  }

  let purchaseUrl: string;
  try {
    const { sessionId, purchaseUrl: url } = await createCheckoutConfig(
      user.id,
      "yearly",
      "/dashboard/subscription?success=plan_changed",
    );
    purchaseUrl = url;
    await supabase.from("pro_checkouts").insert({
      profile_id: user.id,
      checkout_configuration_id: sessionId,
    });
  } catch (err) {
    console.error("[changeSubscription]", err);
    redirect("/dashboard/subscription?error=checkout_failed");
  }
  redirect(purchaseUrl);
}

export async function addTestimonial(formData: FormData): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const msg = await actionMessages();

  const authorName = (formData.get("authorName") as string)?.trim() || "";
  const authorRole = (formData.get("authorRole") as string)?.trim() || undefined;
  const content = (formData.get("content") as string)?.trim() || "";
  const ratingRaw = formData.get("rating") as string;
  const rating = ratingRaw ? Number(ratingRaw) : undefined;

  if (!isValidTestimonialInput({ authorName, authorRole, content, rating })) {
    return { error: msg.dashboard.errorMissing };
  }

  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  const limits = getLimits(isPro ? "pro" : "free");
  const { count } = await supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("profile_id", user.id).eq("is_published", true);
  if ((count ?? 0) >= limits.publishedTestimonials) return { error: msg.dashboard.testimonialsFull };

  const { error } = await supabase.from("testimonials").insert({
    profile_id: user.id, author_name: authorName, author_role: authorRole ?? null,
    content, rating: rating ?? null, is_published: true,
  });
  if (error) return { error: msg.dashboard.errorGeneric };

  revalidatePath("/dashboard");
  revalidatePath(`/[username]`, "page");
  updateTag(PUBLIC_PROFILES_TAG);
  return { success: msg.dashboard.successAdded };
}

export async function approveTestimonial(testimonialId: string): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const msg = await actionMessages();

  const { data: existing } = await supabase.from("testimonials").select("id").eq("id", testimonialId).eq("profile_id", user.id).eq("is_published", false).maybeSingle();
  if (!existing) return { error: msg.dashboard.errorGeneric };

  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  const limits = getLimits(isPro ? "pro" : "free");
  const { count } = await supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("profile_id", user.id).eq("is_published", true);
  if ((count ?? 0) >= limits.publishedTestimonials) return { error: msg.dashboard.testimonialsFull };

  const { error } = await supabase.from("testimonials").update({ is_published: true }).eq("id", testimonialId).eq("profile_id", user.id).eq("is_published", false);
  if (error) return { error: msg.dashboard.errorGeneric };

  revalidatePath("/dashboard");
  revalidatePath(`/[username]`, "page");
  updateTag(PUBLIC_PROFILES_TAG);
  return { success: msg.dashboard.successAdded };
}

export async function deleteTestimonial(testimonialId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const msg = await actionMessages();

  const { error } = await supabase.from("testimonials").delete().eq("id", testimonialId).eq("profile_id", user.id);
  if (error) return { error: msg.dashboard.errorGeneric };

  revalidatePath("/dashboard");
  revalidatePath(`/[username]`, "page");
  updateTag(PUBLIC_PROFILES_TAG);
  return { ok: true };
}

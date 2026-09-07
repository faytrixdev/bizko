"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_PROFILES_TAG } from "@/lib/supabase/queries";
import { RESERVED_USERNAMES } from "@/lib/reservedUsernames";
import { trackEvent } from "@/lib/analytics";
import { canUseTemplate } from "@/lib/template-config";
import { isValidUsername } from "@/lib/validators";
import { normalizePhoneE164 } from "@/lib/utils";

// Resolve the current plan for the authenticated user (Pro may be granted
// before the profile exists, see subscriptions FK on auth.users).
async function currentPlan(supabase: Awaited<ReturnType<typeof createClient>>): Promise<"free" | "pro"> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";
  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  return isPro ? "pro" : "free";
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = (formData.get("username") as string).toLowerCase().trim();
  const display_name = (formData.get("display_name") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const country = (formData.get("country") as string)?.trim();
  const phone_raw = (formData.get("phone_e164") as string).trim();
  const phone_e164 = phone_raw ? normalizePhoneE164(phone_raw) : "";
  const service_title = (formData.get("service_title") as string)?.trim();
  const service_price = formData.get("service_price") as string;
  const service_currency = (formData.get("service_currency") as string) || "XOF";
  const template = (formData.get("template") as string) || "minimal";

  // Validate username
  if (!isValidUsername(username)) {
    redirect("/onboarding?error=username_invalide");
  }
  if (RESERVED_USERNAMES.has(username)) {
    redirect("/onboarding?error=username_reserve");
  }
  if (!display_name || !tagline || !city || !country || !phone_e164) {
    redirect("/onboarding?error=champs_requis");
  }

  // Pro templates are locked for free users server-side (never trust the client).
  if (!canUseTemplate(await currentPlan(supabase), template)) {
    redirect("/onboarding?error=template_locked");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name,
      tagline,
      city,
      country,
      phone_e164,
      template,
      locale: "fr",
    });

    if (profileError) {
      if (profileError.code === "23505") redirect("/onboarding?error=username_pris");
      console.error("onboarding profile insert error:", profileError.code, profileError.message, profileError.details);
      redirect("/onboarding?error=echec");
    }

    await trackEvent("profile_completed", { pagePath: "/onboarding" });

    if (service_title) {
      const { error: serviceError } = await supabase.from("services").insert({
        profile_id: user.id,
        title: service_title,
        price: service_price ? parseInt(service_price, 10) : null,
        currency: service_currency,
        position: 0,
      });
      if (serviceError) {
        console.error("onboarding service insert error:", serviceError);
      } else {
        await trackEvent("service_created", { pagePath: "/onboarding" });
      }
    }
  }

  revalidatePath("/", "layout");
  updateTag(PUBLIC_PROFILES_TAG);
  redirect("/dashboard");
}

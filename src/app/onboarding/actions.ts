"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_PROFILES_TAG } from "@/lib/supabase/queries";
import { RESERVED_USERNAMES } from "@/lib/reservedUsernames";
import { trackEvent } from "@/lib/analytics";
import { isValidUsername } from "@/lib/validators";
import { normalizePhoneE164 } from "@/lib/utils";

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
      template: "minimal",
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

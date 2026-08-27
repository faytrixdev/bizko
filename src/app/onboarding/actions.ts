"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = (formData.get("username") as string).toLowerCase().trim();
  const display_name = formData.get("display_name") as string;
  const tagline = formData.get("tagline") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const phone_e164 = (formData.get("phone_e164") as string).replace(/\s/g, "");
  const service_title = formData.get("service_title") as string;
  const service_price = formData.get("service_price") as string;
  const service_currency = (formData.get("service_currency") as string) || "XOF";

  // Validate username
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    redirect("/onboarding?error=username_invalide");
  }

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
    redirect(`/onboarding?error=${encodeURIComponent(profileError.message)}`);
  }

  if (service_title) {
    await supabase.from("services").insert({
      profile_id: user.id,
      title: service_title,
      price: service_price ? parseInt(service_price, 10) : null,
      currency: service_currency,
      position: 0,
    });
  }

  redirect("/dashboard");
}

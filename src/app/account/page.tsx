import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Colonnes explicites : `select("*")` échouerait après la liste blanche de
  // colonnes (migration 20260923000008) qui exclut is_admin/commission_rate.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, tagline, bio, city, country, phone_e164, email_public, template, locale, avatar_url, is_partner, partner_code")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return <AccountClient user={user} profile={profile} />;
}

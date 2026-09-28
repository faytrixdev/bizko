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
  // is_partner/partner_code sont volontairement absents : AccountClient n'utilise
  // que `user`, et les lire rendait la page dépendante de la migration
  // 20260917000002 (programme partenaires). Sans elle en base, PostgREST renvoie
  // 42703, `profile` vaut null, et la page partait en boucle vers /dashboard.
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, tagline, bio, city, country, phone_e164, email_public, template, locale, avatar_url")
    .eq("id", user.id)
    .single();

  // Une erreur de lecture n'est pas un profil absent : la traiter comme tel
  // déclenchait une redirection en cascade. On la remonte pour qu'elle soit
  // visible dans les logs au lieu de disparaître derrière un /dashboard.
  if (error) {
    throw new Error(`account: profil illisible (${error.code})`, { cause: error });
  }

  if (!profile) {
    redirect("/onboarding");
  }

  return <AccountClient user={user} profile={profile} />;
}

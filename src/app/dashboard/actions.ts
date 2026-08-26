"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const display_name = formData.get("display_name") as string;
  const tagline = formData.get("tagline") as string;
  const bio = formData.get("bio") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const phone_e164 = (formData.get("phone_e164") as string).replace(/\s/g, "");
  const email_public = (formData.get("email_public") as string) || null;
  const template = formData.get("template") as string;

  const { error } = await supabase.from("profiles").update({
    display_name, tagline, bio: bio || null, city, country, phone_e164, email_public, template,
  }).eq("id", user.id);

  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
  revalidatePath(`/[username]`, "page");
}

export async function addService(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const title = formData.get("title") as string;
  const price = formData.get("price") as string;
  const currency = (formData.get("currency") as string) || "XOF";
  const description = (formData.get("description") as string) || null;

  const { data: existing } = await supabase.from("services").select("position").eq("profile_id", user.id).order("position", { ascending: false }).limit(1);
  const nextPos = existing && existing[0] ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("services").insert({
    profile_id: user.id, title, description, price: price ? parseInt(price, 10) : null, currency, position: nextPos,
  });
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
}

export async function deleteService(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/dashboard");
}

export async function addSocial(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const platform = formData.get("platform") as string;
  const url = formData.get("url") as string;
  const { error } = await supabase.from("social_links").insert({ profile_id: user.id, platform, url, position: 0 });
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
}

export async function deleteSocial(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("social_links").delete().eq("id", id);
  revalidatePath("/dashboard");
}

export async function deletePortfolio(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("portfolio_items").delete().eq("id", id);
  revalidatePath("/dashboard");
}

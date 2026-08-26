"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("signup error:", error);
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const digest = (e as { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) throw e;
    const msg = e instanceof Error ? `${e.message} ${"cause" in e ? String((e as { cause?: unknown }).cause) : ""}` : String(e);
    console.error("signup fetch exception:", e);
    redirect(`/signup?error=${encodeURIComponent("fetch failed: " + msg)}`);
  }
  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("login error:", error);
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const digest = (e as { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) throw e;
    const msg = e instanceof Error ? e.message : String(e);
    console.error("login fetch exception:", e);
    redirect(`/login?error=${encodeURIComponent("fetch failed: " + msg)}`);
  }

  // Check if profile exists -> onboarding or dashboard
  const { data: user } = await supabase.auth.getUser();
  if (user.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.user.id)
      .single();
    revalidatePath("/", "layout");
    if (!profile) redirect("/onboarding");
    redirect("/dashboard");
  }
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });
    if (error) {
      console.error("forgot error:", error);
      redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const digest = (e as { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) throw e;
    redirect(`/forgot-password?error=${encodeURIComponent(String(e))}`);
  }
  redirect(`/forgot-password?success=${encodeURIComponent("Lien envoyé — vérifie ta boîte mail.")}`);
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;
  if (password !== confirm) redirect(`/reset-password?error=${encodeURIComponent("Les mots de passe ne correspondent pas.")}`);
  if (password.length < 6) redirect(`/reset-password?error=${encodeURIComponent("6 caractères minimum.")}`);
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("reset error:", error);
      redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const digest = (e as { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) throw e;
    redirect(`/reset-password?error=${encodeURIComponent(String(e))}`);
  }
  redirect("/login?success=Mot de passe mis à jour — connecte-toi.");
}

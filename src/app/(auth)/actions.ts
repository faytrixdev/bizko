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
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
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

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (user?.email_confirmed_at === null) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email || email)}`);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
    revalidatePath("/", "layout");
    if (!profile) redirect("/onboarding");
    redirect("/dashboard");
  }
  redirect("/dashboard");
}

export async function loginWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  if (newPassword.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Utilisateur non trouvé." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Mot de passe modifié avec succès." };
}

export async function deleteAccount() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Utilisateur non trouvé." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileError) {
    return { error: "Erreur lors de la suppression du profil." };
  }

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    return { error: "Erreur lors de la déconnexion." };
  }

  redirect("/");
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Email de confirmation renvoyé." };
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
  redirect(`/forgot-password?success=${encodeURIComponent("Lien envoyé - vérifie ta boîte mail.")}`);
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
  redirect("/login?success=Mot de passe mis à jour - connecte-toi.");
}

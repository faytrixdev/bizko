"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });
    if (error) {
      console.error("signup error:", error);
      redirect(`/signup?error=${encodeURIComponent("signup_failed")}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const digest = (e as { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) throw e;
    console.error("signup fetch exception:", e);
    redirect(`/signup?error=${encodeURIComponent("fetch_failed")}`);
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
      redirect(`/login?error=${encodeURIComponent("identifiants_invalid")}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const digest = (e as { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) throw e;
    console.error("login fetch exception:", e);
    redirect(`/login?error=${encodeURIComponent("fetch_failed")}`);
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

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Utilisateur non trouvé." };
  }

  const currentPassword = formData.get("currentPassword") as string;
  if (!currentPassword) {
    return { error: "Mot de passe actuel requis pour supprimer le compte." };
  }

  if (!user.email) {
    return { error: "Impossible de re-vérifier le compte (email manquant)." };
  }

  // Re-authenticate before any destructive operation. Prevents account
  // deletion by a compromised/unattended session.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const uid = user.id;
  const admin = createAdminClient();

  // Best-effort: delete the user's storage files using the service role so we
  // don't depend on the user session token (which dies once the user is gone),
  // and so a storage failure never blocks the account deletion.
  for (const bucket of ["avatars", "portfolio"]) {
    const { data: objects } = await admin.storage.from(bucket).list(uid);
    if (objects && objects.length > 0) {
      const paths = objects.map((o) => `${uid}/${o.name}`);
      await admin.storage.from(bucket).remove(paths);
    }
  }

  // Delete the auth user via the server-side service role client.
  // The FK profiles.id -> auth.users(id) ON DELETE CASCADE then removes the
  // profile, which cascades to services, portfolio_items, social_links & events.
  // Deleting the auth user FIRST means a failure here never leaves the account
  // alive without its data (no orphaned profile / partial deletion).
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(uid);

  if (deleteUserError) {
    return { error: "Erreur lors de la suppression du compte." };
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
      redirect(`/forgot-password?error=${encodeURIComponent("forgot_failed")}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const digest = (e as { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) throw e;
    redirect(`/forgot-password?error=${encodeURIComponent("forgot_failed")}`);
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
      redirect(`/reset-password?error=${encodeURIComponent("fetch_failed")}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const digest = (e as { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) throw e;
    redirect(`/reset-password?error=${encodeURIComponent("fetch_failed")}`);
  }
  redirect("/login?success=Mot de passe mis à jour - connecte-toi.");
}

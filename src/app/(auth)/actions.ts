"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PUBLIC_PROFILES_TAG } from "@/lib/supabase/queries";
import { getMessages } from "@/lib/i18n/messages";
import { resolveServerLocale } from "@/lib/i18n/messages-server";

// Localize messages returned to the client by server actions. Server actions have
// access to the request's cookie / Accept-Language, matching the page they were
// called from.
async function actionMessages() {
  return getMessages(await resolveServerLocale());
}

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
  const msg = await actionMessages();

  if (newPassword !== confirmPassword) {
    return { error: msg.password.errorMismatch };
  }

  if (newPassword.length < 6) {
    return { error: msg.password.errorMin };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: msg.password.errorNotFound };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: msg.password.errorCurrent };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("changePassword updateUser error:", error);
    return { error: msg.password.error };
  }

  return { success: msg.password.success };
}

const DELETE_CONFIRMATION = "DELETE";

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const msg = await actionMessages();

  if (!user) {
    return { error: msg.auth2.userNotFound };
  }

  const confirmation = (formData.get("confirmation") as string) ?? "";
  if (confirmation !== DELETE_CONFIRMATION) {
    return { error: msg.accountPage.deleteConfirmationRequired };
  }

  const currentPassword = formData.get("currentPassword") as string;
  if (!currentPassword) {
    return { error: msg.accountPage.passwordRequiredForDelete };
  }

  if (!user.email) {
    return { error: msg.accountPage.reverifyEmailMissing };
  }

  // Re-authenticate before any destructive operation. Prevents account
  // deletion by a compromised/unattended session.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) {
    return { error: msg.password.errorCurrent };
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
    return { error: msg.deleteAccount.error };
  }

  const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });

  if (signOutError) {
    return { error: msg.auth2.logoutError };
  }

  updateTag(PUBLIC_PROFILES_TAG);
  redirect("/");
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();
  const msg = await actionMessages();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });

  if (error) {
    console.error("resendConfirmationEmail error:", error);
    return { error: msg.auth2.errorFetchFailed };
  }

  return { success: msg.auth2.successEmailResent };
}

export async function logout(): Promise<{ error?: string } | { ok: true }> {
  const supabase = await createClient();
  const msg = await actionMessages();
  // Local scope: only revoke THIS device's session, not the user's other
  // logged-in devices. Global scope (the default) signs the user out everywhere.
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    console.error("logout error:", error);
    return { error: msg.auth2.logoutError };
  }
  // Navigate client-side to "/" (see LogoutConfirmModal): redirect() here would
  // surface as a NEXT_REDIRECT error to the imperative `await logout()` caller.
  return { ok: true };
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
  redirect(`/forgot-password?success=${encodeURIComponent("email_sent")}`);
}

export async function exchangeResetCode(code: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeResetCode error:", error);
  }
  return { error: error ? true : false };
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;
  if (password !== confirm) redirect(`/reset-password?error=${encodeURIComponent("reset_mismatch")}`);
  if (password.length < 6) redirect(`/reset-password?error=${encodeURIComponent("reset_too_short")}`);
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
  redirect("/login?success=password_updated");
}

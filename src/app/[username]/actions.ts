"use server";

import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public-client";
import { PUBLIC_PROFILES_TAG } from "@/lib/supabase/queries";
import { checkRateLimit } from "@/lib/rateLimit";
import { requestThrottleKey } from "@/lib/clientKey";
import { isValidTestimonialInput } from "@/lib/testimonials";
import { getMessages } from "@/lib/i18n/messages";
import { resolveServerLocale } from "@/lib/i18n/messages-server";

const TESTIMONIAL_RATE_LIMIT = 6;
const TESTIMONIAL_RATE_WINDOW_MS = 60_000;

export async function submitTestimonial(formData: FormData): Promise<{ success?: string; error?: string }> {
  const msg = getMessages(await resolveServerLocale());

  const authorName = (formData.get("authorName") as string)?.trim() || "";
  const authorRole = (formData.get("authorRole") as string)?.trim() || undefined;
  const content = (formData.get("content") as string)?.trim() || "";
  const ratingRaw = formData.get("rating") as string;
  const rating = ratingRaw ? Number(ratingRaw) : undefined;
  const profileId = (formData.get("profileId") as string)?.trim() || "";

  if ((formData.get("company") as string)?.trim()) {
    return { error: msg.profile.testimonials.errorHoneypot };
  }

  if (!isValidTestimonialInput({ authorName, authorRole, content, rating })) {
    return { error: msg.profile.testimonials.errorMissing };
  }

  if (!profileId) {
    return { error: msg.profile.testimonials.errorMissing };
  }

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown";

  const { allowed } = checkRateLimit(`testimonial:${ip}:${profileId}`, {
    limit: TESTIMONIAL_RATE_LIMIT,
    windowMs: TESTIMONIAL_RATE_WINDOW_MS,
  });
  if (!allowed) {
    return { error: msg.profile.testimonials.errorRateLimited };
  }

  // Insertion directe révoquée pour anon (migration 20260923000007) : la
  // soumission passe par la RPC, qui vérifie que le profil cible est public,
  // re-borne les champs et rate-limite en base (partagé entre instances).
  const { error } = await createPublicClient().rpc("submit_testimonial", {
    p_profile_id: profileId,
    p_author_name: authorName,
    p_author_role: authorRole ?? null,
    p_content: content,
    p_rating: rating ?? null,
    p_throttle_key: requestThrottleKey(headerStore as unknown as Headers),
  });
  if (error) {
    if (error.message?.includes("rate limited")) {
      return { error: msg.profile.testimonials.errorRateLimited };
    }
    return { error: msg.profile.testimonials.errorGeneric };
  }

  updateTag(PUBLIC_PROFILES_TAG);
  revalidatePath("/[username]", "page");
  return { success: msg.profile.testimonials.pendingSuccess };
}
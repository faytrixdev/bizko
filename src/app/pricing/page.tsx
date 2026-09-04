import { getServerMessages } from "@/lib/i18n/messages-server";
import { createClient } from "@/lib/supabase/server";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { PricingClient, type PricingCtaState } from "./PricingClient";

export const metadata = {
  title: "Bizko - Tarifs",
  description:
    "Compare Bizko Free et Bizko Pro. Services, reseaux, portfolio, videos et templates - choisis le plan qui te fait grandir.",
  alternates: {
    canonical: "/pricing",
  },
};

type SubRow = {
  plan?: string | null;
  status?: string | null;
};

export default async function PricingPage() {
  const msg = await getServerMessages();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ctaState: PricingCtaState = "guest";
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("profile_id", user.id)
      .maybeSingle();
    const row = sub && !Array.isArray(sub) ? (sub as SubRow) : null;
    const isPro =
      row?.plan === "pro" && (row.status === "active" || row.status === "trialing");
    ctaState = isPro ? "pro" : "free";
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar msg={msg} />
      <PricingClient ctaState={ctaState} />

      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <span className="text-lg font-bold font-display text-gray-900 tracking-tight">Bizko</span>
          <p className="mt-2 text-sm text-gray-400">{msg.landing.footerTagline}</p>
        </div>
      </footer>
    </div>
  );
}
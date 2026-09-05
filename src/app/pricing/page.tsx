import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { createClient } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/plans";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PricingClient, type PricingCtaState } from "./PricingClient";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title: msg.meta.pricingTitle,
    description: msg.meta.pricingDescription,
    alternates: {
      canonical: "/pricing",
    },
  };
}

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
  let username: string | undefined;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("profile_id", user.id)
      .maybeSingle();
    const row = sub && !Array.isArray(sub) ? (sub as SubRow) : null;
    const isPro = isProPlan(row?.plan, row?.status);
    ctaState = isPro ? "pro" : "free";
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    const p = profile && !Array.isArray(profile) ? profile : null;
    username = p?.username ?? undefined;
  }

  return (
    <div className="min-h-screen bg-white">
      {user ? <DashboardHeader username={username} isPro={ctaState === "pro"} /> : <LandingNavbar msg={msg} />}
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
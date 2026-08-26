"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { TabOverview, TabServices, TabPortfolio, TabSocials, TabSettings } from "@/components/dashboard";
import { useI18n } from "@/lib/i18n/provider";

type Tab = "apercu" | "services" | "portfolio" | "reseaux" | "reglages";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  tagline: string;
  bio: string | null;
  city: string;
  country: string;
  phone_e164: string;
  email_public: string | null;
  template: string;
  avatar_url: string | null;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  position: number;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string | null;
  position: number;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  position: number;
}

interface DashboardClientProps {
  profile: Profile;
  services: Service[];
  portfolio: PortfolioItem[];
  socials: SocialLink[];
  views: number;
  waClicks: number;
  publicUrl: string;
  error?: string;
}

export function DashboardClient({
  profile,
  services,
  portfolio,
  socials,
  views,
  waClicks,
  publicUrl,
  error,
}: DashboardClientProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("apercu");

  const TABS: { id: Tab; label: string }[] = [
    { id: "apercu", label: t("dashboard.tabs.apercu") },
    { id: "services", label: t("dashboard.tabs.services") },
    { id: "portfolio", label: t("dashboard.tabs.portfolio") },
    { id: "reseaux", label: t("dashboard.tabs.reseaux") },
    { id: "reglages", label: t("dashboard.tabs.reglages") },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold font-display text-gray-900">
            Bizko<span className="text-[#FF6B35]">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <LocaleSwitch />
            <Link href={`/${profile.username}`} target="_blank" className="text-xs font-medium text-gray-500 hover:text-gray-900">
              {t("dashboard.viewProfile")}
            </Link>
            <form action={logout}>
              <button className="text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-50">
                {t("dashboard.logout")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-6">
        {error && (
          <p className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
            {decodeURIComponent(error)}
          </p>
        )}

        {/* Tab bar */}
        <nav className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`flex-1 h-9 rounded-lg text-xs font-medium transition ${
                tab === tabItem.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        {tab === "apercu" && <TabOverview publicUrl={publicUrl} username={profile.username} views={views} waClicks={waClicks} />}
        {tab === "services" && <TabServices services={services} />}
        {tab === "portfolio" && <TabPortfolio portfolio={portfolio} profileId={profile.id} />}
        {tab === "reseaux" && <TabSocials socials={socials} />}
        {tab === "reglages" && <TabSettings profile={profile} />}
      </div>
    </div>
  );
}

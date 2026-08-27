"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { TabOverview, TabServices, TabPortfolio, TabSocials, TabSettings } from "@/components/dashboard";
import { useI18n } from "@/lib/i18n/provider";
import type { Profile, Service, PortfolioItem, SocialLink } from "@/types/database";

type Tab = "apercu" | "services" | "portfolio" | "reseaux" | "reglages";

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

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "apercu", label: t("dashboard.tabs.apercu"), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: "services", label: t("dashboard.tabs.services"), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg> },
    { id: "portfolio", label: t("dashboard.tabs.portfolio"), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg> },
    { id: "reseaux", label: t("dashboard.tabs.reseaux"), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg> },
    { id: "reglages", label: t("dashboard.tabs.reglages"), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-100/60">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <img src="/logo.png" alt="Bizko" className="h-10" />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LocaleSwitch />
            <div className="w-px h-5 bg-gray-200 mx-0.5 sm:mx-1" />
            <Link href={`/${profile.username}`} target="_blank"
              className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:px-2 sm:h-auto sm:py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50">
              <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              <span className="hidden sm:inline ml-1.5">{t("dashboard.viewProfile")}</span>
            </Link>
            <Link href="/account"
              className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:px-2.5 sm:h-auto sm:py-1.5 text-xs font-medium border border-gray-200/80 bg-white rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200">
              <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline ml-1.5">Compte</span>
            </Link>
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
        <nav className="flex w-full border-b border-gray-200 mb-6">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-medium transition-colors duration-200 ${
                tab === tabItem.id
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="hidden sm:inline">{tabItem.icon}</span>
              {tabItem.label}
              {tab === tabItem.id && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gray-900 rounded-full" />
              )}
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { PasswordChangeForm } from "@/components/account/PasswordChangeForm";
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog";
import { useI18n } from "@/lib/i18n/provider";
import type { Profile } from "@/types/database";

type Tab = "securite" | "compte";

interface AccountClientProps {
  user: { id: string; email?: string };
  profile: Profile;
}

export function AccountClient({ user, profile }: AccountClientProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("securite");

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "securite", label: t("account.security"), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> },
    { id: "compte", label: t("account.account"), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-100/60">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex">
            <img src="/logo.png" alt="Bizko" className="h-7" />
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {t("dashboard.viewProfile")}
            </Link>
            <form action={logout}>
              <button className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium border border-gray-200/80 bg-white rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t("account.title")}</h1>

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

        {tab === "securite" && <PasswordChangeForm />}
        {tab === "compte" && <DeleteAccountDialog user={user} />}
      </div>
    </div>
  );
}

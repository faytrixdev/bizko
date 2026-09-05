"use client";

import React from "react";
import Link from "next/link";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { Logo } from "@/components/Logo";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { useI18n } from "@/lib/i18n/provider";

interface DashboardHeaderProps {
  username?: string;
  isPro: boolean;
}

export function DashboardHeader({ username, isPro }: DashboardHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-100/60">
      <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="inline-flex">
          <Logo size="md" />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <InstallAppButton />
          <LocaleSwitch />
          {username && (
            <>
              <div className="w-px h-5 bg-gray-200 mx-0.5 sm:mx-1" />
              <Link href={`/${username}`} target="_blank"
                className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:px-2 sm:h-auto sm:py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50">
                <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                <span className="hidden sm:inline ml-1.5">{t("dashboard.viewProfile")}</span>
              </Link>
            </>
          )}
          {isPro && (
            <Link href="/dashboard/subscription"
              className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:px-2 sm:h-auto sm:py-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors duration-200 rounded-lg hover:bg-violet-50">
              <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <span className="hidden sm:inline ml-1.5">{t("subscription.manage")}</span>
            </Link>
          )}
          <Link href="/account"
            className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:px-2.5 sm:h-auto sm:py-1.5 text-xs font-medium border border-gray-200/80 bg-white rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200">
            <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline ml-1.5">{t("accountPage.account")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

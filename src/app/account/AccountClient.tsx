"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PasswordChangeModal } from "@/components/account/PasswordChangeModal";
import { LogoutConfirmModal } from "@/components/account/LogoutConfirmModal";
import { DeleteAccountModal } from "@/components/account/DeleteAccountModal";
import { useI18n } from "@/lib/i18n/provider";
import { useConsent } from "@/lib/cookies/consent-context";
import { Logo } from "@/components/Logo";
import type { Profile } from "@/types/database";

interface AccountClientProps {
  user: { id: string; email?: string };
  profile: Profile;
}

export function AccountClient({ user, profile }: AccountClientProps) {
  const { t } = useI18n();
  const { status, openBanner } = useConsent();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-100/60">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex">
            <Logo size="md" />
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
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t("accountPage.title")}</h1>

        <div className="flex flex-col gap-4">
          {/* Security Section */}
          <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t("accountPage.security")}</h2>
                <p className="text-xs text-gray-500">{t("accountPage.securityDesc")}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{t("accountPage.passwordLabel")}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("accountPage.passwordDesc")}</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                {t("accountPage.changePassword")}
              </button>
            </div>
          </div>

          {/* Session Section */}
          <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t("accountPage.session")}</h2>
                <p className="text-xs text-gray-500">{t("accountPage.sessionDesc")}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{t("accountPage.logout")}</p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                {t("accountPage.logout")}
              </button>
            </div>
          </div>

          {/* Cookie Preferences Section */}
          <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t("cookieConsent.title")}</h2>
                <p className="text-xs text-gray-500">{t("cookieConsent.description")}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{t("cookieConsent.managePreferences")}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {status === "accepted" ? t("cookieConsent.statusAccepted") : status === "refused" ? t("cookieConsent.statusRefused") : "—"}
                </p>
              </div>
              <button
                onClick={openBanner}
                className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                {t("cookieConsent.managePreferences")}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-200 rounded-2xl p-6 bg-red-50/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-red-800">{t("accountPage.dangerZone")}</h2>
                <p className="text-xs text-red-600">{t("accountPage.dangerDesc")}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-red-200">
              <div>
                <p className="text-sm font-medium text-red-800">{t("accountPage.deleteAccount")}</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="h-9 px-4 rounded-lg border border-red-300 bg-white text-xs font-medium text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
              >
                {t("accountPage.deleteAccount")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PasswordChangeModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <LogoutConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        user={user}
      />
    </div>
  );
}

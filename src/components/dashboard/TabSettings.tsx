"use client";

import Link from "next/link";
import { updateProfile } from "@/app/dashboard/actions";
import { AvatarUpload } from "@/components/Upload";
import { CountrySelect } from "@/components/CountrySelect";
import { CustomSelect } from "@/components/CustomSelect";
import { useI18n } from "@/lib/i18n/provider";
import type { Profile } from "@/types/database";

interface TabSettingsProps {
  profile: Profile;
}

export function TabSettings({ profile }: TabSettingsProps) {
  const { t } = useI18n();

  return (
    <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.settingsTitle")}</h2>
      <div className="mt-3">
        <AvatarUpload profileId={profile.id} currentUrl={profile.avatar_url} />
      </div>
      <form action={updateProfile} className="mt-4 flex flex-col gap-3">
        <input name="display_name" defaultValue={profile.display_name} required placeholder={t("dashboard.namePlaceholder")} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
        <input name="tagline" defaultValue={profile.tagline} required placeholder={t("dashboard.taglinePlaceholder")} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
        <textarea name="bio" defaultValue={profile.bio || ""} placeholder={t("dashboard.bioPlaceholder")} maxLength={280} className="rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 resize-none" rows={3} />
        <div className="flex gap-3">
          <input name="city" defaultValue={profile.city} required placeholder={t("dashboard.cityPlaceholder")} className="flex-1 min-w-0 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
          <CountrySelect name="country" defaultValue={profile.country} required className="flex-1 min-w-0 h-10" />
        </div>
        <input name="phone_e164" defaultValue={profile.phone_e164} required placeholder={t("dashboard.phonePlaceholder")} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
        <input name="email_public" defaultValue={profile.email_public || ""} placeholder={t("dashboard.emailPlaceholder")} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
        <CustomSelect
          name="template"
          defaultValue={profile.template}
          options={[
            { value: "minimal", label: t("dashboard.templateMinimal") },
            { value: "portfolio", label: t("dashboard.templatePortfolio") },
          ]}
          className="h-10"
        />
        <CustomSelect
          name="locale"
          defaultValue={profile.locale || "fr"}
          options={[
            { value: "fr", label: "Français" },
            { value: "en", label: "English" },
          ]}
          className="h-10"
        />
        <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#EA580C] transition-all duration-200 hover:shadow-sm active:scale-[0.98]">
          {t("dashboard.save")}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          href="/account"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
           {t("settings.myAccount")}
        </Link>
      </div>
    </div>
  );
}

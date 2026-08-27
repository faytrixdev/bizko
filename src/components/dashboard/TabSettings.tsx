"use client";

import { updateProfile } from "@/app/dashboard/actions";
import { AvatarUpload } from "@/components/Upload";
import { useI18n } from "@/lib/i18n/provider";

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
          <input name="city" defaultValue={profile.city} required placeholder={t("dashboard.cityPlaceholder")} className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
          <input name="country" defaultValue={profile.country} required placeholder={t("dashboard.countryPlaceholder")} className="w-20 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
        </div>
        <input name="phone_e164" defaultValue={profile.phone_e164} required placeholder={t("dashboard.phonePlaceholder")} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
        <input name="email_public" defaultValue={profile.email_public || ""} placeholder={t("dashboard.emailPlaceholder")} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
        <select name="template" defaultValue={profile.template} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-gray-900/10 transition-all duration-200">
          <option value="minimal">{t("dashboard.templateMinimal")}</option>
          <option value="portfolio">{t("dashboard.templatePortfolio")}</option>
        </select>
        <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#EA580C] transition-all duration-200 hover:shadow-sm active:scale-[0.98]">
          {t("dashboard.save")}
        </button>
      </form>
    </div>
  );
}

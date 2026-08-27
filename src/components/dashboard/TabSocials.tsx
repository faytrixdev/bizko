"use client";

import { addSocial, deleteSocial } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";
import { CustomSelect } from "@/components/CustomSelect";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  position: number;
}

interface TabSocialsProps {
  socials: SocialLink[];
}

export function TabSocials({ socials }: TabSocialsProps) {
  const { t } = useI18n();

  return (
    <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.socialsTitle")} ({socials.length}/6)</h2>
      {socials.length >= 6 ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t("dashboard.socialsFull")}
        </p>
      ) : (
        <form action={addSocial} className="mt-3 flex flex-col gap-2">
          <CustomSelect
            name="platform"
            placeholder="Plateforme..."
            options={[
              { value: "instagram", label: "Instagram" },
              { value: "tiktok", label: "TikTok" },
              { value: "linkedin", label: "LinkedIn" },
              { value: "facebook", label: "Facebook" },
              { value: "x", label: "X" },
              { value: "youtube", label: "YouTube" },
              { value: "website", label: "Website" },
            ]}
            className="h-10"
          />
          <input name="url" required placeholder="https://..." className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
          <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C] transition-all duration-200 hover:shadow-sm">
            {t("dashboard.add")}
          </button>
        </form>
      )}
      <div className="mt-3 flex flex-col gap-2">
        {socials.map((s) => (
          <div key={s.id} className="flex items-center justify-between border border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5">
            <span className="text-sm truncate text-gray-900">
              {s.platform}: <span className="text-gray-500 font-normal">{s.url}</span>
            </span>
            <form action={deleteSocial}>
              <input type="hidden" name="id" value={s.id} />
              <button className="text-xs text-red-600 hover:underline shrink-0 ml-3">
                x
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

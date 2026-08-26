"use client";

import { addSocial, deleteSocial } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";

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
    <div className="border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.socialsTitle")} ({socials.length}/6)</h2>
      {socials.length >= 6 ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t("dashboard.socialsFull")}
        </p>
      ) : (
        <form action={addSocial} className="mt-3 flex flex-col gap-2">
          <select name="platform" className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="x">X</option>
            <option value="youtube">YouTube</option>
            <option value="website">Website</option>
          </select>
          <input name="url" required placeholder="https://..." className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
          <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">
            {t("dashboard.add")}
          </button>
        </form>
      )}
      <div className="mt-3 flex flex-col gap-2">
        {socials.map((s) => (
          <div key={s.id} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5">
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

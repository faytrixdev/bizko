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
    <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.socialsTitle")} ({socials.length}/6)</h2>
      {socials.length >= 6 ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t("dashboard.socialsFull")}
        </p>
      ) : (
        <form action={addSocial} className="mt-3 flex flex-col gap-2">
          <select name="platform" className="h-10 rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat">
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="x">X</option>
            <option value="youtube">YouTube</option>
            <option value="website">Website</option>
          </select>
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

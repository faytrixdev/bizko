"use client";

import { addService, deleteService } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  position: number;
}

interface TabServicesProps {
  services: Service[];
}

export function TabServices({ services }: TabServicesProps) {
  const { t } = useI18n();

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.servicesTitle")} ({services.length}/8)</h2>
      {services.length >= 8 ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t("dashboard.servicesFull")}
        </p>
      ) : (
        <form action={addService} className="mt-3 flex flex-col gap-2">
          <input name="title" required placeholder={t("dashboard.titlePlaceholder")} maxLength={60} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
          <div className="flex gap-2">
            <input name="price" type="number" placeholder={t("dashboard.pricePlaceholder")} min={0} className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
            <input name="currency" defaultValue="XOF" className="w-20 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
          </div>
          <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">
            {t("dashboard.add")}
          </button>
        </form>
      )}
      <div className="mt-4 flex flex-col gap-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-gray-900">{s.title}</p>
              {s.price != null && (
                <p className="text-xs text-gray-500">
                  {s.price.toLocaleString()} {s.currency}
                </p>
              )}
            </div>
            <form action={deleteService}>
              <input type="hidden" name="id" value={s.id} />
              <button className="text-xs text-red-600 hover:underline shrink-0 ml-3">
                {t("dashboard.delete")}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

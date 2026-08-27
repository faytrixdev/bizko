"use client";

import { addService } from "@/app/dashboard/actions";
import { ServiceList } from "./ServiceList";
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
    <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.servicesTitle")} ({services.length}/8)</h2>
      {services.length >= 8 ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t("dashboard.servicesFull")}
        </p>
      ) : (
        <form action={addService} className="mt-3 flex flex-col gap-2">
          <input name="title" required placeholder={t("dashboard.titlePlaceholder")} maxLength={60} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
          <div className="flex gap-2">
            <input name="price" type="number" placeholder={t("dashboard.pricePlaceholder")} min={0} className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
            <select name="currency" defaultValue="XOF" className="w-28 h-10 rounded-lg border border-gray-200 px-2 pr-10 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 bg-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat">
              <option value="XOF">XOF</option>
              <option value="XAF">XAF</option>
              <option value="NGN">NGN</option>
              <option value="KES">KES</option>
              <option value="ZAR">ZAR</option>
              <option value="DZD">DZD</option>
              <option value="GHS">GHS</option>
              <option value="TZS">TZS</option>
              <option value="UGX">UGX</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C] transition-all duration-200 hover:shadow-sm">
            {t("dashboard.add")}
          </button>
        </form>
      )}
      <ServiceList services={services} />
    </div>
  );
}

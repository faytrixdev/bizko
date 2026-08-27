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
            <select name="currency" defaultValue="XOF" className="w-24 h-10 rounded-lg border border-gray-200 px-2 pr-8 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 bg-white">
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

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { completeOnboarding } from "./actions";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { UsernameField } from "@/components/UsernameField";

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (existing) redirect("/dashboard");

  const msg = await getServerMessages();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-lg border border-gray-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-6 w-6 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center text-xs font-black">B</span>
          <span className="text-xs font-medium tracking-widest uppercase text-gray-400">{msg.onboarding.step}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight font-display text-gray-900">{msg.onboarding.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{msg.onboarding.subtitle}</p>
        {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{decodeURIComponent(error)}</p>}
        <form action={completeOnboarding} className="mt-6 flex flex-col gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs">1</span> {msg.onboarding.step1}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2">bizko.co/</span>
              <UsernameField />
            </div>
            <p className="text-xs text-gray-400 mt-2">{msg.onboarding.usernameHint}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs">2</span> {msg.onboarding.step2}</p>
            <div className="flex flex-col gap-3 mt-3">
              <input name="display_name" required placeholder={msg.onboarding.namePlaceholder} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
              <input name="tagline" required placeholder={msg.onboarding.taglinePlaceholder} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
              <div className="flex gap-3">
                <input name="city" required placeholder={msg.onboarding.cityPlaceholder} className="flex-1 h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                <input name="country" required placeholder={msg.onboarding.countryPlaceholder} defaultValue="CI" className="w-24 h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
              </div>
              <input name="phone_e164" required placeholder={msg.onboarding.phonePlaceholder} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs">3</span> {msg.onboarding.step3}</p>
            <div className="flex flex-col gap-3 mt-3">
              <input name="service_title" required placeholder={msg.onboarding.servicePlaceholder} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
              <div className="flex gap-2">
                <input name="service_price" type="number" placeholder={msg.onboarding.pricePlaceholder} className="flex-1 h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                <select name="service_currency" defaultValue="XOF" className="w-24 h-11 rounded-lg border border-gray-200 px-2 text-sm outline-none focus:border-gray-900 bg-white">
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
            </div>
          </div>

          <button type="submit" className="h-11 rounded-lg bg-[#FF6B35] text-white font-semibold hover:bg-[#EA580C] transition-colors">{msg.onboarding.publishBtn}</button>
        </form>
      </div>
    </div>
  );
}

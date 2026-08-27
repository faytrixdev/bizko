import Link from "next/link";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { getServerMessages } from "@/lib/i18n/messages-server";

export default async function Home() {
  const msg = await getServerMessages();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <img src="/logo.png" alt="Bizko" className="h-10" />
          <div className="flex items-center gap-3">
            <LocaleSwitch />
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              {msg.landing.login}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-4 py-16 sm:py-20 flex flex-col items-center text-center">
        <div className="max-w-xl flex flex-col gap-5">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[0.95] font-display text-gray-900">
            {msg.landing.title}
            <br />
            <span className="text-[#FF6B35]">{msg.landing.titleAccent}</span>
          </h1>
          <p className="text-base text-gray-500 leading-6 max-w-md mx-auto">
            {msg.landing.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-1">
            <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#FF6B35] px-7 text-white font-semibold hover:bg-[#EA580C] transition-colors">
              {msg.landing.cta}
            </Link>
            <Link href="/demo" className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-7 font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {msg.landing.example}
            </Link>
          </div>
        </div>

        {/* Preview card */}
        <div className="mt-14 w-full max-w-[480px] rounded-xl border border-gray-200 bg-white p-5 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">AD</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">Aminata Diallo</div>
              <div className="text-xs text-gray-500">{msg.landing.previewDescription}</div>
            </div>
            <span className="ml-auto inline-flex h-7 items-center rounded-full bg-[#25D366] px-3 text-[11px] font-medium text-white">{msg.profile.whatsapp}</span>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-900">Shooting photo pro</div>
                <div className="text-xs text-gray-500">50 000 XOF</div>
              </div>
              <div className="h-7 px-2.5 rounded-lg bg-gray-900 text-white text-[11px] font-medium flex items-center">{msg.profile.demandBtn}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square rounded-lg bg-gray-100 border border-gray-200" />
              <div className="aspect-square rounded-lg bg-gray-100 border border-gray-200" />
              <div className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">+6</div>
            </div>
          </div>
          <p className="text-[11px] text-center text-gray-400 mt-3">bizko.co/aminata</p>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">{msg.landing.footer}</footer>
    </div>
  );
}

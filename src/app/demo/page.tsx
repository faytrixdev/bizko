import Link from "next/link";
import { getServerMessages } from "@/lib/i18n/messages-server";

export default async function Demo() {
  const msg = await getServerMessages();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <img src="/logo.png" alt="Bizko" className="h-7" />
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-gray-900 text-white px-4 py-1.5 rounded-lg">
            {msg.demo.createMine}
          </Link>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-8">
        <p className="text-center text-xs tracking-widest uppercase text-gray-400 mb-6">{msg.demo.examplePortfolio}</p>

        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <div className="h-20 w-20 rounded-full bg-gray-900 mx-auto flex items-center justify-center text-white font-bold text-xl">AD</div>
          <h1 className="text-[26px] font-bold font-display mt-3 text-gray-900">Aminata Diallo</h1>
          <p className="text-sm font-medium text-[#FF6B35] mt-1">{msg.demo.profile.tagline}</p>
          <p className="text-xs text-gray-500 mt-2">Abidjan, CI</p>
          <p className="text-sm text-gray-600 mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200 text-left">
            {msg.demo.profile.bio}
          </p>
          <div className="mt-5 flex gap-3">
            <span className="flex-1 h-11 rounded-lg bg-[#25D366] text-white font-semibold inline-flex items-center justify-center">{msg.profile.whatsapp}</span>
            <span className="h-11 w-11 rounded-lg border border-gray-200 bg-white inline-flex items-center justify-center text-sm text-gray-500">P</span>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold font-display text-sm text-gray-900">{msg.profile.services}</h2>
          <div className="mt-3 grid gap-2.5">
            {[
              { t: msg.demo.service1Title, p: msg.demo.service1Price },
              { t: msg.demo.service2Title, p: msg.demo.service2Price },
              { t: msg.demo.service3Title, p: msg.demo.service3Price },
            ].map((s) => (
              <div key={s.t} className="rounded-lg border border-gray-200 bg-gray-50 p-3.5 flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{s.t}</p>
                  <p className="text-sm font-bold text-[#FF6B35] mt-1">{s.p}</p>
                </div>
                <span className="self-center h-8 px-3 rounded-lg bg-[#FF6B35] text-white text-xs font-semibold inline-flex items-center">{msg.profile.demandBtn}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <h2 className="font-bold font-display text-sm text-gray-900 px-1 mb-3">{msg.profile.portfolio}</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                {msg.demo.photoLabel} {i}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-gray-900 text-white p-6 text-center">
          <p className="font-semibold">{msg.demo.sameLinkQuestion}</p>
          <p className="text-sm text-gray-400 mt-1">{msg.demo.sameLinkSubtitle}</p>
          <Link href="/signup" className="mt-4 inline-flex h-11 px-7 rounded-lg bg-[#FF6B35] text-white font-semibold hover:bg-[#EA580C] transition">
            {msg.demo.sameLinkCta}
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getServerMessages } from "@/lib/i18n/messages-server";

export default async function PrivacyPage() {
  const msg = await getServerMessages();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-100/60">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <img src="/logo.png" alt="Bizko" className="h-7" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {msg.legal.back}
          </Link>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{msg.legal.privacyTitle}</h1>
        <p className="text-xs text-gray-400 mb-8">{msg.legal.lastUpdated} : 28 aout 2026</p>

        <p className="text-sm text-gray-600 leading-relaxed mb-8">{msg.legal.privacyIntro}</p>

        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy1Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy1}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy2Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy2}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy3Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy3}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy4Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy4}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy5Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy5}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy6Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy6}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy7Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy7}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy8Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy8}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy9Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy9}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.privacy10Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.privacy10}</p>
          </section>
        </div>
      </main>
    </div>
  );
}

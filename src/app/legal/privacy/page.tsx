import { getServerMessages } from "@/lib/i18n/messages-server";
import { LegalHeader } from "@/components/LegalHeader";

export default async function PrivacyPage() {
  const msg = await getServerMessages();

  return (
    <div className="min-h-screen bg-white">
      <LegalHeader />

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

import { getServerMessages } from "@/lib/i18n/messages-server";
import { LegalHeader } from "@/components/LegalHeader";

export default async function TermsPage() {
  const msg = await getServerMessages();

  return (
    <div className="min-h-screen bg-white">
      <LegalHeader />

      <main className="max-w-[640px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{msg.legal.termsTitle}</h1>
        <p className="text-xs text-gray-400 mb-8">{msg.legal.lastUpdated} : 28 aout 2026</p>

        <p className="text-sm text-gray-600 leading-relaxed mb-8">{msg.legal.termsIntro}</p>

        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms1Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms1}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms2Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms2}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms3Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms3}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms4Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms4}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms5Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms5}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms6Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms6}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms7Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms7}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms8Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms8}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms9Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms9}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{msg.legal.terms10Title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{msg.legal.terms10}</p>
          </section>
        </div>
      </main>
    </div>
  );
}

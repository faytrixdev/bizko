import Link from "next/link";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { SectionReveal } from "@/components/landing/SectionReveal";
import { ProfileMockup } from "@/components/landing/ProfileMockup";
import { FaqItem } from "@/components/landing/FaqItem";

export const metadata = {
  title: "Bizko - Ton business en un lien",
  description:
    "Cree ton profil pro en 3 minutes. Services, prix, portfolio et WhatsApp dans un seul lien a partager partout.",
};

export default async function Home() {
  const msg = await getServerMessages();

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar msg={msg} />

      {/* ─── HERO ─── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          {/* Badge */}
          <SectionReveal>
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300/70 rounded-full px-4 py-2 transition-colors cursor-default">
                <span className="text-xs sm:text-sm text-gray-600">
                  {msg.landing.badge}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </div>
          </SectionReveal>

          {/* Headline */}
          <SectionReveal delay={80}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] font-display text-gray-900 text-center max-w-[850px] mx-auto">
              {msg.landing.heroTitle}
              <br />
              <span className="text-accent">{msg.landing.heroTitleAccent}</span>
            </h1>
          </SectionReveal>

          {/* Subtitle */}
          <SectionReveal delay={160}>
            <p className="text-sm sm:text-base md:text-lg mx-auto max-w-2xl text-center mt-6 text-gray-500 leading-7 max-md:px-2">
              {msg.landing.heroSubtitle}
            </p>
          </SectionReveal>

          {/* CTA buttons */}
          <SectionReveal delay={240}>
            <div className="mx-auto w-full flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white px-9 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm shadow-[#FF6B35]/20 inline-flex items-center justify-center"
              >
                {msg.landing.heroCta}
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100/50 rounded-full px-9 py-3.5 text-sm font-medium text-gray-700 transition-colors"
              >
                <span>{msg.landing.heroExample}</span>
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </SectionReveal>

          {/* Subtext */}
          <SectionReveal delay={280}>
            <p className="text-center text-xs text-gray-400 mt-4">
              {msg.landing.heroSubtext}
            </p>
            <p className="text-center text-sm text-gray-400 font-mono mt-1.5">
              bizko.me/tonnom
            </p>
          </SectionReveal>

          {/* Mockup - below everything */}
          <SectionReveal delay={300}>
            <div className="mt-14 sm:mt-20 mx-auto max-w-[340px] sm:max-w-[380px]">
              <ProfileMockup
                name={msg.landing.mockupName}
                initials="AD"
                avatarUrl="/mockup/photo-profile.jpg"
                profession={msg.landing.mockupProfession}
                bio={msg.landing.mockupBio}
                location={msg.landing.mockupLocation}
                services={[
                  { title: msg.landing.mockupService1Title, price: msg.landing.mockupService1Price },
                  { title: msg.landing.mockupService2Title, price: msg.landing.mockupService2Price },
                  { title: msg.landing.mockupService3Title, price: msg.landing.mockupService3Price },
                ]}
                portfolio={[
                  { image: "/mockup/realisation1.jpg", label: "Mariage" },
                  { image: "/mockup/realisation2.jpg", label: "Portrait" },
                ]}
                socials={[
                  { platform: "instagram", url: "#" },
                  { platform: "tiktok", url: "#" },
                  { platform: "facebook", url: "#" },
                ]}
                variant="detailed"
                frame
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="fonctionnalites" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                {msg.landing.featuresTitle}
              </h2>
              <p className="mt-4 text-gray-500 leading-7">
                {msg.landing.featuresDesc}
              </p>
            </div>
          </SectionReveal>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ── Identité - large ── */}
            <SectionReveal delay={0} className="sm:col-span-2">
              <div className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 h-full">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 mb-4 group-hover:bg-accent group-hover:text-white group-hover:border-transparent transition-all duration-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{msg.landing.featureIdentity}</h3>
                    <p className="text-sm text-gray-500 leading-6">
                      {msg.landing.featureIdentityDesc}
                    </p>
                  </div>
                  {/* Mini-mockup identité */}
                  <div className="w-48 shrink-0 rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-[10px] shadow-md ring-2 ring-white">
                      AD
                    </div>
                    <p className="mt-2 text-xs font-semibold text-gray-900">Aminata Diallo</p>
                    <p className="text-[10px] text-accent font-medium">Photographe</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
                      <svg className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-[8px] text-gray-500">Abidjan</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>

            {/* ── Services - petite ── */}
            <SectionReveal delay={80}>
              <div className="group rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 h-full">
                <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 mb-4 group-hover:bg-accent group-hover:text-white group-hover:border-transparent transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{msg.landing.featureServices}</h3>
                <p className="text-sm text-gray-500 leading-6">
                  {msg.landing.featureServicesDesc}
                </p>
              </div>
            </SectionReveal>

            {/* ── Prix - petite ── */}
            <SectionReveal delay={140}>
              <div className="group rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 h-full">
                <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 mb-4 group-hover:bg-accent group-hover:text-white group-hover:border-transparent transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659 1.171-1.671.121-.96M12 2.25l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 1.847 12.673 1.75 12 1.75c-.673 0-1.536.097-2.121.288C9.083.787 7.912.787 6.74 1.666c-1.171.879-1.171 2.303 0 3.182C7.744 5.726 8.607 5.823 9.28 5.823c.673 0 1.536-.097 2.121-.288L12 2.25Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659 1.171-1.671.121-.96M12 2.25l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 1.847 12.673 1.75 12 1.75c-.673 0-1.536.097-2.121.288C9.083.787 7.912.787 6.74 1.666c-1.171.879-1.171 2.303 0 3.182C7.744 5.726 8.607 5.823 9.28 5.823c.673 0 1.536-.097 2.121-.288L12 2.25Z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{msg.landing.featurePrices}</h3>
                <p className="text-sm text-gray-500 leading-6">
                  {msg.landing.featurePricesDesc}
                </p>
              </div>
            </SectionReveal>

            {/* ── Portfolio - large ── */}
            <SectionReveal delay={200} className="sm:col-span-2">
              <div className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 h-full">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 mb-4 group-hover:bg-accent group-hover:text-white group-hover:border-transparent transition-all duration-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{msg.landing.featurePortfolio}</h3>
                    <p className="text-sm text-gray-500 leading-6">
                      {msg.landing.featurePortfolioDesc}
                    </p>
                  </div>
                  {/* Mini-mockup portfolio */}
                  <div className="w-48 shrink-0 grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-rose-200 to-orange-100" />
                    <div className="aspect-square bg-gradient-to-br from-sky-200 to-indigo-100" />
                    <div className="aspect-square bg-gradient-to-br from-emerald-200 to-teal-100" />
                    <div className="aspect-square bg-gradient-to-br from-violet-200 to-purple-100 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white/80">+4</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>

            {/* ── WhatsApp - full width ── */}
            <SectionReveal delay={260} className="sm:col-span-2 lg:col-span-3">
              <div className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 mb-4 group-hover:bg-whatsapp group-hover:text-white group-hover:border-transparent transition-all duration-300">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {msg.landing.featureContact}
                    </h3>
                    <p className="text-sm text-gray-500 leading-6 max-w-md">
                      {msg.landing.featureContactDesc}
                    </p>
                  </div>
                  {/* Mini-mockup WhatsApp */}
                  <div className="w-full sm:w-72 shrink-0 space-y-2">
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-gray-900">{msg.landing.miniMockupService}</p>
                        <p className="text-[10px] font-bold text-accent">{msg.landing.miniMockupPrice}</p>
                      </div>
                      <div className="shrink-0 h-6 px-2 rounded-lg bg-whatsapp text-white text-[9px] font-semibold inline-flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {msg.landing.mockupRequest}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-[#DCF8C6]/30 p-3">
                      <p className="text-[10px] text-gray-600 leading-4">
                        &quot;{msg.landing.miniMockupMessage} <strong>{msg.landing.miniMockupService}</strong> {msg.landing.miniMockupAt} <strong>{msg.landing.miniMockupPrice}</strong>.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                {msg.landing.beforeTitle}
              </h2>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sans Bizko */}
            <SectionReveal delay={100}>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-6 sm:p-8">
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 mb-6">
                  {msg.landing.withoutBizko}
                </span>
                <div className="space-y-3">
                  {[
                    msg.landing.withoutStep1,
                    msg.landing.withoutStep2,
                    msg.landing.withoutStep3,
                    msg.landing.withoutStep4,
                    msg.landing.withoutStep5,
                    msg.landing.withoutStep6,
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-gray-500"
                    >
                      <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-medium text-gray-400">
                          {i + 1}
                        </span>
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>

            {/* Avec Bizko */}
            <SectionReveal delay={200}>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent mb-6">
                  {msg.landing.withBizko}
                </span>
                <div className="space-y-3">
                  {[
                    { text: msg.landing.withStep1, icon: "→" },
                    { text: msg.landing.withStep2, icon: "→" },
                    { text: msg.landing.withStep3, icon: "→" },
                    { text: msg.landing.withStep4, icon: "→" },
                    { text: msg.landing.withStep5, icon: "✓" },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm font-medium text-gray-900"
                    >
                      <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                        {step.icon === "✓" ? (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-bold text-white">{i + 1}</span>
                        )}
                      </div>
                      {step.text}
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT ─── */}
      <section className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <SectionReveal>
              <div className="max-w-md">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                  {msg.landing.productTitle}
                </h2>
                <p className="mt-4 text-gray-500 leading-7">
                  {msg.landing.productDesc}
                </p>
                <div className="mt-8 space-y-3">
                  {[
                    msg.landing.productFeature1,
                    msg.landing.productFeature2,
                    msg.landing.productFeature3,
                    msg.landing.productFeature4,
                    msg.landing.productFeature5,
                    msg.landing.productFeature6,
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href="/demo"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-accent transition-colors group"
                >
                  {msg.landing.heroExample}
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </SectionReveal>

            {/* Large Mockup */}
            <SectionReveal delay={150} className="lg:justify-self-end">
              <div className="w-full max-w-[440px] mx-auto lg:mx-0">
                <ProfileMockup
                  name={msg.landing.productMockupName}
                  initials="KT"
                  avatarUrl="/mockup/photo-profile.jpg"
                  profession={msg.landing.productMockupProfession}
                  bio={msg.landing.productMockupBio}
                  location={msg.landing.productMockupLocation}
                  services={[
                    { title: msg.landing.productMockupService1Title, price: msg.landing.productMockupService1Price },
                    { title: msg.landing.productMockupService2Title, price: msg.landing.productMockupService2Price },
                    { title: msg.landing.productMockupService3Title, price: msg.landing.productMockupService3Price },
                  ]}
                  variant="detailed"
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── WHATSAPP ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                {msg.landing.whatsappTitle}
              </h2>
              <p className="mt-4 text-gray-500 leading-7">
                {msg.landing.whatsappDesc}
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={100}>
            <div className="max-w-lg mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                {/* Service card */}
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {msg.landing.whatsappMockupService}
                    </p>
                    <p className="text-sm font-bold text-accent mt-1">
                      {msg.landing.whatsappMockupPrice}
                    </p>
                  </div>
                  <div className="shrink-0 h-9 px-4 rounded-xl bg-whatsapp text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm shadow-[#25D366]/20">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {msg.landing.whatsappBtn}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center mb-6">
                  <div className="h-8 w-px bg-gray-200 relative">
                    <svg className="w-3 h-3 text-gray-300 absolute -bottom-1.5 left-1/2 -translate-x-1/2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* WhatsApp message preview */}
                <div className="rounded-xl border border-gray-100 bg-[#DCF8C6]/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-whatsapp" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500">
                      {msg.landing.whatsappPreFilled}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-6">
                    &quot;{msg.landing.whatsappMockupMessage}{" "}
                    <strong>{msg.landing.whatsappMockupServiceStrong}</strong>{" "}
                    {msg.landing.whatsappMockupAt}{" "}
                    <strong>{msg.landing.whatsappMockupPrice}</strong>.&quot;
                  </p>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ─── PROFESSIONS ─── */}
      <section className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                {msg.landing.professionsTitle}
              </h2>
              <p className="mt-4 text-gray-500 leading-7">
                {msg.landing.professionsDesc}
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={100}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-3xl mx-auto">
              {[
                {
                  name: msg.landing.prof1,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof2,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof3,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof4,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof5,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof6,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof7,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof8,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof9,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  ),
                },
                {
                  name: msg.landing.prof10,
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  ),
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-white py-5 px-3 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-gray-200/80 transition-all duration-300 cursor-default"
                >
                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                    {p.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{p.name}</span>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="comment-ca-marche" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                {msg.landing.howItWorksTitle}
              </h2>
            </div>
          </SectionReveal>

          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                num: "01",
                title: msg.landing.step1Title,
                desc: msg.landing.step1Desc,
              },
              {
                num: "02",
                title: msg.landing.step2Title,
                desc: msg.landing.step2Desc,
              },
              {
                num: "03",
                title: msg.landing.step3Title,
                desc: msg.landing.step3Desc,
              },
            ].map((step, i) => (
              <SectionReveal key={step.num} delay={i * 100}>
                <div className="text-center">
                  <div className="text-4xl font-bold font-display text-gray-200 mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-6 max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={300}>
            <p className="text-center text-sm text-gray-400 font-mono mt-10">
              bizko.me/tonnom
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ─── EXAMPLES ─── */}
      <section id="exemples" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                {msg.landing.examplesTitle}
              </h2>
            </div>
          </SectionReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: msg.landing.example1Name,
                fullname: msg.landing.example1Fullname,
                profession: msg.landing.example1Profession,
                bio: msg.landing.example1Bio,
                location: msg.landing.example1Location,
                services: [
                  { title: msg.landing.example1Service1Title, price: msg.landing.example1Service1Price },
                  { title: msg.landing.example1Service2Title, price: msg.landing.example1Service2Price },
                ],
              },
              {
                name: msg.landing.example2Name,
                fullname: msg.landing.example2Fullname,
                profession: msg.landing.example2Profession,
                bio: msg.landing.example2Bio,
                location: msg.landing.example2Location,
                services: [
                  { title: msg.landing.example2Service1Title, price: msg.landing.example2Service1Price },
                  { title: msg.landing.example2Service2Title, price: msg.landing.example2Service2Price },
                ],
              },
              {
                name: msg.landing.example3Name,
                fullname: msg.landing.example3Fullname,
                profession: msg.landing.example3Profession,
                bio: msg.landing.example3Bio,
                location: msg.landing.example3Location,
                services: [
                  { title: msg.landing.example3Service1Title, price: msg.landing.example3Service1Price },
                  { title: msg.landing.example3Service2Title, price: msg.landing.example3Service2Price },
                ],
              },
            ].map((profile) => (
              <SectionReveal key={profile.name} delay={100}>
                <Link href={`/${profile.name}`} className="block group">
                  <ProfileMockup
                    name={profile.fullname}
                    initials={profile.fullname.split(" ").map((n) => n[0]).join("")}
                    profession={profile.profession}
                    bio={profile.bio}
                    location={profile.location}
                    services={profile.services}
                    variant="compact"
                  />
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (placeholder) ─── */}

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                {msg.landing.faqTitle}
              </h2>
            </div>
          </SectionReveal>

          <SectionReveal delay={100}>
            <div className="rounded-2xl border border-gray-100 bg-white px-6">
              <FaqItem
                question={msg.landing.faq1Q}
                answer={msg.landing.faq1A}
              />
              <FaqItem
                question={msg.landing.faq2Q}
                answer={msg.landing.faq2A}
              />
              <FaqItem
                question={msg.landing.faq3Q}
                answer={msg.landing.faq3A}
              />
              <FaqItem
                question={msg.landing.faq4Q}
                answer={msg.landing.faq4A}
              />
              <FaqItem
                question={msg.landing.faq5Q}
                answer={msg.landing.faq5A}
              />
              <FaqItem
                question={msg.landing.faq6Q}
                answer={msg.landing.faq6A}
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900 leading-tight">
                {msg.landing.finalTitle}
              </h2>
              <p className="mt-4 text-gray-500 leading-7">
                {msg.landing.finalDesc}
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-white hover:bg-accent-hover transition-all duration-200 shadow-sm shadow-[#FF6B35]/20 hover:shadow-md hover:shadow-[#FF6B35]/25"
              >
                {msg.landing.finalCta}
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <p className="mt-3 text-xs text-gray-400">
                {msg.landing.finalSubtext}
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <span className="text-lg font-bold font-display text-gray-900 tracking-tight">
                Bizko
              </span>
              <p className="mt-2 text-sm text-gray-400">
                {msg.landing.footerTagline}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {msg.landing.footerNav}
              </h4>
              <ul className="space-y-2">
                {[
                  { label: msg.landing.footerFeatures, href: "#fonctionnalites" },
                  { label: msg.landing.footerHowItWorks, href: "#comment-ca-marche" },
                  { label: msg.landing.footerExamples, href: "#exemples" },
                  { label: msg.landing.footerFaq, href: "#faq" },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compte */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {msg.landing.footerAccount}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {msg.landing.footerLogin}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {msg.landing.footerSignup}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {msg.landing.footerLegal}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/legal/terms" className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    {msg.landing.footerTerms}
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    {msg.landing.footerPrivacy}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Bizko. {msg.landing.footerRights}
            </p>
            <p className="text-xs text-gray-400">
              {msg.landing.footerMadeWith}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

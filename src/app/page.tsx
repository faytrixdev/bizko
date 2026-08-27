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
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div className="max-w-xl">
              <SectionReveal>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3.5 py-1 text-xs font-medium text-gray-600 mb-6">
                  Pour les indépendants qui vendent leur expertise
                </span>
              </SectionReveal>

              <SectionReveal delay={80}>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.05] font-display text-gray-900">
                  Ton business.
                  <br />
                  <span className="text-[#FF6B35]">Un seul lien.</span>
                </h1>
              </SectionReveal>

              <SectionReveal delay={160}>
                <p className="mt-5 text-base sm:text-lg text-gray-500 leading-7 max-w-md">
                  Présente tes services, tes prix, ton portfolio et ton WhatsApp
                  dans un profil professionnel que tu peux partager partout.
                </p>
              </SectionReveal>

              <SectionReveal delay={240}>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-[#FF6B35] px-8 text-sm font-semibold text-white hover:bg-[#EA580C] transition-all duration-200 shadow-sm shadow-[#FF6B35]/20 hover:shadow-md hover:shadow-[#FF6B35]/25"
                  >
                    Créer mon Bizko
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </SectionReveal>

              <SectionReveal delay={320}>
                <p className="mt-3 text-xs text-gray-400">
                  Gratuit · Prêt en 3 minutes
                </p>
                <p className="mt-2 text-sm text-gray-400 font-mono">
                  bizko.me/tonnom
                </p>
              </SectionReveal>
            </div>

            {/* Mockup */}
            <SectionReveal delay={200} className="lg:justify-self-end">
              <div className="w-full max-w-[420px] mx-auto lg:mx-0">
                <ProfileMockup
                  name="Aminata Diallo"
                  initials="AD"
                  profession="Photographe"
                  bio="Je capture tes moments précieux — mariage, portrait, événement. Réponse en 2h sur WhatsApp."
                  location="Abidjan, CI"
                  services={[
                    { title: "Shooting portrait", price: "75 000 FCFA" },
                    { title: "Mariage - demi-journée", price: "250 000 FCFA" },
                    { title: "Événement entreprise", price: "150 000 FCFA" },
                  ]}
                  variant="detailed"
                  portfolio={[
                    { label: "Photo" },
                    { label: "Photo" },
                    { label: "Photo" },
                    { label: "Photo" },
                    { label: "Photo" },
                    { label: "+6" },
                  ]}
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="fonctionnalités" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                Un profil. Tout ton business.
              </h2>
              <p className="mt-4 text-gray-500 leading-7">
                Bizko rassemble toutes les informations importantes au même
                endroit — pour que tes prospects trouvent tout en un coup d&apos;œil.
              </p>
            </div>
          </SectionReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                ),
                title: "Ton identité",
                desc: "Présente qui tu es et ce que tu fais.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ),
                title: "Tes services",
                desc: "Montre clairement ce que tu proposes.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659 1.171-1.671.121-.96M12 2.25l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 1.847 12.673 1.75 12 1.75c-.673 0-1.536.097-2.121.288C9.083.787 7.912.787 6.74 1.666c-1.171.879-1.171 2.303 0 3.182C7.744 5.726 8.607 5.823 9.28 5.823c.673 0 1.536-.097 2.121-.288L12 2.25Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659 1.171-1.671.121-.96M12 2.25l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 1.847 12.673 1.75 12 1.75c-.673 0-1.536.097-2.121.288C9.083.787 7.912.787 6.74 1.666c-1.171.879-1.171 2.303 0 3.182C7.744 5.726 8.607 5.823 9.28 5.823c.673 0 1.536-.097 2.121-.288L12 2.25Z" />
                  </svg>
                ),
                title: "Tes prix",
                desc: "Affiche tes tarifs pour attirer des prospects qualifiés.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                ),
                title: "Ton portfolio",
                desc: "Montre concrètement ce que tu sais faire.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                ),
                title: "WhatsApp",
                desc: "Permet à tes visiteurs de te contacter en un clic.",
              },
            ].map((f, i) => (
              <SectionReveal key={f.title} delay={i * 60}>
                <div className="group rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-gray-200/80 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 mb-4 group-hover:bg-[#FF6B35] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-6">{f.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                Arrête de tout expliquer en DM.
              </h2>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sans Bizko */}
            <SectionReveal delay={100}>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-6 sm:p-8">
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 mb-6">
                  Sans Bizko
                </span>
                <div className="space-y-3">
                  {[
                    "Instagram → DM",
                    "\"Tu fais quoi ?\"",
                    "\"C'est combien ?\"",
                    "Envoi du portfolio…",
                    "Retour sur WhatsApp…",
                    "5 messages pour aboutir",
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
                <span className="inline-flex items-center rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-medium text-[#FF6B35] mb-6">
                  Avec Bizko
                </span>
                <div className="space-y-3">
                  {[
                    { text: "Un seul lien", icon: "→" },
                    { text: "Ton profil complet", icon: "→" },
                    { text: "Tes services & prix", icon: "→" },
                    { text: "Ton portfolio", icon: "→" },
                    { text: "WhatsApp en 1 clic", icon: "✓" },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm font-medium text-gray-900"
                    >
                      <div className="h-5 w-5 rounded-full bg-[#FF6B35] flex items-center justify-center shrink-0">
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
                  Ton profil, pensé pour convertir.
                </h2>
                <p className="mt-4 text-gray-500 leading-7">
                  Chaque élément de ton Bizko est conçu pour guider ton visiteur
                  vers la prise de contact — sans friction.
                </p>
                <div className="mt-8 space-y-3">
                  {[
                    "Présentation claire",
                    "Services structurés",
                    "Prix visibles",
                    "Portfolio intégré",
                    "Bouton WhatsApp",
                    "Lien personnalisé",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-[#FF6B35] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href="/demo"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-[#FF6B35] transition-colors group"
                >
                  Voir un exemple
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
                  name="Karim Touré"
                  initials="KT"
                  profession="Développeur web"
                  bio="Je crée des sites web et applications mobiles pour les entreprises africaines. Stack : React, Next.js, Supabase."
                  location="Dakar, SN"
                  services={[
                    { title: "Site vitrine", price: "150 000 FCFA" },
                    { title: "Application mobile", price: "500 000 FCFA" },
                    { title: "Audit technique", price: "50 000 FCFA" },
                  ]}
                  variant="detailed"
                  portfolio={[
                    { label: "Projet" },
                    { label: "Projet" },
                    { label: "Projet" },
                    { label: "Projet" },
                    { label: "Projet" },
                    { label: "+3" },
                  ]}
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
                Du visiteur à la conversation.
              </h2>
              <p className="mt-4 text-gray-500 leading-7">
                Un clic suffit pour commencer une vraie conversation avec ton
                prochain client.
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
                      Shooting photo pro
                    </p>
                    <p className="text-sm font-bold text-[#FF6B35] mt-1">
                      75 000 FCFA
                    </p>
                  </div>
                  <div className="shrink-0 h-9 px-4 rounded-xl bg-[#25D366] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm shadow-[#25D366]/20">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Demander ce service
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
                    <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500">
                      Message pré-rempli
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-6">
                    &quot;Bonjour, je suis intéressé par ton service de
                    <strong> création de site web</strong> à{" "}
                    <strong>75 000 FCFA</strong>.&quot;
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
                Ton expertise mérite son propre espace.
              </h2>
              <p className="mt-4 text-gray-500 leading-7">
                Que tu sois freelance, créateur ou consultant, Bizko s&apos;adapte
                à ton activité.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={100}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-3xl mx-auto">
              {[
                {
                  name: "Photographe",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                  ),
                },
                {
                  name: "Développeur",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                    </svg>
                  ),
                },
                {
                  name: "Designer",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                    </svg>
                  ),
                },
                {
                  name: "Vidéaste",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  ),
                },
                {
                  name: "MUA",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                  ),
                },
                {
                  name: "Consultant",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  ),
                },
                {
                  name: "Coach",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                  ),
                },
                {
                  name: "Formateur",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                    </svg>
                  ),
                },
                {
                  name: "Rédacteur",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  ),
                },
                {
                  name: "Freelance",
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
      <section id="comment-ça-marche" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                Ton Bizko en 3 minutes.
              </h2>
            </div>
          </SectionReveal>

          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                num: "01",
                title: "Crée ton profil",
                desc: "Ajoute ton identité, tes services, tes prix et ton portfolio.",
              },
              {
                num: "02",
                title: "Personnalise ton Bizko",
                desc: "Choisis ton apparence et ton lien.",
              },
              {
                num: "03",
                title: "Partage ton lien",
                desc: "Instagram, TikTok, WhatsApp, LinkedIn — ou partout où tes clients te trouvent.",
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
                Un Bizko pour chaque expertise.
              </h2>
            </div>
          </SectionReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: "Aminata",
                fullname: "Aminata Diallo",
                profession: "Photographe",
                bio: "Portrait, mariage, événement. Réponse en 2h.",
                location: "Abidjan, CI",
                services: [
                  { title: "Shooting portrait", price: "75 000 FCFA" },
                  { title: "Mariage", price: "250 000 FCFA" },
                ],
              },
              {
                name: "karim",
                fullname: "Karim Touré",
                profession: "Développeur web",
                bio: "Sites web et apps mobiles pour entreprises africaines.",
                location: "Dakar, SN",
                services: [
                  { title: "Site vitrine", price: "150 000 FCFA" },
                  { title: "Application mobile", price: "500 000 FCFA" },
                ],
              },
              {
                name: "moussa",
                fullname: "Moussa Koné",
                profession: "Consultant digital",
                bio: "Stratégie digitale et transformation pour PME.",
                location: "Bamako, ML",
                services: [
                  { title: "Audit digital", price: "100 000 FCFA" },
                  { title: "Stratégie réseaux sociaux", price: "200 000 FCFA" },
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

      {/* ─── PRICING ─── */}
      <section id="tarifs" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center max-w-lg mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                Commence simplement.
              </h2>
            </div>
          </SectionReveal>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Free */}
            <SectionReveal delay={100}>
              <div className="rounded-2xl border border-gray-100 bg-white p-7">
                <h3 className="text-sm font-semibold text-gray-900">Free</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-display text-gray-900">
                    0
                  </span>
                  <span className="text-sm text-gray-500">FCFA</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Pour démarrer et tester.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    "Profil public",
                    "Jusqu'à 6 services",
                    "Portfolio (10 photos)",
                    "Lien personnalisé",
                    "Bouton WhatsApp",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-7 block w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 inline-flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  Créer mon Bizko
                </Link>
              </div>
            </SectionReveal>

            {/* Pro */}
            <SectionReveal delay={200}>
              <div className="rounded-2xl border border-gray-100 bg-white p-7 relative">
                <span className="absolute -top-3 right-6 inline-flex items-center rounded-full bg-[#FF6B35] px-3 py-0.5 text-[11px] font-semibold text-white">
                  Bientôt
                </span>
                <h3 className="text-sm font-semibold text-gray-900">Pro</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-display text-gray-900">
                    —
                  </span>
                  <span className="text-sm text-gray-500">FCFA/mois</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Pour aller plus loin.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    "Tout du plan Free",
                    "Services illimités",
                    "Portfolio illimité",
                    "Analytics détaillés",
                    "Domaine personnalisé",
                    "Support prioritaire",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-[#FF6B35] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 block w-full h-11 rounded-xl bg-gray-100 text-sm font-semibold text-gray-400 inline-flex items-center justify-center cursor-default">
                  Bientôt disponible
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <SectionReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
                Questions fréquentes.
              </h2>
            </div>
          </SectionReveal>

          <SectionReveal delay={100}>
            <div className="rounded-2xl border border-gray-100 bg-white px-6">
              <FaqItem
                question="Qu'est-ce que Bizko ?"
                answer="Bizko est un profil professionnel en un lien. Tu y présentes tes services, tes prix, ton portfolio et ton WhatsApp — le tout sur une seule page à partager partout."
              />
              <FaqItem
                question="Est-ce que j'ai besoin d'un site web ?"
                answer="Non. Bizko remplace ton site web pour la plupart des indépendants. Tu obtiens une page pro complète en quelques minutes, sans aucune compétence technique."
              />
              <FaqItem
                question="Puis-je avoir mon propre lien Bizko ?"
                answer="Oui. Ton lien sera de la forme bizko.me/tonnom — facile à partager sur Instagram, TikTok, WhatsApp, LinkedIn et partout ailleurs."
              />
              <FaqItem
                question="Puis-je afficher mes prix ?"
                answer="Oui. Tu peux ajouter un prix à chaque service. Tes prospects voient exactement ce que tu proposes et combien ça coûte avant de te contacter."
              />
              <FaqItem
                question="Comment fonctionne le bouton WhatsApp ?"
                answer="Quand quelqu'un clique sur le bouton, WhatsApp s'ouvre avec un message pré-rempli contenant le nom du service et le prix. Il ne reste qu'à envoyer."
              />
              <FaqItem
                question="Est-ce que mon profil fonctionne sur mobile ?"
                answer="Oui. Bizko est conçu mobile-first. Ton profil est parfaitement adapté sur smartphone, tablette et ordinateur."
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
                Ton prochain client est peut-être déjà en train de regarder ton
                profil.
              </h2>
              <p className="mt-4 text-gray-500 leading-7">
                Donne-lui simplement un endroit où découvrir ce que tu fais.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#FF6B35] px-8 text-sm font-semibold text-white hover:bg-[#EA580C] transition-all duration-200 shadow-sm shadow-[#FF6B35]/20 hover:shadow-md hover:shadow-[#FF6B35]/25"
              >
                Créer mon Bizko
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <p className="mt-3 text-xs text-gray-400">
                Gratuit · 3 minutes · Aucun code
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
                Ton business en un lien.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Navigation
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Fonctionnalités", href: "#fonctionnalités" },
                  { label: "Comment ça marche", href: "#comment-ça-marche" },
                  { label: "Exemples", href: "#exemples" },
                  { label: "Tarifs", href: "#tarifs" },
                  { label: "FAQ", href: "#faq" },
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
                Compte
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Créer mon Bizko
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Légal
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-gray-400 cursor-default">
                    Conditions
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-400 cursor-default">
                    Confidentialité
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Bizko. Tous droits réservés.
            </p>
            <p className="text-xs text-gray-400">
              Fait avec <span className="text-[#FF6B35]">♥</span> pour les indépendants africains.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

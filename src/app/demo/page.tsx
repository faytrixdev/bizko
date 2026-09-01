import Link from "next/link";
import Image from "next/image";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { Logo } from "@/components/Logo";
import { SocialIcon } from "@/components/socialIcons";

export default async function Demo() {
  const msg = await getServerMessages();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <Logo size="md" />
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-1.5 rounded-lg"
          >
            {msg.demo.createMine}
          </Link>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-8 pb-28 sm:pb-8">
        {/* Avatar */}
        <div className="flex justify-center">
          <Image
            src="/mockup/photo-profile.jpg"
            alt="Amadou Diallo"
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white"
          />
        </div>

        {/* Name */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight font-display text-center text-gray-900">
          Amadou Diallo
        </h1>

        {/* Tagline */}
        <p className="mt-2 text-base font-medium text-accent text-center">
          {msg.demo.profile.tagline}
        </p>

        {/* Location pill */}
        <div className="mt-3 flex justify-center">
          <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="text-xs font-medium text-gray-500">
              Abidjan, CI
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-6 text-sm leading-7 text-gray-600 bg-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm text-left">
          {msg.demo.profile.bio}
        </p>

        {/* WhatsApp + Call */}
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="https://wa.me/2250700000000?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20tes%20services%20vu%20sur%20ton%20profil%20Bizko."
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 w-full rounded-xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-whatsapp-hover transition-all duration-200 shadow-md shadow-[#25D366]/20"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {msg.profile.whatsapp} - Amadou
          </a>
          <a
            href="tel:+2250700000000"
            className="h-11 w-full rounded-xl border border-gray-200 bg-white text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-700 transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
            {msg.profile.call}
          </a>
        </div>

        {/* Services */}
        <div className="mt-8">
          <h2 className="text-xs font-bold font-display tracking-widest uppercase text-gray-400 text-center mb-3">
            {msg.profile.services}
          </h2>
          <div className="space-y-2">
            {[
              { t: msg.demo.service1Title, p: msg.demo.service1Price },
              { t: msg.demo.service2Title, p: msg.demo.service2Price },
              { t: msg.demo.service3Title, p: msg.demo.service3Price },
            ].map((s) => (
              <div
                key={s.t}
                className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {s.t}
                  </p>
                  <p className="text-sm font-bold text-accent mt-1">
                    {s.p}
                  </p>
                </div>
                <a
                  href="https://wa.me/2250700000000?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20ton%20service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-whatsapp text-white text-xs font-semibold shadow-sm shadow-[#25D366]/20"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {msg.profile.demandBtn}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="mt-8">
          <h2 className="text-xs font-bold font-display tracking-widest uppercase text-gray-400 text-center mb-3">
            {msg.profile.portfolio}
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { img: "/mockup/realisation1.jpg", label: "Mariage" },
              { img: "/mockup/realisation2.jpg", label: "Portrait" },
            ].map((p) => (
              <div
                key={p.label}
                className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              >
                <Image
                  src={p.img}
                  alt={p.label}
                  fill
                  sizes="(max-width: 768px) 50vw, 640px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Socials */}
        <div className="mt-8">
          <h2 className="text-xs font-bold font-display tracking-widest uppercase text-gray-400 text-center mb-3">
            {msg.profile.socials}
          </h2>
          <div className="space-y-2">
            <a
              href="#"
              className="bg-[#E4405F] hover:bg-[#D63384] h-11 rounded-xl text-white text-sm font-semibold inline-flex items-center justify-center gap-2 w-full shadow-sm transition-colors"
            >
              <SocialIcon platform="instagram" className="w-4 h-4" />
              Instagram
            </a>
            <a
              href="#"
              className="bg-[#000000] hover:bg-[#1a1a1a] h-11 rounded-xl text-white text-sm font-semibold inline-flex items-center justify-center gap-2 w-full shadow-sm transition-colors"
            >
              <SocialIcon platform="tiktok" className="w-4 h-4" />
              TikTok
            </a>
            <a
              href="#"
              className="bg-[#1877F2] hover:bg-[#0D65D9] h-11 rounded-xl text-white text-sm font-semibold inline-flex items-center justify-center gap-2 w-full shadow-sm transition-colors"
            >
              <SocialIcon platform="facebook" className="w-4 h-4" />
              Facebook
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-300 mt-8 font-medium">
          Fait avec{" "}
          <span className="font-medium text-accent">Bizko</span>{" "}
          - bizko.pro/amadoudiallo
        </p>
      </div>

      {/* Sticky WhatsApp CTA - mobile only */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 p-4 z-50">
        <a
          href="https://wa.me/2250700000000?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20tes%20services%20vu%20sur%20ton%20profil%20Bizko."
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 w-full rounded-xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20"
        >
          <SocialIcon platform="whatsapp" />
          {msg.profile.stickyWa}
        </a>
      </div>
    </div>
  );
}

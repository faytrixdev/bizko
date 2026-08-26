"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { updateProfile, addService, deleteService, addSocial, deleteSocial, deletePortfolio } from "./actions";
import { QrShare } from "./QrShare";
import { AvatarUpload, PortfolioUpload } from "./Upload";
import { LocaleSwitch } from "@/lib/i18n/provider";

type Tab = "apercu" | "services" | "portfolio" | "reseaux" | "reglages";

const TABS: { id: Tab; label: string }[] = [
  { id: "apercu", label: "Apercu" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "reseaux", label: "Reseaux" },
  { id: "reglages", label: "Reglages" },
];

interface Profile {
  id: string;
  username: string;
  display_name: string;
  tagline: string;
  bio: string | null;
  city: string;
  country: string;
  phone_e164: string;
  email_public: string | null;
  template: string;
  avatar_url: string | null;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  position: number;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string | null;
  position: number;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  position: number;
}

interface DashboardClientProps {
  profile: Profile;
  services: Service[];
  portfolio: PortfolioItem[];
  socials: SocialLink[];
  views: number;
  waClicks: number;
  publicUrl: string;
  error?: string;
}

export function DashboardClient({
  profile,
  services,
  portfolio,
  socials,
  views,
  waClicks,
  publicUrl,
  error,
}: DashboardClientProps) {
  const [tab, setTab] = useState<Tab>("apercu");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold font-display text-gray-900">
            Bizko<span className="text-[#FF6B35]">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <LocaleSwitch />
            <Link href={`/${profile.username}`} target="_blank" className="text-xs font-medium text-gray-500 hover:text-gray-900">
              Voir mon profil
            </Link>
            <form action={logout}>
              <button className="text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-50">
                Deconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-6">
        {error && (
          <p className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
            {decodeURIComponent(error)}
          </p>
        )}

        {/* Tab bar */}
        <nav className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 h-9 rounded-lg text-xs font-medium transition ${
                tab === t.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        {tab === "apercu" && (
          <div className="flex flex-col gap-4">
            <div className="border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold font-display text-sm text-gray-900">Partage ton Bizko</h2>
              <p className="text-xs text-gray-500 mt-2 break-all font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {publicUrl}
              </p>
              <div className="mt-3">
                <QrShare url={publicUrl} />
              </div>
              <Link href={`/${profile.username}`} target="_blank" className="inline-flex mt-3 text-xs font-medium text-[#FF6B35] hover:underline">
                Previsualiser mon profil
              </Link>
            </div>

            <div className="border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold font-display text-sm text-gray-900">Analytics</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold font-display text-gray-900">{views}</p>
                  <p className="text-xs text-gray-500">Vues</p>
                </div>
                <div className="rounded-lg bg-gray-900 text-white p-4 text-center">
                  <p className="text-2xl font-bold font-display">{waClicks}</p>
                  <p className="text-xs text-gray-400">Clics WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "services" && (
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold font-display text-sm text-gray-900">Services ({services.length}/8)</h2>
            {services.length >= 8 ? (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Limite 8 services atteinte.
              </p>
            ) : (
              <form action={addService} className="mt-3 flex flex-col gap-2">
                <input name="title" required placeholder="Titre" maxLength={60} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
                <div className="flex gap-2">
                  <input name="price" type="number" placeholder="Prix" min={0} className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
                  <input name="currency" defaultValue="XOF" className="w-20 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
                </div>
                <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">
                  Ajouter
                </button>
              </form>
            )}
            <div className="mt-4 flex flex-col gap-2">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-gray-900">{s.title}</p>
                    {s.price != null && (
                      <p className="text-xs text-gray-500">
                        {s.price.toLocaleString()} {s.currency}
                      </p>
                    )}
                  </div>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="text-xs text-red-600 hover:underline shrink-0 ml-3">
                      Supprimer
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "portfolio" && (
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold font-display text-sm text-gray-900">Portfolio ({portfolio.length}/9)</h2>
              {portfolio.length >= 9 ? (
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
                  Limite atteinte
                </span>
              ) : (
                <PortfolioUpload profileId={profile.id} />
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {portfolio.map((p) => (
                <div key={p.id} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" className="aspect-square object-cover rounded-lg border border-gray-200" />
                  <form action={deletePortfolio} className="absolute top-1 right-1">
                    <input type="hidden" name="id" value={p.id} />
                    <button className="bg-white/90 backdrop-blur text-xs w-6 h-6 rounded-lg border border-gray-200 hover:bg-white">
                      x
                    </button>
                  </form>
                </div>
              ))}
            </div>
            {portfolio.length === 0 && (
              <p className="text-xs text-gray-500 mt-3 text-center py-8">
                Aucune image — ajoute tes realisations.
              </p>
            )}
          </div>
        )}

        {tab === "reseaux" && (
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold font-display text-sm text-gray-900">Reseaux sociaux ({socials.length}/6)</h2>
            {socials.length >= 6 ? (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Limite 6 liens atteinte.
              </p>
            ) : (
              <form action={addSocial} className="mt-3 flex flex-col gap-2">
                <select name="platform" className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="x">X</option>
                  <option value="youtube">YouTube</option>
                  <option value="website">Website</option>
                </select>
                <input name="url" required placeholder="https://..." className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
                <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">
                  Ajouter
                </button>
              </form>
            )}
            <div className="mt-3 flex flex-col gap-2">
              {socials.map((s) => (
                <div key={s.id} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5">
                  <span className="text-sm truncate text-gray-900">
                    {s.platform}: <span className="text-gray-500 font-normal">{s.url}</span>
                  </span>
                  <form action={deleteSocial}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="text-xs text-red-600 hover:underline shrink-0 ml-3">
                      x
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reglages" && (
          <div className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold font-display text-sm text-gray-900">Parametres du profil</h2>
            <div className="mt-3">
              <AvatarUpload profileId={profile.id} currentUrl={profile.avatar_url} />
            </div>
            <form action={updateProfile} className="mt-4 flex flex-col gap-3">
              <input name="display_name" defaultValue={profile.display_name} required placeholder="Nom" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              <input name="tagline" defaultValue={profile.tagline} required placeholder="Tagline" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              <textarea name="bio" defaultValue={profile.bio || ""} placeholder="Bio (280c)" maxLength={280} className="rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-gray-900 resize-none" rows={3} />
              <div className="flex gap-3">
                <input name="city" defaultValue={profile.city} required placeholder="Ville" className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
                <input name="country" defaultValue={profile.country} required placeholder="CI" className="w-20 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              </div>
              <input name="phone_e164" defaultValue={profile.phone_e164} required placeholder="+2250700000000" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              <input name="email_public" defaultValue={profile.email_public || ""} placeholder="Email public (optionnel)" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              <select name="template" defaultValue={profile.template} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                <option value="minimal">Minimal</option>
                <option value="portfolio">Portfolio</option>
              </select>
              <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#EA580C] transition">
                Enregistrer
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

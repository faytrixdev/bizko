import { createClient } from "@/lib/supabase/server";
import { buildWaLink, buildMainWaMessage, buildServiceWaMessage } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, tagline, bio, avatar_url, city, username")
    .eq("username", username.toLowerCase())
    .eq("is_public", true)
    .single();

  // NOTE: Metadata is FR-only for MVP. generateMetadata lacks access to locale context.
  // Profile data comes from the database; adding a locale field to profiles would enable full i18n.
  if (!profile) return { title: "Profil introuvable — Bizko" };

  const title = `${profile.display_name} — ${profile.tagline} | Bizko`;
  const description = profile.bio?.slice(0, 155) || `${profile.tagline} a ${profile.city}. Contacte sur WhatsApp via Bizko.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
      url: `https://bizko.co/${profile.username}`,
      type: "profile",
    },
    twitter: { card: "summary", title, description, images: profile.avatar_url ? [profile.avatar_url] : undefined },
  };
}

export default async function PublicProfile({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .eq("is_public", true)
    .single();

  if (!profile) notFound();

  const [{ data: services }, { data: portfolio }, { data: socials }] = await Promise.all([
    supabase.from("services").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("portfolio_items").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
  ]);

  supabase.from("events").insert({ profile_id: profile.id, type: "view" }).then(() => {});

  const msg = await getServerMessages();

  const mainWaRaw = buildWaLink(profile.phone_e164, buildMainWaMessage(profile.display_name));
  const telLink = `tel:${profile.phone_e164}`;
  const isPortfolio = profile.template === "portfolio";
  const pid = profile.id;

  function trackClick(type: string, to: string) {
    return `/api/track-click?pid=${pid}&type=${type}&to=${encodeURIComponent(to)}`;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[640px] mx-auto px-4 py-8 pb-28 sm:pb-8">
        {/* Header — adapts to mode */}
        {isPortfolio ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatar_url} alt={profile.display_name} className="h-24 w-24 rounded-full object-cover mx-auto border-4 border-white" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-2xl mx-auto">
                {profile.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-[28px] font-bold tracking-tight font-display mt-3 text-gray-900">{profile.display_name}</h1>
            <p className="text-sm font-medium text-[#FF6B35] mt-1">{profile.tagline}</p>
            <p className="text-xs text-gray-500 mt-2">{profile.city}, {profile.country}</p>
            {profile.bio && <p className="text-sm text-gray-600 mt-4 leading-6 text-left bg-gray-50 rounded-lg p-4 border border-gray-200">{profile.bio}</p>}
            <div className="mt-5 flex gap-3">
              <a href={trackClick("click_main", mainWaRaw)} target="_blank" rel="noopener noreferrer" className="flex-1 h-11 rounded-lg bg-[#25D366] text-white font-semibold inline-flex items-center justify-center hover:bg-[#128C7E]">{msg.profile.whatsapp}</a>
              <a href={telLink} className="h-11 w-11 rounded-lg border border-gray-200 bg-white inline-flex items-center justify-center hover:bg-gray-50 text-gray-500">P</a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatar_url} alt={profile.display_name} className="h-20 w-20 rounded-full object-cover ring-1 ring-gray-200" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-900 font-semibold">
                {profile.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="mt-4 text-[30px] font-bold tracking-tight font-display leading-none text-gray-900">{profile.display_name}</h1>
            <p className="mt-1.5 text-[15px] text-gray-500">{profile.tagline}</p>
            <p className="mt-3 text-xs tracking-widest uppercase text-gray-400">{profile.city} / {profile.country}</p>
            {profile.bio && <p className="mt-6 text-sm leading-7 text-gray-600 max-w-md border-t border-gray-200 pt-6">{profile.bio}</p>}
            <div className="mt-6 w-full max-w-[400px] flex flex-col gap-2">
              <a href={trackClick("click_main", mainWaRaw)} target="_blank" rel="noopener noreferrer" className="h-11 w-full rounded-lg bg-[#25D366] text-white font-semibold inline-flex items-center justify-center hover:bg-[#128C7E]">{msg.profile.whatsapp} — {profile.display_name.split(" ")[0]}</a>
              <a href={telLink} className="h-10 w-full rounded-lg border border-gray-200 bg-white text-sm font-medium inline-flex items-center justify-center hover:bg-gray-50 text-gray-700">{msg.profile.call}</a>
            </div>
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mt-6">
            <h2 className={`font-bold font-display px-1 mb-3 text-gray-900 ${isPortfolio ? "" : "text-xs tracking-widest uppercase text-gray-400 font-medium"}`}>
              {msg.profile.services}
            </h2>
            {isPortfolio ? (
              <div className="rounded-xl border border-gray-200 p-4 sm:p-5 grid gap-2.5">
                {services.map((s) => {
                  const waRaw = buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency));
                  return (
                    <div key={s.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{s.title}</p>
                        {s.description && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{s.description}</p>}
                        {s.price != null && <p className="text-sm font-bold text-[#FF6B35] mt-2">{s.price.toLocaleString()} {s.currency}</p>}
                      </div>
                      <a href={trackClick(`click_service_${s.id}`, waRaw)} target="_blank" rel="noopener noreferrer" className="self-center shrink-0 h-9 px-4 rounded-lg bg-[#FF6B35] text-white text-xs font-semibold hover:bg-[#EA580C]">{msg.profile.demandBtn}</a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 border-y border-gray-200">
                {services.map((s) => {
                  const waRaw = buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency));
                  return (
                    <div key={s.id} className="py-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                        {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                        {s.price != null && <p className="text-sm text-gray-400 mt-1">{s.price.toLocaleString()} {s.currency}</p>}
                      </div>
                      <a href={trackClick(`click_service_${s.id}`, waRaw)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">{msg.profile.whatsapp}</a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Portfolio */}
        {portfolio && portfolio.length > 0 && (
          <div className="mt-6">
            <h2 className={`font-bold font-display px-1 mb-3 text-gray-900 ${isPortfolio ? "" : "text-xs tracking-widest uppercase text-gray-400 font-medium"}`}>
              {msg.profile.portfolio}
            </h2>
            <div className={isPortfolio ? "grid grid-cols-2 gap-2.5" : "grid grid-cols-3 gap-2"}>
              {portfolio.map((p) => (
                isPortfolio ? (
                  <div key={p.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.image_url} alt={p.title || ""} className="aspect-square w-full object-cover group-hover:scale-[1.02] transition" />
                    {p.title && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3"><p className="text-xs font-medium text-white truncate">{p.title}</p></div>}
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={p.id} src={p.image_url} alt={p.title || ""} className="aspect-square w-full object-cover rounded-lg border border-gray-200" />
                )
              ))}
            </div>
          </div>
        )}

        {/* Socials */}
        {socials && socials.length > 0 && (
          <div className="mt-6">
            <h2 className={`font-bold font-display px-1 mb-3 text-gray-900 ${isPortfolio ? "" : "text-xs tracking-widest uppercase text-gray-400 font-medium"}`}>
              {msg.profile.socials}
            </h2>
            {isPortfolio ? (
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">{s.platform}</a>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 decoration-gray-300">{s.platform}</a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-10">
          {msg.profile.madeWith} <Link href="/" className="font-medium text-[#FF6B35]">Bizko</Link> — bizko.co/{profile.username}
        </p>
      </div>

      {/* Sticky WhatsApp CTA — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 flex justify-center sm:hidden z-50">
        <a href={trackClick("click_sticky", mainWaRaw)} target="_blank" rel="noopener noreferrer" className="h-12 w-full max-w-[640px] rounded-lg bg-[#25D366] text-white font-semibold inline-flex items-center justify-center">
          {msg.profile.stickyWa}
        </a>
      </div>
    </div>
  );
}

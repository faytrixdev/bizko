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
  if (!profile) return { title: "Profil introuvable - Bizko" };

  const title = `${profile.display_name} - ${profile.tagline} | Bizko`;
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
        {/* Header - adapts to mode */}
        {isPortfolio ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatar_url} alt={profile.display_name} className="h-24 w-24 rounded-full object-cover mx-auto shadow-lg ring-4 ring-white" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg ring-4 ring-white">
                {profile.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight font-display mt-4 text-gray-900">{profile.display_name}</h1>
            <p className="text-base font-medium text-[#FF6B35] mt-2">{profile.tagline}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-xs font-medium text-gray-500">{profile.city}, {profile.country}</span>
            </div>
            {profile.bio && <p className="text-sm text-gray-600 mt-4 leading-7 text-left bg-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm">{profile.bio}</p>}
            <div className="mt-5 flex gap-3">
              <a href={trackClick("click_main", mainWaRaw)} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-xl bg-[#25D366] text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all duration-200 shadow-md shadow-[#25D366]/20">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {msg.profile.whatsapp}
              </a>
              <a href={telLink} className="h-12 w-12 rounded-xl border border-gray-200 bg-white inline-flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatar_url} alt={profile.display_name} className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
                {profile.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="mt-5 text-3xl font-bold tracking-tight font-display leading-none text-gray-900">{profile.display_name}</h1>
            <p className="mt-2 text-base font-medium text-[#FF6B35]">{profile.tagline}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-xs font-medium text-gray-500">{profile.city} / {profile.country}</span>
            </div>
            {profile.bio && (
              <p className="mt-6 text-sm leading-7 text-gray-600 max-w-md bg-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm text-left">
                {profile.bio}
              </p>
            )}
            <div className="mt-6 w-full max-w-[400px] flex flex-col gap-3">
              <a href={trackClick("click_main", mainWaRaw)} target="_blank" rel="noopener noreferrer" className="h-12 w-full rounded-xl bg-[#25D366] text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all duration-200 shadow-md shadow-[#25D366]/20">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {msg.profile.whatsapp} - {profile.display_name.split(" ")[0]}
              </a>
              <a href={telLink} className="h-11 w-full rounded-xl border border-gray-200 bg-white text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-700 transition-all duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {msg.profile.call}
              </a>
            </div>
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mt-8">
            <h2 className={`font-bold font-display px-1 mb-4 text-gray-900 ${isPortfolio ? "" : "text-xs tracking-widest uppercase text-gray-400 font-medium"}`}>
              {msg.profile.services}
            </h2>
            {isPortfolio ? (
              <div className="rounded-2xl border border-gray-100 p-4 sm:p-5 grid gap-3 shadow-sm">
                {services.map((s) => {
                  const waRaw = buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency));
                  return (
                    <div key={s.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex gap-3 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{s.title}</p>
                        {s.description && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{s.description}</p>}
                        {s.price != null && <p className="text-sm font-bold text-[#FF6B35] mt-2">{s.price.toLocaleString()} {s.currency}</p>}
                      </div>
                      <a href={trackClick(`click_service_${s.id}`, waRaw)} target="_blank" rel="noopener noreferrer" className="self-center shrink-0 h-9 px-4 rounded-xl bg-[#FF6B35] text-white text-xs font-semibold hover:bg-[#EA580C] transition-all duration-200 shadow-sm shadow-[#FF6B35]/20">{msg.profile.demandBtn}</a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-3">
                {services.map((s) => {
                  const waRaw = buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency));
                  return (
                    <div key={s.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                        {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                        {s.price != null && <p className="text-sm font-bold text-[#FF6B35] mt-2">{s.price.toLocaleString()} {s.currency}</p>}
                      </div>
                      <a href={trackClick(`click_service_${s.id}`, waRaw)} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#128C7E] transition-all duration-200 shadow-sm shadow-[#25D366]/20">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {msg.profile.demandBtn}
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Portfolio */}
        {portfolio && portfolio.length > 0 && (
          <div className="mt-8">
            <h2 className={`font-bold font-display px-1 mb-4 text-gray-900 ${isPortfolio ? "" : "text-xs tracking-widest uppercase text-gray-400 font-medium"}`}>
              {msg.profile.portfolio}
            </h2>
            <div className={isPortfolio ? "grid grid-cols-2 gap-3" : "grid grid-cols-3 gap-3"}>
              {portfolio.map((p) => (
                isPortfolio ? (
                  <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.image_url} alt={p.title || ""} className="aspect-square w-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    {p.title && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3"><p className="text-xs font-medium text-white truncate">{p.title}</p></div>}
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={p.id} src={p.image_url} alt={p.title || ""} className="aspect-square w-full object-cover rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300" />
                )
              ))}
            </div>
          </div>
        )}

        {/* Socials */}
        {socials && socials.length > 0 && (
          <div className="mt-8">
            <h2 className={`font-bold font-display px-1 mb-4 text-gray-900 ${isPortfolio ? "" : "text-xs tracking-widest uppercase text-gray-400 font-medium"}`}>
              {msg.profile.socials}
            </h2>
            {isPortfolio ? (
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-xl bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C] transition-all duration-200 shadow-sm shadow-[#FF6B35]/20">{s.platform}</a>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200">{s.platform}</a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-12">
          {msg.profile.madeWith} <Link href="/" className="font-medium text-[#FF6B35]">Bizko</Link> - bizko.co/{profile.username}
        </p>
      </div>

      {/* Sticky WhatsApp CTA - mobile only */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100/60 bg-white/95 backdrop-blur-xl p-4 flex justify-center sm:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <a href={trackClick("click_sticky", mainWaRaw)} target="_blank" rel="noopener noreferrer" className="h-12 w-full max-w-[640px] rounded-2xl bg-[#25D366] text-white font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {msg.profile.stickyWa}
        </a>
      </div>
    </div>
  );
}

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
        {socials && socials.length > 0 && (() => {
          const socialStyles: Record<string, { bg: string; hover: string; icon: React.ReactNode }> = {
            instagram: { bg: "bg-[#E4405F]", hover: "hover:bg-[#D63384]", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg> },
            tiktok: { bg: "bg-[#000000]", hover: "hover:bg-[#1a1a1a]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
            linkedin: { bg: "bg-[#0A66C2]", hover: "hover:bg-[#004182]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
            facebook: { bg: "bg-[#1877F2]", hover: "hover:bg-[#0D65D9]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            x: { bg: "bg-[#000000]", hover: "hover:bg-[#1a1a1a]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            youtube: { bg: "bg-[#FF0000]", hover: "hover:bg-[#CC0000]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
            website: { bg: "bg-[#6B7280]", hover: "hover:bg-[#4B5563]", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg> },
          };

          return (
            <div className="mt-8">
              <h2 className={`font-bold font-display px-1 mb-4 text-gray-900 ${isPortfolio ? "" : "text-xs tracking-widest uppercase text-gray-400 font-medium"}`}>
                {msg.profile.socials}
              </h2>
              <div className="grid gap-2">
                {socials.map((s) => {
                  const style = socialStyles[s.platform] || socialStyles.website;
                  return (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                      className={`${style.bg} ${style.hover} h-12 rounded-xl text-white font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-sm`}>
                      {style.icon}
                      <span className="capitalize">{s.platform}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })()}

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

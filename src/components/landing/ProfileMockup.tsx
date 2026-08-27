interface Service {
  title: string;
  price: string;
}

interface PortfolioItem {
  label?: string;
}

interface ProfileMockupProps {
  name: string;
  initials: string;
  profession: string;
  bio: string;
  location: string;
  services: Service[];
  portfolio?: PortfolioItem[];
  variant?: "default" | "compact" | "detailed";
}

export function ProfileMockup({
  name,
  initials,
  profession,
  bio,
  location,
  services,
  portfolio = [],
  variant = "default",
}: ProfileMockupProps) {
  return (
    <div className="mockup-card rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
          <div className="text-xs text-[#FF6B35] font-medium">{profession}</div>
        </div>
        <div className="ml-auto shrink-0 inline-flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="text-[10px] font-medium text-gray-500">{location}</span>
        </div>
      </div>

      {/* Bio */}
      {variant !== "compact" && (
        <p className="text-xs text-gray-500 leading-5 mb-4 line-clamp-2">{bio}</p>
      )}

      {/* Services */}
      <div className="space-y-2">
        {services.map((s, i) => (
          <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">{s.title}</div>
              <div className="text-[11px] font-bold text-[#FF6B35] mt-0.5">{s.price}</div>
            </div>
            <div className="shrink-0 h-7 px-2.5 rounded-lg bg-[#25D366] text-white text-[10px] font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio */}
      {variant === "detailed" && portfolio.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-1.5">
            {portfolio.map((p, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-100 border border-gray-100 flex items-center justify-center">
                {p.label && <span className="text-[9px] text-gray-400">{p.label}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link */}
      <p className="text-[10px] text-center text-gray-300 mt-3 font-medium">bizko.me/{name.toLowerCase().replace(/\s/g, "")}</p>
    </div>
  );
}

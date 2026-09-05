import Link from "next/link";
import Image from "next/image";
import type { ExploreResult } from "@/lib/supabase/queries";

type Props = {
  item: ExploreResult;
  strings: { pro: string; categoryLabel: string | null; countryLabel: string };
  avatarAlt?: string;
};

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ExploreCard({ item, strings, avatarAlt }: Props) {
  const alt = avatarAlt ?? item.displayName;

  return (
    <Link
      href={`/${item.username}`}
      className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-md"
    >
      {item.avatarUrl != null ? (
        <Image
          src={item.avatarUrl}
          alt={alt}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-900 to-gray-700 text-lg font-bold text-white"
        >
          {initialsOf(item.displayName)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-display text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:text-accent">
            {item.displayName}
          </p>
          {item.isPro && (
            <span className="inline-flex shrink-0 items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
              {strings.pro}
            </span>
          )}
        </div>

        {item.tagline && (
          <p className="mt-0.5 truncate text-sm text-gray-500">{item.tagline}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.city && (
            <span
              title={strings.countryLabel}
              className="inline-flex items-center gap-1 text-xs text-gray-500"
            >
              <svg
                className="h-3.5 w-3.5 text-gray-400"
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
              {item.city}
              {item.country ? `, ${item.country}` : ""}
            </span>
          )}
          {strings.categoryLabel && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
              {strings.categoryLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

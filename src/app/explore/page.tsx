import Link from "next/link";
import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { createPublicClient } from "@/lib/supabase/public-client";
import { createClient } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/plans";
import { searchExplore, EXPLORE_PAGE_SIZE, type ExploreFilters as ExploreFiltersQuery } from "@/lib/supabase/queries";
import { CATEGORIES, isCategory } from "@/lib/categories";
import { ExploreCard } from "@/components/explore/ExploreCard";
import { ExploreFilters } from "@/components/explore/ExploreFilters";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { DashboardHeader } from "@/components/DashboardHeader";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title: msg.explore.title,
    description: msg.explore.description,
    alternates: {
      canonical: "/explore",
    },
  };
}

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    ville?: string | string[];
    pays?: string | string[];
    cat?: string | string[];
    page?: string | string[];
  }>;
};

const param = (value: string | string[] | undefined): string | undefined =>
  typeof value === "string" ? value.trim() || undefined : undefined;

type SubRow = {
  plan?: string | null;
  status?: string | null;
};

export default async function ExplorePage({ searchParams }: Props) {
  const raw = await searchParams;
  const msg = await getServerMessages();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPro = false;
  let username: string | undefined;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("profile_id", user.id)
      .maybeSingle();
    const row = sub && !Array.isArray(sub) ? (sub as SubRow) : null;
    isPro = isProPlan(row?.plan, row?.status);
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    const p = profile && !Array.isArray(profile) ? profile : null;
    username = p?.username ?? undefined;
  }

  const q = param(raw.q);
  const ville = param(raw.ville);
  const pays = param(raw.pays);
  const cat = param(raw.cat);
  const page = Math.max(1, Number(param(raw.page)) || 1);
  const filters: ExploreFiltersQuery = {
    q,
    city: ville,
    category: cat,
    country: pays,
    page,
  };

  const result = await searchExplore(filters);

  let cities: string[] = [];
  let countries: string[] = [];
  try {
    const { data: citiesData } = await createPublicClient()
      .from("profiles")
      .select("city, country")
      .eq("is_public", true);
    const seenCities = new Set<string>();
    const seenCountries = new Set<string>();
    for (const row of citiesData ?? []) {
      const city = row.city?.trim();
      if (city) seenCities.add(city);
      const country = row.country?.trim();
      if (country) seenCountries.add(country);
    }
    cities = [...seenCities].sort((a, b) => a.localeCompare(b));
    countries = [...seenCountries].sort((a, b) => a.localeCompare(b));
  } catch {
    // directory must not crash if the city list fails
  }

  const categoriesList = CATEGORIES.map((slug) => ({
    value: slug,
    label: msg.categories[slug],
  }));

  const totalPages = Math.max(1, Math.ceil(result.total / EXPLORE_PAGE_SIZE));

  const makePageHref = (targetPage: number): string => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (ville) params.set("ville", ville);
    if (pays) params.set("pays", pays);
    if (cat) params.set("cat", cat);
    params.set("page", String(targetPage));
    return `/explore?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {user ? <DashboardHeader username={username} isPro={isPro} /> : <LandingNavbar msg={msg} />}

      <main className={`flex-1 max-w-6xl mx-auto px-5 sm:px-8 w-full ${user ? "py-12 sm:py-16" : "pt-28 sm:pt-32 pb-12 sm:pb-16"}`}>
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
            {msg.explore.title}
          </h1>
          <p className="mt-3 text-gray-500 leading-7">{msg.explore.description}</p>
        </header>

        <div className="mb-8">
          <ExploreFilters
            strings={{
              searchPlaceholder: msg.explore.searchPlaceholder,
              filterCity: msg.explore.filterCity,
              filterCountry: msg.explore.filterCountry,
              filterCategory: msg.explore.filterCategory,
              allCities: msg.explore.allCities,
              allCountries: msg.explore.allCountries,
              allCategories: msg.explore.allCategories,
              searchLabel: msg.explore.searchLabel,
            }}
            cities={cities}
            countries={countries}
            categories={categoriesList}
            values={{
              q: filters.q,
              city: filters.city,
              category: filters.category,
              country: filters.country,
            }}
          />
        </div>

        {result.items.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-gray-900">{msg.explore.empty}</p>
            <p className="mt-2 text-sm text-gray-500">{msg.explore.emptyHint}</p>
            <Link
              href="/explore"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-all duration-200"
            >
              {msg.explore.reset}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.items.map((item) => (
              <ExploreCard
                key={item.id}
                item={item}
                strings={{
                  pro: msg.explore.pro,
                  categoryLabel:
                    item.category && isCategory(item.category)
                      ? msg.categories[item.category]
                      : null,
                  countryLabel: item.country,
                }}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && result.items.length > 0 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-center gap-4"
          >
            {page > 1 ? (
              <Link
                href={makePageHref(page - 1)}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-accent transition-colors"
              >
                <span aria-hidden="true">«</span>
                {msg.explore.previous}
              </Link>
            ) : null}

            <span className="text-sm text-gray-500">
              {msg.explore.page.replace("{current}", String(page)).replace("{total}", String(totalPages))}
            </span>

            {page < totalPages ? (
              <Link
                href={makePageHref(page + 1)}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-accent transition-colors"
              >
                {msg.explore.next}
                <span aria-hidden="true">»</span>
              </Link>
            ) : null}
          </nav>
        )}
      </main>

      <footer className="border-t border-gray-100 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <span className="text-lg font-bold font-display text-gray-900 tracking-tight">Bizko</span>
          <p className="mt-2 text-sm text-gray-400">{msg.landing.footerTagline}</p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { Search } from "lucide-react";

type Props = {
  strings: {
    searchPlaceholder: string;
    filterCity: string;
    filterCategory: string;
    allCities: string;
    allCategories: string;
    searchLabel: string;
  };
  cities: string[];
  categories: { value: string; label: string }[];
  values: { q?: string; city?: string; category?: string };
};

const selectClass =
  "h-11 shrink-0 sm:w-44 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

export function ExploreFilters({ strings, cities, categories, values }: Props) {
  return (
    <form method="get" action="/explore" className="flex flex-wrap items-center gap-2.5">
      <input
        name="q"
        type="search"
        defaultValue={values.q ?? ""}
        placeholder={strings.searchPlaceholder}
        className="h-11 min-w-[180px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
      />
      <select name="ville" defaultValue={values.city ?? ""} aria-label={strings.filterCity} className={selectClass}>
        <option value="">{strings.allCities}</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <select name="cat" defaultValue={values.category ?? ""} aria-label={strings.filterCategory} className={selectClass}>
        <option value="">{strings.allCategories}</option>
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        aria-label={strings.searchLabel}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-sm"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

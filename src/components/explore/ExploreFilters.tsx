"use client";

import { Search, ChevronDown } from "lucide-react";

type Props = {
  strings: {
    searchPlaceholder: string;
    filterCity: string;
    filterCategory: string;
    filterCountry: string;
    allCities: string;
    allCategories: string;
    allCountries: string;
    searchLabel: string;
  };
  cities: string[];
  countries: string[];
  categories: { value: string; label: string }[];
  values: { q?: string; city?: string; category?: string; country?: string };
};

const selectClass =
  "h-11 w-full appearance-none cursor-pointer rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

function FilterSelect({
  name,
  value,
  ariaLabel,
  options,
  selectClass: cls,
}: {
  name: string;
  value?: string;
  ariaLabel: string;
  options: { value: string; label: string }[];
  selectClass: string;
}) {
  return (
    <div className="relative shrink-0 sm:w-44">
      <select name={name} defaultValue={value ?? ""} aria-label={ariaLabel} className={cls}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
    </div>
  );
}

export function ExploreFilters({ strings, cities, countries, categories, values }: Props) {
  return (
    <form method="get" action="/explore" className="flex flex-wrap items-center gap-2.5">
      <input
        name="q"
        type="search"
        defaultValue={values.q ?? ""}
        placeholder={strings.searchPlaceholder}
        className="h-11 min-w-[180px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
      />
      <FilterSelect
        name="ville"
        value={values.city}
        ariaLabel={strings.filterCity}
        selectClass={selectClass}
        options={[{ value: "", label: strings.allCities }, ...cities.map((city) => ({ value: city, label: city }))]}
      />
      <FilterSelect
        name="pays"
        value={values.country}
        ariaLabel={strings.filterCountry}
        selectClass={selectClass}
        options={[{ value: "", label: strings.allCountries }, ...countries.map((country) => ({ value: country, label: country }))]}
      />
      <FilterSelect
        name="cat"
        value={values.category}
        ariaLabel={strings.filterCategory}
        selectClass={selectClass}
        options={[{ value: "", label: strings.allCategories }, ...categories]}
      />
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
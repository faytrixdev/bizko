"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

type Option = { value: string; label: string };

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
  "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white pl-3 pr-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

function FilterSelect({
  name,
  value,
  ariaLabel,
  options,
  onSelect,
}: {
  name: string;
  value: string;
  ariaLabel: string;
  options: Option[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={ref} className="relative shrink-0 sm:w-44">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={selectClass}
      >
        <span className="truncate">{selected?.label ?? ariaLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-2xl shadow-zinc-300/30"
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors duration-150 ${
                value === option.value
                  ? "bg-gray-50 font-medium text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExploreFilters({ strings, cities, countries, categories, values }: Props) {
  const [city, setCity] = useState(values.city ?? "");
  const [country, setCountry] = useState(values.country ?? "");
  const [category, setCategory] = useState(values.category ?? "");

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
        name="pays"
        value={country}
        ariaLabel={strings.filterCountry}
        onSelect={setCountry}
        options={[{ value: "", label: strings.allCountries }, ...countries.map((country) => ({ value: country, label: country }))]}
      />
      <FilterSelect
        name="ville"
        value={city}
        ariaLabel={strings.filterCity}
        onSelect={setCity}
        options={[{ value: "", label: strings.allCities }, ...cities.map((city) => ({ value: city, label: city }))]}
      />
      <FilterSelect
        name="cat"
        value={category}
        ariaLabel={strings.filterCategory}
        onSelect={setCategory}
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
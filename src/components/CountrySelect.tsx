"use client";

import { AFRICAN_COUNTRIES } from "@/lib/countries";
import { CustomSelect } from "@/components/CustomSelect";

interface CountrySelectProps {
  name?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}

export function CountrySelect({ name = "country", defaultValue, required, className }: CountrySelectProps) {
  return (
    <CustomSelect
      name={name}
      defaultValue={defaultValue}
      placeholder="Pays..."
      required={required}
      options={AFRICAN_COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
      className={className}
    />
  );
}

import { AFRICAN_COUNTRIES } from "@/lib/countries";

interface CountrySelectProps {
  name?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}

export function CountrySelect({ name = "country", defaultValue, required, className }: CountrySelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      required={required}
      className={`${className} pr-8`}
    >
      <option value="">Pays...</option>
      {AFRICAN_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

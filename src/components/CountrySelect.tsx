import { AFRICAN_COUNTRIES } from "@/lib/countries";

interface CountrySelectProps {
  name?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}

const ARROW_CLASSES = "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat";

export function CountrySelect({ name = "country", defaultValue, required, className }: CountrySelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      required={required}
      className={`${className} pr-10 ${ARROW_CLASSES}`}
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

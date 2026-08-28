# Country Selector - African Countries Dropdown

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remplacer le champ texte pays par un sélecteur dropdown avec la liste des pays africains.

**Fichiers à modifier:**
1. `src/app/onboarding/page.tsx` (ligne 45)
2. `src/components/dashboard/TabSettings.tsx` (ligne 28)
3. `src/components/account/AccountForm.tsx` (ligne 72-78)

---

## Design

### Liste des pays africains (codes ISO + noms)

Créer un fichier partagé `src/lib/countries.ts` :

```ts
export const AFRICAN_COUNTRIES = [
  { code: "DZ", name: "Algérie" },
  { code: "AO", name: "Angola" },
  { code: "BJ", name: "Bénin" },
  { code: "BW", name: "Botswana" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cap-Vert" },
  { code: "CM", name: "Cameroun" },
  { code: "CF", name: "Centrafrique" },
  { code: "TD", name: "Tchad" },
  { code: "KM", name: "Comores" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "RD Congo" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "DJ", name: "Djibouti" },
  { code: "EG", name: "Égypte" },
  { code: "GQ", name: "Guinée équatoriale" },
  { code: "ER", name: "Érythrée" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Éthiopie" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambie" },
  { code: "GH", name: "Ghana" },
  { code: "GN", name: "Guinée" },
  { code: "GW", name: "Guinée-Bissau" },
  { code: "KE", name: "Kenya" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libye" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "ML", name: "Mali" },
  { code: "MR", name: "Mauritanie" },
  { code: "MU", name: "Maurice" },
  { code: "MA", name: "Maroc" },
  { code: "MZ", name: "Mozambique" },
  { code: "NA", name: "Namibie" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "RW", name: "Rwanda" },
  { code: "ST", name: "Sao Tomé-et-Principe" },
  { code: "SN", name: "Sénégal" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SO", name: "Somalie" },
  { code: "ZA", name: "Afrique du Sud" },
  { code: "SS", name: "Soudan du Sud" },
  { code: "SD", name: "Soudan" },
  { code: "TZ", name: "Tanzanie" },
  { code: "TG", name: "Togo" },
  { code: "TN", name: "Tunisie" },
  { code: "UG", name: "Ouganda" },
  { code: "ZM", name: "Zambie" },
  { code: "ZW", name: "Zimbabwe" },
] as const;
```

### composant réutilisable `CountrySelect`

Créer `src/components/CountrySelect.tsx` :

```tsx
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
      className={className}
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
```

### Utilisation dans chaque fichier

**Onboarding** (remplace l'input) :
```tsx
<CountrySelect name="country" defaultValue="CI" required className="w-40 h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900 bg-white" />
```

**Dashboard TabSettings** (remplace l'input) :
```tsx
<CountrySelect name="country" defaultValue={profile.country} required className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 bg-white" />
```

**Account AccountForm** (remplace l'Input) :
```tsx
<CountrySelect name="country" defaultValue={profile.country} required className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900 bg-white" />
```

---

## Récapitulatif

| Fichier | Changement |
|---|---|
| `src/lib/countries.ts` | Nouveau - liste des 54 pays africains |
| `src/components/CountrySelect.tsx` | Nouveau - composant réutilisable |
| `src/app/onboarding/page.tsx` | Input → CountrySelect |
| `src/components/dashboard/TabSettings.tsx` | Input → CountrySelect |
| `src/components/account/AccountForm.tsx` | Input → CountrySelect |

# Socials Section Redesign — Brand-Colored Buttons

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remplacer les pills/grays par des boutons brand-colored modernes, un par réseau social, avec icône SVG et couleur officielle.

**Fichier:** `src/app/[username]/page.tsx` (sections Socials minimal + portfolio)

---

## Design

### Principe
Chaque réseau social a sa **couleur officielle** + **icône SVG** + **label**. Le bouton occupe toute la largeur (full-width) pour un rendu mobile-first propre.

### Couleurs et icônes par plateforme

| Platform | Couleur bg | Couleur hover | Icône |
|---|---|---|---|
| instagram | `#E4405F` | `#D63384` | Camera (Heroicons) |
| tiktok | `#000000` | `#1a1a1a` | Music note |
| linkedin | `#0A66C2` | `#004182` | Briefcase |
| facebook | `#1877F2` | `#0D65D9` | F |
| x | `#000000` | `#1a1a1a` | X logo |
| youtube | `#FF0000` | `#CC0000` | Play |
| website | `#6B7280` | `#4B5563` | Globe |

### Layout (minimal mode)
```
┌─────────────────────────────────┐
│ [icon] Instagram          [→]  │  ← bg-[#E4405F], rounded-xl, h-12
├─────────────────────────────────┤
│ [icon] TikTok             [→]  │  ← bg-[#000000], rounded-xl, h-12
├─────────────────────────────────┤
│ [icon] LinkedIn           [→]  │  ← bg-[#0A66C2], rounded-xl, h-12
└─────────────────────────────────┘
```

### Layout (portfolio mode)
Même style mais en `flex flex-col gap-2` (pas de container border).

### Code (minimal)

```tsx
{/* Socials */}
{socials && socials.length > 0 && (() => {
  const socialStyles: Record<string, { bg: string; hover: string; icon: JSX.Element; label: string }> = {
    instagram: { bg: "bg-[#E4405F]", hover: "hover:bg-[#D63384]", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg> },
    tiktok: { bg: "bg-[#000000]", hover: "hover:bg-[#1a1a1a]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.18v-3.45a4.85 4.85 0 01-2-.87V6.69h2z"/></svg> },
    linkedin: { bg: "bg-[#0A66C2]", hover: "hover:bg-[#004182]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    facebook: { bg: "bg-[#1877F2]", hover: "hover:bg-[#0D65D9]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    x: { bg: "bg-[#000000]", hover: "hover:bg-[#1a1a1a]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    youtube: { bg: "bg-[#FF0000]", hover: "hover:bg-[#CC0000]", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
    website: { bg: "bg-[#6B7280]", hover: "hover:bg-[#4B5563]", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg> },
  };

  return (
    <div className="mt-8">
      <h2 className="font-bold font-display px-1 mb-4 text-xs tracking-widest uppercase text-gray-400 font-medium">
        {msg.profile.socials}
      </h2>
      <div className="grid gap-2">
        {socials.map((s) => {
          const style = socialStyles[s.platform] || socialStyles.website;
          return (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
              className={`${style.bg} ${style.hover} h-12 rounded-xl text-white font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-sm`}>
              {style.icon}
              <span className="capitalize">{s.platform}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
})()}
```

---

## Récapitulatif

| Aspect | Avant | Après |
|---|---|---|
| Style | Pills gris (`bg-gray-100`) | Boutons brand-colored pleine largeur |
| Icône | Aucune | SVG officiel de chaque plateforme |
| Couleur | Gris unis | Couleur officielle (Instagram rose, LinkedIn bleu, etc.) |
| Layout | `flex-wrap` horizontal | `grid gap-2` vertical full-width |
| Hover | `bg-gray-200` | Couleur légèrement plus foncée |
| Ombre | Aucune | `shadow-sm` subtil |

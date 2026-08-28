# Profile Page Redesign - Clean Premium

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rendre la page profil publique plus moderne et premium tout en gardant la conversion WhatsApp comme objectif #1.

**Architecture:** Modifications CSS + JSX dans un seul fichier server component. Pas de nouvelles dépendances.

**Tech Stack:** Tailwind CSS 4, React 19, Next.js 16

---

## Fichier principal
`src/app/[username]/page.tsx`

---

## Phase 1 - Header profil premium

### Changements (template minimal + portfolio):

**Avatar:**
- Ajouter `shadow-lg` + `ring-4 ring-white` pour un effet de profondeur
- Taille légèrement augmentée: `h-24 w-24` au lieu de `h-20 w-20` (minimal)

**Nom + tagline:**
- Nom: `text-3xl` au lieu de `text-[30px]` (plus propre)
- Tagline: couleur accent plus vibrante

**Ville/pays:**
- Style pill/badge: `inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1`

**Bio:**
- Card subtle avec `bg-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm`

### Template minimal (après):
```tsx
<div className="flex flex-col items-center text-center">
  {/* Avatar */}
  {profile.avatar_url ? (
    <img src={profile.avatar_url} alt={profile.display_name}
      className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white" />
  ) : (
    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
      {profile.display_name.slice(0, 2).toUpperCase()}
    </div>
  )}

  {/* Name */}
  <h1 className="mt-5 text-3xl font-bold tracking-tight font-display text-gray-900">
    {profile.display_name}
  </h1>

  {/* Tagline */}
  <p className="mt-2 text-base font-medium text-[#FF6B35]">{profile.tagline}</p>

  {/* Location badge */}
  <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
    <span className="text-xs font-medium text-gray-500">{profile.city}, {profile.country}</span>
  </div>

  {/* Bio */}
  {profile.bio && (
    <p className="mt-6 text-sm leading-7 text-gray-600 max-w-md bg-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm">
      {profile.bio}
    </p>
  )}

  {/* CTAs */}
  <div className="mt-6 w-full max-w-[400px] flex flex-col gap-3">
    <a href={trackClick("click_main", mainWaRaw)} target="_blank" rel="noopener noreferrer"
      className="h-12 w-full rounded-xl bg-[#25D366] text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all duration-200 shadow-md shadow-[#25D366]/20 hover:shadow-lg hover:shadow-[#25D366]/30">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {msg.profile.whatsapp} - {profile.display_name.split(" ")[0]}
    </a>
    <a href={telLink}
      className="h-11 w-full rounded-xl border border-gray-200 bg-white text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-700 transition-all duration-200">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
      {msg.profile.call}
    </a>
  </div>
</div>
```

---

## Phase 2 - Services premium

### Template minimal (liste):
- Remplacer `divide-y divide-gray-200 border-y border-gray-200` par des cards individuelles
- Chaque service: `bg-gray-50/50 border border-gray-100 rounded-2xl p-4 shadow-sm`
- Bouton WhatsApp: style pill avec icône

### Template portfolio (grid):
- Cards: `rounded-2xl border-gray-100 shadow-sm`
- Bouton: `rounded-xl` au lieu de `rounded-lg`

### Minimal (après):
```tsx
<div className="grid gap-3">
  {services.map((s) => {
    const waRaw = buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency));
    return (
      <div key={s.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
          {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
          {s.price != null && (
            <p className="text-sm font-bold text-[#FF6B35] mt-2">{s.price.toLocaleString()} {s.currency}</p>
          )}
        </div>
        <a href={trackClick(`click_service_${s.id}`, waRaw)} target="_blank" rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#128C7E] transition-all duration-200 shadow-sm shadow-[#25D366]/20">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {msg.profile.demandBtn}
        </a>
      </div>
    );
  })}
</div>
```

---

## Phase 3 - Portfolio premium

### Changements:
- Portfolio mode: `rounded-2xl` au lieu de `rounded-xl`, hover scale plus subtil `group-hover:scale-[1.03]`
- Minimal mode: `rounded-xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300`
- Ajouter `overflow-hidden` partout

---

## Phase 4 - Socials premium

### Template minimal:
- Remplacer les liens texte par des pills/badges
- Style: `inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200`

### Template portfolio:
- Garder le style actuel mais avec `rounded-xl` et transitions

---

## Phase 5 - Sticky CTA premium

### Changements:
- Ombre portée: `shadow-[0_-4px_20px_rgba(0,0,0,0.08)]`
- Border subtile: `border-gray-100/60`
- Bouton: `rounded-2xl` au lieu de `rounded-lg`, ombre `shadow-lg shadow-[#25D366]/25`
- Ajouter l'icône WhatsApp dans le bouton

---

## Récapitulatif

| Phase | Élément | Changement principal |
|---|---|---|
| 1 | Header profil | Avatar ombre + ring, location badge, bio card, CTAs premium |
| 2 | Services | Cards individuelles au lieu de divide-y, bouton WhatsApp avec icône |
| 3 | Portfolio | Rounded-2xl, hover subtil, ombres |
| 4 | Socials | Pills/badges au lieu de texte brut |
| 5 | Sticky CTA | Ombre portée, rounded-2xl, icône WhatsApp |

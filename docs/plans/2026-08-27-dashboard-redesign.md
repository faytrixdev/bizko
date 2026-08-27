# Dashboard Redesign — Clean Premium

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refaire le dashboard et header pour un rendu moderne, premium, tout en restant cohérent avec le white/orange actuel.

**Architecture:** Modification de CSS + composants existants. Pas de nouvelles dépendances.

**Tech Stack:** Tailwind CSS 4, React 19, Next.js 16

---

## Phase 1 — Header premium

### Task 1.1: Refonte du header dashboard

**Files:**
- Modify: `src/app/dashboard/DashboardClient.tsx` (header section)

**Changements:**
- Ombre portée douce : `shadow-[0_1px_3px_rgba(0,0,0,0.08)]`
- Backdrop-blur léger : `backdrop-blur-xl bg-white/80`
- Avatar du profil à côté du lien "Voir mon profil"
- Séparateur visuel entre logo et actions
- Hover states plus raffinés sur les boutons

**Avant:**
```tsx
<header className="bg-white border-b border-gray-200 sticky top-0 z-40">
  <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
    <Link href="/" className="font-bold font-display text-gray-900">
      Bizko<span className="text-[#FF6B35]">.</span>
    </Link>
    <div className="flex items-center gap-3">
      <LocaleSwitch />
      <Link href={`/${profile.username}`} target="_blank" className="text-xs font-medium text-gray-500 hover:text-gray-900">
        {t("dashboard.viewProfile")}
      </Link>
      <form action={logout}>
        <button className="text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-50">
          {t("dashboard.logout")}
        </button>
      </form>
    </div>
  </div>
</header>
```

**Après:**
```tsx
<header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-100/60">
  <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
    <Link href="/" className="font-bold font-display text-gray-900 text-lg tracking-tight">
      Bizko<span className="text-[#FF6B35]">.</span>
    </Link>
    <div className="flex items-center gap-2">
      <LocaleSwitch />
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <Link href={`/${profile.username}`} target="_blank"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        {t("dashboard.viewProfile")}
      </Link>
      <form action={logout}>
        <button className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200/80 bg-white rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          {t("dashboard.logout")}
        </button>
      </form>
    </div>
  </div>
</header>
```

---

## Phase 2 — Tab bar moderne

### Task 2.1: Refonte de la tab bar

**Files:**
- Modify: `src/app/dashboard/DashboardClient.tsx` (tab bar section)

**Changements:**
- Remplacer le pill gris par un style underline avec indicator animé
- Ajouter des icônes SVG par onglet
- Fond transparent au lieu de `bg-gray-100`

**Après:**
```tsx
<nav className="flex gap-0 border-b border-gray-200 mb-6 relative">
  {TABS.map((tabItem) => (
    <button
      key={tabItem.id}
      onClick={() => setTab(tabItem.id)}
      className={`relative flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-medium transition-colors duration-200 ${
        tab === tabItem.id
          ? "text-gray-900"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {tabItem.icon}
      {tabItem.label}
      {tab === tabItem.id && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"
          transition={{ type: "spring", stiffness": 500, damping": 35 }}
        />
      )}
    </button>
  ))}
</nav>
```

**Icônes par onglet (SVG inline):**
- Apercu: `Eye`
- Services: `Briefcase`
- Portfolio: `Image`
- Reseaux: `Globe`
- Reglages: `Settings`

**Note:** Si `framer-motion` n'est pas dispo, utiliser un CSS transition simple avec `scaleX` au lieu de `layoutId`.

---

## Phase 3 — Cards améliorées

### Task 3.1: Redesign des cards du dashboard

**Files:**
- Modify: `src/components/dashboard/TabOverview.tsx`
- Modify: `src/components/dashboard/TabServices.tsx`
- Modify: `src/components/dashboard/TabPortfolio.tsx`
- Modify: `src/components/dashboard/TabSocials.tsx`
- Modify: `src/components/dashboard/TabSettings.tsx`

**Changements globaux (toutes les cards):**
- `border border-gray-100` au lieu de `border-gray-200` (plus subtil)
- `shadow-sm` par défaut
- `hover:shadow-md transition-shadow duration-300` au hover
- `rounded-2xl` au lieu de `rounded-xl` (plus doux)
- Padding augmenté de `p-5` à `p-6`
- Titres avec `text-gray-900 font-semibold` + sous-titre `text-gray-400 text-xs uppercase tracking-wider`

**Exemple TabOverview card share:**
```tsx
<div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
  <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t("dashboard.share")}</h2>
  <p className="text-xs text-gray-400 mt-0.5">{publicUrl}</p>
  {/* ... */}
</div>
```

---

## Phase 4 — Analytics visuels

### Task 4.1: Redesign des cartes analytics

**Files:**
- Modify: `src/components/dashboard/TabOverview.tsx`

**Changements:**
- Carte vues : fond blanc, icône oeil, nombre en gras, bordure subtile
- Carte WhatsApp : gradient orange→accent, icône WhatsApp, texte blanc
- Ombre plus prononcée sur la carte WhatsApp
- Layout : grille 2 colonnes avec gap plus large

**Après:**
```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Vues */}
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dashboard.views")}</p>
    </div>
    <p className="text-3xl font-bold font-display text-gray-900">{views}</p>
  </div>

  {/* WhatsApp clicks */}
  <div className="rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#EA580C] p-5 shadow-md shadow-[#FF6B35]/20">
    <div className="flex items-center gap-2 mb-3">
      <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </div>
      <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{t("dashboard.waClicks")}</p>
    </div>
    <p className="text-3xl font-bold font-display text-white">{waClicks}</p>
  </div>
</div>
```

---

## Phase 5 — Micro-interactions

### Task 5.1: Ajouter les transitions fluides

**Files:**
- Modify: `src/app/globals.css`

**Ajouter:**
```css
/* Focus ring personalisé */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 8px;
}

/* Smooth transitions pour les inputs */
input, textarea, select {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
}
```

### Task 5.2: Hover states améliorés sur les boutons

Appliquer à tous les boutons du dashboard:
- `transition-all duration-200`
- `hover:scale-[1.02]` sur les boutons primaires (subtil)
- `active:scale-[0.98]` au clic
- Ombre subtile au hover sur les boutons primaires

---

## Récapitulatif

| Phase | Fichiers modifiés | Effet |
|---|---|---|
| 1 | DashboardClient.tsx | Header glass + ombre + icônes |
| 2 | DashboardClient.tsx | Tab bar underline animé + icônes |
| 3 | 5 tab components | Cards ombre + hover + rounded plus doux |
| 4 | TabOverview.tsx | Analytics gradient + icônes + hiérarchie |
| 5 | globals.css + buttons | Transitions fluides + focus rings |

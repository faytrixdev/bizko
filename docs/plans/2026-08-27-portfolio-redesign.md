# Réalisations (Portfolio) Section Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rendre la section Réalisations plus premium avec des overlays de titre, des effets de hover, et un design cohérent.

**Fichier:** `src/app/[username]/page.tsx` (section Portfolio)

---

## Design

### Changements principaux

| Aspect | Avant | Après |
|---|---|---|
| Grid minimal | `grid-cols-3` | `grid-cols-2` (plus de place par image) |
| Titre minimal | Non affiché | Overlay gradient au hover |
| Hover minimal | `hover:shadow-md` | `group-hover:scale-[1.03]` + overlay titre |
| Hover portfolio | `group-hover:scale-[1.03]` | idem + overlay amélioré |
| Coins | `rounded-xl` / `rounded-2xl` | `rounded-2xl` partout |
| Ombre | `shadow-sm` | `shadow-sm hover:shadow-md transition-all duration-300` |

### Code (minimal mode)
```tsx
<div key={p.id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
  <img src={p.image_url} alt={p.title || ""} className="aspect-square w-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  {p.title && (
    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <p className="text-xs font-medium text-white truncate">{p.title}</p>
    </div>
  )}
</div>
```

### Code (portfolio mode)
```tsx
<div key={p.id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
  <img src={p.image_url} alt={p.title || ""} className="aspect-square w-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  {p.title && (
    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <p className="text-xs font-medium text-white truncate">{p.title}</p>
    </div>
  )}
</div>
```

---

## Récapitulatif

| Élément | Changement |
|---|---|
| Grid minimal | `grid-cols-2` au lieu de `grid-cols-3` |
| Overlay gradient | Nouveau : `from-black/50 via-transparent to-transparent` |
| Titre | Apparaît au hover avec `translate-y` + `opacity` animation |
| Hover | `scale-[1.03]` + `shadow-md` + overlay gradient |
| Transitions | `duration-300` partout pour un rendu smooth |

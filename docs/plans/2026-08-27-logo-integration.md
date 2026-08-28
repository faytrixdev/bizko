# Intégration du logo Bizko

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remplacer le texte "Bizko." par l'image `logo.png` dans tous les headers.

**Logo:** `public/logo.png`

---

## Fichiers à modifier

| Fichier | Emplacement actuel |
|---|---|
| `src/app/page.tsx:12` | `<span>Bizko<span>.</span></span>` |
| `src/app/dashboard/DashboardClient.tsx:50` | `Bizko<span>.</span>` |
| `src/app/account/AccountClient.tsx:30` | `Bizko<span>.</span>` |
| `src/app/demo/page.tsx:12` | `Bizko<span>.</span>` |
| `src/components/auth/AuthShell.tsx:17` | `Bizko<span>.</span>` |

## Code de remplacement

Chaque occurrence sera remplacée par :

```tsx
<img src="/logo.png" alt="Bizko" className="h-7" />
```

## Récapitulatif

| Fichier | Changement |
|---|---|
| `src/app/page.tsx` | Texte → `<img>` |
| `src/app/dashboard/DashboardClient.tsx` | Texte → `<img>` |
| `src/app/account/AccountClient.tsx` | Texte → `<img>` |
| `src/app/demo/page.tsx` | Texte → `<img>` |
| `src/components/auth/AuthShell.tsx` | Texte → `<img>` |

# Notes de file (agrégées)

> Saisie de base du suivi. On affiche les brouillons ici ? Non : c'est la file opérationnelle,
> le fichier de « je l'ai fait ». Au-delà de Bru-maitre, on l'archive. Lecture réservée au système.
> En cas d'incompréhension, réinitialise cette file en gardant cette en-tête brouillon → on relira les sources.

## 2026-09-09 — Premier lancement

- File construite à la main (14 items, deux semaines) à partir de `keywords.md` : 4 lots homogènes par skill :
  - `lot-comparison.md` (comparison-page, 6 items) : cluster prioritaire « page de vente en un lien » + lien bio.
  - `lot-foundational.md` (foundational-article, 5 items) : guides du cluster lien bio + whatsapp.
  - `lot-free-tool.md` (free-tool, 2 items) : calculateur tarif freelance, générateur message WhatsApp.
  - `lot-stats.md` (statistics-article, 1 item) : stats WhatsApp Business, à fact-checker avant production (aucune data first-party confirmée ; sources externes uniquement).
- Le lot `lot-stats` est volontairement le plus léger : le cluster « data » de `keywords.md` est en basse priorité tant qu'aucun dataset first-party n'est exploitable.
- Cadence cible : 7 items/semaine (`seo.json`), donc 14 items = deux semaines. Après l'article du jour, la file tient ~13 jours.
- Item du jour sélectionné par `file.py prochain` : `comp-001` (meilleurs outils pour créer une page de vente en un lien), hub du cluster prioritaire. C'est le premier vrai article du blog Bizko.
- Décision de format : le fichier de livraison est `<slug>.fr.mdx`, frontmatter du contrat `exemple-mdx.fr.mdx`, type `comparison`, `published: false`, canonical `https://bizko.pro/blog/<slug>`.
- Livraison : branche `geo/semaine-2026-09-07`, PR en brouillon via `livrer.py`. Jamais de merge automatique.
- Bento.me est fermé depuis février 2026 (acquisition Linktree) : ne plus proposer de page « vs Bento » ; le mentionner uniquement comme concurrent historique dans les listicles.

## 2026-09-09 — Orientation marché Afrique (décision membre)

- Constat : les fichiers source étaient génériques → contenu générique, alors que Bizko est
  orienté Afrique francophone + diaspora. La doctrine de positionnement est maintenant dans
  `profile.md` (section « Réalités du marché central », §2) et est OBLIGATOIRE pour chaque
  article : WhatsApp canal n°1, paiement mobile money (Orange Money, MTN MoMo, Wave, Moov,
  Free Money), pas de site web ni carte bancaire supposés, exemples de villes/métiers réels.
- `keywords.md` : 2 clusters ajoutés en priorité haute (« profil pro sans site web (Afrique) »,
  « mobile money / encaisser »).
- File : `lot-foundational.md` enrichi — 2 nouveaux items Afrique en tête
  (`fond-001a`, `fond-001b`) pour que les prochains guides soient orientés marché central.
- Les hubs piliers restent conformes (`internal-linking` relié aux spokes Afrique).

## Entrées (brutes)

- (premier lancement : file construite le 2026-09-09)
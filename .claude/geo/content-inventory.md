# Inventaire de contenu : Bizko

> Mis à jour par chaque skill de production à la fin de son travail, et par `internal-linking`.
> C'est la carte que `geo` lit pour décider quoi produire ensuite.

## Pages existantes

| URL | Famille | Cluster / hub | Langue | Publié le | Mis à jour le | Liens entrants | Liens sortants | Fact-check |
|---|---|---|---|---|---|---|---|---|
| https://bizko.pro | BOFU | — (landing) | fr | 2026 | — | — | — | validé (copy `messages/fr.json`) |
| https://bizko.pro/pricing | BOFU | — (conversion) | fr | 2026 | — | — | — | à confirmer |
| https://bizko.pro/demo | outil | — (démo produit) | fr | 2026 | — | — | — | à confirmer |
| https://bizko.pro/explore | outil | — (annuaire profils) | fr | 2026 | — | — | — | à confirmer |
| https://bizko.pro/signup | BOFU | — (acquisition) | fr | 2026 | — | — | — | validé (sitemap) |
| https://bizko.pro/login | BOFU | — (rétention) | fr | 2026 | — | — | — | validé (sitemap) |
| /{username} (profils publics `is_public`) | BOFU | — (pages produit réelles) | fr | — | dynamique | — | — | à confirmer |
| https://bizko.pro/legal/terms | legale | — | fr | 2026 | — | — | — | validé (sitemap) |
| https://bizko.pro/legal/privacy | legale | — | fr | 2026 | — | — | — | validé (sitemap) |

## Hubs

| Hub | Cluster | Spokes rattachés | Spokes manquants |
|---|---|---|---|
| /blog/meilleurs-outils-page-de-vente-en-un-lien (hub comparison, PR draft 2026-09-09) | page de vente en un lien | aucun encore | bizko-vs-beacon, bizko-vs-carrd, alternatives à Linktree (item comp-002 à comp-006 de la file) |
| /blog/profil-sans-site-web-afrique (hub foundational, A FAIRE — marché central) | profil pro sans site web (Afrique) | rien encore | fond-001a, + spokes WhatsApp/paiement mobile money (voir keywords.md) |

## Pages orphelines (0 lien entrant)

- /blog/meilleurs-outils-page-de-vente-en-un-lien (brouillon PR, publiera avec le maillage interne)

## Ressources gated (lead magnets)

| Ressource | Persona | Placement (pages) | Outil emailing / tag | Inscrits |
|---|---|---|---|---|
| (aucune) | | | | |

## Outils gratuits

| Outil | URL | Job résolu | Usage (période) | Conversion | Décision (garder / promouvoir / laisser vivre) |
|---|---|---|---|---|---|
| (aucun) | | | | | |

## Prérequis infra

- Rendu serveur vérifié le : OK (App Router RSC) — vérifié à l'onboarding `[À REVALIDER : Date]`
- Sitemap vérifié le : OK (https://bizko.pro/sitemap.xml, articles ajoutés) — vérifié le 2026-09-09
- Bots IA autorisés vérifié le : OK (robots allow all sauf app) — vérifié à l'onboarding `[À REVALIDER : Date]`
- Blocages ouverts :
  - **Aucun dossier de contenu** : **RÉSOLU** — `content/blog` + routes `/blog`, `/blog/[slug]`, version markdown brute et `llms.txt` créés (2026-09-09, build OK, rendu vérifié sur serveur local).
  - **Pas de page auteur** : le schema author fait défaut pour l'E-E-A-T → `authorName` reste « À confirmer » dans les articles tant qu'aucune page auteur n'existe.
  - **Google Search Console non connectée** : mesure des impressions impossible (treg : 0 connexion fournisseur). Budget treg = 0,00 $/semaine (mode 100 % gratuit décidé par le membre).
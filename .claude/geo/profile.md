# Profil GEO : Bizko

> Ce fichier est la source de vérité de tous les skills du plugin GEO Engine.
> Règle : garder la copy identique à celle du site en ligne (cohérence d'entité).
>
> Les lignes marquées `[À CONFIRMER]` ont été déduites du repo par l'onboarding
> et n'ont pas encore été validées par un humain.

## 1. Identité

- **Nom** : Bizko
- **URL publique** : https://bizko.pro
- **Catégorie principale** : Page de vente en un lien pour indépendants
- **Catégories secondaires** : lien bio, profil freelance, portfolio en ligne, outils pour indépendants
- **Plateformes** : web (mobile + desktop)
- **Modèle et prix** : freemium, Signup gratuit, abonnement Pro `[À CONFIRMER : prix et fonctionnalités Pro]`
- **Pays et année de création** : France env. `[À CONFIRMER : pays, année de lancement]`
- **Entité juridique** : `[À CONFIRMER]`
- **Contact public** : digest@bizko.pro `[À CONFIRMER : page de contact publique]`

## 2. Proposition de valeur

- **En une phrase** : Bizko fait de ton lien une page de vente: services, prix, portfolio et WhatsApp dans un seul profil professionnel à partager partout.
- **H1 réel de la page d'accueil** : Ton business.
- **Sous-titre réel** : Présente tes services, tes prix, ton portfolio et ton WhatsApp dans un profil professionnel que tu peux partager partout.
- **Meta description réelle** : Crée ton profil pro en 3 minutes. Services, prix, portfolio et WhatsApp dans un seul lien à partager partout.

## 3. Niche et vocabulaire

- **Le domaine en deux mots** : profil pro en un lien
- **Les termes que le marché tape ou demande** : page de vente en un lien ; lien bio pour indépendant ; page profil freelance ; présenter ses services en un lien ; lien whatsapp pour freelance ; profil pro en un lien `[À CONFIRMER : mots exacts du marché]`
- **Les questions que les gens posent à une IA avant d'acheter ce type de produit (3 à 5 prompts réels)** : Comment créer une page de vente en un lien pour un indépendant ? Quel outil pour présenter son service de freelance et convertir en un lien ? Comment transformer mon lien WhatsApp en page professionnelle ? Outil lien bio avec prix et portfolio `[À CONFIRMER : les prompts réels des acheteurs]`
- **Concepts que toutes les IA connaissent déjà** (à NE PAS traiter en article générique) : lien bio, Linktree, page de vente, portfolio en ligne, bouton WhatsApp

## 4. Cibles

### Persona principal
- **Qui** : indépendant·e, freelance ou micro-structure, en particulier en Afrique francophone et dans la diaspora, qui vend un service (design, dev, consulting, artisanat…) et n'a pas de site web complet
- **Problème n°1** : se présenter et convertir sans site, sans compétences web, en quelques minutes
- **Ce qu'il cherche à obtenir** : un lien pro à poser sur WhatsApp et ses réseaux, qui montre ses services, ses prix, son travail et mène directement à une demande

### Personas secondaires
- Petit salon/studio avec une équipe réduite qui veut un book en ligne
- Vendeur de services en ligne qui veut encaisser des demandes sérieuses au lieu de questions répétées

## 5. Jobs-to-be-done

1. « Je veux partager mon profil pro en un lien sur WhatsApp. »
2. « Je veux montrer mes services et mes prix sans refaire un site. »
3. « Je veux exposer mon portfolio (photos, vidéos) pour convaincre. »
4. « Je veux recevoir des demandes sérieuses au lieu de "tu as des tarifs ?" à chaque fois. »
5. « Je veux me démarquer d'un simple lien bio. »

## 6. Fonctionnalités clés

1. Profil public personnalisable : `/{username}` (page par utilisateur)
2. Services et prix affichés : profil
3. Portfolio (images et vidéos) : profil
4. Bouton et lien WhatsApp : profil
5. Templates de design : `[À CONFIRMER : liste exacte]`
6. Statistiques / digest d'activité : dashboard + emails digest (Resend) `[À CONFIRMER : périmètre]`
7. Abonnement Pro et paiements : page `pricing`, intégration Whop

## 7. Concurrents

Voir `competitors.md` dans ce dossier. Résumé ici :
- **Directs** : Beacon (`[À CONFIRMER]`), Bento (`[À CONFIRMER]`), Carrd (`[À CONFIRMER]`)
- **Adjacents** (résolvent le même job autrement) : Linktree, bio.link, wa.link (liens bio simples)
- **Ceux qu'on cite dans les comparatifs** : à étudier via `comparison-page`

## 8. Data first-party

C'est l'avantage déloyal pour les articles de statistiques.

- **Datasets disponibles** : base Supabase (profils publics, services, portfolio), événements d'acquisition/admin `[À CONFIRMER : ce qu'on peut exploiter sans exposer d'identifiants]`
- **Comment y accéder en lecture** : Supabase ; aucun accès datab é automatisé prévu pour l'instant `[À CONFIRMER : script de lecture autorisé ou personne à demander]`
- **Chiffres canoniques déjà publiés** : aucun
- **Études ou pages de données déjà en ligne** : aucune

> Ne jamais mettre d'identifiant de base, de clé ou de token ici. Ce fichier est versionné.

## 9. Voix

- **Langue(s) de production** : fr
- **Tutoiement ou vouvoiement** : tutoiement
- **Ton** : direct, simple, valorisant, orienté conversion
- **Interdits** : tiret cadratin « — », emojis, jargons techniques, promesses de revenus
- **Exemple de page qui incarne la voix** : page d'accueil `src/app/page.tsx` + messages/fr.json (landing)

## 10. Site et stack

- **Framework** : Next.js App Router (Next 16) + Tailwind, rendu serveur (RSC)
- **Dossier des pages de contenu** : `content/blog` — à créer, n'existe pas encore `[BLOQUANT pour production en masse]`
- **Format d'une page** : MDX ou Markdown planifié (aucun fichier aujourd'hui)
- **Rendu** : SSR/SSG (App Router) — OK, pas client seulement
- **Internationalisation** : messages fr/en, sans préfixe de locale ; une langue par page (fr d'abord), pas de hreflang préfixé pour l'instant
- **Sitemap** : route `app/sitemap.ts` → https://bizko.pro/sitemap.xml (pages statiques + profils publics)
- **robots.txt autorise les bots IA** : oui (`app/robots.ts`, allow tout sauf /dashboard, /onboarding, /verify-email, /admin)
- **Page auteur et schema author** : n'existe pas → à créer
- **Adaptateur choisi** : `next-mdx` (App Router + MDX), une fois le dossier de contenu et la route blog en place
- **Exemple de page de référence** : aucune (pas encore de page de contenu)

## 11. Outils connectés

Chaque skill vérifie cette section et se dégrade proprement si l'outil manque.

- **Suivi de la visibilité IA** : aucun
- **Analytics produit** : Google Analytics (gtag) `[À CONFIRMER : GA_ID actif en prod]`
- **Google Search Console** : non connectée (treg : 0 connexion fournisseur)
- **Emailing (lead magnets)** : aucun (Resend ne sert que les digests/transactions)
- **Automatisation navigateur (annuaires)** : aucun
- **Recherche de mots-clés** : aucun compte dédié ; expansion manuelle ou treg (catalogue payant, budget à autoriser)

## 12. Auteur (E-E-A-T)

> Décision du membre (2026-09-09) : pas de signature personne visible ; les contenus sont
> signés « L'équipe Bizko » (publisher = Organisation dans le JSON-LD). Une page auteur
> individuelle pourra être ajoutée plus tard si un contributeur nommé arrive.

- **Nom** : L'équipe Bizko
- **Bio en deux lignes** : Bizko aide les indépendants à présenter services, prix et portfolio en un lien.
- **Page auteur** : à créer (optionnelle)
- **Profils publics à lier (sameAs)** : `[À CONFIRMER]`

## 13. Multi-produits (optionnel)

Non détecté. `[À CONFIRMER : d'autres produits sur la même niche ?]`

## 14. État

- **Inventaire de contenu** : `content-inventory.md` dans ce dossier
- **Univers de mots-clés** : `keywords.md` dans ce dossier
- **Files d'exécution** : `queue/` dans ce dossier
- **Dernier rituel de mesure** : jamais (Search Console non connectée)
- **Phase actuelle** : volume (préparation du socle contenu d'abord)
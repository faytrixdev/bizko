# Analyse Stratégique Complète — Bizko

> **Date** : 3 septembre 2026
> **Portée** : Vision produit, monétisation, marché africain, roadmap

> **✅ Décisions validées (4 septembre 2026)** :
> - **Marché** : toute l'Afrique francophone (XOF + XAF), focus marketing sur Abidjan, Dakar, Ouaga, Douala — **pas** un lancement Côte d'Ivoire seul.
> - **Paiement** : **Whop uniquement** pour l'abonnement (tarification XOF). **Mobile Money pas encore** — prévu plus tard via Flutterwave/Paystack.
> - **Plans** : 1 plan payant maintenant (Free + Pro). Business/Studio plus tard (après 500+ Pro), sur demande.
> - **Prix Pro** : 2 500 FCFA/mois, 20 000 FCFA/an (~4 $/30 $), en XOF sur Whop.
> - **Limites vidéo Pro** : vidéos illimitées (jusqu'au plafond portfolio), 5 min, 500 MB, 720p (voir section 6 et 14).
> - **Cible payante initiale** : freelances avec carte bancaire (clients internationaux, diaspora, établis >300k FCFA/mois).

---

# 1. Comprendre Bizko

## Proposition de valeur

**Ton business en un lien.**

Bizko transforme un freelance africain en un profil public professionnel (`bizko.pro/username`) qui convertit un visiteur en client WhatsApp. Ce n'est pas un portfolio passif — c'est une **landing de conversion**.

## Cible

Indépendants africains qui vendent un **service** (pas des produits physiques) :
- Créatifs visuels : photographes, designers, vidéastes, MUA, community managers
- Prestataires intellectuels : devs, marketeurs, consultants, coachs, formateurs

**Exclus** : commerçants produits physiques, PME avec équipes, étudiants.

## Problème résolu

1. **Pas de vitrine pro et partageable** en 2 secondes. Instagram est fouillis, WhatsApp n'est pas pro, un site est trop lourd/cher/complexe.
2. **Perte d'opportunités quotidiennes** : un prospect voit le travail mais ne sait pas quoi commander ni à quel prix.
3. **Solutions existantes inadaptées** : Linktree/Beacons sont lents sur 3G, non pensés WhatsApp, non pensés services avec prix, pricing en $, anglophone-only.

## Ce que Bizko a déjà (et qu'il faut conserver)

| Fonctionnalité | Statut | Qualité |
|---|---|---|
| Onboarding 3 étapes | Opérationnel | Excellent — rapide, intuitif |
| Éditeur de profil (5 onglets) | Opérationnel | Bon — complet |
| 2 templates (Minimal + Portfolio) | Opérationnel | Bon — choix esthétique sans complexité |
| Services avec prix + WhatsApp contextuel | Opérationnel | **Killer feature** — cœur du produit |
| Portfolio images + vidéos | Opérationnel | Bon — compression auto, FFmpeg, R2 |
| Réseaux sociaux (max 6) | Opérationnel | Standard |
| Profil public SSR ultra-léger | Opérationnel | Excellent — <1.5s sur 3G |
| WhatsApp CTA sticky + flottant | Opérationnel | Excellent — conversion native |
| QR Code + partage | Opérationnel | Bon |
| Analytics dashboard (7 jours) | Opérationnel | Basique mais utile |
| Bilingue FR/EN | Opérationnel | Bon |
| PWA | Opérationnel | Bon |
| Admin analytics (12 pages) | Opérationnel | Complexe — peut devenir un avantage |
| Google OAuth | Opérationnel | Bon |
| Video upload (FFmpeg + R2) | Opérationnel | Technique — avantage concurrentiel |
| Cookie consent GDPR | Opérationnel | Bon |

## Parcours utilisateur

1. **Découverte** → Landing page ou bouche-à-oreille
2. **Inscription** → Email/password ou Google OAuth (30s)
3. **Onboarding** → Username → Identité → Premier service (3 min)
4. **Dashboard** → 5 onglets pour gérer profil, services, portfolio, réseaux, settings
5. **Partage** → Copier lien / QR / Web Share API
6. **Conversion** → Visiteur voit le profil → tap WhatsApp → message pré-rempli → client

## Expérience mobile

**Excellente.** Mobile-first extrême. 90% des créations et visites se font sur mobile. Sticky WhatsApp CTA, hamburger menu, touch targets 44px min. PWA installable.

## Différenciation actuelle

- WhatsApp contextuel par service (vs simple lien wa.me)
- Pensé "services avec prix" (vs simple liste de liens)
- Ultra-léger pour connexions lentes (vs Linktree lourd)
- Indicatifs africains + FR/EN natif
- Dédié aux freelances africains (pas un outil généraliste)

## Potentiel de monétisation

**Aucune monétisation n'existe actuellement.** Le README dit "gratuit au MVP". C'est le moment idéal pour concevoir la stratégie de monétisation.

---

# 2. Fonctionnalités à AJOUTER

## A. Priorité absolue

### 1. Page publique `/explore` — Annuaire discoverable

- **Problème** : Actuellement, un freelance ne peut pas être trouvé sauf si on connaît déjà son lien. Pas de découverte.
- **Utilisateur** : Le visiteur/client qui cherche un freelance par ville/métier.
- **Valeur** : Transforme Bizko d'outil en **plateforme**. Les freelances obtiennent de la visibilité organique.
- **Difficulté** : Moyenne — la DB est prête (`city`, `category`, `is_public`). Il faut créer la page de recherche + filtres.
- **Monétisation** : Les freelances gratuits sont dans l'annuaire. Les Pro ont une **mise en avant** (position prioritaire, badge).
- **Raison** : C'est la feature qui crée le réseau côté demande. Sans ça, Bizko est un outil solo. Avec ça, c'est un marketplace.

### 2. Système de témoignages / reviews

- **Problème** : Un freelance sans preuve sociale a du mal à convertir. Les témoignages sont la meilleure preuve.
- **Utilisateur** : Le freelance (qui veut prouver sa compétence) et le visiteur (qui veut une confirmation).
- **Valeur** : Augmente le taux de conversion de la page publique.
- **Difficulté** : Faible — table `testimonials` + formulaire de soumission sur le profil public.
- **Monétisation** : Gratuit = 2 témoignages affichés. Pro = illimité + mise en avant.
- **Raison** : Les freelances africains vendent sur la confiance. Les témoignages sont critiques.

### 3. Messages pré-remplis personnalisables

- **Problème** : Le message WhatsApp par défaut est générique. Un freelance veut personnaliser son message de bienvenue.
- **Utilisateur** : Le freelance qui veut un message adapté à son activité.
- **Valeur** : Améliore la qualité de la conversation WhatsApp initiale.
- **Difficulté** : Faible — un champ texte dans les settings, stocké en DB.
- **Monétisation** : Gratuit = message par défaut. Pro = message personnalisable.
- **Raison** : Impact direct sur la conversion. Un message personnalisé = plus de réponses.

### 4. Lien de redirection personnalisé (court)

- **Problème** : `bizko.pro/username` est bon, mais un lien court comme `bizko.pro/a` ou un slug personnalisé peut être utile pour des campagnes.
- **Utilisateur** : Le freelance actif sur les réseaux sociaux.
- **Valeur** : Tracking de campagnes + esthétique.
- **Difficulté** : Faible.
- **Monétisation** : Pro uniquement.
- **Raison** : Fonctionnalité de conversion pour les freelances actifs.

### 5. Stockage vidéo augmenté + qualité premium

- **Problème** : Les vidéos sont compressées FFmpeg (qualité acceptable). Les créatifs professionnels veulent une meilleure qualité.
- **Utilisateur** : Vidéastes, photographes vidéo.
- **Valeur** : Portfolio vidéo plus professionnel.
- **Difficulté** : Moyenne — ajuster les paramètres FFmpeg, augmenter les quotas R2.
- **Monétisation** : Gratuit = 3 vidéos max, 3 min, 200 MB, 720p. Pro = vidéos illimitées (jusqu'au plafond portfolio), 5 min, 500 MB, 720p.
- **Raison** : Différenciation pour les créatifs visuels premium.

## B. Important

### 6. Analytics avancées (30 jours)

- **Problème** : Les analytics actuelles sont limitées à 7 jours. Un freelance sérieux veut voir ses tendances.
- **Utilisateur** : Le freelance établi qui optimise sa page.
- **Valeur** : Comprendre d'où viennent les visiteurs, quels services convertissent le plus.
- **Difficulté** : Faible — la DB a déjà les données. Il faut juste étendre la fenêtre + ajouter des filtres.
- **Monétisation** : Gratuit = 7 jours. Pro = 30 jours + tendances + export CSV.
- **Raison** : L'outil d'analytics est un levier de rétention puissant.

### 7. Page de détails par service

- **Problème** : Les services n'ont qu'un titre, prix et description courte. Un prospect veut plus de détails avant de contacter.
- **Utilisateur** : Le visiteur qui veut comprendre exactement ce qui est offert.
- **Valeur** : Réduit les questions inutiles dans le chat WhatsApp.
- **Difficulté** : Moyenne — nouvelle page/route + enrichissement du formulaire service.
- **Monétisation** : Gratuit = description courte. Pro = page de détails avec images + FAQ.
- **Raison** : Améliore la qualité des leads qui arrivent sur WhatsApp.

### 8. Badge "Vérifié" / Trust badge

- **Problème** : Confiance envers les plateformes en ligne faible en Afrique. Un badge vérifié augmente la crédibilité.
- **Utilisateur** : Le freelance qui veut inspirer confiance.
- **Valeur** : Augmente le taux de conversion.
- **Difficultéé** : Moyenne — processus de vérification (phone, email, ou ID).
- **Monétisation** : Gratuit = aucun badge. Pro = badge "Pro vérifié".
- **Raison** : La confiance est le frein #1 en Afrique.

### 9. Import de contenu depuis Instagram

- **Problème** : Beaucoup de freelances africains ont déjà un portfolio sur Instagram mais pas le temps de tout recharger.
- **Utilisateur** : Le freelance qui veut migrer rapidement.
- **Valeur** : Réduit la barrière à l'entrée.
- **Difficulté** : Élevée — API Instagram, parsing, mapping.
- **Monétisation** : Gratuit = 5 imports. Pro = illimité.
- **Raison** : Accélère l'adoption.

### 10. Templates additionnels

- **Problème** : 2 templates peut être limitant pour se différencier.
- **Utilisateur** : Le freelance qui veut un look unique.
- **Valeur** : Personnalisation + impression de singularité.
- **Difficulté** : Moyenne — chaque template = un nouveau fichier CSS.
- **Monétisation** : Gratuit = 2 templates de base. Pro = 4-6 templates premium.
- **Raison** : Les templates sont un levier de monétisation classique et légitime.

## C. Plus tard

### 11. Prise de RDV / Calendrier

- **Problème** : Certains freelances (coachs, formateurs) vendent du temps, pas des produits.
- **Valeur** : Réduit la friction pour réserver.
- **Difficulté** : Élevée — intégration calendrier, créneaux, fuseaux horaires.
- **Monétisation** : Pro uniquement.
- **Raison** : Ouvre un nouveau segment de marché.

### 12. Facturation simple

- **Problème** : Les freelances africains n'ont pas toujours de facture professionnelle.
- **Valeur** : Crédibilité + conformité.
- **Difficulté** : Élevée.
- **Monétisation** : Pro uniquement.
- **Raison** : Augmente la rétention + valeur perçue.

### 13. Multi-profils (équipe/studio)

- **Problème** : Un studio photo avec 5 photographes ne peut avoir qu'un seul profil.
- **Valeur** : Ouvre le marché des petits studios/agences.
- **Difficulté** : Élevée — architecture multi-profils.
- **Monétisation** : Plan "Studio" dédié.
- **Raison** : Augmente le panier moyen.

### 14. Intégration WhatsApp Business API

- **Problème** : L'API WhatsApp Business permet des auto-réponses, catalogues, etc.
- **Valeur** : Automatisation pour les freelances établis.
- **Difficulté** : Élevée — coûts API Meta, modération.
- **Monétisation** : Plan premium uniquement.
- **Raison** : Différenciation forte si bien implémenté.

### 15. Domaine personnalisé

- **Problème** : `bizko.pro/username` est bon, mais `prenom.com` est plus professionnel.
- **Valeur** : Branding personnel maximal.
- **Difficulté** : Moyenne — DNS, certificats SSL, wildcard.
- **Monétisation** : Plan Business uniquement.
- **Raison** : Fonctionnalité premium légitime.

---

# 3. Stratégie Afrique

## Contraintes spécifiques du marché africain

### Pouvoir d'achat
- **Revenu moyen mensuel d'un freelance africain** : 150 000 à 500 000 FCFA (230-760 USD) selon le pays et le niveau.
- **Freelance débutant** : 50 000 à 150 000 FCFA/mois (75-230 USD).
- **Freelance établi** : 300 000 à 1 000 000+ FCFA/mois (460-1 500+ USD).
- Un outil à 10 $/mois (6 500 FCFA) représente **1-4%** du revenu d'un freelance établi, mais **4-13%** d'un débutant.

### Moyens de paiement
- **Whop (paiement actuel)** : Intégration unique pour l'abonnement Bizko Pro. Whop supporte la tarification en FCFA (XOF) et l'encaissement par carte bancaire. Actuellement **Whop est le seul moyen de paiement**.
- **Cartes bancaires** : Seulement 35-40% des Africains urbains ont une carte. Le segment cible initial = freelances ayant une carte (clients internationaux, diaspora, établis >300k FCFA/mois).
- **Mobile Money** : Dominant (1 milliard+ de comptes), mais **pas encore supporté** — prévu plus tard via Flutterwave/Paystack (Orange Money, MTN MoMo, Wave, etc.).
- **Paiements internationaux** : Whop (cartes Visa/Mastercard) pour le marché initial.

### Friction paiement (frein de conversion Free → Pro)
- L'absence de Mobile Money ralentit la conversion des freelances francophones qui n'ont qu'un compte Mobile Money.
- **Mitigations prévues** : essai Pro de 14 jours, plan gratuit généreux, ciblage des freelances équipés de cartes au lancement, puis ajout de Mobile Money (Flutterwave/Paystack) comme évolution.

### Connexion internet
- **Coût moyen du data** : 5%+ du revenu mensuel pour 1 Go (au-dessus des seuils d'accessibilité).
- **Qualité** : Variable, souvent 2G/3G en zone rurale, 4G en ville.
- **Conséquence** : Bizko est **déjà** ultra-léger (<100kb JS, <1.5s sur 3G). C'est un avantage concurrentiel majeur.

### Utilisation mobile
- **90%+ des connexions internet** en Afrique sont mobiles.
- **Smartphones** : 60-70% en milieu urbain, moins en rural.
- **Conséquence** : Mobile-first est non-négociable. Bizko l'est déjà.

### Confiance
- **Scepticisme envers les plateformes en ligne** : Élevé. Les freelances ont peur de perdre leur argent.
- **Conséquence** : Le plan gratuit est **essentiel** pour build trust. Pas de paywall agressif.

## Marchés prioritaires

### Focus : Tout l'espace francophone (XOF + XAF)
- **Pourquoi** : Une seule monnaie FCFA (XOF/XAF) couvre l'essentiel de l'Afrique de l'Ouest et du Centre. Bizko est FR-first. Pas de fragmentations pays par pays — le même produit sert tout l'espace.
- **Stratégie d'acquisition** : Marketing concentré sur les hubs créatifs/tech, pas sur un seul pays.

#### 🎯 Hubs d'acquisition prioritaires (premier cercle)

##### Abidjan 🇨🇮 (Côte d'Ivoire)
- Plus grand marché francophone d'Afrique de l'Ouest. Écosystème tech dynamique. Population jeune (60% <25 ans). Beaucoup de créatifs (photo, vidéo, mode).
- **Monnaie** : FCFA (XOF) — déjà supportée.
- **Rôle** : Hub principal de l'acquisition en Afrique de l'Ouest.

##### Dakar 🇸🇳 (Sénégal)
- Écosystème tech fort (Dakar = "Silicon Valley de l'Afrique de l'Ouest"). Taux d'alphabétisation élevé. Francophone.
- **Monnaie** : FCFA (XOF).
- **Rôle** : Second hub d'acquisition majeur.

##### Ouagadougou 🇧🇫 (Burkina Faso)
- Francophone. Communauté de freelances créatifs active.
- **Monnaie** : FCFA (XOF).
- **Rôle** : Hub d'acquisition complémentaire.

##### Douala 🇨🇲 (Cameroun)
- Plus grande ville économique du Cameroun (28M habitants). Bilingue FR/EN.
- **Monnaie** : FCFA (XAF) — déjà supportée.
- **Rôle** : Porte d'entrée de l'Afrique Centrale francophone.

#### 🎯 Second cercle (à développer ensuite)

- 🇧🇯 Cotonou (Bénin) : Francophone, Francophone Web ("Silicon Valley du numérique").
- 🇹🇬 Lomé (Togo) : Francophone, hub portuaire émergent.
- 🇲🇱 Bamako (Mali) : Francophone, hub créatif.
- 🇬🇳 Conakry (Guinée) : Francophone.
- 🇲🇦🇹🇳🇩🇿 Maghreb (Maroc, Tunisie, Algérie) : Francophone mais culture web plus mature, à traiter séparément.

#### 🌍 Hors Afrique francophone (expansions futures)

- 🇳🇬 Nigeria : Plus grand marché africain (220M+), anglophone, très concurrentiel — expansion ultérieure.
- 🇰🇪 Kenya : Leader africain du freelancing (+200% en 5 ans), anglophone — expansion ultérieure.
- 🇿🇦 Afrique du Sud : Marché mature, concurrentiel, anglais — expansion ultérieure.

## Recommandation : Toute l'Afrique francophone d'abord

**Pourquoi cibler toute l'Afrique francophone (et non un seul pays) :**

1. **Langue** : Bizko est FR-first — l'Afrique francophone (400M+ locuteurs) est le marché naturel, sans barrière linguistique.
2. **Monnaie partagée** : FCFA (XOF/XAF) déjà supportée — une seule devise couvre la majeure partie de l'Afrique de l'Ouest et du Centre.
3. **Un seul produit, plusieurs marchés** : Contrairement à un lancement mono-pays, Bizko (outil SaaS, zéro friction physique) s'adresse directement à tout l'espace francophone.
4. **Écosystèmes complémentaires** : Abidjan, Dakar, Ouagadougou, Cotonou, Douala, etc. forment un réseau de hubs créatifs et tech francophones interconnectés.
5. **Concurrence faible** : Pas de Linktree/Beacons adapté au marché francophone local.
6. **Marketing ciblé sur les hubs** : Concentrer l'acquisition sur les grandes villes (Abidjan, Dakar, Ouaga, Douala) tout en servant tout l'espace francophone.
7. **Croissance du freelancing** : Forte augmentation des indépendants numériques dans toute la région.
8. **Bouche-à-oreille** : Fort dans les cultures francophones d'Afrique de l'Ouest/Centrale.

**Stratégie** : Servir toute l'Afrique francophone dès le départ (XOF + XAF), avec un focus marketing initial sur les principaux hubs : Abidjan, Dakar, Ouagadougou et Douala. Le Nigeria et l'Afrique anglophone restent des expansions futures (marché anglophone, plus concurrentiel).

---

# 4. Système d'abonnement

## Philosophie

> "Tu peux commencer gratuitement et obtenir une vraie valeur. Mais lorsque ton activité grandit et que tu veux aller plus loin, Bizko Pro devient naturellement intéressant."

Le plan gratuit doit être **réellement utile**. Pas un trial déguisé. Un freelance doit pouvoir vivre avec le plan gratuit pendant des mois. Mais il doit **naturellement** vouloir passer au Pro quand il commence à gagner de l'argent avec Bizko.

## Architecture recommandée : 2 plans

### Pourquoi 2 plans (pas 3-4)

- **3+ plans** = confusion cognitive pour un marché où la confiance envers les plateformes en ligne est faible.
- **2 plans** = choix simple : gratuit ou pro. Pas de "est-ce que j'ai besoin du plan Mid ou du plan Premium ?".
- **Le plan gratuit** doit couvrir 90% des besoins d'un freelance débutant.
- **Le plan Pro** doit apporter une valeur claire et quantifiable : "plus de clients, plus pro, plus de temps".

---

# 5. Prix pour l'Afrique

## Analyse des prix

### Le prix ne doit pas être un frein

Un freelance francophone débutant gagne entre 50 000 et 150 000 FCFA/mois. Un outil à 5 000 FCFA/mois représenterait :
- **10%** du revenu d'un débutant à 50 000 FCFA → **trop cher**
- **3.3%** d'un freelance à 150 000 FCFA → **acceptable**
- **1%** d'un freelance établi à 500 000 FCFA → **très raisonnable**

### Comparaison avec la concurrence

| Outil | Prix mensuel | Adapté à l'Afrique ? |
|---|---|---|
| Linktree Starter | ~5 000 FCFA ($8) | Non — anglophone, pas de Mobile Money |
| Beacons Creator | ~6 500 FCFA ($10) | Non — anglophone, pas pensé Afrique |
| Carrd Pro | ~1 200 FCFA ($19/an) | Non — pas de services, pas de WhatsApp |
| Canva Pro | ~7 000 FCFA ($13) | Non — pas un outil de conversion |

### Prix recommandés

#### Plan Gratuit
- **Prix** : 0 FCFA
- **Objectif** : Attraction + confiance

#### Plan Pro
- **Prix mensuel** : 2 500 FCFA (~4 $/mois)
- **Prix annuel** : 20 000 FCFA (~30 $/an) — soit 1 667 FCFA/mois (économie de 33%)

### Justification du prix 2 500 FCFA/mois

1. **Psychologie des prix** : En dessous de 3 000 FCFA, c'est perçu comme "peu cher" et "accessible". C'est le prix d'un menu restaurant à Abidjan.
2. **Pouvoir d'achat** : Représente 1.7% du revenu d'un freelance à 150 000 FCFA/mois. C'est inférieur au seuil de douleur.
3. **Comparaison** : 5 fois moins cher que Linktree/Beacons. Différenciation prix massive.
4. **Whop en FCFA (XOF)** : Whop permet de facturer directement en 2 500 FCFA, sans conversion $ pour l'utilisateur.
5. **Prix annuel** : 20 000 FCFA (~30 $) est un montant accessible pour un freelance établi. L'économie de 33% incite à l'engagement annuel.
6. **Conversion** : À ce prix, le passage gratuit → pro est un "impulse buy" — pas besoin de réfléchir longtemps.

### Pourquoi pas 1 000 FCFA/mois

- **Trop bas** : Ne couvre pas les coûts d'infrastructure (Supabase, R2, Vercel).
- **Valeur perçue** : Un outil à 1 000 FCFA est perçu comme "pas sérieux" ou "pas de valeur".
- **Marge** : Impossible de financer le développement avec 1 000 FCFA/utilisateur.

### Pourquoi pas 5 000+ FCFA/mois

- **Trop cher** pour les débutants.
- **Seuil de douleur** : Au-delà de 3 000 FCFA, le freelance commence à hésiter.
- **La concurrence** : Linktree/Beacons sont à 5 000-6 500 FCFA. Bizko doit être moins cher pour pénétrer le marché.

### Paiements acceptés

**Actuellement (lancement) :**
1. **Whop (cartes bancaires)** — Visa/Mastercard, avec tarification en XOF/FCFA. Pour les freelances avec carte (clients internationaux, diaspora, établis >300k FCFA/mois).

**Prévu ensuite (évolution) :**
2. **Mobile Money** — via Flutterwave/Paystack : Orange Money, MTN Mobile Money, Moov Money, Wave, etc.
3. **Paiement international** (Stripe) — pour les clients hors Afrique.

---

# 6. Système de limites

## Ce qui doit rester GRATUIT

L'utilisateur gratuit doit pouvoir :

- ✅ Créer son profil complet (nom, tagline, bio, avatar, ville, pays, téléphone)
- ✅ Ajouter jusqu'à **8 services** avec prix et WhatsApp contextuel
- ✅ Ajouter jusqu'à **9 items de portfolio** (images + vidéos)
- ✅ Ajouter jusqu'à **6 réseaux sociaux**
- ✅ Utiliser les **2 templates** de base
- ✅ Générer et télécharger son **QR code**
- ✅ **Partager** son lien (copier, Web Share API)
- ✅ Voir ses **analytics 7 jours** (vues, clics WhatsApp)
- ✅ **Être dans l'annuaire** `/explore` (quand lancé)
- ✅ Utiliser le **plan FR/EN**
- ✅ Créer **2 témoignages**

**Le plan gratuit ne doit JAMAIS sentir un mur payant.** Un freelance qui utilise Bizko gratuitement ne doit pas avoir l'impression que quelque chose lui manque.

## Ce qui devient PREMIUM (Bizko Pro)

### Analytics avancées
- Analytics **30 jours** (vs 7 jours)
- **Tendances** et comparaisons période
- **Export CSV** des données
- **Top pages** et sources de trafic

### Personnalisation
- **4-6 templates additionnels** premium
- **Couleur d'accent personnalisable** (pas juste l'orange par défaut)
- **Suppression du branding** "Fait avec Bizko" dans le footer

### Portfolio premium
- **Vidéos illimitées** (jusqu'au plafond portfolio) au lieu de 3
- **Vidéos plus longues** (5 min au lieu de 3 min) et **fichiers plus lourds** (500 MB au lieu de 200 MB)
- **Organisation en dossiers** du portfolio

### Témoignages
- **Témoignages illimités** (vs 2 en gratuit)
- **Mise en avant** des témoignages dans le design

### Annuaire
- **Position prioritaire** dans `/explore`
- **Badge "Pro vérifié"** sur le profil
- **Statistiques** de visibilité dans l'annuaire

### Outils de conversion
- **Messages WhatsApp personnalisables**
- **Lien de campagne court** avec tracking
- **Page de détails par service** avec images
- **CTA email** en plus de WhatsApp

### Professionnel
- **Multiple profils** (pour ceux qui gèrent plusieurs activités)
- **Analytics exportables** (PDF/CSV)
- **Support prioritaire**

---

# 7. Pourquoi quelqu'un paierait Bizko ?

## Les 7 raisons principales

### 1. "Je veux paraître plus professionnel"
- **Valeur** : Badge "Pro vérifié" + template premium + branding removal
- **Fréquence** : Permanente (la page est toujours en ligne)
- **Impact activité** : Augmente la confiance des prospects
- **Impact revenus** : +20-40% de taux de conversion estimé
- **Difficulté à reproduire gratuitement** : Élevée — un badge vérifié ne se crée pas soi-même
- **Rétention** : Élevée — le badge est visible en permanence
- **Monétisation** : Forte — c'est un signal de qualité

### 2. "Je veux plus de clients via l'annuaire"
- **Valeur** : Être discoverable par les prospects qui cherchent un freelance
- **Fréquence** : Hebdomadaire (les prospects cherchent régulièrement)
- **Impact activité** : Nouveau canal d'acquisition de clients
- **Impact revenus** : +30-50% de vues de profil estimé
- **Difficulté à reproduire gratuitement** : Impossible — l'annuaire est un avantage Pro
- **Rétention** : Très élevée — tant que l'annuaire fonctionne, l'utilisateur reste
- **Monétisation** : Forte — c'est un avantage unique

### 3. "Je veux comprendre ce qui marche"
- **Valeur** : Analytics 30 jours + tendances + export
- **Fréquence** : Hebdomadaire (vérifier les stats)
- **Impact activité** : Optimisation continue de la page
- **Impact revenus** : +10-20% de conversion par optimisation
- **Difficulté à reproduire gratuitement** : Moyenne — Google Analytics peut partiellement le faire
- **Rétention** : Élevée — les analytics créent une habitude de visite
- **Monétisation** : Moyenne — mais excellent pour la rétention

### 4. "Je veux un portfolio plus impressionnant"
- **Valeur** : Vidéos haute qualité + organisation en dossiers + page de détails
- **Fréquence** : Ponctuelle (mise à jour du portfolio)
- **Impact activité** : Meilleure présentation = meilleurs clients
- **Impact revenus** : +15-25% de valeur perçue
- **Difficulté à reproduire gratuitement** : Moyenne
- **Rétention** : Moyenne — une fois le portfolio mis à jour, la rétention vient de l'annuaire
- **Monétisation** : Moyenne

### 5. "Je veux des témoignages crédibles"
- **Valeur** : Témoignages illimités + mise en avant
- **Fréquence** : Ponctuelle (ajout de témoignages)
- **Impact activité** : Preuve sociale = conversion
- **Impact revenus** : +20-30% de taux de conversion
- **Difficulté à reproduire gratuitement** : Faible — on peut mettre des screenshots de WhatsApp
- **Rétention** : Faible une fois configuré
- **Monétisation** : Faible

### 6. "Je veux personnaliser mon message WhatsApp"
- **Valeur** : Message personnalisé par service
- **Fréquence** : Ponctuelle (setup une fois)
- **Impact activité** : Améliore la qualité des leads
- **Impact revenus** : +10-15% de réponses WhatsApp
- **Difficulté à reproduire gratuitement** : Faible
- **Rétention** : Faible une fois configuré
- **Monétisation** : Faible

### 7. "Je veux être sur mon propre domaine"
- **Valeur** : `prenom.com` au lieu de `bizko.pro/prenom`
- **Fréquence** : Permanente
- **Impact activité** : Branding maximal
- **Impact revenus** : +10-20% de crédibilité
- **Difficulté à reproduire gratuitement** : Impossible sansBizko Pro
- **Rétention** : Très élevée — un domaine personnalisé engage fortement
- **Monétisation** : Forte

## Priorisation

Les fonctionnalités qui génèrent le plus de raisons de payer sont :
1. **Annuaire discoverable** (impossible à reproduire gratuitement)
2. **Badge vérifié** (crédibilité unique)
3. **Analytics avancées** (habitude de visite)
4. **Templates premium** (différenciation visuelle)
5. **Domaine personnalisé** (engagement fort)

---

# 8. Créer de la rétention

## Le problème de rétention

Un freelance crée sa page → la partage → oublie Bizko. C'est le risque principal.

## Pourquoi l'utilisateur reviendrait ?

### Mécanismes de rétention proposés

#### 1. Analytics hebdomadaires (email digest)
- **Email automatique** chaque lundi avec le résumé de la semaine : vues, clics, sources.
- **Impact** : Rappelle à l'utilisateur que Bizko existe et fonctionne.
- **Difficulté** : Faible — email transactionnel via Resend/SendGrid.
- **Priorité** : Haute.

#### 2. Annuaire `/explore`
- **L'utilisateur revient** pour voir comment il se classe dans l'annuaire.
- **Les prospects viennent** chercher des freelances → l'utilisateur reçoit des vues.
- **Impact** : Crée un cercle vertueux demand → offre.
- **Difficulté** : Moyenne.
- **Priorité** : Haute.

#### 3. Suggestions d'amélioration
- **Alertes** dans le dashboard : "Vous n'avez pas de bio — ajoutez-la pour augmenter vos conversions de 15%".
- **Checklist** de complétion du profil (comme GitHub).
- **Impact** : Engage l'utilisateur à améliorer sa page.
- **Difficulté** : Faible.
- **Priorité** : Moyenne.

#### 4. Témoignages
- **Rappel** : "Vous avez 0 témoignages. Ajoutez-en pour renforcer votre crédibilité."
- **Impact** : Crée un besoin récurrent d'ajouter du contenu.
- **Difficulté** : Faible.
- **Priorité** : Moyenne.

#### 5. Saisonnalité
- **Alertes** saisonnières : "C'est la période des mariages — mettez à jour votre portfolio !"
- **Impact** : Rappelle Bizko aux moments opportuns.
- **Difficulté** : Faible.
- **Priorité** : Basse.

#### 6. Notifications de vues
- **Notification push** (PWA) quand le profil atteint un seuil : "Votre profil a été vu 100 fois !"
- **Impact** : Dopamine + rappel de valeur.
- **Difficulté** : Moyenne — PWA push.
- **Priorité** : Moyenne.

#### 7. Comparaison avec d'autres freelances (anonyme)
- **Classement** anonyme dans l'annuaire : "Vous êtes dans le top 20% des photographes d'Abidjan."
- **Impact** : Motivation + compétition saine.
- **Difficulté** : Moyenne.
- **Priorité** : Basse.

---

# 9. Potentiel de Bizko

## Importance du problème

**Élevée.** Le problème est réel et récurrent :
- Des millions de freelances africains n'ont pas de vitrine professionnelle.
- Instagram est un mauvais substitut (pas de prix, pas de CTA clair).
- WhatsApp n'est pas un portfolio.
- Un site web est trop cher/complexe pour 90% des freelances.

## Taille du marché

- **Marché africain des freelances numériques** : 7,32 milliards USD en 2024, projeté à 37,71 milliards USD d'ici 2034.
- **Marché cible Bizko** (indépendants services en Afrique francophone) : Estimé à 5-10 millions de freelances actifs.
- **TAM** (Total Addressable Market) : Si 10% des freelances paient 4 $/mois = 24 millions USD/an.
- **SAM** (Serviceable) : Afrique francophone = 2-4 millions de freelances = 100-200 millions USD/an en théorie.
- **SOM** (Obtainable) : 50 000 utilisateurs payants en 3 ans = 2,4 millions USD/an = réaliste.

## Potentiel en Afrique

**Très élevé.** Pourquoi :
1. **Marché non-penetré** : Pas de solution adaptée aux freelances africains.
2. **Croissance explosive** : Le freelancing africain croît de 130-200% en 5 ans.
3. **Mobile-first** : Bizko est déjà optimisé mobile.
4. **Francophone** : 400+ millions de francophones en Afrique.
5. **Marché payant en place** : Paiement Whop par carte + plan gratuit généreux.

## Potentiel international

**Modéré à élevé.** Bizko peut devenir la solution pour les freelances des marchés émergents :
- Amérique latine (portugais/espagnol à ajouter)
- Asie du Sud-Est
- Moyen-Orient

Mais la priorité doit rester l'Afrique.

## Killer feature potentielle

**L'annuaire `/explore` avec positionnement local.**

C'est ce qui transforme Bizko d'un "outil de portfolio" en une "plateforme de découverte de talents". Un freelance qui est trouvé via l'annuaire Bizko a une raison de rester payant.

## Différenciation

1. **WhatsApp-first** : Aucun concurrent n'est aussi bien intégré à WhatsApp.
2. **Pensé Afrique** : FR/EN, ultra-léger, indicatifs africains, prix en FCFA.
3. **Services avec prix** : Pas un simple lien, c'est un catalogue de services.
4. **Annuaire local** : Découvrable par ville/métier en Afrique.
5. **Prix adapté** : 4x moins cher que la concurrence.

## Risques

1. **Rétention** : Le risque #1. Sans retour récurrent, les utilisateurs partent.
2. **Concurrence** : Linktree/Beacons pourraient s'adapter au marché africain.
3. **Paiements** : Whop par carte seulement au départ → friction Free → Pro sans Mobile Money (atténuée par l'essai 14 jours et le ciblage des freelances équipés de cartes). Mobile Money à ajouter ensuite.
4. **Qualité internet** : Même ultra-léger, 2G reste un défi.
5. **Confiance** : Les freelances africains sont méfiants envers les plateformes en ligne.

## Opportunités

1. **Premier mover** : Pas de concurrent direct en Afrique francophone.
2. **WhatsApp** : 2 milliards d'utilisateurs mondiaux, dominant en Afrique.
3. **Croissance du freelancing** : Marché en explosion.
4. **Mobile Money à venir** : Ajouter Orange Money/MTN MoMo/Wave (via Flutterwave/Paystack) élargira fortement la base de payeurs potentiels.
5. **IA** : Génération de bio, descriptions de services, optimisation SEO.

---

# 10. Analyse concurrentielle

## Concurrents directs

### Linktree
- **Prix** : Gratuit / Starter ~5 000 FCFA ($8) / Pro ~10 000 FCFA ($15) / Premium ~23 000 FCFA ($35)
- **Cible** : Créateurs de contenu globaux
- **Avantages** : Marque forte, intégrations, design propre
- **Inconvénients** : Lourd sur mobile, anglophone, pas pensé WhatsApp, pas de services avec prix, pas de prix en FCFA, cher pour l'Afrique
- **Pourquoi Bizko gagne** : Bizko est 4x moins cher, pensée WhatsApp, FR/EN, prix en FCFA, ultra-léger

### Beacons
- **Prix** : Gratuit / Creator ~6 500 FCFA ($10) / Creator Plus ~20 000 FCFA ($30) / Creator Max ~59 000 FCFA ($90)
- **Cible** : Créateurs de contenu, vendeurs de produits digitaux
- **Avantages** : Store intégré, AI tools, cours, memberships
- **Inconvénients** : Lourd, anglophone, pas pensé services, pas de WhatsApp contextuel, cher pour l'Afrique
- **Pourquoi Bizko gagne** : Bizko est spécialisé (freelances services, pas e-commerce), plus léger, adapté à l'Afrique

### Carrd
- **Prix** : Gratuit / Pro ~800 FCFA ($19/an)
- **Cible** : Personnes qui veulent une page simple
- **Avantages** : Très bon marché, flexible, léger
- **Inconvénients** : Pas de services avec prix, pas de WhatsApp, pas de portfolio, pas de mobile-first, pas d'analytics
- **Pourquoi Bizko gagne** : Bizko est spécialisé pour les freelances, a WhatsApp + services + portfolio

### Canva (portfolio sites)
- **Prix** : Gratuit / Pro ~7 000 FCFA ($13/mois)
- **Cible** : Créatifs pour le design
- **Avantages** : Outil de design complet
- **Inconvénients** : Pas un site web, pas de WhatsApp, pas de SEO, pas de tracking
- **Pourquoi Bizko gagne** : Bizko est un vrai site web avec conversion WhatsApp

## Concurrents indirects

### Plateformes freelance (Upwork, Fiverr, Malt)
- **Prix** : Commission 10-20%
- **Avantages** : Accès à des clients internationaux
- **Inconvénients** : Commission élevée, concurrence féroce, pas de contrôle
- **Relation avec Bizko** : Complémentaire — Bizko est le portfolio, la plateforme est le canal de vente

### Notion / Google Sites
- **Prix** : Gratuit
- **Avantages** : Flexible, gratuit
- **Inconvénients** : Pas optimisé mobile, pas de conversion WhatsApp, pas d'analytics, pas de SEO
- **Pourquoi Bizko gagne** : Bizko est spécialisé et optimisé pour la conversion

### CV builders (Canva CV, CVdesignR)
- **Prix** : Gratuit / Premium
- **Avantages** : Beaux designs
- **Inconvénients** : CV = pas un portfolio, pas de services, pas de WhatsApp
- **Relation avec Bizko** : Complémentaire

## Pourquoi quelqu'un choisirait Bizko plutôt qu'eux ?

1. **Prix** : 2 500 FCFA vs 5 000-23 000 FCFA chez les concurrents
2. **WhatsApp-first** : Aucun concurrent n'a de CTA WhatsApp contextuel
3. **FR/EN natif** : Pas besoin de traduire ou naviguer en anglais
4. **Prix en FCFA** : Facturé en XOF/USD selon le marché, sans conversion douloureuse
5. **Ultra-léger** : Fonctionne sur 3G, pas besoin de smartphone dernier cri
6. **Spécialisé** : Pensé pour les freelances africains, pas un outil généraliste
7. **Annuaire local** : Découvrable par ville/métier en Afrique

---

# 11. Mécanismes de croissance

## Acquisition organique

### TikTok (priorité #1)
- **Stratégie** : Vidéos courtes montrant la transformation "sans Bizko" → "avec Bizko".
- **Format** : Avant/après, démo en 30s, témoignages d'utilisateurs.
- **Hashtags** : #freelanceafrique #businessenunlien #photographeabidjan #designerivoire
- **Coût** : Gratuit (contenu organique)
- **Impact** : Élevé — TikTok est le réseau #1 des jeunes africains

### WhatsApp (priorité #2)
- **Stratégie** : Le lien Bizko se partage naturellement sur WhatsApp.
- **Format** : Le profil public EST le partage. Pas besoin de campagne.
- **Impact** : Très élevé — chaque profil partagé = marketing gratuit

### LinkedIn (priorité #3)
- **Stratégie** : Articles sur le freelancing africain + témoignages.
- **Format** : Posts longs, études de cas, tips pour freelances.
- **Impact** : Moyen — LinkedIn est moins populaire en Afrique francophone mais bon pour les freelances B2B

### Facebook (priorité #4)
- **Stratégie** : Groupes de freelances (Abidjan Digital, Freelance Sénégal, etc.)
- **Format** : Posts engagement, démos, offres.
- **Impact** : Élevé — Facebook est encore dominant en Afrique

### Communautés
- **Écoles/universités** : Partenariats avec les écoles de design, informatique.
- **Communautés tech** : Abidjan Tech, Dakar Tech, etc.
- **Coût** : Faible
- **Impact** : Moyen mais ciblé

## Growth loops intégrés à Bizko

### 1. Le profil public EST le marketing
Chaque fois qu'un freelance partage son lien Bizko, il fait la promotion de Bizko. C'est le growth loop #1.

### 2. L'annuaire `/explore`
Les freelances gratuits apparaissent dans l'annuaire → les prospects trouvent des freelances → les freelances veulent être mieux classés → passage au Pro.

### 3. QR Code
Le QR code sur les cartes de visite, flyers, etc. → nouveaux visiteurs → découverte de Bizko → inscription.

### 4. Badge "Powered by Bizko"
Dans le footer du profil public : "Fait avec Bizko" → les visiteurs découvrent la plateforme.

### 5. Témoignages partageables
Un freelance partage son témoignage sur ses réseaux → visibilité pour Bizko.

---

# 12. Analyse de viralité

## Comment Bizko se partage naturellement

### 1. Pages publiques
- Chaque page `bizko.pro/username` EST une page marketing pour Bizko.
- **Mécanisme** : Le freelance partage son lien → le prospect voit "Fait avec Bizko" → curiosité → inscription potentielle.

### 2. QR Code
- **Mécanisme** : Le freelance imprime son QR sur des cartes, flyers, menus → les gens scannent → découvrent Bizko.

### 3. Partage WhatsApp
- **Mécanisme** : Le freelance envoie son lien Bizko sur WhatsApp → le contact voit le profil → potentiellement s'inscrit.

### 4. LinkedIn
- **Mécanisme** : Le freelance met son lien Bizko dans sa bio LinkedIn → les recruteurs/clients voient Bizko.

### 5. Signatures email
- **Mécanisme** : Le freelance ajoute `bizko.pro/username` dans sa signature email → chaque email = promotion.

### 6. Réseaux sociaux
- **Mécanisme** : Le freelance met son lien dans sa bio Instagram/TikTok/Twitter → ses followers découvrent Bizko.

## Mécanismes de croissance non-agressifs

1. **Le produit EST le marketing** : Chaque profil partagé fait la promo de Bizko.
2. **L'annuaire** : Les prospects trouvent des freelances via Bizko → Bizko devient incontournable.
3. **QR codes** : Impression physique = marketing hors-ligne.
4. **Témoignages** : Les freelances partagent leurs succès sur les réseaux.
5. **Bouche-à-oreille** : En Afrique, le bouche-à-oreille est le canal #1.

---

# 13. Positionnement final

## One-liner

> **Ton business en un lien. Un profil qui te fait gagner des clients sur WhatsApp.**

## Positionnement

Bizko n'est **pas** un portfolio builder. Bizko n'est **pas** un link-in-bio.

Bizko est un **outil de conversion** qui transforme un freelance en une landing page professionnelle qui convertit les visiteurs en clients WhatsApp.

**Analogie** : Linktree est l'annuaire téléphonique. Bizko est la boutique avec un vendeur qui vous accueille.

## Cible principale

**Freelance africain francophone qui vend un service et qui vit sur WhatsApp.**

Plus spécifiquement : photographes, designers, vidéastes, MUA, consultants, développeurs, formateurs dans toute l'Afrique francophone (hubs prioritaires : Abidjan, Dakar, Ouaga, Douala).

## Problème principal

**"Je suis bon dans ce que je fais, mais les gens ne savent pas quoi commander ni à quel prix, et ils ne savent pas comment me contacter facilement."**

## Killer feature

**Le WhatsApp contextuel par service.** Chaque service a son propre message pré-rempli avec le nom du service et le prix. C'est ce qui transforme un visiteur en client.

## Business model

- **Plan gratuit** : Attraction + confiance + bouche-à-oreille
- **Plan Pro (2 500 FCFA/mois)** : Analytics avancées, templates premium, badge vérifié, annuaire prioritaire, branding removal, témoignages illimités
- **Annuaire `/explore`** : Le levier de monétisation principal — les freelances paient pour être discoverables

## Pricing

| Plan | Prix mensuel | Prix annuel |
|---|---|---|
| Bizko Free | 0 FCFA | 0 FCFA |
| Bizko Pro | 2 500 FCFA (~4 $) | 20 000 FCFA (~30 $) |

## Free plan

- Profil complet (identité, services, portfolio, réseaux)
- 8 services avec WhatsApp contextuel
- 9 items de portfolio (images + vidéos)
- 2 templates
- QR code + partage
- Analytics 7 jours
- Être dans l'annuaire
- FR/EN

## Paid plan (pourquoi payer)

- Analytics 30 jours + tendances + export
- Templates premium (4-6)
- Badge "Pro vérifié"
- Position prioritaire dans l'annuaire
- Messages WhatsApp personnalisables
- Témoignages illimités
- Vidéos illimitées (jusqu'au plafond portfolio), jusqu'à 5 min et 500 MB
- Support prioritaire

## Expansion (1-3 ans)

### Année 1
- Paiement Whop (Pro actif) + annuaire `/explore`
- Analytics avancées
- Templates premium

### Année 2
- Prise de RDV / calendrier
- Facturation simple
- Intégration WhatsApp Business API

### Année 3
- Multi-profils (équipe/studio)
- Domaine personnalisé
- Expansion Afrique australe + Afrique de l'Est
- IA (génération de contenu, optimisation)

---

# 14. Structure des abonnements

## Bizko Free

**Fonctionnalités :**
- Profil complet (nom, tagline, bio, avatar, ville, pays, téléphone)
- 8 services avec prix + WhatsApp contextuel
- 9 items de portfolio (images + vidéos)
- 6 réseaux sociaux
- 2 templates (Minimal + Portfolio)
- QR code + partage (copier, Web Share API)
- Analytics 7 jours (vues, clics)
- Être dans l'annuaire `/explore`
- FR/EN
- PWA

**Limites :**
- 3 vidéos max (3 min, 200 MB, qualité 720p)
- 2 témoignages
- Analytics 7 jours seulement
- Pas de badge vérifié
- Pas de position prioritaire dans l'annuaire
- Branding "Fait avec Bizko" dans le footer
- Pas de messages WhatsApp personnalisables

**Avantages :**
- **Vraiment utile** — un freelance peut vivre avec pendant des mois
- **Pas de mur payant** — rien ne manque pour commencer
- **Annuaire** — visibilité organique dès le jour 1

**Prix :** 0 FCFA

## Bizko Pro

**Fonctionnalités :**
- Tout ce qui est inclus dans Free
- Analytics 30 jours + tendances + comparaison + export CSV
- 6 templates premium (4 additionnels)
- Badge "Pro vérifié" sur le profil
- Position prioritaire dans l'annuaire `/explore`
- Messages WhatsApp personnalisables
- Témoignages illimités
- Vidéos illimitées (jusqu'au plafond portfolio), jusqu'à 5 min et 500 MB
- Branding removal ("Fait avec Bizko" retiré)
- Couleur d'accent personnalisable
- Support prioritaire

**Limites :**
- 1 seul profil (pas multi-profils)
- Pas de domaine personnalisé
- Pas de prise de RDV
- Pas de facturation

**Avantages :**
- **Plus de clients** via l'annuaire prioritaire
- **Plus professionnel** via le badge vérifié
- **Plus de contrôle** via les analytics et personnalisation
- **Plus de conversion** via les messages personnalisés et témoignages

**Prix mensuel :** 2 500 FCFA (~4 $)
**Prix annuel :** 20 000 FCFA (~30 $) — soit 1 667 FCFA/mois (économie de 33%)

**Raison principale de passer au Pro :**
> "Tu commences à gagner de l'argent grâce à Bizko. Bizko Pro te donne les outils pour en gagner encore plus."

## Bizko Business / Studio

**Quand le lancer :** Quand Bizko aura 5 000+ utilisateurs Pro.

**Fonctionnalités :**
- Tout ce qui est inclus dans Pro
- 3 profils (équipe/studio)
- Domaine personnalisé
- Prise de RDV / calendrier
- Facturation simple
- Analytics exportables (PDF)
- API (pour intégrations avancées)

**Prix mensuel :** 7 500 FCFA (~12 $)
**Prix annuel :** 60 000 FCFA (~90 $)

**Cible :** Studios photo, agences de design, small businesses avec 2-3 freelances.

## Pourquoi cette structure est meilleure

1. **2 plans principaux** = choix simple. Pas de confusion.
2. **Le plan gratuit est généreux** = attraction massive.
3. **Le plan Pro est accessible** = conversion naturelle.
4. **Le plan Business est optionnel** = pour les power users uniquement.
5. **Pas de plan "débutant" artificiel** = le gratuit suffit pour les débutants.
6. **L'annuaire** est le levier de monétisation principal = valorise l'ensemble de l'écosystème.

---

# 15. Optimisation de la conversion Free → Paid

## Stratégie : "Créer de la valeur → faire découvrir → montrer la valeur → proposer naturellement"

### Où afficher les offres premium

1. **Dashboard** : Bandeau discret en haut du dashboard — "Passez à Pro pour débloquer les analytics 30 jours"
2. **Analytics** : Quand l'utilisateur voit les analytics 7 jours — "Passez à Pro pour voir 30 jours de données"
3. **Annuaire** : Quand un freelance voit qu'il n'est pas en tête — "Passez à Pro pour une mise en avant"
4. **Template** : Quand l'utilisateur sélectionne un template premium — "Ce template est disponible avec Bizko Pro"
5. **QR Code** : "Passez à Pro pour personnaliser votre QR code"

### Quand montrer les upgrades

1. **Après 7 jours d'utilisation** : Le freelance a eu le temps de créer sa page et de voir les premières stats.
2. **Quand il atteint un seuil** : "Votre profil a été vu 50 fois cette semaine ! Passez à Pro pour comprendre d'où viennent vos visiteurs."
3. **Quand il partage son lien** : "Votre lien a été cliqué 20 fois ! Passez à Pro pour savoir qui clique."
4. **Quand ilConsulte l'annuaire** : "Vous êtes classé 15ème parmi les photographes d'Abidjan. Passez à Pro pour être en tête."
5. **Quand il clique sur un template premium** : "Ce template est réservé aux membres Pro."

### Quels avantages mettre en avant

1. **Plus de clients** : "Les freelances Pro reçoivent 3x plus de vues dans l'annuaire."
2. **Plus professionnel** : "Le badge Pro vérifié augmente la confiance de vos prospects."
3. **Plus de temps** : "Les analytics Pro vous aident à optimiser votre page en 5 minutes par semaine."
4. **Plus de revenus** : "Les freelances Pro convertissent 25% mieux grâce aux messages personnalisés."

### Quels messages utiliser

- ✅ "Votre profil a été vu 100 fois. Passez à Pro pour savoir d'où viennent vos visiteurs."
- ✅ "Vous êtes classé 8ème parmi les designers d'Abidjan. Passez à Pro pour être en tête."
- ✅ "Les freelances Pro reçoivent en moyenne 3x plus de vues dans l'annuaire."
- ✅ "Passez à Pro pour personnaliser vos messages WhatsApp et augmenter vos conversions."
- ❌ "Débloquez des fonctionnalités exclusives !"
- ❌ "Vous ratez quelque chose !"
- ❌ "Offre limitée !"

### Comment éviter d'être agressif

1. **Maximum 1 proposition par session** : Pas de popups répétés.
2. **Contextuel** : La proposition apparaît quand l'utilisateur a un besoin identifié.
3. **Respectueux** : "Vous pouvez continuer gratuitement. Mais si vous voulez aller plus loin..."
4. **Avec preuve** : Montrer des données concrètes (vos analytics montrent X, passez à Pro pour voir Y).
5. **Fermable** : Toujours un bouton "Plus tard" visible.

### Montrer la valeur avant de demander de payer

1. **Free trial de 14 jours** : Donner accès à toutes les fonctionnalités Pro pendant 14 jours, puis revenir au gratuit.
2. **Fonctionnalité "aperçu"** : Montrer les analytics 30 jours en gris avec un message "Passez à Pro pour débloquer".
3. **Annuaire** : Montrer le classement complet avec le numéro, mais griser la mise en avant Pro.
4. **Email digest** : Envoyer un email résumant les analytics 7 jours, avec un CTA vers Pro pour 30 jours.

---

# 16. Roadmap

## Maintenant (Priorité haute)

| Fonctionnalité | Impact utilisateur | Impact business | Difficulté | Priorité |
|---|---|---|---|---|
| Système de paiement (Whop, carte) | Élevé | **Critique** | Moyenne | 🔴 P0 |
| Plan Pro (limites + features) | Élevé | **Critique** | Faible | 🔴 P0 |
| Page annuaire `/explore` basique | Élevé | **Critique** | Moyenne | 🔴 P0 |
| Témoignages (ajout/suppression/affichage) | Moyen | Élevé | Faible | 🔴 P0 |
| Email digest hebdomadaire (analytics) | Moyen | Élevé | Faible | 🔴 P0 |

**Justification** : Sans paiement, pas de business. Sans annuaire, pas de rétention. Sans témoignages, pas de confiance.

## Dans 1-2 mois

| Fonctionnalité | Impact utilisateur | Impact business | Difficulté | Priorité |
|---|---|---|---|---|
| Analytics 30 jours (extension) | Élevé | Élevé | Faible | 🟠 P1 |
| Messages WhatsApp personnalisables | Moyen | Élevé | Faible | 🟠 P1 |
| Templates premium (2-3 additionnels) | Moyen | Élevé | Moyenne | 🟠 P1 |
| Badge "Pro vérifié" | Élevé | Élevé | Moyenne | 🟠 P1 |
| Branding removal (Pro) | Moyen | Moyen | Faible | 🟠 P1 |
| Suggestions d'amélioration (checklist profil) | Moyen | Moyen | Faible | 🟠 P1 |

## Dans 3-6 mois

| Fonctionnalité | Impact utilisateur | Impact business | Difficulté | Priorité |
|---|---|---|---|---|
| Page de détails par service | Élevé | Moyen | Moyenne | 🟡 P2 |
| Import depuis Instagram | Élevé | Élevé | Élevée | 🟡 P2 |
| Notifications push (PWA) | Moyen | Moyen | Moyenne | 🟡 P2 |
| Analytics export CSV/PDF | Moyen | Moyen | Faible | 🟡 P2 |
| Annuaire avec filtres avancés | Élevé | Élevé | Moyenne | 🟡 P2 |
| A/B testing des messages WhatsApp | Moyen | Élevé | Moyenne | 🟡 P2 |

## Plus tard (6-12 mois)

| Fonctionnalité | Impact utilisateur | Impact business | Difficulté | Priorité |
|---|---|---|---|---|
| Prise de RDV / calendrier | Élevé | Élevé | Élevée | 🟢 P3 |
| Facturation simple | Moyen | Élevé | Élevée | 🟢 P3 |
| Multi-profils (équipe/studio) | Moyen | Élevé | Élevée | 🟢 P3 |
| Domaine personnalisé | Moyen | Moyen | Moyenne | 🟢 P3 |
| Intégration WhatsApp Business API | Élevé | Élevé | Très élevée | 🟢 P3 |
| IA (génération bio, descriptions) | Moyen | Moyen | Élevée | 🟢 P3 |
| Expansion Afrique australe/Est | Élevé | Élevé | Moyenne | 🟢 P3 |

---

# Résumé exécutif

## Ce que Bizko est déjà
Un outil de conversion WhatsApp pour freelances africains, mobile-first, ultra-léger, bilingue FR/EN, avec des fonctionnalités techniques impressionnantes (FFmpeg, R2, analytics). **Le produit est bon.**

## Ce que Bizko doit devenir
Une **plateforme de découverte de talents** en Afrique, pas juste un outil de portfolio. L'annuaire `/explore` est la clé.

## Les 3 priorités immédiates
1. **Paiement** (Whop, carte) →monétisation
2. **Annuaire `/explore`** → rétention + croissance
3. **Plan Pro** → conversion free → paid

## Le prix
**2 500 FCFA/mois** (~4 $). Assez bas pour être un "impulse buy", assez haut pour être viable.

## La killer feature
**WhatsApp contextuel par service** + **annuaire discoverable par ville/métier**.

## Le risque #1
**Rétention**. Sans raison de revenir, les freelances oublient Bizko. L'annuaire + email digest + notifications sont les réponses.

## L'opportunité #1
**Marché non-penetré**. Pas de solution adaptée aux freelances africains francophone. Bizko peut devenir le standard.

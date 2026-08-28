# 01 — Produit Bizko

## Concept principal
Bizko est un outil utilitaire (pas une plateforme au MVP) qui permet à un indépendant service de créer un profil public unique `bizko.me/username` qui convertit.

Le profil n’est pas une vitrine passive : c’est une landing de conversion WhatsApp.

## Types d’utilisateurs
**Créateur (owner) :** indépendant A+C. Crée, édite, publie, partage son profil. Auth email.
**Visiteur :** prospect qui arrive via lien/QR. Aucune auth. Voit le profil public et contacte.

Pas de rôles équipe/admin au MVP.

## Concept du profil
Un profil = une URL unique, une identité, des services, un portfolio, des liens sociaux, un contact WhatsApp.
- Un utilisateur = un profil (1:1) au MVP.
- Le username est unique, 3-30 caractères, a-z 0-9 _ uniquement, non modifiable après création sans support (pour éviter le squat).

## Profil public
URL : `bizko.me/{username}` (ex: `bizko.me/aminata_photo`)
- SSR ultra-léger, < 1.5s sur 3G, pas de JS lourd.
- Hiérarchie stricte (identique sur tous les templates) :
  1. Header identité (avatar, nom, métier/tagline, ville)
  2. CTA principal sticky : "Discuter sur WhatsApp" + icône Appel secondaire
  3. Services (liste)
  4. Portfolio (grille)
  5. Réseaux sociaux
  6. Footer discret "Fait avec Bizko"

## Informations personnelles
- `display_name` (requis)
- `tagline` / métier (requis, ex: "Photographe à Abidjan")
- `bio` courte (280 caractères max, optionnel)
- `avatar_url` (optionnel, crop carré, compressé 400x400 webp)
- `city` + `country` (requis pour futur annuaire, affiché)
- `locale` FR/EN

Pourquoi : permet de comprendre en 2 sec qui est la personne et où elle exerce.

## Moyens de contact
- Téléphone WhatsApp (requis) : stocké en E.164 (`+2250700000000`), affiché avec indicatif. Validé.
- Appel : même numéro, bouton secondaire `tel:`.
- Email public (optionnel) : lien `mailto:` discret.
- Pas de formulaire interne au MVP (friction). Tout passe par WhatsApp/tel.

## WhatsApp (feature cœur)
- **CTA principal sticky** en haut du profil public : ouvre `https://wa.me/{numéro}?text={message_principal_encodé}`
  Message par défaut : `Salut {display_name}, j'ai vu ton profil Bizko et je souhaite discuter de tes services.`
- **Bouton par service** : chaque service a un bouton "Demander sur WhatsApp" qui ouvre `wa.me` avec message contextuel : `Salut, je suis intéressé par "{service_title}" à {price} {currency}, vu sur ton profil Bizko.`
- Le numéro est normalisé côté serveur (suppression espaces, ajout +).

Qui : tous les créateurs. Comportement : un tap = WhatsApp s’ouvre avec message prêt à envoyer. Pas d’API WhatsApp Business au MVP.

## Réseaux sociaux
Liste ordonnée, max 6 : Instagram, TikTok, LinkedIn, Facebook, X, YouTube, Behance, Site web.
- Champ URL validée, icône correspondante.
- Affichés après portfolio, pas en haut (pour ne pas faire fuir vers Insta avant conversion).

## Services
- `title` (requis, 60c), `description` (optionnel, 140c), `price` (optionnel, number), `currency` (XOF/EUR/USD, défaut XOF), `position` (ordre)
- Max 8 services au MVP.
- Affichage : carte simple avec prix aligné à droite + bouton "WhatsApp" par service.
- Pourquoi : c’est le cœur "business". Permet au prospect de savoir quoi acheter et à quel prix sans DM.

## Portfolio
- `image_url` (storage), `title` (optionnel), `position`
- Max 9 images au MVP, grille 3x3 sur mobile, lightbox simple au tap (sans librairie lourde).
- Compression auto côté upload : webp, max 1200px, < 200kb.
- Pourquoi : preuve sociale pour créatifs. Optionnel pour consultants (peut rester vide).

## QR Code
- **Pas affiché sur le profil public.**
- Dans le dashboard : bouton "Générer mon QR" → affiche QR de `bizko.me/username` (lib qrcode) → Télécharger PNG 800x800 + Partager.
- Pourquoi : répond à l’attente "carte de visite" sans alourdir la page publique. Usage : impression flyer/carte.

## Partage
- Dashboard : "Copier le lien" (feedback copié), "Partager" (Web Share API si dispo), "Télécharger QR".
- Profil public : bouton flottant "Partager" discret en bas.

## Username / URL
- `username` unique, 3-30c, a-z0-9_, lowercased, réservé à la création. Vérification d’unicité en temps réel.
- URL publique : `bizko.me/{username}` (pas de sous-domaine au MVP).
- Redirection `www` → apex.

## Personnalisation / Templates
- 2 templates MVP : **Minimal** (editorial, pro, beaucoup de blanc) et **Portfolio** (grille visuelle dominante). 3ème "Pro / Service" en SHOULD HAVE.
- Même structure HTML, seul CSS change (couleurs, typo, grille, espacement). Pas de builder drag & drop.
- Choix du template dans l’éditeur, prévisualisation instantanée.
- Couleurs : palette limitée par template (pas de color picker libre au MVP pour garder cohérence + perf).
- Pourquoi : donner un sentiment de choix sans complexité dev.

## Autres fonctionnalités validées
- Bilingue FR/EN : sélecteur langue dans dashboard + profil public (détection navigateur en fallback).
- Prévisualisation temps réel dans l’éditeur (même composant que public, en iframe/side panel).

## Explicitement NON validé (ne pas builder)
Domaine perso, paiement Mobile Money, prise de RDV, catalogue produits, analytics avancées, équipe, annuaire.

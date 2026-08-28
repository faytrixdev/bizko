# 03 - User Flows Bizko

## Flow 1 : Landing → Inscription → Onboarding → Première publication

```
Landing bizko.me
  ↓ [CTA "Créer mon lien gratuit"]
Inscription (email, password)
  ↓ [Créer compte]
Onboarding Étape 1/3 : Choisir username
  - input username + check dispo temps réel
  ↓ [Continuer]
Onboarding Étape 2/3 : Identité
  - display_name, tagline, city, WhatsApp (E.164), avatar
  ↓ [Continuer]
Onboarding Étape 3/3 : Premier service
  - title, price, currency
  ↓ [Publier]
Dashboard / Éditeur
  ↓ [Voir mon profil]
Profil public bizko.me/{username}
```

Points clés : vérification email obligatoire. Username validé avant suite.

## Flow 2 : Édition du profil (utilisateur connecté)

```
Dashboard
  ├─→ Éditer Identité → sauvegarde auto → Prévisualisation
  ├─→ Gérer Services → Ajouter/Éditer/Supprimer/Réordonner → sauvegarde
  ├─→ Gérer Portfolio → Upload (compress) / Supprimer / Réordonner
  ├─→ Gérer Réseaux → Ajouter URL validée
  ├─→ Choisir Template → Minimal / Portfolio → préview instantanée
  └─→ Prévisualiser (panel latéral = rendu profil public)
        ↓ [Publier / Mettre à jour]
      Profil public mis à jour (SSR)
```

Sauvegarde : debounce 800ms + bouton "Enregistré ✓". Pas de "Publier/Brouillon" complexe au MVP : toute sauvegarde = public.

## Flow 3 : Partage du profil

```
Dashboard → Section "Partage"
  ├─ [Copier le lien] → clipboard + toast "Lien copié !"
  ├─ [Partager] → Web Share API (WhatsApp, etc.) → fallback copier
  └─ [Générer QR] → modal QR → [Télécharger PNG] / [Partager image]
```

Profil public → bouton flottant [Partager] discret → même actions.

## Flow 4 : Visite du profil (prospect non connecté)

```
Lien bizko.me/{username} (reçu sur WhatsApp/Insta/QR)
  ↓
Profil public charge (<1.5s)
  ├─ Voir identité + tagline + ville
  ├─ CTA sticky "Discuter sur WhatsApp" toujours visible
  ├─ Scroller : Services → [WhatsApp par service] → Portfolio (lightbox) → Sociaux
  └─ Actions :
       ├─ Tap CTA principal → wa.me?text=message_principal → WhatsApp s'ouvre
       ├─ Tap bouton service → wa.me?text=message_contextuel_service → WhatsApp
       ├─ Tap tel → tel:+225...
       └─ Tap réseau → lien externe (nouvel onglet)
```

Aucune auth requise. Pas de tracking intrusif.

## Flow 5 : QR Code (créateur)

```
Dashboard → [Générer mon QR]
  ↓
Modal : QR de bizko.me/{username} (qrcode lib)
  ├─ [Télécharger PNG 800x800]
  └─ [Partager image] (si dispo)
Usage hors app : impression carte/flyer, scan en event → Flow 4
```

## Flow 6 : Connexion retour + modification

```
bizko.me/login → email+password → Dashboard
  → Éditer → Prévisualiser → Sauvegarde auto → Profil public à jour
```

## Flow 7 : Gestion erreurs

```
Username déjà pris → message inline "Indisponible, essaie {suggestion}"
WhatsApp invalide → "Numéro invalide, format +2250700000000"
Upload image > 5MB → "Image trop lourde, max 5MB"
Lien social invalide → "URL invalide"
Profil non trouvé (404) → page 404 avec CTA "Créer ton Bizko"
Lien wa.me → si WhatsApp non installé → fallback page wa.me web
```

## Flow 8 : Changement langue

```
Dashboard header [FR | EN] → toggle → i18n recharge → préférence stockée localStorage + profil.locale
Profil public : détection Accept-Language si visiteur, sinon locale du créateur
```

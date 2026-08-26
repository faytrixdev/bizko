# 02 — MVP Bizko

Objectif MVP : permettre à un indépendant service de créer et partager en < 5 min un profil qui convertit sur WhatsApp. Développable par 1 dev en 3-4 semaines. Gratuit total.

---

## MUST HAVE — Indispensable au lancement

### 1. Auth Email + Onboarding
Objectif : friction 0, création compte en 30s.
- Inscription/connexion email+password (Supabase Auth), vérification email optionnelle au MVP.
- Onboarding 3 étapes : (1) Choisir username, (2) Identité (nom, tagline, ville, WhatsApp), (3) Premier service.
- Redirection vers éditeur après onboarding.

### 2. Éditeur de profil
Objectif : créer le profil sans friction.
- Champs : display_name, tagline, bio (280c), avatar, city/country, phone WhatsApp (E.164), email public, locale.
- Validation temps réel, sauvegarde auto (debounced).

### 3. Gestion Services (cœur business)
Objectif : lister ce qu’on vend avec prix → déclencher WhatsApp contextuel.
- CRUD services : title, description, price, currency (XOF/EUR/USD), position (drag ou flèches).
- Max 8, ordre persistant.
- Chaque service génère son lien wa.me contextuel.

### 4. Portfolio
Objectif : preuve visuelle pour créatifs.
- Upload max 9 images, compression webp côté client/serveur, < 200kb, max 1200px.
- Ordre, suppression, titre optionnel.
- Stockage Supabase Storage.

### 5. Réseaux sociaux
Objectif : centraliser sans cannibaliser la conversion.
- CRUD social_links : platform (enum) + URL validée, max 6, ordre.
- Affichés après portfolio.

### 6. Profil public ultra-léger
Objectif : convertir, pas impressionner. C’est l’écran #1.
- Route `/{username}` SSR, < 1.5s sur 3G, < 100kb JS.
- Hiérarchie : Identité → CTA WhatsApp sticky (+ tel secondaire) → Services → Portfolio → Sociaux → Footer "Fait avec Bizko".
- CTA sticky reste visible au scroll (mobile).
- 404 propre si username inconnu.

### 7. Templates (2 skins)
Objectif : choix esthétique sans complexité.
- Minimal + Portfolio. Même HTML, CSS différent.
- Sélecteur dans éditeur, prévisualisation instantanée.

### 8. Username / URL unique
Objectif : identité partageable.
- `bizko.co/{username}`, unique, 3-30c, a-z0-9_, lowercased, check dispo en temps réel.
- Réservation à la création.

### 9. Partage + QR secondaire
Objectif : diffuser le lien partout.
- Dashboard : Copier lien, Partager (Web Share API), Générer/Télécharger QR PNG.
- QR non affiché sur profil public.

### 10. Bilingue FR/EN
Objectif : couvrir Afrique francophone + anglophone.
- i18n simple (JSON), sélecteur dashboard, détection navigateur pour profil public.

---

## SHOULD HAVE — Utile mais non bloquant (faire si temps)

- **3ème template "Pro / Service"** : focus services + témoignages. Même structure.
- **Témoignages** : 2-3 citations (texte + auteur) sous portfolio.
- **Analytics basiques** : vues profil + clics WhatsApp (par service et global), stockés en table events, dashboard compteur simple. Pas de graphique complexe.

Si retard, décaler en V1.1 sans impacter lancement.

---

## NOT NOW — Explicitement exclu du MVP

Ne pas builder, ne pas designer, ne pas prévoir d’UI pour :
- Catalogue produits physiques / stock / variantes
- Paiement / Mobile Money / Stripe
- Annuaire / Explore / Recherche / SEO annuaire (mais DB prête : `city`, `category`, `is_public`)
- Domaine personnalisé
- Prise de RDV / calendrier / disponibilité
- WhatsApp Business API / auto-réponses
- Auth par téléphone OTP / SMS
- PWA / offline / service worker
- Équipe / multi-profiles / rôles
- Templates premium / paywall / abonnement
- Analytics avancées / graphiques
- Modération / signalement
- SEO avancé blog
- Import Instagram auto

Toute demande d’ajout doit être validée explicitement et déplacée de NOT NOW → MUST HAVE par décision produit.

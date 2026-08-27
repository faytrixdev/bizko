# Auth System Design — Bizko

## Context

L'application utilise Supabase Auth avec email/mot de passe. Le système fonctionne mais présente des lacunes critiques : pas de Google OAuth, pas de protection middleware des routes, pas de page Account dédiée, gestion incomplète de la confirmation email, types dispersés.

## Objectifs

1. Google OAuth intégré proprement
2. Middleware de protection des routes par couches (auth → session → profil → onboarding → app)
3. Page /account dédiée (profil, sécurité, suppression)
4. Types centralisés dans src/types/
5. Gestion complète de la confirmation email (renvoi, erreurs, liens expirés)
6. Hook useSession pour la gestion côté client
7. Respect du flow onboarding existant

## Architecture

### Couches de protection

```
Request → Middleware (refresh session)
       → Route Guard (auth required?)
       → Profile Guard (profile exists?)
       → Onboarding Guard (onboarding complete?)
       → Page/Action
```

### Types centralisés

Fichier unique `src/types/database.ts` avec tous les types : Profile, Service, PortfolioItem, SocialLink, Session.

### Google OAuth

Flow : login/signup → signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' }) → callback → session → profil check → dashboard/onboarding.

### Middleware protection

| Route | Auth | Profile | Redirect si |
|-------|------|---------|-------------|
| /login, /signup | Non | Non | Déjà connecté → /dashboard |
| /forgot-password, /reset-password, /verify-email | Non | Non | — |
| /onboarding | Oui | Non (doit pas exister) | Pas auth → /login, Profil existe → /dashboard |
| /dashboard, /account | Oui | Oui | Pas auth → /login, Pas profil → /onboarding |
| /{username}, / | Non | Non | — |

### Page Account

Onglets :
- Profil : display_name, tagline, bio, avatar, ville, pays, téléphone
- Sécurité : changement mot de passe (pas si compte Google)
- Compte : email, déconnexion, suppression

### Server Actions modifiées

- signup : gérer email non confirmé → redirect /verify-email
- login : gérer email non confirmé (message clair)
- Ajouter loginWithGoogle
- Ajouter changePassword (depuis /account)
- Ajouter deleteAccount (avec cascade côté serveur)

### Erreurs gérées

- Email non confirmé → "Vérifiez votre boîte de réception"
- Mauvais mot de passe → "Email ou mot de passe incorrect"
- Lien expiré → "Ce lien a expiré. Demandez un nouveau lien."
- Profil manquant → redirection onboarding
- Suppression → confirmation + cleanup

### Sécurité

- Mots de passe jamais stockés côté client
- Service role key uniquement côté serveur
- RLS sur toutes les tables
- Validation côté serveur de toutes les données

## Impact

- Fichiers modifiés : middleware.ts, (auth)/actions.ts, login/page.tsx, signup/page.tsx, verify-email/page.tsx, onboarding/page.tsx
- Fichiers créés : src/types/database.ts, src/hooks/useSession.ts, src/app/account/page.tsx, src/app/auth/callback/route.ts, GoogleOAuthButton, account components
- Pas de changement de schéma DB
- Pas de nouvelles dépendances npm

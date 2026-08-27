# Auth System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implémenter un système d'authentification complet avec Google OAuth, protection des routes, page Account, et gestion robuste des sessions.

**Architecture:** Extension progressive de l'existant. Ajout de Google OAuth, middleware de protection par couches, types centralisés, et page /account dédiée.

**Tech Stack:** Next.js 16, Supabase Auth (@supabase/ssr), React 19, TypeScript, Tailwind CSS

---

## Task 1: Types centralisés

**Files:**
- Create: `src/types/database.ts`
- Modify: `src/components/dashboard/DashboardClient.tsx`
- Modify: `src/components/dashboard/TabSettings.tsx`

**Step 1: Créer le fichier de types**

Créer `src/types/database.ts` avec tous les types :

```typescript
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  tagline: string;
  bio: string | null;
  city: string;
  country: string;
  phone_e164: string;
  email_public: string | null;
  template: string;
  avatar_url: string | null;
}

export interface Service {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  position: number;
}

export interface PortfolioItem {
  id: string;
  profile_id: string;
  image_url: string;
  title: string | null;
  position: number;
}

export interface SocialLink {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  position: number;
}

export type Template = 'minimal' | 'portfolio';
export type Locale = 'fr' | 'en';
export type Currency = 'XOF' | 'XAF' | 'NGN' | 'KES' | 'ZAR' | 'DZD' | 'GHS' | 'TZS' | 'UGX' | 'USD' | 'EUR' | 'GBP';
```

**Step 2: Mettre à jour DashboardClient.tsx**

Remplacer les interfaces inline par les imports depuis `src/types/database.ts`.

**Step 3: Mettre à jour TabSettings.tsx**

Remplacer les interfaces inline par les imports depuis `src/types/database.ts`.

**Step 4: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs de type

**Step 5: Commit**

```bash
git add src/types/database.ts src/components/dashboard/DashboardClient.tsx src/components/dashboard/TabSettings.tsx
git commit -m "feat: add centralized TypeScript types for database entities"
```

---

## Task 2: Hook useSession

**Files:**
- Create: `src/hooks/useSession.ts`
- Create: `src/hooks/index.ts`

**Step 1: Créer le hook useSession**

Créer `src/hooks/useSession.ts` :

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import type { User } from '@supabase/supabase-js';

interface SessionState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isOnboarded: boolean;
  refresh: () => Promise<void>;
}

export function useSession(): SessionState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }, [supabase]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    
    if (currentUser) {
      const profileData = await fetchProfile(currentUser.id);
      setProfile(profileData);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [supabase, fetchProfile]);

  useEffect(() => {
    refresh();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile, refresh]);

  return {
    user,
    profile,
    loading,
    isOnboarded: !!profile,
    refresh,
  };
}
```

**Step 2: Créer le barrel export**

Créer `src/hooks/index.ts` :

```typescript
export { useSession } from './useSession';
```

**Step 3: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 4: Commit**

```bash
git add src/hooks/useSession.ts src/hooks/index.ts
git commit -m "feat: add useSession hook for client-side session management"
```

---

## Task 3: Callback OAuth Route

**Files:**
- Create: `src/app/auth/callback/route.ts`

**Step 1: Créer la route de callback**

Créer `src/app/auth/callback/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Check if profile exists
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          return NextResponse.redirect(`${origin}/dashboard`);
        } else {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
```

**Step 2: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat: add OAuth callback route for Google authentication"
```

---

## Task 4: GoogleOAuthButton Component

**Files:**
- Create: `src/components/auth/GoogleOAuthButton.tsx`
- Modify: `src/components/auth/index.ts`

**Step 1: Créer le composant GoogleOAuthButton**

Créer `src/components/auth/GoogleOAuthButton.tsx` :

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface GoogleOAuthButtonProps {
  mode: 'login' | 'signup';
}

export function GoogleOAuthButton({ mode }: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {mode === 'login' ? 'Continuer avec Google' : 'S\'inscrire avec Google'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
```

**Step 2: Mettre à jour le barrel export**

Modifier `src/components/auth/index.ts` pour exporter GoogleOAuthButton.

**Step 3: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 4: Commit**

```bash
git add src/components/auth/GoogleOAuthButton.tsx src/components/auth/index.ts
git commit -m "feat: add GoogleOAuthButton component for OAuth authentication"
```

---

## Task 5: Modifier les Server Actions Auth

**Files:**
- Modify: `src/app/(auth)/actions.ts`

**Step 1: Modifier la fonction signup**

La fonction signup doit :
1. Vérifier si l'email existe déjà avec un provider différent
2. Gérer les erreurs de confirmation email
3. Rediriger vers `/verify-email` au lieu de `/onboarding`

**Step 2: Modifier la fonction login**

La fonction login doit :
1. Vérifier si l'email est confirmé
2. Retourner un message clair si non confirmé
3. Gérer les erreurs de manière appropriée

**Step 3: Ajouter la fonction loginWithGoogle**

```typescript
export async function loginWithGoogle() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
```

**Step 4: Ajouter la fonction changePassword**

```typescript
export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas.' };
  }

  if (newPassword.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
  }

  // Verify current password by trying to sign in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return { error: 'Utilisateur non trouvé.' };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: 'Mot de passe actuel incorrect.' };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Mot de passe modifié avec succès.' };
}
```

**Step 5: Ajouter la fonction deleteAccount**

```typescript
export async function deleteAccount() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Utilisateur non trouvé.' };
  }

  // Delete profile (cascades to services, portfolio_items, social_links, events)
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);

  if (profileError) {
    return { error: 'Erreur lors de la suppression du profil.' };
  }

  // Delete user from auth (requires service role key)
  // Note: This should be done via a Supabase Edge Function or webhook
  // For now, we'll sign out and let the user know their data is deleted
  
  const { error: signOutError } = await supabase.auth.signOut();
  
  if (signOutError) {
    return { error: 'Erreur lors de la déconnexion.' };
  }

  redirect('/');
}
```

**Step 6: Ajouter la fonction resendConfirmationEmail**

```typescript
export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Email de confirmation renvoyé.' };
}
```

**Step 7: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 8: Commit**

```bash
git add src/app/(auth)/actions.ts
git commit -m "feat: enhance auth server actions with Google OAuth, password change, account deletion, and email resend"
```

---

## Task 6: Modifier les pages Login et Signup

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/signup/page.tsx`

**Step 1: Ajouter GoogleOAuthButton au login**

Ajouter le bouton Google OAuth au login page avec un séparateur "ou".

**Step 2: Ajouter GoogleOAuthButton au signup**

Ajouter le bouton Google OAuth au signup page avec un séparateur "ou".

**Step 3: Améliorer la gestion des erreurs**

Afficher des messages d'erreur plus clairs pour :
- Email non confirmé
- Mauvais mot de passe
- Erreur réseau

**Step 4: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 5: Commit**

```bash
git add src/app/(auth)/login/page.tsx src/app/(auth)/signup/page.tsx
git commit -m "feat: add Google OAuth buttons to login and signup pages"
```

---

## Task 7: Modifier la page Verify Email

**Files:**
- Modify: `src/app/(auth)/verify-email/page.tsx`

**Step 1: Ajouter fonctionnalité de renvoi d'email**

Ajouter un bouton pour renvoyer l'email de confirmation avec :
- Champ email (pré-rempli si disponible)
- État de chargement
- Message de succès/erreur

**Step 2: Ajouter gestion des liens expirés**

Afficher un message clair si le lien de confirmation est expiré.

**Step 3: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 4: Commit**

```bash
git add src/app/(auth)/verify-email/page.tsx
git commit -m "feat: enhance verify email page with resend functionality"
```

---

## Task 8: Modifier le Middleware

**Files:**
- Modify: `middleware.ts`
- Modify: `src/lib/supabase/middleware.ts`

**Step 1: Ajouter logique de protection des routes**

Dans `src/lib/supabase/middleware.ts`, ajouter la logique de redirection basée sur l'état d'authentification.

**Step 2: Protéger les routes privées**

- `/login`, `/signup` → redirect to `/dashboard` if authenticated
- `/onboarding` → require auth, redirect to `/dashboard` if profile exists
- `/dashboard`, `/account` → require auth, redirect to `/login` if no session

**Step 3: Gérer les routes API**

- `/api/check-username` → public
- `/api/track-click` → public
- `/api/supabase-health` → public
- Autres routes API → require auth

**Step 4: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 5: Commit**

```bash
git add middleware.ts src/lib/supabase/middleware.ts
git commit -m "feat: add route protection middleware with layered auth checks"
```

---

## Task 9: Page Account

**Files:**
- Create: `src/app/account/page.tsx`
- Create: `src/app/account/AccountClient.tsx`
- Create: `src/components/account/AccountForm.tsx`
- Create: `src/components/account/PasswordChangeForm.tsx`
- Create: `src/components/account/DeleteAccountDialog.tsx`

**Step 1: Créer la page account**

Créer `src/app/account/page.tsx` comme Server Component qui vérifie l'authentification.

**Step 2: Créer le composant AccountClient**

Créer `src/app/account/AccountClient.tsx` avec onglets pour Profil, Sécurité, Compte.

**Step 3: Créer AccountForm**

Formulaire pour modifier display_name, tagline, bio, avatar, ville, pays, téléphone.

**Step 4: Créer PasswordChangeForm**

Formulaire pour changer le mot de passe avec validation.

**Step 5: Créer DeleteAccountDialog**

Dialog de confirmation pour supprimer le compte avec avertissement.

**Step 6: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 7: Commit**

```bash
git add src/app/account/
git commit -m "feat: add dedicated account settings page with profile, security, and deletion"
```

---

## Task 10: Mettre à jour l'Onboarding

**Files:**
- Modify: `src/app/onboarding/page.tsx`

**Step 1: Vérifier la logique de redirection**

S'assurer que l'onboarding :
- Redirige vers `/login` si pas authentifié
- Redirige vers `/dashboard` si le profil existe déjà
- Crée correctement le profil pour les utilisateurs Google

**Step 2: Mettre à jour la création de profil**

S'assurer que le profil est créé avec toutes les données nécessaires pour les utilisateurs Google.

**Step 3: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 4: Commit**

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat: update onboarding to handle Google OAuth users"
```

---

## Task 11: Mettre à jour les Composants Dashboard

**Files:**
- Modify: `src/components/dashboard/DashboardClient.tsx`
- Modify: `src/components/dashboard/TabSettings.tsx`

**Step 1: Utiliser les types centralisés**

Remplacer les interfaces inline par les imports depuis `src/types/database.ts`.

**Step 2: Ajouter lien vers /account**

Ajouter un lien vers la page Account dans le dashboard.

**Step 3: Vérifier la compilation**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 4: Commit**

```bash
git add src/components/dashboard/DashboardClient.tsx src/components/dashboard/TabSettings.tsx
git commit -m "feat: update dashboard components to use centralized types and link to account"
```

---

## Task 12: Tests et Vérification

**Files:**
- Create: `src/components/auth/__tests__/GoogleOAuthButton.test.tsx`
- Create: `src/hooks/__tests__/useSession.test.ts`
- Create: `src/app/account/__tests__/AccountForm.test.tsx`

**Step 1: Tests unitaires pour GoogleOAuthButton**

Tester que le composant s'affiche correctement et gère les états de chargement.

**Step 2: Tests unitaires pour useSession**

Tester que le hook retourne correctement les données de session.

**Step 3: Tests d'intégration pour AccountForm**

Tester que le formulaire soumet correctement les données.

**Step 4: Exécuter tous les tests**

Run: `npm test`
Expected: Tous les tests passent

**Step 5: Vérifier la compilation finale**

Run: `npm run build`
Expected: Pas d'erreurs

**Step 6: Commit**

```bash
git add src/components/auth/__tests__/ src/hooks/__tests__/ src/app/account/__tests__/
git commit -m "test: add unit and integration tests for auth system"
```

---

## Task 13: Documentation

**Files:**
- Modify: `README.md`

**Step 1: Mettre à jour le README**

Ajouter la documentation sur :
- L'authentification (email + Google)
- La gestion des routes
- La page Account
- Les variables d'environnement requises

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with auth system documentation"
```

---

## Scénarios de Test

### Scénario 1: Nouvel utilisateur email
1. Aller sur `/signup`
2. Entrer email + mot de passe
3. Vérifier redirect vers `/verify-email`
4. Cliquer sur lien dans email
5. Vérifier redirect vers `/onboarding`
6. Compléter onboarding
7. Vérifier redirect vers `/dashboard`

### Scénario 2: Nouvel utilisateur Google
1. Aller sur `/login`
2. Cliquer "Continuer avec Google"
3. Authentification Google
4. Vérifier redirect vers `/onboarding`
5. Compléter onboarding
6. Vérifier redirect vers `/dashboard`

### Scénario 3: Utilisateur existant email
1. Aller sur `/login`
2. Entrer email + mot de passe
3. Vérifier redirect vers `/dashboard`

### Scénario 4: Utilisateur existant Google
1. Aller sur `/login`
2. Cliquer "Continuer avec Google"
3. Authentification Google
4. Vérifier redirect vers `/dashboard`

### Scénario 5: Mot de passe oublié
1. Aller sur `/forgot-password`
2. Entrer email
3. Vérifier message de succès
4. Cliquer dans email
5. Aller sur `/reset-password`
6. Entrer nouveau mot de passe
7. Vérifier redirect vers `/login`

### Scénario 6: Persistance session
1. Se connecter
2. Fermer le navigateur
3. Rouvrir l'application
4. Vérifier toujours connecté

### Scénario 7: Changement mot de passe
1. Aller sur `/account`
2. Onglet Sécurité
3. Entrer mot de passe actuel + nouveau
4. Vérifier message de succès
5. Se déconnecter
6. Se reconnecter avec nouveau mot de passe

### Scénario 8: Déconnexion + route privée
1. Se connecter
2. Se déconnecter
3. Tenter d'accéder à `/dashboard`
4. Vérifier redirect vers `/login`

### Scénario 9: Profil créé une seule fois
1. Se connecter avec Google (nouvel utilisateur)
2. Vérifier onboarding affiché
3. Compléter onboarding
4. Se déconnecter
5. Se reconnecter avec Google
6. Vérifier onboarding PAS affiché, redirect vers `/dashboard`

### Scénario 10: Modification profil
1. Aller sur `/account`
2. Modifier display_name
3. Sauvegarder
4. Vérifier les modifications persistées

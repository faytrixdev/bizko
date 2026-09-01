import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackEvent } from '@/lib/analytics';

function safeNextPath(raw: string | null): string | null {
  if (!raw) return null;
  // Allow only same-origin relative paths (no protocol-relative "//", no "javascript:").
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

function isRecentCreation(createdAt: string | undefined, withinMs = 3 * 60 * 1000): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  return Number.isFinite(created) && Date.now() - created <= withinMs;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // OAuth (e.g. Google) and email-verification both land here once a
        // real auth session exists, so auth.uid() is valid. A brand-new
        // account has created_at ~= now; returning logins have an older one.
        if (isRecentCreation(user.created_at)) {
          await trackEvent('user_signed_up', { pagePath: '/auth/callback' });
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // Only honor `next` when the user already has a profile; otherwise
        // always push unonboarded users to onboarding.
        const target = next && profile ? next : profile ? '/dashboard' : '/onboarding';
        return NextResponse.redirect(`${origin}${target}`);
      }
    } else {
      console.error('exchangeCodeForSession error:', error);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('exchange_error: ' + error.message)}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

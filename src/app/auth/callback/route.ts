import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeNextPath(raw: string | null): string | null {
  if (!raw) return null;
  // Allow only same-origin relative paths (no protocol-relative "//", no "javascript:").
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
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

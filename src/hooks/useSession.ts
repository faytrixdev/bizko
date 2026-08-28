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
    let active = true;

    (async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!active) return;
        setUser(currentUser);
        setProfile(currentUser ? await fetchProfile(currentUser.id) : null);
      } finally {
        if (active) setLoading(false);
      }
    })();

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

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  return {
    user,
    profile,
    loading,
    isOnboarded: !!profile,
    refresh,
  };
}

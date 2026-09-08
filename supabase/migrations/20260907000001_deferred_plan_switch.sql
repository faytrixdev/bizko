-- Deferred plan switch (monthly <-> yearly) for Bizko Pro.
-- After scheduling a switch, no checkout is created immediately. The current
-- Whop membership is cancelled at period end, and the user keeps access for a
-- grace window (7 days) during which they complete the new plan's checkout.

alter table public.subscriptions
  add column pending_interval text check (pending_interval in ('monthly','yearly')),
  add column pending_effective_at timestamptz;

-- is_pro now also returns true during the switch grace window: when a switch is
-- pending and the old period just ended, access continues for 7 days so the
-- user can finalize the new plan's checkout without losing Pro.
create or replace function public.is_pro(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where profile_id = p_profile_id
      and plan = 'pro'
      and (
        status in ('active','trialing')
        or (
          pending_interval is not null
          and pending_effective_at is not null
          and now() <= pending_effective_at + interval '7 days'
        )
      )
  );
$$;

grant execute on function public.is_pro(uuid) to anon, authenticated;
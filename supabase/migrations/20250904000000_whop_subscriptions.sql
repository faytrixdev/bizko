-- Whop subscriptions for Bizko Pro
-- One row per profile (profile_id PK). A row may be absent => free plan.
-- Written by the Whop webhook (service role) and read by server actions / RPC.

create table public.subscriptions (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  plan text not null default 'pro' check (plan in ('free','pro')),
  status text not null default 'active'
    check (status in ('trialing','active','past_due','canceled','expired')),
  whop_user_id text,
  whop_membership_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Owner can read their own subscription (for dashboard display).
create policy "Owner can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = profile_id);

-- Webhook / system updates are done via the service role (bypasses RLS).
-- Owner cannot insert/update to prevent self-granting Pro.
-- No insert/update/delete policies for regular users.

-- Helper: is an authenticated profile currently Pro (active or trialing)?
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
      and status in ('active','trialing')
  );
$$;

grant execute on function public.is_pro(uuid) to anon, authenticated;

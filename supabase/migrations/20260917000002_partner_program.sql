-- Partner program V1. Bizko is the source of truth: partners, referrals,
-- payments, commissions and payouts live here; Chariow/Whop only confirm payments.

-- profiles: partner identity (no expiry; Pro is granted purely by is_partner)
alter table public.profiles
  add column is_partner boolean not null default false,
  add column partner_code text
    check (partner_code is null or partner_code ~ '^[a-z0-9_]{3,60}_[a-z0-9]{4,8}$'),
  add column commission_rate integer not null default 30
    check (commission_rate between 1 and 100);

create unique index idx_profiles_partner_code on public.profiles(partner_code)
  where partner_code is not null;

-- referrals: immutable user -> partner attribution. One partner per user.
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('partner_link','partner_profile')),
  created_at timestamptz not null default now(),
  unique (referred_user_id)
);

create index idx_referrals_partner on public.referrals(partner_id);

alter table public.referrals enable row level security;

-- is_active_partner: security-definer helper so RLS policies (and later the app
-- lookup) can check partner status even for profiles hidden by the profiles
-- SELECT policy (is_public = false). Avoids policy recursion on public.profiles.
create or replace function public.is_active_partner(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_profile_id and is_partner
  );
$$;

grant execute on function public.is_active_partner(uuid) to anon, authenticated;

-- get_active_partner_by_code: security-definer lookup by partner_code so the
-- onboarding attribution works even for partners hidden by the profiles SELECT
-- policy (is_public = false). Returns the partner id, or null when inactive.
create or replace function public.get_active_partner_by_code(p_code text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles
  where partner_code = p_code and is_partner
  limit 1;
$$;

grant execute on function public.get_active_partner_by_code(text) to anon, authenticated;

create policy "Partner can view their referrals"
  on public.referrals for select
  using (partner_id = auth.uid());

create policy "Referred user attributes themselves once"
  on public.referrals for insert
  with check (
    referred_user_id = auth.uid()
    and partner_id <> referred_user_id
    and public.is_active_partner(partner_id)
  );

-- payments: one row per confirmed provider payment. Idempotency anchor.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('whop','chariow')),
  provider_payment_id text not null unique,
  amount integer not null check (amount > 0),
  currency text not null default 'XOF',
  interval text not null default 'monthly' check (interval in ('monthly','yearly')),
  plan text not null default 'pro',
  status text not null default 'succeeded' check (status in ('succeeded','failed','refunded')),
  created_at timestamptz not null default now()
);

create index idx_payments_profile on public.payments(profile_id);

alter table public.payments enable row level security;

create policy "Payer or their partner can view a payment"
  on public.payments for select
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.referrals r
      where r.partner_id = auth.uid() and r.referred_user_id = payments.profile_id
    )
  );

-- payouts: manual withdrawal requests.
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount >= 5000),
  method text not null,
  account_identifier text not null,
  account_holder text,
  details text,
  status text not null default 'pending' check (status in ('pending','paid','rejected')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  check ((status = 'paid') = (paid_at is not null))
);

create index idx_payouts_partner on public.payouts(partner_id);
create index idx_payouts_status on public.payouts(status);

alter table public.payouts enable row level security;

create policy "Partner can view their payouts"
  on public.payouts for select
  using (partner_id = auth.uid());

create policy "Partner can request their payouts"
  on public.payouts for insert
  with check (partner_id = auth.uid() and public.is_active_partner(partner_id));

-- commissions: one per payment, created by webhooks, linked to a payout when paid.
create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.profiles(id) on delete restrict,
  referred_user_id uuid not null references public.profiles(id) on delete restrict,
  payment_id uuid not null unique references public.payments(id) on delete restrict,
  amount integer not null check (amount > 0),
  status text not null default 'approved' check (status in ('pending','approved','paid')),
  payout_id uuid references public.payouts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_commissions_partner on public.commissions(partner_id);
create index idx_commissions_partner_status on public.commissions(partner_id, status);

alter table public.commissions enable row level security;

create policy "Partner can view their commissions"
  on public.commissions for select
  using (partner_id = auth.uid());

-- is_pro: partners are Pro for the whole collaboration, without a subscription row.
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
        (
          status in ('active','trialing')
          and (
            provider <> 'chariow'
            or current_period_end is null
            or current_period_end > now()
          )
        )
        or (
          pending_interval is not null
          and pending_effective_at is not null
          and now() <= pending_effective_at + interval '7 days'
        )
      )
  ) or exists (
    select 1 from public.profiles
    where id = p_profile_id and is_partner
  );
$$;

grant execute on function public.is_pro(uuid) to anon, authenticated;

notify pgrst, 'reload schema';

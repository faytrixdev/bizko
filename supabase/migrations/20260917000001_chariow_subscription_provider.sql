-- Chariow (Mobile Money) as a second Pro payment provider on subscriptions.
-- Whop remains the recorded provider for rows written before this migration.
-- Chariow has no recurring-billing API: a paid sale grants a time-limited
-- license, so the row stores provider = 'chariow' plus the sale/product that
-- created it, and current_period_end is computed by the webhook (30/365 days).

alter table public.subscriptions
  add column provider text not null default 'whop'
    check (provider in ('whop','chariow')),
  add column chariow_sale_id text unique,
  add column chariow_product_id text;

-- is_pro: has to treat Chariow rows as time-limited. A chariow row only counts
-- as Pro while its period (current_period_end) is in the future; there is no
-- auto-renewal and no "expired" Pulse event, so the local computed period is
-- the only source of truth. Grace-window handling is unchanged (Whop switches
-- never produce a chariow pending_* state).
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
  );
$$;

grant execute on function public.is_pro(uuid) to anon, authenticated;
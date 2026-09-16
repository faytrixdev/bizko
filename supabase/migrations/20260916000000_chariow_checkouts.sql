-- Chariow (Mobile Money) checkouts for Bizko Pro.
-- pro_checkouts now records which provider created the checkout so the Whop
-- self-healing lookup (findMembershipByCheckout) only ever sees Whop rows.

alter table public.pro_checkouts
  add column provider text not null default 'whop'
  check (provider in ('whop','chariow'));

-- Chariow Pulse deliveries, for webhook deduplication on x-pulse-delivery-id.
create table if not exists public.chariow_pulse_deliveries (
  delivery_id text primary key,
  event text not null,
  sale_id text,
  profile_id uuid references public.profiles(id) on delete set null,
  processed_at timestamptz not null default now()
);

alter table public.chariow_pulse_deliveries enable row level security;

-- No user-facing rows: only the service role (bypasses RLS) writes/reads.
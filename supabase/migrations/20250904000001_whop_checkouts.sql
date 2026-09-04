-- Track Whop checkout configurations created for each profile.
-- Lets the subscription page resolve a membership id from the checkout
-- configuration id (ch_...) without depending solely on the webhook.

create table public.pro_checkouts (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  checkout_configuration_id text not null,
  created_at timestamptz not null default now()
);

alter table public.pro_checkouts enable row level security;

-- The user who started the checkout records and reads it.
create policy "Owner insert own pro checkout"
  on public.pro_checkouts for insert
  with check (auth.uid() = profile_id);

create policy "Owner view own pro checkout"
  on public.pro_checkouts for select
  using (auth.uid() = profile_id);

-- No update/delete policies for regular users.
-- Webhook / system reads go through the service role (bypasses RLS).

create index pro_checkouts_profile_id_idx on public.pro_checkouts(profile_id, created_at desc);
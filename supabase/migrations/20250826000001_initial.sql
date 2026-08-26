-- Bizko initial migration
-- Based on docs/06-database.md
-- Run in Supabase SQL Editor

-- Extensions
create extension if not exists "pgcrypto";

-- Helper: updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles: 1:1 with auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null,
  tagline text not null,
  bio text check (char_length(bio) <= 280),
  avatar_url text,
  city text not null,
  country text not null,
  phone_e164 text not null check (phone_e164 ~ '^\+\d{8,15}$'),
  email_public text,
  template text not null default 'minimal' check (template in ('minimal','portfolio')),
  locale text not null default 'fr' check (locale in ('fr','en')),
  is_public boolean not null default true,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_city on public.profiles(city);
create index idx_profiles_category on public.profiles(category) where category is not null;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  description text check (char_length(description) <= 140),
  price integer check (price >= 0),
  currency text not null default 'XOF' check (currency in ('XOF','EUR','USD')),
  position integer not null default 0
);

create index idx_services_profile_position on public.services(profile_id, position);

-- portfolio_items
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  title text,
  position integer not null default 0
);

create index idx_portfolio_profile_position on public.portfolio_items(profile_id, position);

-- social_links
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('instagram','tiktok','linkedin','facebook','x','youtube','behance','website')),
  url text not null check (url ~ '^https?://'),
  position integer not null default 0
);

create index idx_social_links_profile_position on public.social_links(profile_id, position);

-- events (analytics basic, SHOULD HAVE)
create table public.events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('view','click_whatsapp_main','click_whatsapp_service','click_tel')),
  service_id uuid references public.services(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_events_profile_type_created on public.events(profile_id, type, created_at);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.social_links enable row level security;
alter table public.events enable row level security;

-- profiles policies
-- Public can read public profiles
create policy "Public can view public profiles"
  on public.profiles for select
  using (is_public = true);

-- Users can view own profile (even if not public)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert own profile (id must match auth.uid)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can delete own profile
create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- services policies
create policy "Public can view services of public profiles"
  on public.services for select
  using (
    exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.is_public = true)
    or auth.uid() = (select id from public.profiles where id = services.profile_id)
  );

create policy "Owners can manage own services"
  on public.services for all
  using (auth.uid() = (select id from public.profiles where id = services.profile_id))
  with check (auth.uid() = (select id from public.profiles where id = services.profile_id));

-- portfolio policies (same pattern)
create policy "Public can view portfolio of public profiles"
  on public.portfolio_items for select
  using (
    exists (select 1 from public.profiles where profiles.id = portfolio_items.profile_id and profiles.is_public = true)
    or auth.uid() = (select id from public.profiles where id = portfolio_items.profile_id)
  );

create policy "Owners can manage own portfolio"
  on public.portfolio_items for all
  using (auth.uid() = (select id from public.profiles where id = portfolio_items.profile_id))
  with check (auth.uid() = (select id from public.profiles where id = portfolio_items.profile_id));

-- social_links policies
create policy "Public can view social links of public profiles"
  on public.social_links for select
  using (
    exists (select 1 from public.profiles where profiles.id = social_links.profile_id and profiles.is_public = true)
    or auth.uid() = (select id from public.profiles where id = social_links.profile_id)
  );

create policy "Owners can manage own social links"
  on public.social_links for all
  using (auth.uid() = (select id from public.profiles where id = social_links.profile_id))
  with check (auth.uid() = (select id from public.profiles where id = social_links.profile_id));

-- events policies
-- Public can insert view events? Allow anon insert for view tracking
create policy "Anyone can insert view events"
  on public.events for insert
  with check (true);

create policy "Owners can view own events"
  on public.events for select
  using (auth.uid() = (select id from public.profiles where id = events.profile_id));

-- Helper function: check username availability
create or replace function public.is_username_available(uname text)
returns boolean as $$
  select not exists (select 1 from public.profiles where username = lower(uname));
$$ language sql stable;

-- Storage buckets: create via SQL if not exists (Supabase storage)
-- Note: Run via storage API or dashboard; these inserts are for reference
-- insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('portfolio','portfolio', true) on conflict do nothing;

-- Storage RLS: allow public read, owner write (to be set via Dashboard > Storage > Policies)
-- Example policies below need storage schema access:
-- create policy "Public read avatars" on storage.objects for select using (bucket_id = 'avatars');
-- create policy "Users can upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
-- For MVP, set buckets public and add policies via Supabase Dashboard.

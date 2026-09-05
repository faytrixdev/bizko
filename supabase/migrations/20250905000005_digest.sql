-- Digest email hebdomadaire: préférences, envois et RPC d'agrégats

-- Préférences de désinscription (1 ligne par profil)
create table if not exists public.digest_prefs (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  unsubscribed_at timestamptz null
);

-- Historique des envois hebdomadaires (clé ISO week, ex: "2026-W36")
create table if not exists public.digest_sends (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week text not null,
  sent_at timestamptz not null default now(),
  email text not null,
  primary key (profile_id, week)
);

-- RLS sur digest_prefs : propriétaire seulement (préférences privées)
alter table public.digest_prefs enable row level security;

create policy if not exists "Owner can view own digest prefs"
  on public.digest_prefs for select
  using (auth.uid() = profile_id);

create policy if not exists "Owner can insert own digest prefs"
  on public.digest_prefs for insert
  with check (auth.uid() = profile_id);

create policy if not exists "Owner can update own digest prefs"
  on public.digest_prefs for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy if not exists "Owner can delete own digest prefs"
  on public.digest_prefs for delete
  using (auth.uid() = profile_id);

-- RLS sur digest_sends : propriétaire seulement
alter table public.digest_sends enable row level security;

create policy if not exists "Owner can view own digest sends"
  on public.digest_sends for select
  using (auth.uid() = profile_id);

create policy if not exists "Owner can insert own digest sends"
  on public.digest_sends for insert
  with check (auth.uid() = profile_id);

create policy if not exists "Owner can update own digest sends"
  on public.digest_sends for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy if not exists "Owner can delete own digest sends"
  on public.digest_sends for delete
  using (auth.uid() = profile_id);

-- RPC: agrégats hebdomadaires pour le digest
-- Retourne: { views, clicks, prev_views, prev_clicks, top_service_name, top_service_count, has_activity }
create or replace function public.get_profile_weekly_digest(p_profile_id uuid)
returns jsonb
language sql
security definer
set search_path = pg_catalog, public
as $$
  with cur as (
    select
      count(*) filter (where type = 'view') as views,
      count(*) filter (where type like 'click%') as clicks
    from public.events
    where profile_id = p_profile_id
      and created_at >= now() - interval '7 days'
      and created_at <= now()
  ),
  prev as (
    select
      count(*) filter (where type = 'view') as views,
      count(*) filter (where type like 'click%') as clicks
    from public.events
    where profile_id = p_profile_id
      and created_at >= now() - interval '14 days'
      and created_at < now() - interval '7 days'
  ),
  top as (
    select s.title as service_name, count(e.id) as seen
    from public.events e
    join public.services s on s.id = e.service_id
    where e.profile_id = p_profile_id
      and e.type ILIKE 'click%'
      and e.service_id is not null
      and e.created_at >= now() - interval '7 days'
      and e.created_at <= now()
    group by s.title
    order by seen desc
    limit 1
  )
  select jsonb_build_object(
    'views', (select views from cur),
    'clicks', (select clicks from cur),
    'prev_views', (select views from prev),
    'prev_clicks', (select clicks from prev),
    'top_service_name', (select service_name from top),
    'top_service_count', coalesce((select seen from top), 0),
    'has_activity', ((select views from cur) + (select clicks from cur) > 0)
  );
$$;

revoke all on function public.get_profile_weekly_digest(uuid) from public;
grant execute on function public.get_profile_weekly_digest(uuid) to authenticated;

-- Indexes for RPC query performance
create index if not exists idx_events_profile_created on public.events (profile_id, created_at);
create index if not exists idx_events_profile_type_created on public.events (profile_id, type, created_at);
create index if not exists idx_events_profile_service_type_created on public.events (profile_id, service_id, type, created_at);
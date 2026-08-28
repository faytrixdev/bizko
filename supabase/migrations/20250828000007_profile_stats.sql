-- ============================================================
-- profile_stats — aggregated view/click counters per profile.
-- Removes the need for exact count(*) scans on events for the
-- dashboard, keeping it fast even when the events table grows.
-- ============================================================

create table if not exists public.profile_stats (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  views bigint not null default 0,
  clicks bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profile_stats enable row level security;

create policy "Owners can view own stats"
  on public.profile_stats
  for select
  using (auth.uid() = profile_id);

grant select on public.profile_stats to authenticated;

-- ============================================================
-- record_event — also maintain the aggregate counters.
-- Counters keep counting past the raw-event cap (50k/profile)
-- so analytics stay accurate without unbounded storage.
-- ============================================================

create or replace function public.record_event(
  p_profile_id uuid,
  p_type text,
  p_service_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_view boolean;
begin
  -- Validate the event type against the allowed set
  if not (p_type ~ '^(view|click_.+)$') then
    raise exception 'invalid event type';
  end if;

  -- The targeted profile must exist and be public
  if not exists (
    select 1 from public.profiles where id = p_profile_id and is_public = true
  ) then
    raise exception 'profile not found or not public';
  end if;

  -- If a service id is given, it must belong to that profile
  if p_service_id is not null and not exists (
    select 1 from public.services where id = p_service_id and profile_id = p_profile_id
  ) then
    raise exception 'service does not belong to profile';
  end if;

  v_is_view := (p_type = 'view');

  -- Aggregate counters (always, even past the raw-event cap)
  insert into public.profile_stats (profile_id, views, clicks)
  values (
    p_profile_id,
    case when v_is_view then 1 else 0 end,
    case when v_is_view then 0 else 1 end
  )
  on conflict (profile_id) do update set
    views = public.profile_stats.views + excluded.views,
    clicks = public.profile_stats.clicks + excluded.clicks,
    updated_at = now();

  -- Bound the number of stored raw events so analytics cannot be flooded.
  if (select count(*) from public.events where profile_id = p_profile_id) >= 50000 then
    return;
  end if;

  insert into public.events (profile_id, type, service_id)
  values (p_profile_id, p_type, p_service_id);
end;
$$;

grant execute on function public.record_event(uuid, text, uuid) to anon, authenticated;

-- ============================================================
-- Backfill the counters from the existing raw events.
-- ============================================================

insert into public.profile_stats (profile_id, views, clicks)
select
  profile_id,
  count(*) filter (where type = 'view'),
  count(*) filter (where type <> 'view')
from public.events
group by profile_id
on conflict (profile_id) do update set
  views = public.profile_stats.views + excluded.views,
  clicks = public.profile_stats.clicks + excluded.clicks,
  updated_at = now();
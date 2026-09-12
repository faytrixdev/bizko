-- ============================================================
-- Fix analytics: attribute service_id to click_service events.
--
-- click_service_<uuid> events were inserted with service_id = NULL,
-- so the weekly digest's "top service" never matched (NULL service_id
-- filtered out) and the click events were not attributable to a service.
-- record_event now derives + validates the service id from the type and
-- existing rows are backfilled from the type string.
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
  v_service_id uuid;
begin
  if not (p_type ~ '^(view|click_.+)$') then
    raise exception 'invalid event type';
  end if;

  if not exists (
    select 1 from public.profiles where id = p_profile_id and is_public = true
  ) then
    raise exception 'profile not found or not public';
  end if;

  -- click_service_<uuid> encodes the service id: extract and validate it so
  -- events stay attributable to a service (digest top-service, breakdown).
  if p_type like 'click_service_%' then
    begin
      v_service_id := substring(
        p_type from '^click_service_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$'
      )::uuid;
    exception when others then
      v_service_id := null;
    end;
    if v_service_id is null then
      raise exception 'invalid service id in type';
    end if;
    if p_service_id is not null and p_service_id <> v_service_id then
      raise exception 'service id mismatch';
    end if;
    if not exists (
      select 1 from public.services where id = v_service_id and profile_id = p_profile_id
    ) then
      raise exception 'service does not belong to profile';
    end if;
  end if;

  -- Explicit p_service_id must still belong to the profile
  if p_service_id is not null and p_type not like 'click_service_%' and not exists (
    select 1 from public.services where id = p_service_id and profile_id = p_profile_id
  ) then
    raise exception 'service does not belong to profile';
  end if;

  v_is_view := (p_type = 'view');

  -- Aggregate counters (always counted, even past the raw-event window)
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

  insert into public.events (profile_id, type, service_id)
  values (p_profile_id, p_type, coalesce(p_service_id, v_service_id));

  -- Rolling window: keep the 50k most recent raw events per profile so the
  -- 7-day trend and click breakdown stay live instead of freezing at the cap.
  delete from public.events e
  where e.profile_id = p_profile_id
    and e.id in (
      select e2.id from public.events e2
      where e2.profile_id = p_profile_id
      order by e2.created_at, e2.id
      offset 50000
    );
end;
$$;

-- Backfill existing click_service_* rows from the type string.
update public.events e
set service_id = t.sid
from (
  select id,
    substring(
      type from '^click_service_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$'
    )::uuid as sid
  from public.events
  where type like 'click_service_%'
    and service_id is null
) t
where e.id = t.id
  and t.sid is not null
  and exists (select 1 from public.services s where s.id = t.sid);

grant execute on function public.record_event(uuid, text, uuid) to anon, authenticated;

NOTIFY pgrst, 'reload schema';
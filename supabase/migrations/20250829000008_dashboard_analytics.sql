-- ============================================================
-- dashboard_analytics — helpers to feed the dashboard analytics
-- (7-day trend + click breakdown) without heavy client-side
-- processing and without exposing another profile's data.
--
-- Both functions are SECURITY DEFINER and enforce ownership
-- (auth.uid() must equal the requested profile), so they stay
-- safe even though they bypass row-level security.
-- ============================================================

-- 7-day breakdown of clicks by source bucket.
create or replace function public.get_profile_clicks_breakdown(
  p_profile_id uuid,
  p_days int default 7
)
returns table (bucket text, count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() <> p_profile_id then
    raise exception 'forbidden';
  end if;

  return query
  select t.bucket, count(*)::bigint
  from (
    select case
      when type = 'click_main' then 'main'
      when type = 'click_sticky' then 'sticky'
      when type = 'click_floating' then 'floating'
      when type = 'click_tel' then 'tel'
      when type like 'click_service_%' then 'service'
      else 'other'
    end as bucket
    from public.events
    where profile_id = p_profile_id
      and type <> 'view'
      and created_at >= (current_date - (p_days - 1))::timestamptz
  ) t
  group by t.bucket
  order by count desc;
end;
$$;

-- Per-day view/click counts over the last p_days (zero-filled so the
-- client always gets a full series even on days with no activity).
create or replace function public.get_daily_events(
  p_profile_id uuid,
  p_days int default 7
)
returns table (day date, views bigint, clicks bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() <> p_profile_id then
    raise exception 'forbidden';
  end if;

  return query
  select g.dt::date as day,
    count(e.id) filter (where e.type = 'view')::bigint as views,
    count(e.id) filter (where e.type <> 'view')::bigint as clicks
  from generate_series(
    (current_date - (p_days - 1))::date,
    current_date,
    '1 day'::interval
  ) as g(dt)
  left join public.events e
    on e.profile_id = p_profile_id
    and e.created_at >= g.dt
    and e.created_at < g.dt + interval '1 day'
  group by g.dt
  order by g.dt;
end;
$$;

grant execute on function public.get_profile_clicks_breakdown(uuid, int) to authenticated;
grant execute on function public.get_daily_events(uuid, int) to authenticated;

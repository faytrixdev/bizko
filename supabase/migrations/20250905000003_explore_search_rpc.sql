-- search_public_profiles : annuaire public, profils is_public uniquement
create or replace function public.search_public_profiles(
  p_query text default null,
  p_city text default null,
  p_category text default null,
  p_limit int default 24,
  p_offset int default 0
)
returns table (
  id uuid,
  username text,
  display_name text,
  tagline text,
  avatar_url text,
  city text,
  country text,
  category text,
  template text,
  is_pro boolean,
  total bigint
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    p.id,
    p.username,
    p.display_name,
    p.tagline,
    p.avatar_url,
    p.city,
    p.country,
    p.category,
    p.template,
    case
      when s.plan = 'pro' and s.status in ('active', 'trialing') then true
      else false
    end as is_pro,
    count(*) over ()::bigint as total
  from public.profiles p
  left join public.subscriptions s on s.profile_id = p.id
  where p.is_public = true
    and (
      p_query is null or p_query = ''
      or p.username ilike '%' || p_query || '%'
      or p.display_name ilike '%' || p_query || '%'
      or p.city ilike '%' || p_query || '%'
      or p.category ilike '%' || p_query || '%'
      or p.bio ilike '%' || p_query || '%'
    )
    and (p_city is null or p_city = '' or p.city = p_city)
    and (p_category is null or p_category = '' or p.category = p_category)
  order by is_pro desc, p.display_name asc
  limit greatest(least(p_limit, 48), 1)
  offset greatest(p_offset, 0);
$$;

revoke all on function public.search_public_profiles(text, text, text, int, int) from public;
grant execute on function public.search_public_profiles(text, text, text, int, int) to anon, authenticated;

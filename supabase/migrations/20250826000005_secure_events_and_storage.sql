-- Security hardening: events & storage RLS
-- Run after 00004_expand_currencies.sql
-- 1) Storage: enforce file ownership (files stored under <auth.uid>/...)
-- 2) Events: remove broad anon insert, route inserts through a SECURITY DEFINER RPC

-- ============================================================
-- 1) STORAGE RLS — ownership via first path segment
--    Uploads are written to `${profileId}/...` where profiles.id = auth.users.id,
--    so (storage.foldername(name))[1] is the owner's uid.
-- ============================================================

drop policy if exists "Owners can update own avatars" on storage.objects;
drop policy if exists "Owners can delete own avatars" on storage.objects;
drop policy if exists "Owners can update own portfolio" on storage.objects;
drop policy if exists "Owners can delete own portfolio" on storage.objects;

create policy "Owners can update own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners can delete own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners can update own portfolio"
  on storage.objects for update
  using (
    bucket_id = 'portfolio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'portfolio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners can delete own portfolio"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 2) EVENTS — remove broad anon insert, use a validated RPC
-- ============================================================

-- Revoke the permissive "anyone can insert" policy
drop policy if exists "Anyone can insert view events" on public.events;

-- SECURITY DEFINER RPC: validates the profile type so anon clients
-- cannot freely insert arbitrary events.
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

  insert into public.events (profile_id, type, service_id)
  values (p_profile_id, p_type, p_service_id);
end;
$$;

grant execute on function public.record_event(uuid, text, uuid) to anon, authenticated;

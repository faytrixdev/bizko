-- Security & integrity hardening (run after 00005_secure_events_and_storage.sql)
-- 1) Storage: restrict uploads to image content types (SVG/HTML/JS upload -> stored XSS)
-- 2) is_username_available: make SECURITY DEFINER so private usernames are respected
-- 3) record_event: bound volume per profile to prevent analytics flooding

-- ============================================================
-- 1) STORAGE — restrict upload content_type to images
-- ============================================================

drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Authenticated users can upload portfolio" on storage.objects;

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
    and content_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

create policy "Authenticated users can upload portfolio"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
    and content_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

-- Also guard UPDATE (objects can be overwritten/upserted): keep the same
-- content_type restriction on the new version of the object.
drop policy if exists "Owners can update own avatars" on storage.objects;
drop policy if exists "Owners can update own portfolio" on storage.objects;

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
    and content_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
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
    and content_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

-- ============================================================
-- 2) is_username_available — SECURITY DEFINER to see all profiles
-- ============================================================

create or replace function public.is_username_available(uname text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (select 1 from public.profiles where username = lower(uname));
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

-- ============================================================
-- 3) record_event — bound the number of stored events per profile.
--    Prevents analytics flooding / unbounded table growth.
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

  -- Bound the number of stored raw events so analytics cannot be flooded.
  -- (Optional extension point: replace this with per-minute rate limiting.)
  if (select count(*) from public.events where profile_id = p_profile_id) >= 50000 then
    raise exception 'event limit reached for profile';
  end if;

  insert into public.events (profile_id, type, service_id)
  values (p_profile_id, p_type, p_service_id);
end;
$$;

grant execute on function public.record_event(uuid, text, uuid) to anon, authenticated;

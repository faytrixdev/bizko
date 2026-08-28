-- Security & integrity hardening (run after 00005_secure_events_and_storage.sql)
-- 1) Storage: restrict uploads to image content types (SVG/HTML/JS upload -> stored XSS)
-- 2) is_username_available: make SECURITY DEFINER so private usernames are respected
-- 3) record_event: bound volume per profile to prevent analytics flooding

-- ============================================================
-- 1) STORAGE — restrict upload content type to images.
--    Where the MIME lives differs by storage version: recent
--    versions store it in metadata (jsonb), intermediate ones
--    use a content_type column, old ones a mimetype column.
--    We detect which exists and build the policies dynamically.
-- ============================================================

do $$
declare
  mime_expr text;
begin
  -- The MIME column differs by storage version:
  --   recent variants : metadata->>'mimetype' (jsonb, no dedicated column)
  --   intermediate     : content_type column
  --   old              : mimetype column
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'storage' and table_name = 'objects'
      and column_name = 'content_type'
  ) then
    mime_expr := 'content_type';
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'storage' and table_name = 'objects'
      and column_name = 'mimetype'
  ) then
    mime_expr := 'mimetype';
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'storage' and table_name = 'objects'
      and column_name = 'metadata'
  ) then
    mime_expr := 'coalesce(metadata->>''mimetype'', metadata->>''contentType'', metadata->>''content_type'')';
  else
    raise exception 'storage.objects has no MIME column (mimetype/content_type/metadata)';
  end if;

  -- INSERT policies
  execute format(
    'drop policy if exists "Authenticated users can upload avatars" on storage.objects'
  );
  execute format(
    'create policy "Authenticated users can upload avatars"
       on storage.objects for insert
       with check (
         bucket_id = ''avatars''
         and auth.role() = ''authenticated''
         and (storage.foldername(name))[1] = auth.uid()::text
         and (%s) in (''image/jpeg'', ''image/png'', ''image/webp'', ''image/gif'')
       )',
    mime_expr
  );

  execute format(
    'drop policy if exists "Authenticated users can upload portfolio" on storage.objects'
  );
  execute format(
    'create policy "Authenticated users can upload portfolio"
       on storage.objects for insert
       with check (
         bucket_id = ''portfolio''
         and auth.role() = ''authenticated''
         and (storage.foldername(name))[1] = auth.uid()::text
         and (%s) in (''image/jpeg'', ''image/png'', ''image/webp'', ''image/gif'')
       )',
    mime_expr
  );

  -- UPDATE policies (objects can be overwritten/upserted): keep the same
  -- content type restriction on the new version of the object.
  execute format(
    'drop policy if exists "Owners can update own avatars" on storage.objects'
  );
  execute format(
    'create policy "Owners can update own avatars"
       on storage.objects for update
       using (
         bucket_id = ''avatars''
         and auth.role() = ''authenticated''
         and (storage.foldername(name))[1] = auth.uid()::text
       )
       with check (
         bucket_id = ''avatars''
         and auth.role() = ''authenticated''
         and (storage.foldername(name))[1] = auth.uid()::text
         and (%s) in (''image/jpeg'', ''image/png'', ''image/webp'', ''image/gif'')
       )',
    mime_expr
  );

  execute format(
    'drop policy if exists "Owners can update own portfolio" on storage.objects'
  );
  execute format(
    'create policy "Owners can update own portfolio"
       on storage.objects for update
       using (
         bucket_id = ''portfolio''
         and auth.role() = ''authenticated''
         and (storage.foldername(name))[1] = auth.uid()::text
       )
       with check (
         bucket_id = ''portfolio''
         and auth.role() = ''authenticated''
         and (storage.foldername(name))[1] = auth.uid()::text
         and (%s) in (''image/jpeg'', ''image/png'', ''image/webp'', ''image/gif'')
       )',
    mime_expr
  );
end;
$$;

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

-- ============================================================
-- Audit de sécurité #7 — témoignages + storage.
--
-- A) Témoignages : n'importe qui pouvait insérer un témoignage « pending »
--    sur N'IMPORTE quel profile_id, directement via PostgREST, sans que
--    le profil existe/public soit vérifié, et sans rate-limit réel (celui
--    de la server action est en mémoire) :
--      POST /rest/v1/testimonials
--      {"profile_id":"<uuid>","author_name":"x","content":"spam",
--       "is_published":false}
--    => insertion directe révoquée pour anon + policy visiteur supprimée :
--       les visiteurs passent par submit_testimonial() qui valide (profil
--       public, bornes de champs) et rate-limite en base.
--    Le propriétaire garde l'insertion directe (témoignages publiés depuis
--    le dashboard) via la policy « Owners can manage own testimonials ».
--
-- B) Storage : les policies `SELECT … using (bucket_id = '…')` permettaient
--    à un anonyme de LISTER tout le bucket (/storage/v1/object/list/…),
--    donc d'énumérer tous les UUID utilisateurs et leurs fichiers.
--    Les téléchargements publics ne sont pas concernés (les buckets sont
--    `public` et /object/public/* est servi en superuser, hors RLS) ; on
--    remplace donc la lecture par une policy limitée au PROPRIÉTAIRE, qui
--    conserve aussi le fonctionnement de `upload(..., { upsert: true })`
--    (l'upsert nécessite SELECT + UPDATE).
-- ============================================================

-- ------------------------------------------------------------
-- A) Témoignages
-- ------------------------------------------------------------

drop policy if exists "Visitors can submit pending testimonials" on public.testimonials;

-- Les visiteurs anonymes n'ont plus d'accès direct en écriture.
revoke insert on public.testimonials from anon;

create or replace function public.submit_testimonial(
  p_profile_id uuid,
  p_author_name text,
  p_author_role text default null,
  p_content text default null,
  p_rating smallint default null,
  p_throttle_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_name text := btrim(coalesce(p_author_name, ''));
  v_author_role text := nullif(btrim(coalesce(p_author_role, '')), '');
  v_content text := btrim(coalesce(p_content, ''));
  v_id uuid;
begin
  -- Le profil cible doit exister ET être public.
  if not exists (
    select 1 from public.profiles where id = p_profile_id and is_public = true
  ) then
    raise exception 'profile not found or not public';
  end if;

  if length(v_author_name) < 1 or length(v_author_name) > 120 then
    raise exception 'invalid author name';
  end if;
  if v_author_role is not null and length(v_author_role) > 120 then
    raise exception 'invalid author role';
  end if;
  if length(v_content) < 1 or length(v_content) > 400 then
    raise exception 'invalid content';
  end if;
  if p_rating is not null and (p_rating < 1 or p_rating > 5) then
    raise exception 'invalid rating';
  end if;

  -- 6 témoignages / minute / (profil, client) — même limite que la
  -- constante TESTIMONIAL_RATE_LIMIT de la server action, mais partagée
  -- entre toutes les instances serverless.
  if not public.bump_rpc_throttle(
    'testimonial',
    p_throttle_key,
    p_profile_id::text,
    6,
    60
  ) then
    raise exception 'rate limited';
  end if;

  insert into public.testimonials (
    profile_id, author_name, author_role, content, rating, is_published
  )
  values (
    p_profile_id, v_author_name, v_author_role, v_content, p_rating, false
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_testimonial(uuid, text, text, text, smallint, text)
  from public;
grant execute on function public.submit_testimonial(uuid, text, text, text, smallint, text)
  to anon, authenticated;

-- ------------------------------------------------------------
-- B) Storage : lecture réservée au propriétaire (plus d'énumération)
-- ------------------------------------------------------------

drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Public read portfolio" on storage.objects;

drop policy if exists "Owners can read own avatars" on storage.objects;
create policy "Owners can read own avatars"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Owners can read own portfolio" on storage.objects;
create policy "Owners can read own portfolio"
  on storage.objects for select
  using (
    bucket_id = 'portfolio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

notify pgrst, 'reload schema';

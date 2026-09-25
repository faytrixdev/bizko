-- ============================================================
-- Audit de sécurité #1 — profiles : les colonnes privilégiées ne sont
-- PLUS modifiables par l'utilisateur (escalade admin / Pro gratuite).
--
-- Vulnérabilité corrigée :
--   create policy "Users can update own profile" on public.profiles
--     for update using (auth.uid() = id);           -- sans WITH CHECK
--   + colonnes is_admin / is_partner / partner_code / commission_rate
--     ajoutées par les migrations 00010 et 00002 (partner program).
--
--   Une policy UPDATE sans WITH CHECK réutilise son USING comme contrôle
--   de la nouvelle ligne, et Supabase accorde par défaut tous les
--   privilèges de table à anon/authenticated. N'importe quel compte
--   connecté pouvait donc faire :
--     PATCH /rest/v1/profiles?id=eq.<uid>  {"is_admin":true}
--   => accès total à l'admin (RPC, /admin/*, actions partenaires) ou
--      PATCH {"is_partner":true,"commission_rate":100} => Pro gratuit.
--
-- Défense en profondeur, 3 couches :
--   1) privilèges colonne (les colonnes sensibles ne sont plus insérables
--      ni modifiables par anon/authenticated) ;
--   2) policies UPDATE/INSERT avec WITH CHECK explicite ;
--   3) trigger de garde qui réimpose les valeurs protégées.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Privilèges colonne : n'autoriser que les colonnes « profil »
-- ------------------------------------------------------------

-- Le rôle anonyme n'a jamais besoin d'écrire un profil.
revoke insert, update, delete on public.profiles from anon;

-- L'utilisateur authentifié peut créer/son profil mais uniquement les
-- colonnes de présentation. Les colonnes de privilège (is_admin,
-- is_partner, partner_code, commission_rate) sont volontairement exclues :
-- elles restent modifiables uniquement par le service role (webhooks,
-- back-office admin, scripts).
revoke insert, update on public.profiles from authenticated;

grant insert (
  id,
  username,
  display_name,
  tagline,
  bio,
  avatar_url,
  city,
  country,
  phone_e164,
  email_public,
  template,
  locale,
  is_public,
  category
) on public.profiles to authenticated;

grant update (
  display_name,
  tagline,
  bio,
  avatar_url,
  city,
  country,
  phone_e164,
  email_public,
  template,
  locale,
  is_public,
  category
) on public.profiles to authenticated;

-- ------------------------------------------------------------
-- 2) Policies : WITH CHECK explicite + interdiction d'auto-privilège
-- ------------------------------------------------------------

-- Les colonnes de privilège n'étant plus insérables ni modifiables
-- (couche 1), le WITH CHECK se limite à l'ownership : un WITH CHECK
-- comparant is_admin/is_partner casserait la mise à jour du profil par
-- l'admin lui-même ou par un partenaire (leur propre ligne porte déjà
-- ces valeurs à true).
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- 3) Trigger de garde : toute requête portée par un utilisateur
--    (auth.uid() non nul, y compris depuis une fonction SECURITY
--    DEFINER) conserve les valeurs protégées. Le service role
--    (auth.uid() nul) et le SQL direct les conservent modifiables.
-- ------------------------------------------------------------

create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.is_admin        := old.is_admin;
    new.is_partner      := old.is_partner;
    new.partner_code    := old.partner_code;
    new.commission_rate := old.commission_rate;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_privileged on public.profiles;
create trigger trg_protect_profile_privileged
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

notify pgrst, 'reload schema';

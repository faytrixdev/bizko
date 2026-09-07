-- ============================================================
-- Bizko: allow Pro subscription before a profile exists.
--
-- During onboarding the profile row does not exist yet. When a brand-new
-- user upgrades to Pro from the onboarding template picker (step 2), the
-- Whop webhook tries to upsert `subscriptions` with profile_id = user.id,
-- which violates the FK to public.profiles(id) -> the payment succeeds but
-- the user never becomes Pro. Same for `pro_checkouts`.
--
-- profiles.id already references auth.users(id) on delete cascade, so
-- pointing these FKs at auth.users(id) keeps account deletion cascading
-- (auth user -> profiles -> subscriptions), and lets the subscription /
-- checkout row land before the profile is created (profiles.id = user.id,
-- so lookups by profile_id still match).
-- ============================================================

alter table public.subscriptions
  drop constraint subscriptions_profile_id_fkey,
  add constraint subscriptions_profile_id_fkey
    foreign key (profile_id) references auth.users(id) on delete cascade;

alter table public.pro_checkouts
  drop constraint pro_checkouts_profile_id_fkey,
  add constraint pro_checkouts_profile_id_fkey
    foreign key (profile_id) references auth.users(id) on delete cascade;
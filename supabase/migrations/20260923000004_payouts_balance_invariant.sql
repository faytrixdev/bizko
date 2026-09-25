-- ============================================================
-- Audit de sécurité #4 — payouts : l'invariant de solde est désormais
-- garanti par la base, pas par l'application.
--
-- Vulnérabilité corrigée :
--   la policy d'insertion ne vérifiait que `partner_id = auth.uid()`
--   et `is_active_partner(partner_id)`. Le montant était borné
--   uniquement dans la server action (dashboard/partner/actions.ts),
--   donc contournable en appelant PostgREST directement :
--     POST /rest/v1/payouts {"partner_id":"<moi>","amount":100000000,...}
--   (combiné à l'escalade `is_partner` corrigée par la migration #1).
--
-- Correction : l'insertion directe est révoquée, les demandes passent par
-- request_payout(), SECURITY DEFINER, qui recalcule le solde disponible
-- dans la même transaction.
-- ============================================================

drop policy if exists "Partner can request their payouts" on public.payouts;

revoke insert on public.payouts from anon, authenticated;

-- ------------------------------------------------------------
-- request_payout : seule voie d'insertion pour un partenaire.
-- Le solde disponible est recalculé ici :
--   commissions approuvées - (payouts pending + paid)
-- et doit couvrir le montant demandé (pas de retrait à découvert).
-- 5000 = MIN_PAYOUT_AMOUNT (src/lib/partner/commissions.ts).
-- ------------------------------------------------------------
create or replace function public.request_payout(
  p_amount integer,
  p_method text,
  p_account_identifier text,
  p_account_holder text default null,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_available bigint;
  v_method text := btrim(coalesce(p_method, ''));
  v_account text := btrim(coalesce(p_account_identifier, ''));
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  if not exists (
    select 1 from public.profiles where id = v_uid and is_partner = true
  ) then
    raise exception 'not_partner';
  end if;

  if p_amount is null or p_amount < 5000 then
    raise exception 'below_minimum';
  end if;

  if v_method = '' or v_account = '' then
    raise exception 'incomplete';
  end if;

  select
    coalesce((
      select sum(c.amount) from public.commissions c
      where c.partner_id = v_uid and c.status = 'approved'
    ), 0)
    - coalesce((
      select sum(p.amount) from public.payouts p
      where p.partner_id = v_uid and p.status in ('pending', 'paid')
    ), 0)
  into v_available;

  if p_amount > v_available then
    raise exception 'insufficient_balance';
  end if;

  insert into public.payouts (
    partner_id, amount, method, account_identifier, account_holder, details
  )
  values (
    v_uid,
    p_amount,
    v_method,
    v_account,
    nullif(btrim(coalesce(p_account_holder, '')), ''),
    nullif(btrim(coalesce(p_details, '')), '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.request_payout(integer, text, text, text, text)
  from public, anon;
grant execute on function public.request_payout(integer, text, text, text, text)
  to authenticated;

notify pgrst, 'reload schema';

-- ============================================================
-- Audit de sécurité #3 — helper générique de rate-limit côté base.
--
-- Les limites applicatives (src/lib/rateLimit.ts) sont en mémoire et donc
-- inefficaces sur plusieurs instances serverless : un attaquant peut les
-- contourner en appelant les RPC PostgREST directement. Ce helper déplace
-- la limite DANS la base, au plus près de l'écriture.
--
-- La table n'a AUCUNE policy RLS : seuls le service role et les fonctions
-- SECURITY DEFINER (qui s'exécutent en tant que propriétaire) y accèdent.
-- ============================================================

create table if not exists public.rpc_throttle (
  scope text not null,
  throttle_key text not null,
  bucket_key text not null default '',
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (scope, throttle_key, bucket_key, window_start)
);

create index if not exists idx_rpc_throttle_window on public.rpc_throttle (window_start);

alter table public.rpc_throttle enable row level security;
revoke all on table public.rpc_throttle from anon, authenticated;

-- ------------------------------------------------------------
-- bump_rpc_throttle : incrémente un compteur de fenêtre et renvoie
-- true tant que la limite n'est pas dépassée.
--   p_scope           : 'event' | 'analytics' | 'testimonial' | ...
--   p_throttle_key    : identifiant client (hash d'IP côté serveur).
--                       NULL/vide => pas de limite (appelant de confiance
--                       uniquement, jamais depuis le navigateur).
--   p_bucket_key      : cible (profil, service, event name…).
--   p_limit           : nb max d'appels par fenêtre.
--   p_window_seconds  : taille de la fenêtre (défaut 60 s).
-- ------------------------------------------------------------
create or replace function public.bump_rpc_throttle(
  p_scope text,
  p_throttle_key text,
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seconds integer := greatest(coalesce(p_window_seconds, 60), 1);
  v_window timestamptz;
  v_hits integer;
begin
  if p_throttle_key is null or btrim(p_throttle_key) = '' then
    return true;
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from now()) / v_seconds) * v_seconds
  );

  insert into public.rpc_throttle (scope, throttle_key, bucket_key, window_start, hits)
  values (p_scope, p_throttle_key, coalesce(p_bucket_key, ''), v_window, 1)
  on conflict (scope, throttle_key, bucket_key, window_start)
  do update set hits = public.rpc_throttle.hits + 1
  returning hits into v_hits;

  -- Purge opportuniste des fenêtres anciennes (évite une table qui grossit
  -- indéfiniment, sans dépendre d'un cron).
  if random() < 0.01 then
    delete from public.rpc_throttle where window_start < now() - interval '1 hour';
  end if;

  return v_hits <= greatest(coalesce(p_limit, 1), 1);
end;
$$;

revoke all on function public.bump_rpc_throttle(text, text, text, integer, integer)
  from public, anon, authenticated;

notify pgrst, 'reload schema';

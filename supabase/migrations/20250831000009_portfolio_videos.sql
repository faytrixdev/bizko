-- Portfolio media : supports images ET videos uploadées
alter table public.portfolio_items
  rename column image_url to media_url;

alter table public.portfolio_items
  add column media_type text not null default 'image'
    check (media_type in ('image','video'));

alter table public.portfolio_items
  add column thumbnail_url text;

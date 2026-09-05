create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 120),
  author_role text check (author_role is null or char_length(author_role) between 1 and 120),
  content text not null check (char_length(content) between 1 and 400),
  rating smallint check (rating between 1 and 5),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_testimonials_profile on public.testimonials(profile_id, is_published);

alter table public.testimonials enable row level security;

create policy "public read published" on public.testimonials
  for select using (is_published = true);

create policy "owner all" on public.testimonials
  for all using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "visitor insert pending" on public.testimonials
  for insert to anon, authenticated
  with check (auth.uid() is distinct from profile_id and is_published = false);

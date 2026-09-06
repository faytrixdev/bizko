-- 6 public profiles templates (2 free + 4 pro).
-- The current constraint was created inline in 20250826000001_initial.sql with the
-- implicit name `profiles_template_check`.
alter table public.profiles
  drop constraint if exists profiles_template_check;

alter table public.profiles
  add constraint profiles_template_check check (
    template in ('minimal', 'portfolio', 'studio', 'edito', 'urban', 'obsidienne')
  );
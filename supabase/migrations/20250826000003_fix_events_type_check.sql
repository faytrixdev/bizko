-- Fix events type check constraint to accept any click_* pattern
-- Previous constraint was too restrictive

alter table public.events drop constraint if exists events_type_check;

alter table public.events add constraint events_type_check check (type ~ '^(view|click_.+)$');

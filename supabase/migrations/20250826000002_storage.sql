-- Storage buckets for Bizko
-- Run after 00001_initial.sql

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- Policies for avatars bucket
create policy "Public read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Owners can update own avatars"
on storage.objects for update
using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Owners can delete own avatars"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Policies for portfolio bucket
create policy "Public read portfolio"
on storage.objects for select
using (bucket_id = 'portfolio');

create policy "Authenticated users can upload portfolio"
on storage.objects for insert
with check (bucket_id = 'portfolio' and auth.role() = 'authenticated');

create policy "Owners can update own portfolio"
on storage.objects for update
using (bucket_id = 'portfolio' and auth.role() = 'authenticated');

create policy "Owners can delete own portfolio"
on storage.objects for delete
using (bucket_id = 'portfolio' and auth.role() = 'authenticated');

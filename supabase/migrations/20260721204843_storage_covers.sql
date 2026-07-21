-- supabase/migrations/XXXXXXXXXXXXXX_storage_covers.sql
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "public_read_covers" on storage.objects
  for select using (bucket_id = 'covers');

create policy "admin_write_covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'covers');

create policy "admin_update_covers" on storage.objects
  for update to authenticated using (bucket_id = 'covers');
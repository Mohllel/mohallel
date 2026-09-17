-- bucket عام لصور الأندية (شعار/زي/غلاف/صور لاعبين) — قراءة عامة، كتابة محصورة بمجلد كل مستخدم
insert into storage.buckets (id, name, public)
values ('club-media', 'club-media', true)
on conflict (id) do nothing;

create policy "public read club-media" on storage.objects for select using (
  bucket_id = 'club-media'
);

create policy "users upload to own folder" on storage.objects for insert with check (
  bucket_id = 'club-media' and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users update own folder" on storage.objects for update using (
  bucket_id = 'club-media' and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users delete own folder" on storage.objects for delete using (
  bucket_id = 'club-media' and (storage.foldername(name))[1] = auth.uid()::text
);

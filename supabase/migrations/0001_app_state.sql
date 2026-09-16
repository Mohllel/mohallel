-- جدول تخزين عام يخدم كل متاجر التطبيق (النادي، المباريات، التدريب) كنسخة JSON واحدة لكل مستخدم.
-- يُشغَّل مرة واحدة يدوياً من SQL Editor في لوحة Supabase.
create table if not exists app_state (
  user_id uuid references auth.users(id) on delete cascade not null,
  store_name text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, store_name)
);

alter table app_state enable row level security;

create policy "select own state" on app_state for select using (auth.uid() = user_id);
create policy "insert own state" on app_state for insert with check (auth.uid() = user_id);
create policy "update own state" on app_state for update using (auth.uid() = user_id);
create policy "delete own state" on app_state for delete using (auth.uid() = user_id);

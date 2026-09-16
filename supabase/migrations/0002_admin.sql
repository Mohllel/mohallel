-- عضوية "مطوّر": من كان صفه هنا يملك وصولاً إدارياً لكل حسابات المنصة.
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;

-- كل مستخدم يقدر يتحقق فقط من عضويته هو (لا يرى بقية المطوّرين)
create policy "check own admin membership" on admins for select using (auth.uid() = user_id);

-- إعدادات عامة للمنصة — صف وحيد
create table if not exists app_settings (
  id boolean primary key default true check (id),
  maintenance_mode boolean not null default false,
  announcement text not null default '',
  updated_at timestamptz not null default now()
);

insert into app_settings (id) values (true) on conflict (id) do nothing;

alter table app_settings enable row level security;

create policy "anyone can read app settings" on app_settings for select using (true);
create policy "admin can update app settings" on app_settings for update using (
  exists (select 1 from admins where admins.user_id = auth.uid())
);

-- قائمة كل الأندية المشتركة (بريد + اسم النادي + اسم المستخدم + حالة PRO) — للمطوّر فقط
create or replace function admin_list_clubs()
returns table (
  user_id uuid,
  email text,
  club_name text,
  user_name text,
  is_pro boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  return query
    select
      u.id,
      u.email::text,
      s.data->>'clubName',
      s.data->>'userName',
      coalesce((s.data->>'isPro')::boolean, false),
      s.updated_at
    from app_state s
    join auth.users u on u.id = s.user_id
    where s.store_name = 'mohallel-club';
end;
$$;

-- تفعيل/إلغاء PRO لأي حساب — للمطوّر فقط
create or replace function admin_set_pro(target_user_id uuid, pro_value boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  update app_state
  set data = jsonb_set(data, '{isPro}', to_jsonb(pro_value)), updated_at = now()
  where user_id = target_user_id and store_name = 'mohallel-club';
end;
$$;

-- إحصائيات عامة للمنصة — للمطوّر فقط
create or replace function admin_platform_stats()
returns table (
  total_clubs bigint,
  total_pro bigint,
  total_matches bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  return query
    select
      (select count(*) from app_state where store_name = 'mohallel-club'),
      (select count(*) from app_state where store_name = 'mohallel-club' and (data->>'isPro')::boolean = true),
      (select coalesce(sum(match_count), 0) from (
        select (select count(*) from jsonb_object_keys(coalesce(data->'matches', '{}'::jsonb))) as match_count
        from app_state where store_name = 'mohallel-matches'
      ) counts);
end;
$$;

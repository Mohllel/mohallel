-- قائمة كل الحسابات المسجَّلة بالمنصة (للوحة المطوّر — تبويبا "الرئيسية" و"المستخدمين")
create or replace function admin_list_users()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  last_data_update timestamptz,
  owns_club boolean,
  is_admin boolean,
  member_of_emails text[]
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
      u.created_at,
      u.last_sign_in_at,
      (select max(s.updated_at) from app_state s where s.user_id = u.id),
      exists (select 1 from app_state s where s.user_id = u.id and s.store_name = 'mohallel-club'),
      exists (select 1 from admins a where a.user_id = u.id),
      (
        select array_agg(owner.email::text)
        from club_members cm
        join auth.users owner on owner.id = cm.club_owner_id
        where cm.member_user_id = u.id
      )
    from auth.users u;
end;
$$;

-- إضافة عدد المحللين المدعوّين لكل نادٍ في قائمة الأندية الحالية (تغيير شكل الإرجاع يتطلب حذفها أولاً)
drop function if exists admin_list_clubs();

create function admin_list_clubs()
returns table (
  user_id uuid,
  email text,
  club_name text,
  user_name text,
  is_pro boolean,
  updated_at timestamptz,
  member_count bigint
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
      s.data->'state'->>'clubName',
      s.data->'state'->>'userName',
      coalesce((s.data->'state'->>'isPro')::boolean, false),
      s.updated_at,
      (select count(*) from club_members cm where cm.club_owner_id = s.user_id)
    from app_state s
    join auth.users u on u.id = s.user_id
    where s.store_name = 'mohallel-club';
end;
$$;

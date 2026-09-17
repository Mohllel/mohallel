-- عضوية محللين مدعوّين للعمل على نفس بيانات نادٍ (club_owner_id = user_id بجدول app_state)
create table if not exists club_members (
  club_owner_id uuid references auth.users(id) on delete cascade not null,
  member_user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (club_owner_id, member_user_id)
);

alter table club_members enable row level security;

create policy "owner can see own members" on club_members for select using (auth.uid() = club_owner_id);
create policy "member can see own memberships" on club_members for select using (auth.uid() = member_user_id);

-- سياسات إضافية على app_state (لا تستبدل سياسات ٠٠٠١ — RLS تجمعها بـOR): الأعضاء المدعوّون يقرؤون/يكتبون بيانات النادي
create policy "members can select club state" on app_state for select using (
  exists (
    select 1 from club_members
    where club_members.club_owner_id = app_state.user_id
    and club_members.member_user_id = auth.uid()
  )
);
create policy "members can insert club state" on app_state for insert with check (
  exists (
    select 1 from club_members
    where club_members.club_owner_id = app_state.user_id
    and club_members.member_user_id = auth.uid()
  )
);
create policy "members can update club state" on app_state for update using (
  exists (
    select 1 from club_members
    where club_members.club_owner_id = app_state.user_id
    and club_members.member_user_id = auth.uid()
  )
);

-- سياسات إضافية على مخزن الصور: الأعضاء المدعوّون يقدرون يرفعون/يعدّلون صوراً بمجلد النادي (لا مجلدهم هم)
create policy "members can upload to club folder" on storage.objects for insert with check (
  bucket_id = 'club-media' and exists (
    select 1 from club_members
    where club_members.club_owner_id::text = (storage.foldername(name))[1]
    and club_members.member_user_id = auth.uid()
  )
);
create policy "members can update club folder" on storage.objects for update using (
  bucket_id = 'club-media' and exists (
    select 1 from club_members
    where club_members.club_owner_id::text = (storage.foldername(name))[1]
    and club_members.member_user_id = auth.uid()
  )
);

-- دعوة محلل بالبريد — لصاحب النادي فقط (auth.uid() ضمنياً هو المالك)
create or replace function invite_club_member(member_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = member_email;
  if target_id is null then
    raise exception 'لا يوجد حساب بهذا البريد. اطلب منه إنشاء حساب أولاً.';
  end if;
  if target_id = auth.uid() then
    raise exception 'لا يمكنك دعوة نفسك';
  end if;
  insert into club_members (club_owner_id, member_user_id) values (auth.uid(), target_id)
  on conflict do nothing;
end;
$$;

-- إزالة عضو — لصاحب النادي فقط
create or replace function remove_club_member(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from club_members where club_owner_id = auth.uid() and member_user_id = target_user_id;
end;
$$;

-- قائمة الأعضاء المدعوّين لناديّ أنا (بالبريد)
create or replace function list_club_members()
returns table (member_user_id uuid, email text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select cm.member_user_id, u.email::text, cm.created_at
    from club_members cm
    join auth.users u on u.id = cm.member_user_id
    where cm.club_owner_id = auth.uid();
end;
$$;

-- الأندية التي دُعيت إليها أنا (بريد كل مالك)
create or replace function list_my_memberships()
returns table (club_owner_id uuid, club_owner_email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select cm.club_owner_id, u.email::text
    from club_members cm
    join auth.users u on u.id = cm.club_owner_id
    where cm.member_user_id = auth.uid();
end;
$$;

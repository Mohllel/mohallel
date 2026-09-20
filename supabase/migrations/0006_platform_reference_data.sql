-- فصل حساب المطوّر عن بيانات الأندية + بيانات مرجعية موحّدة على مستوى المنصة + إضافات لوحة المطوّر.

-- ============================================================
-- ١) الأندية المرجعية — قائمة موحّدة يديرها المطوّر، تُقرأ من كل حسابات النادي
-- ============================================================
create table if not exists reference_clubs (
  id text primary key,
  name text not null,
  logo text,
  created_at timestamptz not null default now()
);

alter table reference_clubs enable row level security;
create policy "any signed-in user can read reference clubs" on reference_clubs for select using (auth.uid() is not null);

create or replace function admin_add_reference_club(club_name text, club_logo text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id text := substr(md5(random()::text), 1, 9);
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  insert into reference_clubs (id, name, logo) values (new_id, club_name, club_logo);
  return new_id;
end;
$$;

create or replace function admin_remove_reference_club(club_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  delete from reference_clubs where id = club_id;
  update reference_competitions set eligible_club_ids = array_remove(eligible_club_ids, club_id);
end;
$$;

create or replace function admin_set_reference_club_logo(club_id text, club_logo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  update reference_clubs set logo = club_logo where id = club_id;
end;
$$;

-- ============================================================
-- ٢) المسابقات المرجعية — بنفس الفكرة، مع قائمة الأندية المشارِكة (فارغة = بلا حصر، تظهر لأي نادٍ)
-- ============================================================
create table if not exists reference_competitions (
  id text primary key,
  name text not null,
  eligible_club_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table reference_competitions enable row level security;
create policy "any signed-in user can read reference competitions" on reference_competitions for select using (auth.uid() is not null);

create or replace function admin_add_reference_competition(competition_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id text := substr(md5(random()::text), 1, 9);
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  insert into reference_competitions (id, name) values (new_id, competition_name);
  return new_id;
end;
$$;

create or replace function admin_remove_reference_competition(competition_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  delete from reference_competitions where id = competition_id;
end;
$$;

create or replace function admin_set_competition_eligibility(competition_id text, club_ids text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  update reference_competitions set eligible_club_ids = club_ids where id = competition_id;
end;
$$;

-- زرع البيانات الحالية (بنفس المعرّفات المستخدمة فعلياً بحساب المطوّر) — يحافظ على روابط المباريات القائمة بلا حاجة لأي تعديل
insert into reference_clubs (id, name) values
  ('h3vbuyqeg', 'المحرق'),
  ('oyqnsomcz', 'النبيه صالح'),
  ('lc0ef24zr', 'الأهلي'),
  ('fc4xqh9uo', 'داركليب'),
  ('sr32cwpkv', 'الدير'),
  ('od33igk04', 'إتحاد الريف'),
  ('lppt12drx', 'عالي'),
  ('6kaenpv0h', 'الشباب'),
  ('dj9eh63dp', 'التضامن'),
  ('d34asnyqq', 'بني جمرة'),
  ('1fca1qss5', 'النجمة'),
  ('pvjrnm2xi', 'النصر')
on conflict (id) do nothing;

insert into reference_competitions (id, name, eligible_club_ids) values
  ('d77amge53', 'دوري عيسى بن راشد الممتاز لكرة الطائرة',
    array['h3vbuyqeg','oyqnsomcz','lc0ef24zr','fc4xqh9uo','d34asnyqq','1fca1qss5','pvjrnm2xi','lppt12drx']),
  ('jxbc303sa', 'دوري عيسى بن راشد للدرجة الأولى لكرة الطائرة', '{}'),
  ('7x4hipadm', 'كأس الإتحاد لكرة الطائرة', '{}'),
  ('j701e93jl', 'كأس ولي العهد لكرة الطائرة', '{}')
on conflict (id) do nothing;

-- ============================================================
-- ٣) إعداد الذكاء الاصطناعي — برومت واحد لتحسين صور اللاعبين، يقرأه Edge Function بمفتاح الخدمة
-- ============================================================
create table if not exists ai_config (
  id boolean primary key default true check (id),
  enhance_prompt text not null default '',
  updated_at timestamptz not null default now()
);

alter table ai_config enable row level security;
create policy "admin can read ai config" on ai_config for select using (
  exists (select 1 from admins where admins.user_id = auth.uid())
);

create or replace function admin_set_ai_prompt(new_prompt text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  update ai_config set enhance_prompt = new_prompt, updated_at = now() where id = true;
end;
$$;

insert into ai_config (id, enhance_prompt) values (true, 'Create a photorealistic professional volleyball player portrait, photographed
from his anatomical right at a 30-degree three-quarter angle. Natural relaxed
stance, same friendly expression as in the reference. Do not mirror the image.

IDENTITY (from reference image 1): Preserve his facial identity, eye shape, nose,
jawline, smile, skin tone, hairline, facial hair and apparent age exactly. Do not
beautify or reconstruct the face. Maintain his original physique and proportions —
head size, shoulder width, neck length, torso length, arm length, apparent height
and athletic build. Use image 1 ONLY for face, hairstyle, skin tone and body
proportions — do NOT copy its red jacket or its background.

WARDROBE (from reference image 2 only): Dress him in the jersey shown in image 2,
matching its design, colors, patterns and placement as closely as possible,
fitted naturally to HIS original body. If shorts are visible, use white shorts.
Do NOT copy the body, pose, face or background of the person wearing the
reference uniform. Do not invent extra numbers, letters or logos that are not
visible in image 2.

LIGHTING: Realistic sports-portrait lighting recreated in a studio — a broad
overhead light balanced with soft frontal fill to light the eyes and reduce
under-eye shadows. Neutral white balance for accurate skin and jersey colors.
Enhance fabric detail without artificial smoothing or exaggerated sharpness.

BACKGROUND: A completely plain, solid medium-gray studio background, easy to
remove. No sports hall, no net, no seating, no lights, no scenery. No gradients,
no textures, no background shadows, no text. Keep all subject edges natural and
clearly defined, no halos, no background color spill.

CAMERA: Eye-level, natural 85mm lens perspective, head-to-upper-thigh framing,
vertical 4:5 composition. Keep head, shoulders and elbows inside the frame with
comfortable margins.

NEGATIVE: no invented numbers or sponsor text, no volleyball unless requested, no
beautified or reshaped face, no changed body proportions, no mirrored image, no
background scenery, no gradient background, no distorted hands, no extra
fingers, no watermark, no text overlay.') on conflict (id) do nothing;

-- ============================================================
-- ٤) تفعيل/تعطيل ميزات عن بُعد (feature flags)
-- ============================================================
create table if not exists feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text not null default '',
  updated_at timestamptz not null default now()
);

alter table feature_flags enable row level security;
create policy "any signed-in user can read feature flags" on feature_flags for select using (auth.uid() is not null);

create or replace function admin_upsert_feature_flag(flag_key text, flag_enabled boolean, flag_description text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  insert into feature_flags (key, enabled, description, updated_at)
  values (flag_key, flag_enabled, flag_description, now())
  on conflict (key) do update set enabled = excluded.enabled, description = excluded.description, updated_at = now();
end;
$$;

create or replace function admin_delete_feature_flag(flag_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  delete from feature_flags where key = flag_key;
end;
$$;

-- ============================================================
-- ٥) سجلّ أخطاء العميل — كل مستخدم يسجّل أخطاءه فقط، المطوّر يقرأ الكل
-- ============================================================
create table if not exists client_errors (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  stack text,
  url text,
  created_at timestamptz not null default now()
);

alter table client_errors enable row level security;
create policy "users can report their own errors" on client_errors for insert with check (auth.uid() = user_id);

create or replace function admin_list_client_errors(limit_count int default 100)
returns setof client_errors
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where admins.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  return query select * from client_errors order by created_at desc limit limit_count;
end;
$$;

-- ============================================================
-- ٦) نقل بيانات النادي الحالية لحساب المطوّر إلى حساب آخر (فصل نهائي عن حساب المطوّر)
-- ============================================================
create or replace function admin_migrate_club_data(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  source_id uuid := auth.uid();
  target_id uuid;
begin
  if not exists (select 1 from admins where admins.user_id = source_id) then
    raise exception 'not authorized';
  end if;

  select id into target_id from auth.users where email = target_email;
  if target_id is null then
    raise exception 'الحساب الجديد غير موجود — يجب تسجيل الدخول فيه مرة واحدة على الأقل بهذا البريد أولاً';
  end if;
  if target_id = source_id then
    raise exception 'لا يمكن النقل لنفس الحساب';
  end if;

  delete from app_state where user_id = target_id;
  update app_state set user_id = target_id, updated_at = now() where user_id = source_id;
end;
$$;

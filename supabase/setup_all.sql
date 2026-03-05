create extension if not exists "pgcrypto";

create type application_status as enum ('신청', '입금대기', '결제완료', '환불');
create type send_channel as enum ('alimtalk', 'sms', 'email');
create type send_status as enum ('queued', 'sent', 'failed');

create table if not exists competitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  location text not null,
  fee integer not null default 0,
  bank_account text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists divisions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  consent_privacy boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  application_no text not null unique,
  competition_id uuid not null references competitions(id),
  division_id uuid references divisions(id),
  participant_id uuid not null references participants(id),
  status application_status not null default '신청',
  memo text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  depositor_name text not null,
  amount integer not null,
  status application_status not null default '입금대기',
  confirmed_by uuid,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  trigger_name text not null,
  channel send_channel not null,
  title text,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists message_logs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id),
  channel send_channel not null,
  status send_status not null,
  provider text,
  provider_message_id text,
  error_code text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_action_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  target_table text not null,
  target_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

alter table competitions enable row level security;
alter table divisions enable row level security;
alter table participants enable row level security;
alter table applications enable row level security;
alter table payments enable row level security;
alter table message_templates enable row level security;
alter table message_logs enable row level security;
alter table admin_action_logs enable row level security;

-- NOTE: 실제 운영에서는 auth.users 기반 관리자 역할 정책으로 교체 필요
create policy "deny all competitions" on competitions for all using (false);
create policy "deny all divisions" on divisions for all using (false);
create policy "deny all participants" on participants for all using (false);
create policy "deny all applications" on applications for all using (false);
create policy "deny all payments" on payments for all using (false);
create policy "deny all message_templates" on message_templates for all using (false);
create policy "deny all message_logs" on message_logs for all using (false);
create policy "deny all admin_action_logs" on admin_action_logs for all using (false);
-- 공개 대회 정보는 anon/authenticated에서 조회 가능하도록 정책 분리

drop policy if exists "deny all competitions" on competitions;

create policy "public read competitions"
on competitions
for select
to anon, authenticated
using (is_public = true);

create policy "deny write competitions"
on competitions
for all
to anon, authenticated
using (false)
with check (false);

-- 샘플 공개 대회 데이터 (없을 때만 삽입)
insert into competitions (title, description, event_date, location, fee, bank_account, is_public)
select
  'ICN 오픈 2026',
  '전국 참가 가능한 보디빌딩 대회',
  '2026-08-30',
  '인천 컨벤션 센터',
  70000,
  '신한 110-000-000000 (예금주: ICN 운영사무국)',
  true
where not exists (
  select 1
  from competitions
  where title = 'ICN 오픈 2026'
    and event_date = '2026-08-30'
);
-- 1) divisions: 공개 대회에 속한 종목은 anon에서 조회 가능

drop policy if exists "deny all divisions" on divisions;

create policy "public read divisions"
on divisions for select
to anon, authenticated
using (
  exists (
    select 1 from competitions c
    where c.id = divisions.competition_id
      and c.is_public = true
  )
);

create policy "deny write divisions"
on divisions for all
to anon, authenticated
using (false)
with check (false);

-- 2) participants: 서버(service_role)에서만 insert
--    anon에서는 insert 불가 → API 라우트가 service_role 키 사용

-- 3) applications: 서버(service_role)에서만 insert
--    anon에서는 insert 불가 → API 라우트가 service_role 키 사용-- 회원 프로필 테이블
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  gender text check (gender in ('male', 'female')),
  age integer check (age > 0 and age < 150),
  phone text,
  email text,
  provider text, -- 'kakao', 'google', 'naver'
  profile_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "users can update own profile" on profiles
  for update using (auth.uid() = id);

-- 신규 유저 가입 시 자동으로 프로필 생성
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, provider)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'provider'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

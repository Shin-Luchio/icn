-- =============================================
-- Schema Upgrade: 상태값 재정의 + 필드 추가 + 신규 테이블
-- =============================================

-- 1) application_status enum 확장
alter type application_status add value if not exists '작성중';
alter type application_status add value if not exists '검수중';
alter type application_status add value if not exists '승인완료';
alter type application_status add value if not exists '반려';
alter type application_status add value if not exists '취소';

-- 2) competitions 필드 추가
alter table competitions
  add column if not exists slug text unique,
  add column if not exists host_name text,
  add column if not exists registration_open_at timestamptz,
  add column if not exists registration_close_at timestamptz,
  add column if not exists poster_image_url text,
  add column if not exists max_applicants integer,
  add column if not exists rules_content text;

-- slug 기존 레코드 채우기 (title 기반)
update competitions
  set slug = regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')
  where slug is null;

-- 3) divisions 필드 추가
alter table divisions
  add column if not exists gender text check (gender in ('남', '여', '혼성')) default '혼성',
  add column if not exists class_type text,
  add column if not exists weight_class text,
  add column if not exists entry_fee integer,
  add column if not exists max_applicants integer,
  add column if not exists rules_content text,
  add column if not exists sort_order integer not null default 0;

-- 4) participants 필드 추가
alter table participants
  add column if not exists birth_date date,
  add column if not exists gender text check (gender in ('남', '여')),
  add column if not exists affiliation text,
  add column if not exists emergency_contact text;

-- 5) applications 필드 추가
alter table applications
  add column if not exists bib_number integer,
  add column if not exists checkin_status boolean not null default false,
  add column if not exists measurement_status boolean not null default false,
  add column if not exists reject_reason text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text;

-- 6) attachments 테이블 (증빙 업로드)
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  type text not null, -- 'id_card', 'photo', 'etc'
  file_url text not null,
  original_name text,
  verified_status text not null default 'pending' check (verified_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

alter table attachments enable row level security;
create policy "deny all attachments" on attachments for all using (false);

-- 7) notices 테이블 (공지사항)
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete set null,
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table notices enable row level security;
create policy "deny all notices" on notices for all using (false);
create policy "public read published notices" on notices
  for select using (is_published = true);

-- 8) results 테이블 (대회 결과)
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  division_id uuid references divisions(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  participant_name text not null,
  affiliation text,
  rank integer,
  award_name text,
  created_at timestamptz not null default now()
);

alter table results enable row level security;
create policy "deny all results" on results for all using (false);
create policy "public read results" on results
  for select using (true);

-- 9) message_templates: 공개 읽기 허용 (서버에서 사용)
-- (service_role로만 write, 읽기는 서비스롤 경유)

-- 10) 인덱스
create index if not exists idx_applications_competition_id on applications(competition_id);
create index if not exists idx_applications_status on applications(status);
create index if not exists idx_applications_participant_id on applications(participant_id);
create index if not exists idx_notices_published on notices(is_published, published_at desc);
create index if not exists idx_results_competition_id on results(competition_id, division_id);
create index if not exists idx_divisions_competition_id on divisions(competition_id, sort_order);

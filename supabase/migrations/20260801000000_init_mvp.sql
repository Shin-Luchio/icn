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

-- 회원 프로필 테이블
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

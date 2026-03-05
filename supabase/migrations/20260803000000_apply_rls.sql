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
--    anon에서는 insert 불가 → API 라우트가 service_role 키 사용
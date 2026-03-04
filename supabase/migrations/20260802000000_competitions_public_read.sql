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

# ICN MVP Project Base

`MVP_PLAN.md` 기준으로 생성한 **Next.js + Supabase 기반 초기 프로젝트 골격**입니다.

## 포함 범위 (MVP 기준)
- 홍보 페이지: `/` (공개 대회정보를 DB에서 조회)
- 참가 신청 페이지: `/apply`
- 백오피스 5개 화면
  - `/admin/competitions`
  - `/admin/applications`
  - `/admin/payments`
  - `/admin/messages`
  - `/admin/exports`
- Supabase 초기 스키마/상태 enum/RLS 기본 템플릿

## 빠른 시작
```bash
cp .env.example .env.local
npm install
npm run dev
```


## 관리자 로그인
- 백오피스(`/admin/*`)는 로그인 보호됩니다.
- 기본 계정(초기 설정)
- 운영 환경에서는 `.env.local`의 `ADMIN_ID`, `ADMIN_PASSWORD`로 반드시 변경하세요.


## 대회정보 조회
- 홈(`/`)과 관리자 대회 목록(`/admin/competitions`)은 `competitions` 테이블을 조회합니다.
- 환경변수가 없거나 조회 실패 시 기본 샘플 데이터를 fallback으로 표시합니다.

## DB 초기화
Supabase SQL Editor 또는 CLI에서 아래 마이그레이션을 실행합니다.

- `supabase/migrations/20260801000000_init_mvp.sql`
- `supabase/migrations/20260802000000_competitions_public_read.sql`

## 문서
- [MVP 실행안](./MVP_PLAN.md)

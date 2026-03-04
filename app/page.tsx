import { Nav } from "@/components/nav";

const sections = [
  ["대회 개요", "ICN 오픈 대회 / 전국 참가 가능"],
  ["일정", "2026-08-30 (일)"],
  ["장소", "인천 컨벤션 센터"],
  ["규정", "체급/장비 규정은 공지사항 확인"],
  ["종목", "초급/중급/상급"],
  ["시상", "각 체급 1~3위 + 특별상"],
  ["문의", "카카오채널 @icn 또는 010-0000-0000"]
];

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <section className="card">
          <h1>ICN 대회 홍보 페이지 (MVP)</h1>
          <p>공지/후원사/신청 링크 중심으로 빠르게 운영 가능한 랜딩입니다.</p>
        </section>

        <section className="card grid grid-2">
          {sections.map(([title, body]) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>공지</h2>
          <ul>
            <li>신청 마감: 2026-08-20</li>
            <li>입금 확인 SLA: 영업일 기준 24시간</li>
            <li>입금자명 규칙: 참가자명 + 휴대폰 뒤 4자리 (예: 홍길동0101)</li>
          </ul>
        </section>

        <section className="card">
          <h2>후원사</h2>
          <p>스폰서 로고/텍스트 슬롯 (MVP는 텍스트 우선).</p>
        </section>
      </main>
    </>
  );
}

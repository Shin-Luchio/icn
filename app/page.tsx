import Link from "next/link";
import { Nav } from "@/components/nav";
import { getPublicCompetitions } from "@/lib/competitions";

export const revalidate = 0;

export default async function HomePage() {
  const { competitions, source } = await getPublicCompetitions();

  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <span className="hero-kicker">BODYBUILDING PROMOTION</span>
          <h1>
            무대 위에서 증명하는 힘, <strong>ICN CHAMPIONSHIP</strong>
          </h1>
          <p>공지 확인 후 바로 참가 신청하고, 운영팀은 백오피스에서 빠르게 상태를 관리합니다.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <Link href="/apply" className="button">
              지금 참가 신청
            </Link>
            <Link href="/admin/competitions" className="button secondary">
              운영자 백오피스
            </Link>
          </div>
        </section>

        <section className="card">
          <h2>대회 목록</h2>
          <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
            출처: {source === "database" ? "Supabase DB" : "기본 샘플 데이터"}
          </p>

          {competitions.length === 0 ? (
            <p className="muted">현재 공개된 대회가 없습니다.</p>
          ) : (
            <div className="grid grid-2">
              {competitions.map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: 16,
                    background: "rgba(16,20,31,0.6)"
                  }}
                >
                  <h3 style={{ marginBottom: 8 }}>{c.title}</h3>
                  {c.description && <p className="muted" style={{ fontSize: 14, marginBottom: 10 }}>{c.description}</p>}
                  <table style={{ fontSize: 14 }}>
                    <tbody>
                      <tr>
                        <td style={{ color: "var(--text-subtle)", paddingRight: 12, border: "none" }}>일정</td>
                        <td style={{ border: "none" }}>{c.event_date}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "var(--text-subtle)", paddingRight: 12, border: "none" }}>장소</td>
                        <td style={{ border: "none" }}>{c.location}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "var(--text-subtle)", paddingRight: 12, border: "none" }}>참가비</td>
                        <td style={{ border: "none" }}>{c.fee.toLocaleString()}원</td>
                      </tr>
                      <tr>
                        <td style={{ color: "var(--text-subtle)", paddingRight: 12, border: "none" }}>입금계좌</td>
                        <td style={{ border: "none", wordBreak: "break-all" }}>{c.bank_account}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: 12 }}>
                    <Link href="/apply" className="button" style={{ fontSize: 13, padding: "7px 12px" }}>
                      신청하기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>공지</h2>
          <ul className="muted">
            <li>입금 확인 SLA: 영업일 기준 24시간</li>
            <li>입금자명 규칙: 참가자명 + 휴대폰 뒤 4자리 (예: 홍길동0101)</li>
            <li>문의: 카카오채널 @icn 또는 010-0000-0000</li>
          </ul>
        </section>

        <section className="card">
          <h2>후원사</h2>
          <p className="muted">스폰서 로고/텍스트 슬롯 (MVP는 텍스트 우선)</p>
        </section>
      </main>
    </>
  );
}
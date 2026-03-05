import Link from "next/link";
import { Nav } from "@/components/nav";
import { getPublicCompetitions } from "@/lib/competitions";
import type { Route } from "next";

export const revalidate = 0;

export default async function CompetitionsPage() {
  const { competitions, source } = await getPublicCompetitions();

  return (
    <>
      <Nav />
      <main>
        <section style={{ marginBottom: 4 }}>
          <span className="hero-kicker">COMPETITIONS</span>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", margin: "8px 0 8px" }}>대회 목록</h1>
          <p className="muted" style={{ fontSize: 15 }}>
            참가 신청 가능한 ICN 대회 목록입니다. 대회를 선택해 상세 내용을 확인하세요.
          </p>
          {source === "fallback" && (
            <p style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 6 }}>
              * 샘플 데이터 표시 중 (DB 미연결)
            </p>
          )}
        </section>

        {competitions.length === 0 ? (
          <section className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🏟️</p>
            <p className="muted">현재 참가 신청 가능한 대회가 없습니다.</p>
            <p className="muted" style={{ fontSize: 14 }}>곧 새로운 대회가 공개될 예정입니다.</p>
          </section>
        ) : (
          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            {competitions.map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: 24,
                  background: "linear-gradient(150deg, rgba(18,24,37,0.95), rgba(15,19,30,0.95))",
                  display: "flex",
                  gap: 24,
                  alignItems: "flex-start",
                  flexWrap: "wrap"
                }}
              >
                {/* 대회 정보 */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "rgba(239,68,68,0.15)",
                        color: "#fca5a5",
                        border: "1px solid rgba(239,68,68,0.3)",
                        fontWeight: 600
                      }}
                    >
                      모집 중
                    </span>
                  </div>
                  <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>{c.title}</h2>
                  {c.description && (
                    <p className="muted" style={{ fontSize: 14, margin: "0 0 14px", lineHeight: 1.6 }}>
                      {c.description}
                    </p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: 14 }}>
                    <span className="muted">📅 {c.event_date}</span>
                    <span className="muted">📍 {c.location}</span>
                    <span style={{ color: "var(--accent-2)", fontWeight: 600 }}>
                      참가비 {c.fee.toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
                  <Link href={`/competitions/${c.id}` as Route} className="button" style={{ textAlign: "center" }}>
                    상세 보기 →
                  </Link>
                  <Link
                    href={`/competitions/${c.id}/apply` as Route}
                    className="button secondary"
                    style={{ textAlign: "center" }}
                  >
                    바로 신청
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

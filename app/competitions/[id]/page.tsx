import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { getCompetitionById } from "@/lib/competitions";
import type { Route } from "next";

export const revalidate = 0;

export default async function CompetitionDetailPage({ params }: { params: { id: string } }) {
  const competition = await getCompetitionById(params.id);

  if (!competition) notFound();

  const { title, description, event_date, location, fee, bank_account, divisions } = competition;

  return (
    <>
      <Nav />
      <main>
        {/* 뒤로가기 */}
        <div style={{ marginBottom: 12 }}>
          <Link href={"/competitions" as Route} className="muted" style={{ fontSize: 14 }}>
            ← 대회 목록으로
          </Link>
        </div>

        {/* 타이틀 헤더 */}
        <section className="hero">
          <span className="hero-kicker">ICN COMPETITION</span>
          <h1 style={{ fontSize: "clamp(22px, 3.5vw, 40px)" }}>{title}</h1>
          {description && (
            <p style={{ maxWidth: 600 }}>{description}</p>
          )}
          <Link
            href={`/competitions/${competition.id}/apply` as Route}
            className="button"
            style={{ display: "inline-block", marginTop: 20, fontSize: 16, padding: "12px 24px" }}
          >
            참가 신청하기 →
          </Link>
        </section>

        {/* 대회 기본 정보 */}
        <section className="card">
          <h2 style={{ marginBottom: 16 }}>대회 정보</h2>
          <table style={{ fontSize: 15 }}>
            <tbody>
              {[
                { label: "대회 일정", value: event_date },
                { label: "장소", value: location },
                { label: "참가비", value: `${fee.toLocaleString()}원` },
                { label: "입금 계좌", value: bank_account },
                {
                  label: "입금자명",
                  value: "참가자명 + 휴대폰 뒤 4자리 (예: 홍길동0101)"
                },
                {
                  label: "입금 확인",
                  value: "영업일 기준 24시간 이내 확인 후 안내"
                }
              ].map(({ label, value }) => (
                <tr key={label}>
                  <td
                    style={{
                      color: "var(--text-subtle)",
                      paddingRight: 24,
                      whiteSpace: "nowrap",
                      border: "none",
                      paddingTop: 10,
                      paddingBottom: 10,
                      verticalAlign: "top"
                    }}
                  >
                    {label}
                  </td>
                  <td style={{ border: "none", paddingTop: 10, paddingBottom: 10 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 참가 부문 */}
        {divisions.length > 0 && (
          <section className="card">
            <h2 style={{ marginBottom: 16 }}>참가 부문</h2>
            <div className="grid grid-2" style={{ gap: 10 }}>
              {divisions.map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    background: "rgba(16,20,31,0.4)"
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontWeight: 500 }}>{d.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 신청 안내 */}
        <section className="card">
          <h2 style={{ marginBottom: 12 }}>신청 방법</h2>
          <ol style={{ color: "var(--text-subtle)", fontSize: 14, paddingLeft: 20, lineHeight: 2 }}>
            <li>아래 &apos;참가 신청하기&apos; 버튼을 클릭해 신청서를 작성합니다.</li>
            <li>신청 완료 후 화면에 표시된 계좌로 참가비를 입금합니다.</li>
            <li>입금자명: <strong style={{ color: "var(--text)" }}>참가자명 + 휴대폰 뒤 4자리</strong></li>
            <li>영업일 기준 24시간 내 입금 확인 후 문자로 안내드립니다.</li>
          </ol>
          <div style={{ marginTop: 20 }}>
            <Link
              href={`/competitions/${competition.id}/apply` as Route}
              className="button"
              style={{ display: "inline-block" }}
            >
              참가 신청하기 →
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}

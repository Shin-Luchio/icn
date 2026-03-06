import Link from "next/link";
import { Nav } from "@/components/nav";
import { getPublicCompetitions } from "@/lib/competitions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Route } from "next";

export const revalidate = 60;

const values = [
  { icon: "🏆", title: "공정한 심사", desc: "국제 기준의 심사 기준을 적용합니다. 모든 선수가 동등한 조건에서 경쟁합니다." },
  { icon: "📋", title: "체계적인 운영", desc: "신청부터 시상까지 전 과정을 투명하게 운영합니다. 선수가 무대에만 집중할 수 있도록." },
  { icon: "🌱", title: "선수 성장 지원", desc: "아마추어부터 프로까지, 모든 레벨의 선수가 도전할 수 있는 대회를 개최합니다." }
];

const categories = [
  { name: "보디빌딩", desc: "남성 전통 근육미 부문" },
  { name: "클래식 보디빌딩", desc: "비율 중심 심사 부문" },
  { name: "피지크", desc: "균형 잡힌 체형 부문" },
  { name: "피트니스 비키니", desc: "여성 건강미 부문" },
  { name: "맨즈 피지크", desc: "남성 X자 체형 부문" },
  { name: "웰니스", desc: "여성 하체 중심 부문" }
];

async function getRecentNotices() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("notices")
    .select("id,title,published_at,is_pinned")
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(4);
  return data ?? [];
}

export default async function HomePage() {
  const [{ competitions }, notices] = await Promise.all([
    getPublicCompetitions(),
    getRecentNotices()
  ]);
  const upcomingCount = competitions.length;

  return (
    <>
      <Nav />
      <main>

        {/* 히어로 */}
        <section className="hero">
          <span className="hero-kicker">KOREA BODYBUILDING FEDERATION</span>
          <h1>
            무대 위에서 증명하는 힘,<br />
            <strong>ICN CHAMPIONSHIP</strong>
          </h1>
          <p style={{ maxWidth: 560 }}>
            ICN은 대한민국 최고 수준의 보디빌딩 대회를 개최합니다.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <Link href={"/competitions" as Route} className="button">
              대회 참가 신청 →
            </Link>
            <Link href={"/lookup" as Route} className="button secondary">
              신청 내역 조회
            </Link>
          </div>
        </section>

        {/* 핵심 가치 */}
        <section className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginBottom: 20 }}>ICN의 약속</h2>
          <div className="grid grid-2" style={{ gap: 16 }}>
            {values.map((v) => (
              <div key={v.title} style={{ padding: "20px", border: "1px solid var(--line)", borderRadius: 12, background: "rgba(16,20,31,0.5)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div>
                <h3 style={{ marginBottom: 8, fontSize: 17 }}>{v.title}</h3>
                <p className="muted" style={{ fontSize: 14, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
            <div style={{ padding: "20px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.08))" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
              <h3 style={{ marginBottom: 12, fontSize: 17 }}>대회 현황</h3>
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent-2)" }}>{upcomingCount > 0 ? upcomingCount : "—"}</div>
                  <div className="muted" style={{ fontSize: 13 }}>진행 중인 대회</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent-2)" }}>6+</div>
                  <div className="muted" style={{ fontSize: 13 }}>참가 부문</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 다가오는 대회 */}
        {upcomingCount > 0 && (
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>다가오는 대회</h2>
              <Link href={"/competitions" as Route} className="muted" style={{ fontSize: 14, textDecoration: "underline" }}>전체 보기 →</Link>
            </div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              {competitions.slice(0, 2).map((c) => (
                <Link key={c.id} href={`/competitions/${c.id}` as Route} style={{ display: "block", padding: 16, border: "1px solid var(--line)", borderRadius: 10, background: "rgba(16,20,31,0.6)", textDecoration: "none" }}>
                  <div style={{ display: "inline-block", fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", marginBottom: 8 }}>모집 중</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{c.title}</h3>
                  <p className="muted" style={{ fontSize: 13, margin: "0 0 8px" }}>📅 {c.event_date} · 📍 {c.location}</p>
                  <p style={{ fontSize: 14, margin: 0, color: "var(--accent-2)", fontWeight: 600 }}>참가비 {c.fee.toLocaleString()}원</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 최근 공지사항 */}
        {notices.length > 0 && (
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>최근 공지</h2>
              <Link href={"/notices" as Route} className="muted" style={{ fontSize: 14, textDecoration: "underline" }}>전체 보기 →</Link>
            </div>
            <div>
              {(notices as {id:string;title:string;published_at:string|null;is_pinned:boolean}[]).map((n, i) => (
                <div key={n.id}>
                  {i > 0 && <div style={{ height: 1, background: "var(--line)" }} />}
                  <Link href={`/notices/${n.id}` as Route} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", textDecoration: "none" }}>
                    {n.is_pinned && <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "rgba(249,115,22,0.15)", color: "var(--accent-2)", flexShrink: 0 }}>📌</span>}
                    <span style={{ flex: 1, fontSize: 14, fontWeight: n.is_pinned ? 700 : 400 }}>{n.title}</span>
                    <span className="muted" style={{ fontSize: 12, flexShrink: 0 }}>{n.published_at ? new Date(n.published_at).toLocaleDateString("ko-KR") : ""}</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 참가 부문 소개 */}
        <section className="card">
          <h2 style={{ marginBottom: 6 }}>참가 부문</h2>
          <p className="muted" style={{ marginBottom: 20, fontSize: 14 }}>ICN 대회에서 경쟁하는 6개 공식 부문입니다.</p>
          <div className="grid grid-2" style={{ gap: 10 }}>
            {categories.map((cat) => (
              <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid var(--line)", borderRadius: 8, background: "rgba(16,20,31,0.4)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(90deg, var(--accent), var(--accent-2))", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{cat.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <section className="card">
          <h2 style={{ marginBottom: 16 }}>빠른 메뉴</h2>
          <div className="grid grid-2" style={{ gap: 10 }}>
            {[
              { href: "/competitions", icon: "📅", label: "대회 일정", desc: "다가오는 대회 확인" },
              { href: "/lookup", icon: "🔍", label: "신청 조회", desc: "신청 상태 확인" },
              { href: "/results", icon: "🥇", label: "대회 결과", desc: "수상자 결과 조회" },
              { href: "/faq", icon: "❓", label: "FAQ", desc: "참가 관련 질문" }
            ].map(item => (
              <Link key={item.href} href={item.href as Route} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 10, background: "rgba(16,20,31,0.4)", textDecoration: "none" }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참가 안내 */}
        <section className="card">
          <h2>참가 안내</h2>
          <ul className="muted" style={{ marginBottom: 20, paddingLeft: 16, lineHeight: 2 }}>
            <li>입금 확인 SLA: 영업일 기준 24시간 이내</li>
            <li>입금자명: 참가자명 + 휴대폰 뒤 4자리 (예: 홍길동0101)</li>
            <li>문의: 카카오채널 @icn 또는 010-0000-0000</li>
          </ul>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href={"/competitions" as Route} className="button">대회 목록 보기 →</Link>
            <Link href={"/faq" as Route} className="button secondary">FAQ 보기</Link>
          </div>
        </section>

      </main>
    </>
  );
}

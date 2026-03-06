import Link from "next/link";
import type { Route } from "next";
import { Nav } from "@/components/nav";
import { getPublicCompetitions } from "@/lib/competitions";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 60;

/* ─── 참가 부문 정의 ─── */
const DIVISIONS = [
  { name: "보디빌딩",      desc: "남성 전통 근육미",    gender: "남성", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)" },
  { name: "클래식",        desc: "비율 중심 심사",      gender: "남성", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
  { name: "맨즈 피지크",   desc: "X자 체형 부문",       gender: "남성", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  { name: "피지크",        desc: "균형 잡힌 체형",      gender: "남성", color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.25)" },
  { name: "피트니스 비키니", desc: "여성 건강미",        gender: "여성", color: "#ec4899", bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.25)" },
  { name: "웰니스",        desc: "여성 하체 중심",      gender: "여성", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
];

/* ─── 핵심 가치 ─── */
const VALUES = [
  {
    icon: "🏆",
    title: "공정한 심사",
    desc: "IFBB 국제 기준을 엄격히 적용합니다. 전문 심판단 구성으로 모든 선수가 동등한 조건에서 경쟁합니다."
  },
  {
    icon: "⚙️",
    title: "체계적 운영",
    desc: "신청부터 시상까지 전 과정을 투명하게 운영합니다. 선수는 무대에만 집중할 수 있도록 모든 행정을 지원합니다."
  },
  {
    icon: "🌱",
    title: "선수 성장 지원",
    desc: "아마추어부터 프로까지 모든 레벨의 선수가 도전할 수 있습니다. 우리의 무대가 여러분의 커리어를 만듭니다."
  },
];

/* ─── Supabase 공지 조회 ─── */
async function getRecentNotices() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("notices")
    .select("id,title,published_at,is_pinned")
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type Notice = { id: string; title: string; published_at: string | null; is_pinned: boolean };

/* ═══════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════ */
export default async function HomePage() {
  const [{ competitions }, notices] = await Promise.all([
    getPublicCompetitions(),
    getRecentNotices()
  ]);

  return (
    <>
      <Nav />
      <main className="home-main">

        {/* ══════════════════════════════
            1. HERO
        ══════════════════════════════ */}
        <section className="home-hero">
          {/* 배경 레이어 */}
          <div className="home-hero-bg" aria-hidden="true">
            <div className="home-hero-grid" />
            <div className="home-hero-glow-1" />
            <div className="home-hero-glow-2" />
            <div className="home-hero-line" />
            <div className="home-hero-watermark">ICN</div>
          </div>

          {/* 본문 */}
          <div className="home-hero-content">
            {/* 라이브 배지 */}
            <div className="home-hero-badge">
              <span className="home-hero-badge-dot" />
              2026 SEASON NOW OPEN
            </div>

            {/* 메인 헤드라인 */}
            <h1 className="home-hero-title">
              한국 보디빌딩의<br />
              <span className="home-hero-title-em">새로운 무대</span>
            </h1>

            {/* 서브 헤드라인 */}
            <p className="home-hero-sub">
              ICN CHAMPIONSHIP은 세계 기준의 심사, 체계적인 운영,
              선수 중심의 무대로 대한민국 보디빌딩의 새 기준을 만들어갑니다.
            </p>

            {/* CTA */}
            <div className="home-hero-actions">
              <Link href={"/competitions" as Route} className="btn-hero-primary">
                참가 신청하기 →
              </Link>
              <Link href={"/lookup" as Route} className="btn-hero-secondary">
                신청 내역 조회
              </Link>
            </div>

            {/* 통계 */}
            <div className="home-hero-stats">
              {[
                { num: competitions.length > 0 ? `${competitions.length}개` : "2개", label: "진행 중인 대회" },
                { num: "1,000+", label: "누적 참가자" },
                { num: "6개",    label: "공식 참가 부문" },
                { num: "전국",   label: "개최 규모" },
              ].map((s) => (
                <div key={s.label} className="home-hero-stat">
                  <div className="home-hero-stat-num">{s.num}</div>
                  <div className="home-hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            2. 다가오는 대회
        ══════════════════════════════ */}
        {competitions.length > 0 && (
          <div className="home-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
              <div>
                <p className="section-kicker">UPCOMING EVENTS</p>
                <h2 className="home-section-title" style={{ margin: 0 }}>다가오는 대회</h2>
              </div>
              <Link
                href={"/competitions" as Route}
                style={{ fontSize: 13, color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 4 }}
              >
                전체 보기 →
              </Link>
            </div>

            <div className="event-cards">
              {competitions.slice(0, 3).map((c) => {
                const d = new Date(c.event_date);
                return (
                  <Link
                    key={c.id}
                    href={`/competitions/${c.id}` as Route}
                    className="event-card"
                  >
                    {/* 코너 글로우 */}
                    <div className="event-card-corner-glow" aria-hidden="true" />

                    {/* 날짜 블록 */}
                    <div className="event-card-date">
                      <span className="event-card-day">
                        {String(d.getDate()).padStart(2, "0")}
                      </span>
                      <div className="event-card-month-wrap">
                        <span className="event-card-month">{MONTHS_EN[d.getMonth()]}</span>
                        <span className="event-card-year">{d.getFullYear()}</span>
                      </div>
                    </div>

                    {/* 모집 배지 */}
                    <div className="event-card-status-badge">
                      <span className="event-card-status-dot" />
                      모집 중
                    </div>

                    {/* 대회명 */}
                    <h3 className="event-card-title">{c.title}</h3>

                    {/* 장소 */}
                    <p className="event-card-location">📍 {c.location}</p>

                    {/* 푸터 */}
                    <div className="event-card-footer">
                      <div>
                        <div className="event-card-fee">{c.fee.toLocaleString()}원</div>
                        <div className="event-card-fee-label">참가비</div>
                      </div>
                      <span className="event-card-cta">신청하기 →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            3. ICN을 선택하는 이유 (alt bg)
        ══════════════════════════════ */}
        <div className="home-alt-section">
          <div className="home-alt-inner">
            <p className="section-kicker" style={{ textAlign: "center" }}>WHY ICN</p>
            <h2
              className="home-section-title"
              style={{ textAlign: "center", marginBottom: 8 }}
            >
              ICN을 선택하는 이유
            </h2>
            <p
              className="home-section-sub"
              style={{ textAlign: "center", marginBottom: 48 }}
            >
              국제 기준의 심사부터 선수 성장 지원까지
            </p>

            <div className="values-grid">
              {VALUES.map((v) => (
                <div key={v.title} className="value-item">
                  <div className="value-icon-wrap">{v.icon}</div>
                  <h3 className="value-title">{v.title}</h3>
                  <p className="value-desc">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            4. 참가 부문
        ══════════════════════════════ */}
        <div className="home-section">
          <p className="section-kicker">DIVISIONS</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 36
            }}
          >
            <h2 className="home-section-title" style={{ margin: 0 }}>참가 부문</h2>
            <Link
              href={"/competitions" as Route}
              style={{ fontSize: 13, color: "var(--text-subtle)" }}
            >
              대회 신청 →
            </Link>
          </div>

          <div className="division-grid">
            {DIVISIONS.map((d) => (
              <div
                key={d.name}
                className="division-card"
                style={{ borderColor: d.border }}
              >
                <div
                  className="division-dot"
                  style={{ background: d.color, boxShadow: `0 0 8px ${d.color}60` }}
                />
                <div className="division-name">{d.name}</div>
                <div className="division-desc">{d.desc}</div>
                <div
                  className="division-gender-badge"
                  style={{
                    background: d.bg,
                    color: d.color,
                    border: `1px solid ${d.border}`
                  }}
                >
                  {d.gender}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════
            5. 최근 공지사항
        ══════════════════════════════ */}
        {(notices as Notice[]).length > 0 && (
          <div className="home-section" style={{ paddingTop: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20
              }}
            >
              <div>
                <p className="section-kicker">NOTICE</p>
                <h2 className="home-section-title" style={{ margin: 0 }}>공지사항</h2>
              </div>
              <Link
                href={"/notices" as Route}
                style={{ fontSize: 13, color: "var(--text-subtle)" }}
              >
                전체 보기 →
              </Link>
            </div>

            <div className="notice-list">
              {(notices as Notice[]).map((n) => (
                <Link key={n.id} href={`/notices/${n.id}` as Route} className="notice-row">
                  {n.is_pinned && <span className="notice-pin">📌 고정</span>}
                  <span className="notice-title">{n.title}</span>
                  <span className="notice-date">
                    {n.published_at
                      ? new Date(n.published_at).toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" })
                      : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            6. FINAL CTA
        ══════════════════════════════ */}
        <div className="home-cta-section">
          <div className="home-cta-bg-text" aria-hidden="true">CHAMPION</div>
          <div className="home-cta-inner">
            <p className="section-kicker" style={{ marginBottom: 16 }}>JOIN US</p>
            <h2 className="home-cta-title">
              지금 무대에<br />
              <span style={{
                background: "linear-gradient(90deg, #ef4444, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                오르세요
              </span>
            </h2>
            <p className="home-cta-sub">
              ICN CHAMPIONSHIP은 여러분의 땀과 노력을 무대 위에서 증명할 기회를 드립니다.
              지금 신청하고 대한민국 최고의 보디빌딩 무대를 경험하세요.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href={"/competitions" as Route} className="btn-hero-primary">
                대회 참가 신청하기 →
              </Link>
              <Link href={"/faq" as Route} className="btn-hero-secondary">
                자주 묻는 질문
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            7. 빠른 메뉴
        ══════════════════════════════ */}
        <div className="home-section" style={{ paddingTop: 48, paddingBottom: 80 }}>
          <div className="quick-grid">
            {[
              { href: "/competitions", icon: "📅", label: "대회 일정", desc: "다가오는 대회 확인" },
              { href: "/lookup",       icon: "🔍", label: "신청 조회", desc: "신청 상태 확인"    },
              { href: "/results",      icon: "🥇", label: "대회 결과", desc: "수상자 결과 조회"  },
              { href: "/faq",          icon: "❓", label: "FAQ",       desc: "자주 묻는 질문"   },
            ].map((item) => (
              <Link key={item.href} href={item.href as Route} className="quick-item">
                <span className="quick-icon">{item.icon}</span>
                <span className="quick-label">{item.label}</span>
                <span className="quick-desc">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}

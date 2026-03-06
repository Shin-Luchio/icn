import Link from "next/link";
import type { Route } from "next";
import { Nav } from "@/components/nav";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 60;

async function getResults() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { competitions: [] };

  const { data: competitions } = await supabase
    .from("competitions")
    .select("id,title,event_date,location")
    .order("event_date", { ascending: false })
    .limit(20);

  return { competitions: competitions ?? [] };
}

async function getResultsByCompetition(competitionId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("results")
    .select("id,participant_name,affiliation,rank,award_name,divisions(name)")
    .eq("competition_id", competitionId)
    .order("rank");

  return data ?? [];
}

type Comp = { id: string; title: string; event_date: string; location: string };

export default async function ResultsPage({
  searchParams
}: {
  searchParams: { comp?: string };
}) {
  const { competitions } = await getResults();
  const selectedId = searchParams.comp || (competitions[0]?.id ?? "");
  const results = selectedId ? await getResultsByCompetition(selectedId) : [];
  const selectedComp = (competitions as Comp[]).find(c => c.id === selectedId);

  // 종목별 그룹핑
  const byDivision: Record<string, typeof results> = {};
  for (const r of results) {
    const divName = (r.divisions as unknown as { name: string } | null)?.name ?? "기타";
    if (!byDivision[divName]) byDivision[divName] = [];
    byDivision[divName].push(r);
  }

  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <span className="hero-kicker">RESULTS</span>
          <h1>대회 결과</h1>
          <p style={{ maxWidth: 500 }}>역대 대회 수상자 결과를 확인하세요.</p>
        </section>

        {(competitions as Comp[]).length === 0 ? (
          <section className="card">
            <p className="muted" style={{ textAlign: "center", padding: "40px 0" }}>등록된 대회 결과가 없습니다.</p>
          </section>
        ) : (
          <>
            {/* 대회 선택 탭 */}
            <section className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(competitions as Comp[]).map(c => (
                  <Link
                    key={c.id}
                    href={`/results?comp=${c.id}` as Route}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: c.id === selectedId ? "2px solid var(--accent-2)" : "1px solid var(--line)",
                      background: c.id === selectedId ? "rgba(249,115,22,0.1)" : "rgba(16,20,31,0.4)",
                      color: c.id === selectedId ? "var(--accent-2)" : "var(--text-subtle)",
                      fontSize: 13,
                      fontWeight: c.id === selectedId ? 700 : 400,
                      textDecoration: "none",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            </section>

            {/* 선택 대회 정보 */}
            {selectedComp && (
              <section className="card" style={{ padding: "16px 20px" }}>
                <h2 style={{ margin: "0 0 4px" }}>{selectedComp.title}</h2>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                  📅 {selectedComp.event_date} &nbsp;·&nbsp; 📍 {selectedComp.location}
                </p>
              </section>
            )}

            {/* 결과 */}
            {results.length === 0 ? (
              <section className="card">
                <p className="muted" style={{ textAlign: "center", padding: "40px 0" }}>해당 대회의 결과가 아직 등록되지 않았습니다.</p>
              </section>
            ) : (
              Object.entries(byDivision).map(([division, divResults]) => (
                <section key={division} className="card">
                  <h3 style={{ marginBottom: 16, color: "var(--accent-2)" }}>{division}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {divResults.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "12px 16px",
                          borderRadius: 8,
                          background: r.rank === 1
                            ? "linear-gradient(90deg, rgba(251,191,36,0.1), rgba(249,115,22,0.05))"
                            : "rgba(16,20,31,0.4)",
                          border: `1px solid ${r.rank === 1 ? "rgba(251,191,36,0.3)" : "var(--line)"}`
                        }}
                      >
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: r.rank === 1 ? "linear-gradient(135deg, #fbbf24, #f97316)"
                            : r.rank === 2 ? "linear-gradient(135deg, #d1d5db, #9ca3af)"
                            : r.rank === 3 ? "linear-gradient(135deg, #d97706, #b45309)"
                            : "rgba(107,114,128,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 800, color: r.rank && r.rank <= 3 ? "#fff" : "var(--text-subtle)",
                          flexShrink: 0
                        }}>
                          {r.rank ?? "-"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>{r.participant_name}</div>
                          {r.affiliation && <div className="muted" style={{ fontSize: 13 }}>{r.affiliation}</div>}
                        </div>
                        {r.award_name && (
                          <div style={{ fontSize: 13, color: "var(--accent-2)", fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
                            {r.award_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link href="/" className="muted" style={{ fontSize: 14 }}>← 홈으로</Link>
        </div>
      </main>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  "신청":    { label: "신청 접수", color: "#93c5fd", bg: "rgba(59,130,246,0.12)" },
  "입금대기": { label: "입금 대기", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  "결제완료": { label: "결제 완료", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  "검수중":  { label: "검수 중", color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  "승인완료": { label: "참가 확정", color: "#4ade80", bg: "rgba(74,222,128,0.2)" },
  "반려":    { label: "반려", color: "#fca5a5", bg: "rgba(239,68,68,0.12)" },
  "취소":    { label: "취소", color: "#9ca3af", bg: "rgba(107,114,128,0.12)" },
  "환불":    { label: "환불 처리", color: "#9ca3af", bg: "rgba(107,114,128,0.12)" }
};

type Application = {
  id: string;
  application_no: string;
  status: string;
  created_at: string;
  competitions: { title: string; event_date: string; location: string; fee: number } | null;
  divisions: { name: string } | null;
  payments: { depositor_name: string; amount: number; status: string; confirmed_at: string | null }[] | null;
  participants: { name: string; phone: string } | null;
};

export default function LookupPage() {
  const [phone, setPhone] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(false);

    const res = await fetch(`/api/lookup?phone=${encodeURIComponent(phone)}`);
    if (res.ok) {
      const json = await res.json();
      setApplications(json.applications ?? []);
    } else {
      const json = await res.json();
      setError(json.error || "조회 중 오류가 발생했습니다.");
    }
    setSearched(true);
    setLoading(false);
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const s = STATUS_STYLES[status] ?? { label: status, color: "#9ca3af", bg: "rgba(107,114,128,0.12)" };
    return (
      <span style={{ padding: "5px 14px", borderRadius: 999, fontSize: 13, color: s.color, background: s.bg, fontWeight: 700 }}>
        {s.label}
      </span>
    );
  };

  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <span className="hero-kicker">신청 조회</span>
          <h1>신청 내역 확인</h1>
          <p style={{ maxWidth: 480 }}>
            등록하신 휴대폰 번호로 신청 상태와 결제 정보를 확인하세요.
          </p>
        </section>

        {/* 조회 폼 */}
        <section className="card">
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="휴대폰 번호 (01012345678)"
              style={{
                flex: 1,
                minWidth: 240,
                padding: "11px 16px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "rgba(16,20,31,0.8)",
                color: "var(--text)",
                fontSize: 15
              }}
            />
            <button className="button" type="submit" disabled={loading} style={{ fontSize: 15, padding: "11px 24px" }}>
              {loading ? "조회 중..." : "조회하기"}
            </button>
          </form>
          {error && <p style={{ color: "var(--accent)", fontSize: 14, marginTop: 10, marginBottom: 0 }}>{error}</p>}
        </section>

        {/* 조회 결과 */}
        {searched && (
          <>
            {applications.length === 0 ? (
              <section className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <h3 style={{ marginBottom: 8 }}>신청 내역이 없습니다</h3>
                <p className="muted" style={{ marginBottom: 20 }}>입력하신 번호로 등록된 신청이 없습니다. 번호를 다시 확인해주세요.</p>
                <Link href="/competitions" className="button" style={{ display: "inline-block" }}>대회 신청하기 →</Link>
              </section>
            ) : (
              <>
                <p className="muted" style={{ fontSize: 14, marginBottom: 8 }}>총 {applications.length}건의 신청 내역</p>
                {applications.map((a) => {
                  const payment = Array.isArray(a.payments) ? a.payments[0] : null;
                  return (
                    <section key={a.id} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-subtle)", fontFamily: "monospace" }}>{a.application_no}</p>
                          <h3 style={{ margin: 0 }}>{a.competitions?.title ?? "대회명 없음"}</h3>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>

                      <table style={{ fontSize: 14, width: "100%" }}>
                        <tbody>
                          {[
                            ["참가자명", a.participants?.name],
                            ["종목", a.divisions?.name ?? "미선택"],
                            ["대회일", a.competitions?.event_date],
                            ["장소", a.competitions?.location],
                            ["신청일", new Date(a.created_at).toLocaleDateString("ko-KR")]
                          ].map(([k, v]) => (
                            <tr key={String(k)}>
                              <td style={{ color: "var(--text-subtle)", paddingRight: 20, border: "none", paddingTop: 6, paddingBottom: 6, whiteSpace: "nowrap" }}>{k}</td>
                              <td style={{ border: "none", paddingTop: 6, paddingBottom: 6 }}>{v ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* 결제 정보 */}
                      {payment && (
                        <div style={{ marginTop: 14, padding: 14, borderRadius: 8, background: "rgba(16,20,31,0.4)", border: "1px solid var(--line)" }}>
                          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700 }}>결제 정보</p>
                          <table style={{ fontSize: 13 }}>
                            <tbody>
                              {[
                                ["입금자명", <span key="d" style={{ color: "var(--accent-2)", fontWeight: 700 }}>{payment.depositor_name}</span>],
                                ["금액", `${payment.amount?.toLocaleString()}원`],
                                ["결제 상태", <StatusBadge key="s" status={payment.status} />],
                                payment.confirmed_at ? ["확인일", new Date(payment.confirmed_at).toLocaleDateString("ko-KR")] : null
                              ].filter(Boolean).map((row) => {
                                const [k, v] = row as [string, React.ReactNode];
                                return (
                                  <tr key={String(k)}>
                                    <td style={{ color: "var(--text-subtle)", paddingRight: 20, border: "none", paddingTop: 4, paddingBottom: 4, whiteSpace: "nowrap" }}>{k}</td>
                                    <td style={{ border: "none", paddingTop: 4, paddingBottom: 4 }}>{v}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 입금 대기 안내 */}
                      {a.status === "신청" || a.status === "입금대기" ? (
                        <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", fontSize: 13, color: "var(--text-subtle)" }}>
                          ⚠️ 입금이 확인되지 않았습니다. 신청 완료 시 안내된 계좌로 참가비를 입금해주세요.
                        </div>
                      ) : a.status === "반려" ? (
                        <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#fca5a5" }}>
                          ❌ 신청이 반려되었습니다. 자세한 사유는 운영 담당자에게 문의해주세요.
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </>
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

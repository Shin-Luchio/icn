"use client";

import { useState, useEffect } from "react";

type Competition = { id: string; title: string; event_date: string };

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "신청", label: "신청" },
  { value: "입금대기", label: "입금대기" },
  { value: "결제완료", label: "결제완료" },
  { value: "승인완료", label: "승인완료" },
  { value: "반려", label: "반려" },
  { value: "취소", label: "취소" }
];

export function ExportsClient() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filterComp, setFilterComp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/competitions").then(r => r.json()).then(d => setCompetitions(Array.isArray(d) ? d : []));
  }, []);

  async function handleExport() {
    setLoading(true);
    setMsg("");
    const params = new URLSearchParams();
    if (filterComp) params.set("competition_id", filterComp);
    if (filterStatus) params.set("status", filterStatus);

    try {
      const res = await fetch(`/api/admin/export?${params}`);
      if (!res.ok) {
        const j = await res.json();
        setMsg(j.error || "내보내기 실패");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `icn-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg("CSV 다운로드가 완료되었습니다. 엑셀에서 열 수 있습니다.");
    } catch {
      setMsg("네트워크 오류가 발생했습니다.");
    }
    setLoading(false);
  }

  const selectStyle = { padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.8)", color: "var(--text)", fontSize: 14 };

  return (
    <section className="card">
      <h2 style={{ marginBottom: 8 }}>데이터 내보내기 (CSV)</h2>
      <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
        신청자 데이터를 CSV로 내려받아 엑셀에서 열 수 있습니다. BOM 포함으로 한글이 정상 표시됩니다.
      </p>

      {/* 포함 컬럼 안내 */}
      <div style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 8, marginBottom: 20, fontSize: 13, background: "rgba(16,20,31,0.4)" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 600 }}>포함 컬럼</p>
        <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
          신청번호 · 신청상태 · 참가자명 · 휴대폰 · 이메일 · 성별 · 생년월일 · 소속 ·
          종목 · 대회명 · 대회일 · 장소 · 입금자명 · 입금액 · 결제상태 · 결제확인일 ·
          번호표 · 체크인 · 신청일 · 메모
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>대회 필터</span>
          <select style={selectStyle} value={filterComp} onChange={e => setFilterComp(e.target.value)}>
            <option value="">전체 대회</option>
            {competitions.map(c => <option key={c.id} value={c.id}>{c.title} ({c.event_date})</option>)}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>상태 필터</span>
          <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {msg && (
        <p style={{ color: msg.includes("실패") || msg.includes("오류") ? "var(--accent)" : "#4ade80", fontSize: 14, marginBottom: 12 }}>
          {msg}
        </p>
      )}

      <button
        className="button"
        onClick={handleExport}
        disabled={loading}
        type="button"
        style={{ fontSize: 15 }}
      >
        {loading ? "생성 중..." : "⬇ CSV 다운로드"}
      </button>
    </section>
  );
}

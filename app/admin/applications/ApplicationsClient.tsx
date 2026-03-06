"use client";

import { useState, useEffect, useCallback } from "react";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "신청":    { label: "신청", color: "#93c5fd", bg: "rgba(59,130,246,0.12)" },
  "입금대기": { label: "입금대기", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  "결제완료": { label: "결제완료", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  "검수중":  { label: "검수중", color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  "승인완료": { label: "승인완료", color: "#4ade80", bg: "rgba(74,222,128,0.2)" },
  "반려":    { label: "반려", color: "#fca5a5", bg: "rgba(239,68,68,0.12)" },
  "취소":    { label: "취소", color: "#9ca3af", bg: "rgba(107,114,128,0.12)" },
  "환불":    { label: "환불", color: "#9ca3af", bg: "rgba(107,114,128,0.12)" }
};

type Application = {
  id: string;
  application_no: string;
  status: string;
  created_at: string;
  memo: string | null;
  bib_number: number | null;
  reject_reason: string | null;
  participants: { name: string; phone: string; email: string | null; gender: string | null; birth_date: string | null; affiliation: string | null } | null;
  divisions: { name: string; gender: string | null } | null;
  competitions: { title: string; event_date: string } | null;
  payments: { depositor_name: string; amount: number; status: string }[] | null;
};

type Competition = { id: string; title: string; event_date: string };

const ALL_STATUSES = ["신청", "입금대기", "결제완료", "검수중", "승인완료", "반려", "취소"];

export function ApplicationsClient() {
  const [items, setItems] = useState<Application[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterComp, setFilterComp] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState("");

  const fetchCompetitions = useCallback(async () => {
    const res = await fetch("/api/admin/competitions");
    if (res.ok) setCompetitions(await res.json());
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    if (filterComp) params.set("competition_id", filterComp);
    const res = await fetch(`/api/admin/applications?${params}`);
    if (res.ok) {
      const json = await res.json();
      setItems(json.data ?? []);
      setTotal(json.total ?? 0);
    }
    setLoading(false);
  }, [search, filterStatus, filterComp, page]);

  useEffect(() => { fetchCompetitions(); }, [fetchCompetitions]);
  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleStatusChange(id: string) {
    if (!newStatus) return;
    setStatusChanging(true);
    const body: Record<string, unknown> = { status: newStatus };
    if (newStatus === "반려" && rejectReason) body.reject_reason = rejectReason;
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setMsg("상태가 변경되었습니다.");
      setSelected(null);
      fetchData();
    } else {
      const j = await res.json();
      setMsg(j.error || "변경 실패");
    }
    setStatusChanging(false);
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const s = STATUS_LABELS[status] ?? { label: status, color: "#9ca3af", bg: "rgba(107,114,128,0.12)" };
    return (
      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, color: s.color, background: s.bg, fontWeight: 600, whiteSpace: "nowrap" }}>
        {s.label}
      </span>
    );
  };

  return (
    <section className="card">
      <h2 style={{ marginBottom: 16 }}>신청자 관리</h2>

      {msg && <p style={{ color: "#4ade80", fontSize: 14, marginBottom: 12 }}>{msg}</p>}

      {/* 필터 */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          placeholder="신청번호 검색..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.8)", color: "var(--text)", fontSize: 14, minWidth: 180 }}
        />
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.8)", color: "var(--text)", fontSize: 14 }}
        >
          <option value="">전체 상태</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterComp}
          onChange={e => { setFilterComp(e.target.value); setPage(1); }}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.8)", color: "var(--text)", fontSize: 14, minWidth: 160 }}
        >
          <option value="">전체 대회</option>
          {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <button className="button secondary" onClick={fetchData} type="button" style={{ padding: "8px 16px", fontSize: 13 }}>새로고침</button>
      </div>

      <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>총 {total}건</p>

      {/* 목록 */}
      {loading ? (
        <p className="muted">로딩 중...</p>
      ) : items.length === 0 ? (
        <p className="muted">신청 데이터가 없습니다.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ fontSize: 13, width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>신청번호</th>
                <th style={{ textAlign: "left" }}>이름</th>
                <th style={{ textAlign: "left" }}>연락처</th>
                <th style={{ textAlign: "left" }}>종목</th>
                <th style={{ textAlign: "left" }}>대회</th>
                <th>상태</th>
                <th>신청일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{a.application_no}</td>
                  <td style={{ fontWeight: 600 }}>{a.participants?.name ?? "-"}</td>
                  <td style={{ color: "var(--text-subtle)" }}>{a.participants?.phone ?? "-"}</td>
                  <td style={{ color: "var(--text-subtle)" }}>{a.divisions?.name ?? "미선택"}</td>
                  <td style={{ color: "var(--text-subtle)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.competitions?.title ?? "-"}</td>
                  <td style={{ textAlign: "center" }}><StatusBadge status={a.status} /></td>
                  <td style={{ color: "var(--text-subtle)", fontSize: 12 }}>{new Date(a.created_at).toLocaleDateString("ko-KR")}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="button secondary"
                      onClick={() => { setSelected(a); setNewStatus(a.status); setRejectReason(a.reject_reason ?? ""); setMsg(""); }}
                      type="button"
                      style={{ padding: "3px 10px", fontSize: 12 }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {total > 30 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
          {page > 1 && <button className="button secondary" onClick={() => setPage(p => p - 1)} type="button" style={{ fontSize: 13, padding: "6px 14px" }}>← 이전</button>}
          <span style={{ padding: "6px 14px", fontSize: 13, color: "var(--text-subtle)" }}>{page} / {Math.ceil(total / 30)}</span>
          {page * 30 < total && <button className="button secondary" onClick={() => setPage(p => p + 1)} type="button" style={{ fontSize: 13, padding: "6px 14px" }}>다음 →</button>}
        </div>
      )}

      {/* 상세/상태변경 모달 */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#0f1420", border: "1px solid var(--line)", borderRadius: 12, padding: 28, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>신청 상세</h3>
              <button onClick={() => setSelected(null)} type="button" style={{ background: "none", border: "none", color: "var(--text-subtle)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <table style={{ fontSize: 14, width: "100%", marginBottom: 20 }}>
              <tbody>
                {[
                  ["신청번호", selected.application_no],
                  ["현재 상태", <StatusBadge key="s" status={selected.status} />],
                  ["참가자명", selected.participants?.name],
                  ["연락처", selected.participants?.phone],
                  ["이메일", selected.participants?.email ?? "-"],
                  ["성별", selected.participants?.gender ?? "-"],
                  ["소속", selected.participants?.affiliation ?? "-"],
                  ["종목", selected.divisions?.name ?? "미선택"],
                  ["대회", selected.competitions?.title],
                  ["신청일", new Date(selected.created_at).toLocaleString("ko-KR")],
                  ["비고", selected.memo ?? "-"],
                  ["번호표", selected.bib_number ?? "-"],
                  ...(selected.reject_reason ? [["반려 사유", selected.reject_reason]] : [])
                ].map(([k, v]) => (
                  <tr key={String(k)}>
                    <td style={{ color: "var(--text-subtle)", paddingRight: 16, border: "none", paddingTop: 6, paddingBottom: 6, whiteSpace: "nowrap", verticalAlign: "top" }}>{k}</td>
                    <td style={{ border: "none", paddingTop: 6, paddingBottom: 6 }}>{v as React.ReactNode}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 결제 정보 */}
            {selected.payments && selected.payments.length > 0 && (
              <div style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
                <strong style={{ display: "block", marginBottom: 8 }}>결제 정보</strong>
                {selected.payments.map((p, i) => (
                  <div key={i} style={{ color: "var(--text-subtle)" }}>
                    {p.depositor_name} / {p.amount?.toLocaleString()}원 / <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            )}

            {/* 상태 변경 */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <h4 style={{ marginBottom: 12 }}>상태 변경</h4>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    type="button"
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: newStatus === s ? "2px solid var(--accent-2)" : "1px solid var(--line)",
                      background: newStatus === s ? "rgba(249,115,22,0.15)" : "rgba(16,20,31,0.5)",
                      color: newStatus === s ? "var(--accent-2)" : "var(--text-subtle)",
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {newStatus === "반려" && (
                <textarea
                  placeholder="반려 사유를 입력하세요..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.8)", color: "var(--text)", fontSize: 13, minHeight: 60, resize: "vertical", marginBottom: 10, boxSizing: "border-box" }}
                />
              )}
              <button
                className="button"
                onClick={() => handleStatusChange(selected.id)}
                disabled={statusChanging || newStatus === selected.status}
                type="button"
              >
                {statusChanging ? "변경 중..." : "상태 저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

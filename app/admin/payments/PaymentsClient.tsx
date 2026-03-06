"use client";

import { useState, useEffect, useCallback } from "react";

type Payment = {
  id: string;
  depositor_name: string;
  amount: number;
  status: string;
  confirmed_at: string | null;
  created_at: string;
  applications: {
    application_no: string;
    status: string;
    participants: { name: string; phone: string } | null;
    competitions: { title: string; event_date: string } | null;
    divisions: { name: string } | null;
  } | null;
};

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  "신청":    { color: "#93c5fd", bg: "rgba(59,130,246,0.12)" },
  "입금대기": { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  "결제완료": { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  "환불":    { color: "#9ca3af", bg: "rgba(107,114,128,0.12)" }
};

export function PaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/admin/payments?${params}`);
    if (res.ok) {
      const json = await res.json();
      setPayments(json.data ?? []);
    }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleStatusChange(paymentId: string, newStatus: string) {
    if (!confirm(`결제 상태를 "${newStatus}"로 변경하시겠습니까?`)) return;
    setUpdating(paymentId);
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: paymentId, status: newStatus })
    });
    if (res.ok) {
      setMsg(`상태가 "${newStatus}"로 변경되었습니다.`);
      fetchData();
    } else {
      const j = await res.json();
      setMsg(j.error || "변경 실패");
    }
    setUpdating(null);
  }

  const Badge = ({ status }: { status: string }) => {
    const s = STATUS_STYLES[status] ?? { color: "#9ca3af", bg: "rgba(107,114,128,0.12)" };
    return (
      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, color: s.color, background: s.bg, fontWeight: 600 }}>
        {status}
      </span>
    );
  };

  // 통계
  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === "입금대기").length,
    confirmed: payments.filter(p => p.status === "결제완료").length,
    totalAmount: payments.filter(p => p.status === "결제완료").reduce((s, p) => s + (p.amount ?? 0), 0)
  };

  return (
    <section className="card">
      <h2 style={{ marginBottom: 16 }}>결제 상태 관리</h2>

      {/* 통계 */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "전체", value: stats.total, color: "#e5e7eb" },
          { label: "입금대기", value: stats.pending, color: "#fbbf24" },
          { label: "결제완료", value: stats.confirmed, color: "#4ade80" },
          { label: "확인금액", value: `${stats.totalAmount.toLocaleString()}원`, color: "#4ade80" }
        ].map(s => (
          <div key={s.label} style={{ padding: "12px 20px", border: "1px solid var(--line)", borderRadius: 8, background: "rgba(16,20,31,0.5)" }}>
            <div style={{ fontSize: 12, color: "var(--text-subtle)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {msg && <p style={{ color: "#4ade80", fontSize: 14, marginBottom: 12 }}>{msg}</p>}

      {/* 필터 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.8)", color: "var(--text)", fontSize: 14 }}
        >
          <option value="">전체 상태</option>
          {["신청", "입금대기", "결제완료", "환불"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="button secondary" onClick={fetchData} type="button" style={{ padding: "8px 16px", fontSize: 13 }}>새로고침</button>
      </div>

      {loading ? (
        <p className="muted">로딩 중...</p>
      ) : payments.length === 0 ? (
        <p className="muted">결제 데이터가 없습니다.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ fontSize: 13, width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>신청번호</th>
                <th style={{ textAlign: "left" }}>참가자</th>
                <th style={{ textAlign: "left" }}>대회</th>
                <th style={{ textAlign: "left" }}>종목</th>
                <th style={{ textAlign: "left" }}>입금자명</th>
                <th>금액</th>
                <th>상태</th>
                <th>확인일</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.applications?.application_no ?? "-"}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.applications?.participants?.name ?? "-"}</div>
                    <div style={{ color: "var(--text-subtle)", fontSize: 11 }}>{p.applications?.participants?.phone ?? ""}</div>
                  </td>
                  <td style={{ color: "var(--text-subtle)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.applications?.competitions?.title ?? "-"}</td>
                  <td style={{ color: "var(--text-subtle)" }}>{p.applications?.divisions?.name ?? "-"}</td>
                  <td style={{ fontWeight: 600, color: "var(--accent-2)" }}>{p.depositor_name}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{p.amount?.toLocaleString()}원</td>
                  <td style={{ textAlign: "center" }}><Badge status={p.status} /></td>
                  <td style={{ color: "var(--text-subtle)", fontSize: 12 }}>
                    {p.confirmed_at ? new Date(p.confirmed_at).toLocaleDateString("ko-KR") : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {p.status === "입금대기" || p.status === "신청" ? (
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        <button
                          onClick={() => handleStatusChange(p.id, "결제완료")}
                          disabled={updating === p.id}
                          type="button"
                          style={{ padding: "3px 10px", fontSize: 12, background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 6, cursor: "pointer" }}
                        >
                          확인
                        </button>
                        <button
                          onClick={() => handleStatusChange(p.id, "환불")}
                          disabled={updating === p.id}
                          type="button"
                          style={{ padding: "3px 10px", fontSize: 12, background: "rgba(107,114,128,0.1)", color: "#9ca3af", border: "1px solid rgba(107,114,128,0.3)", borderRadius: 6, cursor: "pointer" }}
                        >
                          환불
                        </button>
                      </div>
                    ) : p.status === "결제완료" ? (
                      <button
                        onClick={() => handleStatusChange(p.id, "환불")}
                        disabled={updating === p.id}
                        type="button"
                        style={{ padding: "3px 10px", fontSize: 12, background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, cursor: "pointer" }}
                      >
                        환불
                      </button>
                    ) : (
                      <span style={{ color: "var(--text-subtle)", fontSize: 12 }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

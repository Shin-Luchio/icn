"use client";

import { useState, useEffect, useCallback } from "react";

type Competition = { id: string; title: string };

const TRIGGER_LABELS = [
  { value: "신청완료", label: "신청 완료 안내" },
  { value: "입금안내", label: "입금 안내" },
  { value: "결제확정", label: "결제 확정 안내" },
  { value: "반려안내", label: "반려 안내" },
  { value: "D-1",     label: "대회 D-1 안내" },
  { value: "D-day",   label: "대회 당일 안내" }
];

const STATUS_TARGETS = [
  { value: "",       label: "전체" },
  { value: "신청",   label: "신청자 (입금 전)" },
  { value: "입금대기", label: "입금대기" },
  { value: "결제완료", label: "결제완료자" },
  { value: "승인완료", label: "승인완료자" }
];

export function MessagesClient() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filterComp, setFilterComp] = useState("");
  const [filterStatus, setFilterStatus] = useState("결제완료");
  const [trigger, setTrigger] = useState("신청완료");
  const [preview, setPreview] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [targetCount, setTargetCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/competitions").then(r => r.json()).then(d => setCompetitions(Array.isArray(d) ? d : []));
  }, []);

  const loadPreview = useCallback(async () => {
    setPreview(
      trigger === "신청완료"
        ? `[ICN] {참가자명}님의 신청이 완료되었습니다.\n신청번호: {신청번호}\n입금 계좌: {계좌}\n입금자명: {입금자명}\n참가비: {금액}원`
        : trigger === "결제확정"
        ? `[ICN] {참가자명}님의 참가비 납입이 확인되었습니다.\n대회: {대회명} ({대회일})\n종목: {종목}\n감사합니다.`
        : trigger === "D-1"
        ? `[ICN] 내일은 {대회명} 대회 날입니다!\n일시: {대회일}\n장소: {장소}\n준비 잘 하시고 건강하게 뵙겠습니다.`
        : `[ICN] {참가자명}님께 안내 메시지를 발송합니다.`
    );

    // 대상 수 미리 조회
    const params = new URLSearchParams({ limit: "1" });
    if (filterComp) params.set("competition_id", filterComp);
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/admin/applications?${params}`);
    if (res.ok) {
      const json = await res.json();
      setTargetCount(json.total ?? 0);
    }
  }, [trigger, filterComp, filterStatus]);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  async function handleSend() {
    if (!confirm(`${targetCount ?? "?"}명에게 메시지를 발송하시겠습니까?`)) return;
    setSending(true);
    // TODO: 실제 SOLAPI 연동 시 /api/admin/messages POST
    await new Promise(r => setTimeout(r, 1000));
    setMsg(`✓ 발송 요청 완료 (${targetCount}명). 실제 발송은 알림톡 연동 후 활성화됩니다.`);
    setSending(false);
  }

  const selectStyle = { padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.8)", color: "var(--text)", fontSize: 14, width: "100%" };

  return (
    <section className="card">
      <h2 style={{ marginBottom: 16 }}>메시지 발송 센터</h2>
      <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
        발송 채널: 알림톡 → SMS fallback (SOLAPI 연동 후 활성화)
      </p>

      <div className="grid grid-2" style={{ gap: 16, marginBottom: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>발송 템플릿</span>
          <select style={selectStyle} value={trigger} onChange={e => setTrigger(e.target.value)}>
            {TRIGGER_LABELS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>대상 대회</span>
          <select style={selectStyle} value={filterComp} onChange={e => setFilterComp(e.target.value)}>
            <option value="">전체 대회</option>
            {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>대상 상태</span>
          <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {STATUS_TARGETS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>발송 대상 수</span>
          <div style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.5)", fontSize: 22, fontWeight: 700, color: targetCount === 0 ? "var(--text-subtle)" : "var(--accent-2)" }}>
            {targetCount === null ? "-" : `${targetCount}명`}
          </div>
        </div>
      </div>

      {/* 메시지 미리보기 */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: "var(--text-subtle)", marginBottom: 8 }}>메시지 미리보기</p>
        <div style={{ padding: 16, borderRadius: 8, border: "1px solid var(--line)", background: "rgba(16,20,31,0.5)", fontSize: 14, whiteSpace: "pre-line", lineHeight: 1.7, color: "var(--text-subtle)" }}>
          {preview}
        </div>
      </div>

      {msg && <p style={{ color: "#4ade80", fontSize: 14, marginBottom: 12 }}>{msg}</p>}

      <button
        className="button"
        onClick={handleSend}
        disabled={sending || !targetCount}
        type="button"
        style={{ fontSize: 16 }}
      >
        {sending ? "발송 중..." : `${targetCount ?? 0}명에게 즉시 발송`}
      </button>

      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
        ※ SOLAPI 알림톡 키 설정 후 실제 발송이 활성화됩니다.
      </p>
    </section>
  );
}

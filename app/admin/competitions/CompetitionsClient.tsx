"use client";

import { useState, useEffect, useCallback } from "react";

type Competition = {
  id: string;
  title: string;
  event_date: string;
  location: string;
  fee: number;
  is_public: boolean;
  registration_open_at: string | null;
  registration_close_at: string | null;
  host_name: string | null;
  bank_account: string;
  description: string | null;
};

const EMPTY_FORM = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  fee: "",
  bank_account: "",
  host_name: "",
  registration_open_at: "",
  registration_close_at: "",
  is_public: false,
  max_applicants: ""
};

type FormState = typeof EMPTY_FORM;

export function CompetitionsClient() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/competitions");
    if (res.ok) setCompetitions(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMsg("");
  }

  function openEdit(c: Competition) {
    setEditId(c.id);
    setForm({
      title: c.title,
      description: c.description ?? "",
      event_date: c.event_date,
      location: c.location,
      fee: String(c.fee),
      bank_account: c.bank_account,
      host_name: c.host_name ?? "",
      registration_open_at: c.registration_open_at ? c.registration_open_at.slice(0, 16) : "",
      registration_close_at: c.registration_close_at ? c.registration_close_at.slice(0, 16) : "",
      is_public: c.is_public,
      max_applicants: ""
    });
    setShowForm(true);
    setMsg("");
  }

  async function handleSave() {
    if (!form.title || !form.event_date || !form.location || !form.bank_account) {
      setMsg("필수 항목을 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    setMsg("");
    const method = editId ? "PATCH" : "POST";
    const url = editId ? `/api/admin/competitions/${editId}` : "/api/admin/competitions";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fee: Number(form.fee) || 0,
        max_applicants: form.max_applicants ? Number(form.max_applicants) : null
      })
    });

    if (res.ok) {
      setMsg(editId ? "수정 완료" : "생성 완료");
      setShowForm(false);
      setEditId(null);
      fetchData();
    } else {
      const json = await res.json();
      setMsg(json.error || "저장 실패");
    }
    setSaving(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 대회를 삭제하시겠습니까?\n관련 신청 데이터도 모두 삭제됩니다.`)) return;
    const res = await fetch(`/api/admin/competitions/${id}`, { method: "DELETE" });
    if (res.ok) { setMsg("삭제 완료"); fetchData(); }
    else { const j = await res.json(); setMsg(j.error || "삭제 실패"); }
  }

  async function togglePublic(c: Competition) {
    await fetch(`/api/admin/competitions/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: !c.is_public })
    });
    fetchData();
  }

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--line)",
    background: "rgba(16,20,31,0.8)",
    color: "var(--text)",
    fontSize: 14,
    boxSizing: "border-box" as const
  };

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>대회 관리</h2>
        <button className="button" onClick={openCreate} type="button">+ 대회 생성</button>
      </div>

      {msg && (
        <p style={{ color: msg.includes("실패") || msg.includes("입력") ? "var(--accent)" : "#4ade80", marginBottom: 12, fontSize: 14 }}>
          {msg}
        </p>
      )}

      {/* 생성/수정 폼 */}
      {showForm && (
        <div style={{ padding: 20, border: "1px solid var(--line)", borderRadius: 10, marginBottom: 20, background: "rgba(16,20,31,0.6)" }}>
          <h3 style={{ marginBottom: 16 }}>{editId ? "대회 수정" : "새 대회 생성"}</h3>
          <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>대회명 *</span>
              <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ICN 오픈 2026" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>주최</span>
              <input style={inputStyle} value={form.host_name} onChange={e => setForm(f => ({ ...f, host_name: e.target.value }))} placeholder="ICN 운영사무국" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>대회일 *</span>
              <input type="date" style={inputStyle} value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>장소 *</span>
              <input style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="인천 컨벤션 센터" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>참가비 (원) *</span>
              <input type="number" style={inputStyle} value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="70000" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>입금 계좌 *</span>
              <input style={inputStyle} value={form.bank_account} onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))} placeholder="신한 110-000-000000 (ICN)" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>접수 시작</span>
              <input type="datetime-local" style={inputStyle} value={form.registration_open_at} onChange={e => setForm(f => ({ ...f, registration_open_at: e.target.value }))} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>접수 마감</span>
              <input type="datetime-local" style={inputStyle} value={form.registration_close_at} onChange={e => setForm(f => ({ ...f, registration_close_at: e.target.value }))} />
            </label>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>대회 설명</span>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="대회 소개 문구를 입력하세요." />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} style={{ width: "auto" }} />
            <span style={{ fontSize: 14 }}>공개 (체크 시 대외 사이트에 노출)</span>
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="button" onClick={handleSave} disabled={saving} type="button">
              {saving ? "저장 중..." : editId ? "수정 완료" : "생성"}
            </button>
            <button className="button secondary" onClick={() => setShowForm(false)} type="button">취소</button>
          </div>
        </div>
      )}

      {/* 대회 목록 */}
      {loading ? (
        <p className="muted">로딩 중...</p>
      ) : competitions.length === 0 ? (
        <p className="muted">등록된 대회가 없습니다.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ fontSize: 14, width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>대회명</th>
                <th style={{ textAlign: "left" }}>일정</th>
                <th style={{ textAlign: "left" }}>장소</th>
                <th>참가비</th>
                <th>공개</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td style={{ color: "var(--text-subtle)" }}>{c.event_date}</td>
                  <td style={{ color: "var(--text-subtle)" }}>{c.location}</td>
                  <td style={{ textAlign: "center" }}>{c.fee.toLocaleString()}원</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => togglePublic(c)}
                      type="button"
                      style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        background: c.is_public ? "rgba(74,222,128,0.15)" : "rgba(107,114,128,0.15)",
                        color: c.is_public ? "#4ade80" : "#9ca3af"
                      }}
                    >
                      {c.is_public ? "공개" : "비공개"}
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button className="button secondary" onClick={() => openEdit(c)} type="button" style={{ padding: "4px 10px", fontSize: 12 }}>수정</button>
                      <button onClick={() => handleDelete(c.id, c.title)} type="button" style={{ padding: "4px 10px", fontSize: 12, background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, cursor: "pointer" }}>삭제</button>
                    </div>
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

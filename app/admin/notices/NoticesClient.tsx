"use client";

import { useState, useEffect, useCallback } from "react";

type Notice = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  competition_id: string | null;
  competitions?: { title: string } | null;
};

type Competition = { id: string; title: string };

const EMPTY_FORM = { title: "", content: "", competition_id: "", is_pinned: false, is_published: false };
type FormState = typeof EMPTY_FORM;

export function NoticesClient() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [nr, cr] = await Promise.all([
      fetch("/api/admin/notices"),
      fetch("/api/admin/competitions")
    ]);
    if (nr.ok) setNotices(await nr.json());
    if (cr.ok) setCompetitions(await cr.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMsg("");
  }

  function openEdit(n: Notice) {
    setEditId(n.id);
    setForm({
      title: n.title,
      content: n.content,
      competition_id: n.competition_id ?? "",
      is_pinned: n.is_pinned,
      is_published: n.is_published
    });
    setShowForm(true);
    setMsg("");
  }

  async function handleSave() {
    if (!form.title || !form.content) {
      setMsg("제목과 내용을 입력해주세요.");
      return;
    }
    setSaving(true);
    setMsg("");
    const method = editId ? "PATCH" : "POST";
    const url = editId ? `/api/admin/notices/${editId}` : "/api/admin/notices";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, competition_id: form.competition_id || null })
    });
    if (res.ok) {
      setMsg(editId ? "공지 수정 완료" : "공지 등록 완료");
      setShowForm(false);
      fetchAll();
    } else {
      const j = await res.json();
      setMsg(j.error || "저장 실패");
    }
    setSaving(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 공지를 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    if (res.ok) { setMsg("삭제 완료"); fetchAll(); }
    else { const j = await res.json(); setMsg(j.error || "삭제 실패"); }
  }

  async function togglePublish(n: Notice) {
    const res = await fetch(`/api/admin/notices/${n.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !n.is_published })
    });
    if (res.ok) fetchAll();
  }

  const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "rgba(16,20,31,0.8)", color: "var(--text)", fontSize: 14, boxSizing: "border-box" as const };

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>공지사항 관리</h2>
        <button className="button" onClick={openCreate} type="button">+ 공지 등록</button>
      </div>

      {msg && <p style={{ color: msg.includes("실패") || msg.includes("입력") ? "var(--accent)" : "#4ade80", fontSize: 14, marginBottom: 12 }}>{msg}</p>}

      {/* 작성 폼 */}
      {showForm && (
        <div style={{ padding: 20, border: "1px solid var(--line)", borderRadius: 10, marginBottom: 20, background: "rgba(16,20,31,0.6)" }}>
          <h3 style={{ marginBottom: 16 }}>{editId ? "공지 수정" : "새 공지 등록"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>제목 *</span>
              <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="공지 제목" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>연결 대회 (선택)</span>
              <select style={inputStyle} value={form.competition_id} onChange={e => setForm(f => ({ ...f, competition_id: e.target.value }))}>
                <option value="">전체 공지 (대회 무관)</option>
                {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>내용 *</span>
              <textarea style={{ ...inputStyle, minHeight: 160, resize: "vertical" }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="공지 내용을 입력하세요." />
            </label>
            <div style={{ display: "flex", gap: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} style={{ width: "auto" }} />
                <span style={{ fontSize: 14 }}>상단 고정</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} style={{ width: "auto" }} />
                <span style={{ fontSize: 14 }}>즉시 공개</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="button" onClick={handleSave} disabled={saving} type="button">{saving ? "저장 중..." : editId ? "수정 완료" : "등록"}</button>
              <button className="button secondary" onClick={() => setShowForm(false)} type="button">취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? <p className="muted">로딩 중...</p> : notices.length === 0 ? <p className="muted">등록된 공지가 없습니다.</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ fontSize: 13, width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>제목</th>
                <th style={{ textAlign: "left" }}>연결 대회</th>
                <th>고정</th>
                <th>공개</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.map(n => (
                <tr key={n.id}>
                  <td style={{ fontWeight: n.is_pinned ? 700 : 400 }}>
                    {n.is_pinned && <span style={{ color: "var(--accent-2)", marginRight: 6 }}>📌</span>}
                    {n.title}
                  </td>
                  <td style={{ color: "var(--text-subtle)" }}>{(n.competitions as { title: string } | null)?.title ?? "전체"}</td>
                  <td style={{ textAlign: "center" }}>{n.is_pinned ? "✓" : ""}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => togglePublish(n)}
                      type="button"
                      style={{ padding: "3px 10px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, background: n.is_published ? "rgba(74,222,128,0.15)" : "rgba(107,114,128,0.15)", color: n.is_published ? "#4ade80" : "#9ca3af" }}
                    >
                      {n.is_published ? "공개" : "비공개"}
                    </button>
                  </td>
                  <td style={{ color: "var(--text-subtle)", fontSize: 12 }}>{new Date(n.created_at).toLocaleDateString("ko-KR")}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button className="button secondary" onClick={() => openEdit(n)} type="button" style={{ padding: "3px 10px", fontSize: 12 }}>수정</button>
                      <button onClick={() => handleDelete(n.id, n.title)} type="button" style={{ padding: "3px 10px", fontSize: 12, background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, cursor: "pointer" }}>삭제</button>
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

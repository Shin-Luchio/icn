"use client";

import { useState } from "react";
import Link from "next/link";
import type { CompetitionWithDivisions } from "@/lib/competitions";
import { getRegistrationStatus } from "@/lib/competition-utils";
import type { Route } from "next";

type ApplyResult = {
  application_no: string;
  competition: { title: string; fee: number; bank_account: string };
  depositor_name: string;
};

export function CompetitionApplyForm({ competition }: { competition: CompetitionWithDivisions }) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [error, setError] = useState("");

  // 접수 기간 체크
  const regStatus = getRegistrationStatus(competition);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value;
    const getChecked = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement)?.checked;

    const payload = {
      name: get("name"),
      phone: get("phone"),
      email: get("email") || undefined,
      birth_date: get("birth_date") || undefined,
      gender: get("gender") || undefined,
      affiliation: get("affiliation") || undefined,
      competition_id: competition.id,
      division_id: get("division_id") || undefined,
      memo: get("memo") || undefined,
      consent_privacy: getChecked("consent_privacy")
    };

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "신청 처리 중 오류가 발생했습니다.");
      } else {
        setResult(json);
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }

    setSubmitting(false);
  }

  // 접수 기간 아닌 경우
  if (regStatus === "upcoming") {
    const openDate = competition.registration_open_at
      ? new Date(competition.registration_open_at).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "";
    return (
      <section className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <h2 style={{ marginBottom: 8 }}>아직 접수 기간이 아닙니다</h2>
        <p className="muted" style={{ marginBottom: 4 }}>접수 시작: <strong>{openDate}</strong></p>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>접수 시작 후 다시 방문해주세요.</p>
        <Link href={"/competitions" as Route} className="button secondary" style={{ display: "inline-block" }}>← 대회 목록으로</Link>
      </section>
    );
  }

  if (regStatus === "closed") {
    return (
      <section className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h2 style={{ marginBottom: 8 }}>접수가 마감되었습니다</h2>
        <p className="muted" style={{ marginBottom: 20 }}>해당 대회의 참가 신청 접수 기간이 종료되었습니다.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={"/competitions" as Route} className="button secondary" style={{ display: "inline-block" }}>← 다른 대회 보기</Link>
          <Link href={"/notices" as Route} className="button" style={{ display: "inline-block" }}>공지사항 확인</Link>
        </div>
      </section>
    );
  }

  // 신청 완료
  if (result) {
    return (
      <section className="card">
        <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h2 style={{ marginBottom: 6 }}>신청이 완료되었습니다!</h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 0 }}>
            아래 안내에 따라 참가비를 입금해주세요.
          </p>
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "rgba(16,20,31,0.6)",
            marginBottom: 16
          }}
        >
          <p style={{ margin: "0 0 6px" }}>
            신청번호: <strong style={{ color: "var(--accent-2)", fontFamily: "monospace", fontSize: 15 }}>{result.application_no}</strong>
          </p>
          <p style={{ margin: 0, color: "var(--text-subtle)", fontSize: 14 }}>{result.competition.title}</p>
        </div>

        <h3 style={{ marginBottom: 12 }}>입금 안내</h3>
        <table style={{ fontSize: 14 }}>
          <tbody>
            {[
              ["참가비", `${result.competition.fee.toLocaleString()}원`],
              ["입금 계좌", result.competition.bank_account],
              ["입금자명", <><strong key="n" style={{ color: "var(--accent-2)" }}>{result.depositor_name}</strong><span key="s" className="muted" style={{ fontSize: 12 }}> (참가자명 + 휴대폰 뒤 4자리)</span></>]
            ].map(([k, v]) => (
              <tr key={String(k)}>
                <td style={{ color: "var(--text-subtle)", paddingRight: 20, border: "none", paddingTop: 8, paddingBottom: 8 }}>{k}</td>
                <td style={{ border: "none", paddingTop: 8, paddingBottom: 8, fontWeight: 700 }}>{v as React.ReactNode}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", fontSize: 13 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 600 }}>📌 신청번호를 꼭 메모해두세요!</p>
          <p className="muted" style={{ margin: 0 }}>
            신청 조회 페이지에서 휴대폰 번호로 신청 상태를 확인할 수 있습니다.
            입금 확인 후 영업일 기준 24시간 내 결제완료 안내가 발송됩니다.
          </p>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={"/lookup" as Route} className="button secondary" style={{ display: "inline-block" }}>
            신청 내역 확인 →
          </Link>
          <Link href={"/competitions" as Route} className="button secondary" style={{ display: "inline-block" }}>
            ← 대회 목록으로
          </Link>
        </div>
      </section>
    );
  }

  const inputStyle = {
    display: "block" as const,
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid var(--line)",
    background: "rgba(16,20,31,0.8)",
    color: "var(--text)",
    fontSize: 15,
    boxSizing: "border-box" as const,
    marginTop: 6
  };

  return (
    <form className="card grid" onSubmit={handleSubmit} style={{ gap: 18 }}>
      {/* 대회 정보 요약 */}
      <div
        style={{
          padding: "14px 16px",
          borderRadius: 8,
          background: "rgba(249,115,22,0.06)",
          border: "1px solid rgba(249,115,22,0.2)",
          fontSize: 14
        }}
      >
        <strong>{competition.title}</strong>
        <span className="muted"> &nbsp;·&nbsp; {competition.event_date} &nbsp;·&nbsp; {competition.location}</span>
        <span style={{ color: "var(--accent-2)", fontWeight: 600, marginLeft: 8 }}>
          {competition.fee.toLocaleString()}원
        </span>
        {competition.registration_close_at && (
          <div style={{ marginTop: 4, fontSize: 12, color: "#fbbf24" }}>
            ⏰ 접수 마감: {new Date(competition.registration_close_at).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      {/* 부문 선택 */}
      {competition.divisions.length > 0 && (
        <label>
          <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>참가 부문 *</span>
          <select name="division_id" required style={inputStyle}>
            <option value="">-- 부문을 선택하세요 --</option>
            {competition.divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}{d.gender && d.gender !== "혼성" ? ` (${d.gender})` : ""}
                {d.entry_fee ? ` — ${d.entry_fee.toLocaleString()}원` : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* 2열 그리드 */}
      <div className="grid grid-2" style={{ gap: 14 }}>
        <label>
          <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>참가자명 *</span>
          <input className="input" style={inputStyle} name="name" placeholder="홍길동" required />
        </label>
        <label>
          <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>휴대폰 *</span>
          <input className="input" style={inputStyle} name="phone" type="tel" placeholder="01012345678" required />
        </label>
        <label>
          <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>이메일</span>
          <input className="input" style={inputStyle} name="email" type="email" placeholder="example@email.com" />
        </label>
        <label>
          <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>생년월일</span>
          <input className="input" style={inputStyle} name="birth_date" type="date" />
        </label>
        <label>
          <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>성별</span>
          <select name="gender" style={inputStyle}>
            <option value="">선택 안 함</option>
            <option value="남">남</option>
            <option value="여">여</option>
          </select>
        </label>
        <label>
          <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>소속 (팀/체육관)</span>
          <input className="input" style={inputStyle} name="affiliation" placeholder="OO 체육관 (없으면 공란)" />
        </label>
      </div>

      <label>
        <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>비고 (선택)</span>
        <textarea name="memo" rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="알레르기, 특이사항 등 전달할 내용을 입력하세요." />
      </label>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <input
          type="checkbox"
          name="consent_privacy"
          required
          style={{ width: "auto", marginTop: 4, flexShrink: 0 }}
        />
        <span style={{ fontSize: 14 }}>
          개인정보(이름, 연락처, 생년월일 등)를 대회 운영 목적으로 수집·이용하는 것에 동의합니다. (필수)
        </span>
      </label>

      {error && (
        <p style={{ color: "var(--accent)", margin: 0, fontSize: 14 }}>{error}</p>
      )}

      <button className="button" type="submit" disabled={submitting} style={{ fontSize: 16, padding: "13px" }}>
        {submitting ? "처리 중..." : "신청하기"}
      </button>
    </form>
  );
}

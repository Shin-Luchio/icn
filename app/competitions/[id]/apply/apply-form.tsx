"use client";

import { useState } from "react";
import Link from "next/link";
import type { CompetitionWithDivisions } from "@/lib/competitions";
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
            신청번호: <strong style={{ color: "var(--accent-2)" }}>{result.application_no}</strong>
          </p>
          <p style={{ margin: 0, color: "var(--text-subtle)", fontSize: 14 }}>{result.competition.title}</p>
        </div>

        <h3 style={{ marginBottom: 12 }}>입금 안내</h3>
        <table style={{ fontSize: 14 }}>
          <tbody>
            <tr>
              <td style={{ color: "var(--text-subtle)", paddingRight: 20, border: "none", paddingTop: 8, paddingBottom: 8 }}>참가비</td>
              <td style={{ border: "none", paddingTop: 8, paddingBottom: 8, fontWeight: 700 }}>
                {result.competition.fee.toLocaleString()}원
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-subtle)", paddingRight: 20, border: "none", paddingTop: 8, paddingBottom: 8 }}>입금 계좌</td>
              <td style={{ border: "none", paddingTop: 8, paddingBottom: 8 }}>{result.competition.bank_account}</td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-subtle)", paddingRight: 20, border: "none", paddingTop: 8, paddingBottom: 8 }}>입금자명</td>
              <td style={{ border: "none", paddingTop: 8, paddingBottom: 8 }}>
                <strong style={{ color: "var(--accent-2)" }}>{result.depositor_name}</strong>
                <span className="muted" style={{ fontSize: 12 }}> (참가자명 + 휴대폰 뒤 4자리)</span>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          입금 확인 후 영업일 기준 24시간 내 결제완료 안내가 발송됩니다.
        </p>

        <div style={{ marginTop: 20 }}>
          <Link href={"/competitions" as Route} className="button secondary" style={{ display: "inline-block" }}>
            ← 대회 목록으로
          </Link>
        </div>
      </section>
    );
  }

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
      </div>

      {/* 부문 선택 */}
      {competition.divisions.length > 0 && (
        <label>
          참가 부문 *
          <select name="division_id" required>
            <option value="">-- 부문을 선택하세요 --</option>
            {competition.divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        참가자명 *
        <input className="input" name="name" placeholder="홍길동" required />
      </label>

      <label>
        휴대폰 *
        <input className="input" name="phone" type="tel" placeholder="01012345678" required />
      </label>

      <label>
        이메일 (선택)
        <input className="input" name="email" type="email" placeholder="example@email.com" />
      </label>

      <label>
        비고 (선택)
        <textarea name="memo" rows={3} placeholder="알레르기, 특이사항 등 전달할 내용을 입력하세요." />
      </label>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <input
          type="checkbox"
          name="consent_privacy"
          required
          style={{ width: "auto", marginTop: 4, flexShrink: 0 }}
        />
        <span style={{ fontSize: 14 }}>
          개인정보(이름, 연락처)를 대회 운영 목적으로 수집·이용하는 것에 동의합니다. (필수)
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

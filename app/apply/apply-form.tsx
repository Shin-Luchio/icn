"use client";

import { useState } from "react";
import type { CompetitionWithDivisions } from "@/lib/competitions";

type ApplyResult = {
  application_no: string;
  competition: { title: string; fee: number; bank_account: string };
  depositor_name: string;
};

export function ApplyForm({ competitions }: { competitions: CompetitionWithDivisions[] }) {
  const [selectedCompId, setSelectedCompId] = useState(competitions[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [error, setError] = useState("");

  const selectedComp = competitions.find((c) => c.id === selectedCompId);
  const divisions = selectedComp?.divisions ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value;
    const getChecked = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.checked;

    const payload = {
      name: get("name"),
      phone: get("phone"),
      email: get("email") || undefined,
      competition_id: selectedCompId,
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

  if (result) {
    return (
      <section className="card">
        <h2>신청이 완료되었습니다!</h2>
        <p>
          신청번호: <strong>{result.application_no}</strong>
        </p>
        <p>대회: {result.competition.title}</p>
        <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "14px 0" }} />
        <h3>입금 안내</h3>
        <p>참가비: <strong>{result.competition.fee.toLocaleString()}원</strong></p>
        <p>입금계좌: {result.competition.bank_account}</p>
        <p>
          입금자명: <strong>{result.depositor_name}</strong>
          <span className="muted"> (참가자명 + 휴대폰 뒤 4자리)</span>
        </p>
        <p className="muted" style={{ marginTop: 10, fontSize: 14 }}>
          입금 확인 후 영업일 기준 24시간 내 결제완료 안내가 발송됩니다.
        </p>
      </section>
    );
  }

  if (competitions.length === 0) {
    return (
      <section className="card">
        <p className="muted">현재 신청 가능한 대회가 없습니다.</p>
      </section>
    );
  }

  return (
    <form className="card grid" onSubmit={handleSubmit}>
      <label>
        대회 선택 *
        <select
          name="competition_id"
          value={selectedCompId}
          onChange={(e) => setSelectedCompId(e.target.value)}
        >
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.event_date})
            </option>
          ))}
        </select>
      </label>

      {divisions.length > 0 && (
        <label>
          종목/부문 *
          <select name="division_id" required>
            <option value="">-- 선택하세요 --</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        참가자명 *
        <input className="input" name="name" required />
      </label>

      <label>
        휴대폰 *
        <input className="input" name="phone" placeholder="01012345678" required />
      </label>

      <label>
        이메일 (선택)
        <input className="input" name="email" type="email" placeholder="example@email.com" />
      </label>

      <label>
        비고 (선택)
        <textarea name="memo" rows={3} />
      </label>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <input
          type="checkbox"
          name="consent_privacy"
          required
          style={{ width: "auto", marginTop: 4, flexShrink: 0 }}
        />
        <span>
          개인정보(이름, 연락처)를 대회 운영 목적으로 수집·이용하는 것에 동의합니다. (필수)
        </span>
      </label>

      {error && <p style={{ color: "var(--accent)", margin: 0 }}>{error}</p>}

      {selectedComp && (
        <div className="muted" style={{ fontSize: 14 }}>
          참가비: {selectedComp.fee.toLocaleString()}원 &nbsp;·&nbsp; {selectedComp.bank_account}
        </div>
      )}

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "처리 중..." : "신청하기"}
      </button>
    </form>
  );
}
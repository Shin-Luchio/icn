"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";

const FAQ_DATA = [
  {
    category: "신청",
    items: [
      {
        q: "참가 신청은 어떻게 하나요?",
        a: "대회 일정 페이지에서 원하는 대회를 선택한 후 '참가 신청하기' 버튼을 클릭하세요. 신청서 작성 → 결제 순으로 진행됩니다."
      },
      {
        q: "신청 마감 후에도 신청할 수 있나요?",
        a: "접수 기간이 종료된 대회는 추가 신청이 불가합니다. 다음 대회를 이용해주세요."
      },
      {
        q: "한 대회에 여러 종목으로 신청 가능한가요?",
        a: "종목별로 별도 신청이 필요합니다. 각 종목 신청 시 참가비가 별도 부과됩니다."
      },
      {
        q: "신청 내역은 어떻게 확인하나요?",
        a: "신청 완료 시 발급된 신청번호를 '신청 조회' 페이지에서 확인하실 수 있습니다. 또는 등록된 휴대폰 번호로 조회하세요."
      }
    ]
  },
  {
    category: "결제",
    items: [
      {
        q: "결제 방법은 무엇인가요?",
        a: "계좌이체(무통장입금)를 기본으로 지원합니다. 신청 완료 화면에 표시된 계좌로 입금하시면 됩니다."
      },
      {
        q: "입금자명은 어떻게 입력해야 하나요?",
        a: "입금자명은 '참가자명 + 휴대폰 뒤 4자리'로 입력해주세요. (예: 홍길동0101) 이를 통해 입금 확인을 진행합니다."
      },
      {
        q: "입금 확인은 얼마나 걸리나요?",
        a: "영업일 기준 24시간 이내에 확인 후 문자/알림톡으로 안내해 드립니다."
      },
      {
        q: "환불은 가능한가요?",
        a: "대회 3일 전까지 전액 환불 가능합니다. 운영 담당자(카카오채널 @icn 또는 010-0000-0000)에게 문의해주세요."
      }
    ]
  },
  {
    category: "대회 준비",
    items: [
      {
        q: "복장 규정이 있나요?",
        a: "종목별 IFBB 기준 복장 규정이 적용됩니다. 대회 상세 페이지에서 종목별 규정을 확인하세요."
      },
      {
        q: "체급 측정은 언제 하나요?",
        a: "대회 당일 현장 등록 시 체급 측정을 진행합니다. 공식 체급 측정 시간을 반드시 지켜주세요."
      },
      {
        q: "오일 사용이 가능한가요?",
        a: "금속성/반짝이 성분이 포함되지 않은 오일만 사용 가능합니다. 자세한 규정은 참가자 안내문을 참조하세요."
      }
    ]
  },
  {
    category: "현장",
    items: [
      {
        q: "사전 등록과 현장 등록의 차이는?",
        a: "온라인 사전 등록 후 참가비를 입금하시면 됩니다. 당일 현장에서는 신청번호 확인 및 체급 측정만 진행합니다."
      },
      {
        q: "관람 티켓은 어디서 구매하나요?",
        a: "현장 매표소에서 구매 가능합니다. 사전 예매 시 할인 혜택이 있으며, 대회 상세 페이지에서 확인하세요."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <span className="hero-kicker">FAQ</span>
          <h1>자주 묻는 질문</h1>
          <p style={{ maxWidth: 500 }}>참가 신청부터 현장 운영까지, 궁금한 사항을 정리했습니다.</p>
        </section>

        {FAQ_DATA.map((cat) => (
          <section key={cat.category} className="card">
            <h2 style={{ marginBottom: 16, fontSize: 18, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
              {cat.category}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {cat.items.map((item, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key} style={{ borderBottom: "1px solid var(--line)" }}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : key)}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 4px",
                        background: "none",
                        border: "none",
                        color: "var(--text)",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: 12
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: 15 }}>Q. {item.q}</span>
                      <span style={{ color: "var(--accent-2)", fontSize: 18, flexShrink: 0, transition: "transform 0.2s", transform: isOpen ? "rotate(45deg)" : "none" }}>+</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 4px 16px", fontSize: 14, lineHeight: 1.8, color: "var(--text-subtle)" }}>
                        A. {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <section className="card" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: 8 }}>해결되지 않은 문제가 있으신가요?</h3>
          <p className="muted" style={{ marginBottom: 16 }}>카카오채널 @icn 또는 아래 연락처로 문의해주세요.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="button secondary" style={{ fontSize: 14 }}>← 홈으로</Link>
            <Link href="/competitions" className="button" style={{ fontSize: 14 }}>대회 신청하기 →</Link>
          </div>
        </section>
      </main>
    </>
  );
}

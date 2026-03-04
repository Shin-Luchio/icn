const templates = ["신청완료", "입금안내", "결제확정", "D-1 안내", "D-day 안내"];

export default function MessagesAdminPage() {
  return (
    <section className="card">
      <h2>4) 발송 센터</h2>
      <p>템플릿 선택 + 대상 필터 + 즉시 발송(MVP)</p>

      <div className="grid grid-2">
        <label>
          템플릿
          <select defaultValue={templates[0]}>
            {templates.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          대상 필터
          <select defaultValue="결제완료자">
            <option>전체</option>
            <option>입금대기자</option>
            <option>결제완료자</option>
          </select>
        </label>
      </div>

      <button className="button" type="button" style={{ marginTop: 12 }}>
        즉시 발송
      </button>
    </section>
  );
}

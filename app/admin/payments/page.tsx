const payments = [
  { no: "A-1001", depositor: "홍길동0101", amount: "70,000", status: "입금대기" },
  { no: "A-1002", depositor: "김민수0202", amount: "70,000", status: "결제완료" }
];

export default function PaymentsAdminPage() {
  return (
    <section className="card">
      <h2>3) 결제 상태 관리</h2>
      <p>상태 전이: 입금대기 → 결제완료 / 환불</p>
      <table>
        <thead>
          <tr>
            <th>신청번호</th>
            <th>입금자명</th>
            <th>금액</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.no}>
              <td>{p.no}</td>
              <td>{p.depositor}</td>
              <td>{p.amount}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

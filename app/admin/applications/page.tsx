const applications = [
  { no: "A-1001", name: "홍길동", phone: "010-1234-0101", division: "초급", status: "입금대기" },
  { no: "A-1002", name: "김민수", phone: "010-2222-0202", division: "중급", status: "결제완료" }
];

export default function ApplicationsAdminPage() {
  return (
    <section className="card">
      <h2>2) 신청자 목록</h2>
      <p>검색/필터: 이름, 휴대폰, 신청번호, 결제상태</p>
      <table>
        <thead>
          <tr>
            <th>신청번호</th>
            <th>이름</th>
            <th>휴대폰</th>
            <th>종목</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <tr key={a.no}>
              <td>{a.no}</td>
              <td>{a.name}</td>
              <td>{a.phone}</td>
              <td>{a.division}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

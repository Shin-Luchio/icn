const competitions = [
  {
    name: "ICN 오픈 2026",
    status: "공개",
    date: "2026-08-30",
    location: "인천 컨벤션 센터"
  }
];

export default function CompetitionsAdminPage() {
  return (
    <section className="card">
      <h2>1) 대회 관리 (CRUD)</h2>
      <table>
        <thead>
          <tr>
            <th>대회명</th>
            <th>상태</th>
            <th>일정</th>
            <th>장소</th>
          </tr>
        </thead>
        <tbody>
          {competitions.map((c) => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td>{c.status}</td>
              <td>{c.date}</td>
              <td>{c.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

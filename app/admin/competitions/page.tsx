import { getPublicCompetitions } from "@/lib/competitions";

export const revalidate = 0;

export default async function CompetitionsAdminPage() {
  const { competitions, source } = await getPublicCompetitions();

  return (
    <section className="card">
      <h2>1) 대회 관리 (CRUD)</h2>
      <p className="muted">현재 조회 데이터 출처: {source === "database" ? "Supabase" : "기본 샘플 데이터"}</p>
      <table>
        <thead>
          <tr>
            <th>대회명</th>
            <th>일정</th>
            <th>장소</th>
            <th>참가비</th>
          </tr>
        </thead>
        <tbody>
          {competitions.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.event_date}</td>
              <td>{c.location}</td>
              <td>{c.fee.toLocaleString()}원</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { getCompetitionById } from "@/lib/competitions";
import { CompetitionApplyForm } from "./apply-form";
import type { Route } from "next";

export const revalidate = 0;

export default async function ApplyPage({ params }: { params: { id: string } }) {
  const competition = await getCompetitionById(params.id);

  if (!competition) notFound();

  return (
    <>
      <Nav />
      <main>
        {/* 브레드크럼 */}
        <div style={{ marginBottom: 12, fontSize: 14, color: "var(--text-subtle)" }}>
          <Link href={"/competitions" as Route} className="muted">대회 목록</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <Link href={`/competitions/${competition.id}` as Route} className="muted">{competition.title}</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span>참가 신청</span>
        </div>

        <section className="card" style={{ marginBottom: 0 }}>
          <h1 style={{ fontSize: "clamp(18px, 2.5vw, 26px)", marginBottom: 4 }}>참가 신청</h1>
          <p className="muted" style={{ fontSize: 14 }}>
            신청 완료 후 화면에 표시된 계좌로 참가비를 입금하면 접수가 완료됩니다.
          </p>
        </section>

        <CompetitionApplyForm competition={competition} />
      </main>
    </>
  );
}

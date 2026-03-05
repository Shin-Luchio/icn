import { Nav } from "@/components/nav";
import { getCompetitionsWithDivisions } from "@/lib/competitions";
import { ApplyForm } from "./apply-form";

export const revalidate = 0;

export default async function ApplyPage() {
  const { competitions } = await getCompetitionsWithDivisions();

  return (
    <>
      <Nav />
      <main>
        <section className="card">
          <h1>참가 신청</h1>
          <p className="muted">무통장입금 기반 신청 흐름입니다. 신청 후 입금 안내가 표시됩니다.</p>
        </section>

        <ApplyForm competitions={competitions} />
      </main>
    </>
  );
}
import { Nav } from "@/components/nav";

export default function ApplyPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="card">
          <h1>참가 신청</h1>
          <p>무통장입금 기반 신청 흐름 MVP 예시 폼입니다.</p>
        </section>

        <form className="card grid" action="#" method="post">
          <label>
            참가자명
            <input className="input" name="name" required />
          </label>

          <label>
            휴대폰
            <input className="input" name="phone" placeholder="010-1234-5678" required />
          </label>

          <label>
            종목/부문
            <select name="division" defaultValue="초급">
              <option>초급</option>
              <option>중급</option>
              <option>상급</option>
            </select>
          </label>

          <label>
            비고(선택)
            <textarea name="memo" rows={3} />
          </label>

          <button className="button" type="submit">
            신청하기
          </button>
        </form>

        <section className="card">
          <h2>입금 안내</h2>
          <p>입금계좌: 신한 110-000-000000 (예금주: ICN 운영사무국)</p>
          <p>입금자명: 참가자명 + 휴대폰 뒤 4자리 (예: 홍길동0101)</p>
          <p>신청 후 문자/이메일로 같은 안내가 발송됩니다.</p>
        </section>
      </main>
    </>
  );
}

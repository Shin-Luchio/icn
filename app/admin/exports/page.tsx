export default function ExportsAdminPage() {
  return (
    <section className="card">
      <h2>5) 데이터 내보내기</h2>
      <p>필터 결과 그대로 CSV로 내려받아 엑셀에서 열 수 있습니다.</p>
      <button className="button" type="button">
        CSV 다운로드
      </button>
    </section>
  );
}

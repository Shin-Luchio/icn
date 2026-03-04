import Link from "next/link";
import { Nav } from "@/components/nav";

const adminLinks = [
  ["/admin/competitions", "대회 관리"],
  ["/admin/applications", "신청자 목록"],
  ["/admin/payments", "결제 상태"],
  ["/admin/messages", "발송 센터"],
  ["/admin/exports", "데이터 내보내기"]
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>
        <section className="card">
          <h1>백오피스 (MVP)</h1>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {adminLinks.map(([href, label]) => (
              <Link key={href} href={href} className="button">
                {label}
              </Link>
            ))}
          </div>
        </section>
        {children}
      </main>
    </>
  );
}

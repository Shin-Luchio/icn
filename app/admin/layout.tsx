import Link from "next/link";
import type { Route } from "next";
import { Nav } from "@/components/nav";
import { AdminLogoutButton } from "@/components/admin-logout-button";

const adminLinks: { href: Route; label: string }[] = [
  { href: "/admin/competitions" as Route, label: "🏆 대회 관리" },
  { href: "/admin/applications" as Route, label: "📋 신청자" },
  { href: "/admin/payments" as Route, label: "💳 결제" },
  { href: "/admin/notices" as Route, label: "📢 공지" },
  { href: "/admin/messages" as Route, label: "✉️ 발송" },
  { href: "/admin/exports" as Route, label: "📥 내보내기" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>
        <section className="card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: 18 }}>ICN 관리자</h1>
            <AdminLogoutButton />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {adminLinks.map((link) => (
              <Link key={link.href} href={link.href} className="button secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </section>
        {children}
      </main>
    </>
  );
}

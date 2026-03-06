import Link from "next/link";
import type { Route } from "next";

const links: { href: Route; label: string }[] = [
  { href: "/competitions" as Route, label: "대회 일정" },
  { href: "/notices" as Route, label: "공지사항" },
  { href: "/results" as Route, label: "결과" },
  { href: "/faq" as Route, label: "FAQ" },
  { href: "/lookup" as Route, label: "신청 조회" }
];

export function Nav() {
  return (
    <header className="nav-shell">
      <div className="nav-inner">
        <Link href="/" className="brand">
          ICN CHAMPIONSHIP
        </Link>
        <nav className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

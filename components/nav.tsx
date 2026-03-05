import Link from "next/link";
import type { Route } from "next";
import { AuthButton } from "@/components/auth-button";

const links: { href: Route; label: string }[] = [
  { href: "/" as Route, label: "홈" },
  { href: "/competitions" as Route, label: "대회 목록" },
  { href: "/admin/competitions" as Route, label: "백오피스" }
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
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}

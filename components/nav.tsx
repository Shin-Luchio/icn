import Link from "next/link";
import type { Route } from "next";

const links: { href: Route; label: string }[] = [
  { href: "/", label: "홍보" },
  { href: "/apply", label: "참가 신청" },
  { href: "/admin/competitions", label: "백오피스" }
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

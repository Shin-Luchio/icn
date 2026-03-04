import Link from "next/link";

const links = [
  { href: "/", label: "홍보" },
  { href: "/apply", label: "참가 신청" },
  { href: "/admin/competitions", label: "백오피스" }
];

export function Nav() {
  return (
    <header className="card" style={{ marginBottom: 0, borderRadius: 0 }}>
      <nav style={{ display: "flex", gap: 16 }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

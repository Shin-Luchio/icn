import Link from "next/link"
import {UrlObject} from "node:url"

interface NavLink {
    key: string
    href: UrlObject | __next_route_internal_types__.RouteImpl<string>
    label: string
}

const links: NavLink[] = [
    {key: "1", href: "/", label: "홍보"},
    {key: "2", href: "/apply", label: "참가 신청"},
    {key: "3", href: "/admin/competitions", label: "백오피스"}
]

export function Nav() {
    return (
        <header className="nav-shell">
            <div className="nav-inner">
                <Link href="/" className="brand">
                    ICN CHAMPIONSHIP
                </Link>
                <nav className="nav-links">
                    {links.map((link) => (
                        <Link key={link.key} href={link.href} className="nav-link">
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}

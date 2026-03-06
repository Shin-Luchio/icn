import Link from "next/link";
import type { Route } from "next";
import { Nav } from "@/components/nav";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 60;

async function getNotices() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("notices")
    .select("id,title,is_pinned,published_at,created_at")
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

type Notice = { id: string; title: string; is_pinned: boolean; published_at: string | null; created_at: string };

export default async function NoticesPage() {
  const notices = await getNotices() as Notice[];

  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <span className="hero-kicker">NOTICE</span>
          <h1>공지사항</h1>
          <p style={{ maxWidth: 500 }}>대회 일정, 규정 변경, 운영 안내 등 중요 공지를 확인하세요.</p>
        </section>

        <section className="card">
          {notices.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "40px 0" }}>등록된 공지사항이 없습니다.</p>
          ) : (
            <div>
              {notices.map((n, i) => (
                <div key={n.id}>
                  {i > 0 && <div style={{ height: 1, background: "var(--line)", margin: "0 0" }} />}
                  <Link
                    href={`/notices/${n.id}` as Route}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "16px 4px",
                      textDecoration: "none",
                      transition: "opacity 0.15s"
                    }}
                  >
                    {n.is_pinned && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(249,115,22,0.15)", color: "var(--accent-2)", border: "1px solid rgba(249,115,22,0.3)", whiteSpace: "nowrap", flexShrink: 0 }}>
                        📌 고정
                      </span>
                    )}
                    <span style={{ flex: 1, fontWeight: n.is_pinned ? 700 : 400, fontSize: 15 }}>{n.title}</span>
                    <span style={{ color: "var(--text-subtle)", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {new Date(n.published_at ?? n.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link href="/" className="muted" style={{ fontSize: 14 }}>← 홈으로</Link>
        </div>
      </main>
    </>
  );
}

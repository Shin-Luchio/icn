import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 60;

async function getNotice(id: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("notices")
    .select("id,title,content,is_pinned,published_at,created_at,updated_at")
    .eq("id", id)
    .eq("is_published", true)
    .single();
  return data;
}

type Notice = { id: string; title: string; content: string; is_pinned: boolean; published_at: string | null; created_at: string; updated_at: string };

export default async function NoticeDetailPage({ params }: { params: { id: string } }) {
  const notice = await getNotice(params.id) as Notice | null;
  if (!notice) notFound();

  const dateStr = new Date(notice.published_at ?? notice.created_at).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <>
      <Nav />
      <main>
        <div style={{ marginBottom: 12 }}>
          <Link href={"/notices" as Route} className="muted" style={{ fontSize: 14 }}>← 공지사항 목록</Link>
        </div>

        <section className="card">
          <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
            {notice.is_pinned && (
              <span style={{ display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(249,115,22,0.15)", color: "var(--accent-2)", border: "1px solid rgba(249,115,22,0.3)", marginBottom: 10 }}>
                📌 고정 공지
              </span>
            )}
            <h1 style={{ fontSize: "clamp(20px, 3vw, 28px)", marginBottom: 8 }}>{notice.title}</h1>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>{dateStr}</p>
          </div>

          <div style={{ fontSize: 15, lineHeight: 1.9, color: "var(--text-subtle)", whiteSpace: "pre-wrap" }}>
            {notice.content}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <Link href={"/notices" as Route} className="muted" style={{ fontSize: 14 }}>← 목록으로</Link>
          <Link href={"/competitions" as Route} className="button secondary" style={{ fontSize: 13, padding: "6px 14px" }}>대회 신청하기 →</Link>
        </div>
      </main>
    </>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))
  ];
  return "\uFEFF" + lines.join("\r\n"); // BOM for Excel
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const competition_id = searchParams.get("competition_id") || "";
  const status = searchParams.get("status") || "";

  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("applications")
    .select(
      `application_no,status,bib_number,checkin_status,created_at,memo,
       participants(name,phone,email,gender,birth_date,affiliation),
       divisions(name,gender),
       competitions(title,event_date,location),
       payments(depositor_name,amount,status,confirmed_at)`
    )
    .order("created_at", { ascending: false });

  if (competition_id) query = query.eq("competition_id", competition_id);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 평탄화
  const rows = (data ?? []).map((a: Record<string, unknown>) => {
    const p = (a.participants as Record<string, unknown>) ?? {};
    const d = (a.divisions as Record<string, unknown>) ?? {};
    const c = (a.competitions as Record<string, unknown>) ?? {};
    const py = Array.isArray(a.payments) ? a.payments[0] ?? {} : (a.payments as Record<string, unknown>) ?? {};
    return {
      신청번호: a.application_no,
      신청상태: a.status,
      참가자명: p.name,
      휴대폰: p.phone,
      이메일: p.email,
      성별: p.gender,
      생년월일: p.birth_date,
      소속: p.affiliation,
      종목: d.name,
      종목성별: d.gender,
      대회명: c.title,
      대회일: c.event_date,
      장소: c.location,
      입금자명: py.depositor_name,
      입금액: py.amount,
      결제상태: py.status,
      결제확인일: py.confirmed_at,
      번호표: a.bib_number,
      체크인: a.checkin_status ? "O" : "",
      신청일: a.created_at,
      메모: a.memo
    };
  });

  const csv = toCSV(rows as Record<string, unknown>[]);
  const filename = `icn-applications-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    }
  });
}

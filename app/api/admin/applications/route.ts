import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const competition_id = searchParams.get("competition_id") || "";
  const page = Number(searchParams.get("page") || "1");
  const limit = 30;
  const offset = (page - 1) * limit;

  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("applications")
    .select(
      `id,application_no,status,memo,created_at,bib_number,checkin_status,reject_reason,
       participants(id,name,phone,email,gender,birth_date,affiliation),
       divisions(id,name,gender),
       competitions(id,title,event_date),
       payments(id,depositor_name,amount,status)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (competition_id) query = query.eq("competition_id", competition_id);
  if (status) query = query.eq("status", status);

  if (search) {
    // 이름/전화/신청번호 검색 (participants join 경유)
    query = query.or(
      `application_no.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0, page, limit });
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.replace(/\D/g, "") || "";

  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: "올바른 휴대폰 번호를 입력해주세요." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // 참가자 조회 (전화번호)
  const { data: participants, error: pErr } = await supabase
    .from("participants")
    .select("id,name,phone")
    .like("phone", `%${phone.slice(-8)}`);

  if (pErr || !participants || participants.length === 0) {
    return NextResponse.json({ applications: [] });
  }

  const participantIds = participants.map((p) => p.id);

  const { data: applications, error: aErr } = await supabase
    .from("applications")
    .select(
      `id,application_no,status,created_at,
       competitions(title,event_date,location,fee),
       divisions(name),
       payments(depositor_name,amount,status,confirmed_at),
       participants(name,phone)`
    )
    .in("participant_id", participantIds)
    .order("created_at", { ascending: false });

  if (aErr) return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });

  return NextResponse.json({ applications: applications ?? [] });
}

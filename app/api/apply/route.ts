import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

function generateApplicationNo(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `ICN-${datePart}-${randPart}`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { name, phone, email, competition_id, division_id, memo, consent_privacy } = body as {
    name?: string;
    phone?: string;
    email?: string;
    competition_id?: string;
    division_id?: string;
    memo?: string;
    consent_privacy?: boolean;
  };

  if (!name || !phone || !competition_id || !consent_privacy) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }

  // 1) participants 저장
  const { data: participant, error: pError } = await supabase
    .from("participants")
    .insert({ name, phone, email: email || null, consent_privacy: true })
    .select("id")
    .single();

  if (pError || !participant) {
    return NextResponse.json({ error: "참가자 저장에 실패했습니다." }, { status: 500 });
  }

  // 2) applications 저장
  const application_no = generateApplicationNo();

  const { data: application, error: aError } = await supabase
    .from("applications")
    .insert({
      application_no,
      competition_id,
      division_id: division_id || null,
      participant_id: participant.id,
      status: "신청",
      memo: memo || null
    })
    .select("application_no")
    .single();

  if (aError || !application) {
    return NextResponse.json({ error: "신청 저장에 실패했습니다." }, { status: 500 });
  }

  // 3) 입금 안내용 대회 정보 조회
  const { data: competition } = await supabase
    .from("competitions")
    .select("title,fee,bank_account")
    .eq("id", competition_id)
    .single();

  return NextResponse.json({
    application_no: application.application_no,
    competition,
    depositor_name: `${name}${(phone as string).replace(/\D/g, "").slice(-4)}`
  });
}
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

  const {
    name, phone, email, birth_date, gender, affiliation,
    competition_id, division_id, memo, consent_privacy
  } = body as {
    name?: string; phone?: string; email?: string;
    birth_date?: string; gender?: string; affiliation?: string;
    competition_id?: string; division_id?: string;
    memo?: string; consent_privacy?: boolean;
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

  // 대회 접수 기간 체크
  const { data: competition, error: compErr } = await supabase
    .from("competitions")
    .select("title,fee,bank_account,registration_open_at,registration_close_at,is_public")
    .eq("id", competition_id)
    .single();

  if (compErr || !competition) {
    return NextResponse.json({ error: "존재하지 않는 대회입니다." }, { status: 404 });
  }

  if (!competition.is_public) {
    return NextResponse.json({ error: "현재 신청이 불가한 대회입니다." }, { status: 400 });
  }

  const now = new Date();
  if (competition.registration_open_at && now < new Date(competition.registration_open_at)) {
    return NextResponse.json({ error: "아직 접수 기간이 시작되지 않았습니다." }, { status: 400 });
  }
  if (competition.registration_close_at && now > new Date(competition.registration_close_at)) {
    return NextResponse.json({ error: "접수 기간이 마감되었습니다." }, { status: 400 });
  }

  // 1) participants 저장
  const { data: participant, error: pError } = await supabase
    .from("participants")
    .insert({
      name,
      phone,
      email: email || null,
      birth_date: birth_date || null,
      gender: gender || null,
      affiliation: affiliation || null,
      consent_privacy: true
    })
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
    .select("application_no,id")
    .single();

  if (aError || !application) {
    return NextResponse.json({ error: "신청 저장에 실패했습니다." }, { status: 500 });
  }

  // 3) payment 레코드 생성 (입금대기 상태)
  const depositor_name = `${name}${(phone as string).replace(/\D/g, "").slice(-4)}`;
  await supabase.from("payments").insert({
    application_id: application.id,
    depositor_name,
    amount: competition.fee,
    status: "입금대기"
  });

  return NextResponse.json({
    application_no: application.application_no,
    competition,
    depositor_name
  });
}

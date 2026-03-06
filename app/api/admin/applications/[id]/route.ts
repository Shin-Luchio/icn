import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("applications")
    .select(
      `*,
       participants(*),
       divisions(id,name,gender,class_type,weight_class),
       competitions(id,title,event_date,location,fee,bank_account),
       payments(*),
       attachments(*)`
    )
    .eq("id", params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "없는 신청입니다." }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {};
  const allowed = ["status", "memo", "bib_number", "checkin_status", "measurement_status", "reject_reason", "reviewed_at", "reviewed_by"];
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key];
  }

  if (updateData.status === "승인완료" || updateData.status === "반려") {
    updateData.reviewed_at = new Date().toISOString();
    updateData.reviewed_by = "admin";
  }

  const { error } = await supabase
    .from("applications")
    .update(updateData)
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 관리자 액션 로그
  await supabase.from("admin_action_logs").insert({
    action: "update_application",
    target_table: "applications",
    target_id: params.id,
    detail: updateData
  });

  return NextResponse.json({ success: true });
}

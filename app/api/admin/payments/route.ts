import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const competition_id = searchParams.get("competition_id") || "";

  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("payments")
    .select(
      `id,depositor_name,amount,status,confirmed_at,created_at,
       applications(id,application_no,status,
         participants(name,phone),
         competitions(title,event_date),
         divisions(name))`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0 });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const { payment_id, status } = await req.json();
  if (!payment_id || !status) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = { status };
  if (status === "결제완료") {
    updateData.confirmed_at = new Date().toISOString();
    updateData.confirmed_by = "admin";
  }

  const { error: pError } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", payment_id);

  if (pError) return NextResponse.json({ error: pError.message }, { status: 500 });

  // 결제완료 시 → 연결된 application도 상태 업데이트
  if (status === "결제완료") {
    const { data: payment } = await supabase
      .from("payments")
      .select("application_id")
      .eq("id", payment_id)
      .single();

    if (payment?.application_id) {
      await supabase
        .from("applications")
        .update({ status: "결제완료" })
        .eq("id", payment.application_id);
    }
  }

  await supabase.from("admin_action_logs").insert({
    action: "update_payment",
    target_table: "payments",
    target_id: payment_id,
    detail: { status }
  });

  return NextResponse.json({ success: true });
}

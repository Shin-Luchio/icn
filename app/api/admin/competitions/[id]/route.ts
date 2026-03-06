import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("*,divisions(id,name,gender,class_type,weight_class,entry_fee,max_applicants,sort_order)")
    .eq("id", params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "없는 대회입니다." }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {};
  const allowed = ["title","description","event_date","location","fee","bank_account","is_public","host_name","registration_open_at","registration_close_at","max_applicants","rules_content","poster_image_url"];
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key] === "" ? null : body[key];
  }
  if (updateData.fee) updateData.fee = Number(updateData.fee);
  if (updateData.max_applicants) updateData.max_applicants = Number(updateData.max_applicants);

  const { error } = await supabase
    .from("competitions")
    .update(updateData)
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("competitions").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

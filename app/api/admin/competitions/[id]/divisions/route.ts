import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("divisions")
    .select("*")
    .eq("competition_id", params.id)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("divisions")
    .insert({
      competition_id: params.id,
      name: body.name,
      gender: body.gender || "혼성",
      class_type: body.class_type || null,
      weight_class: body.weight_class || null,
      entry_fee: body.entry_fee ? Number(body.entry_fee) : null,
      max_applicants: body.max_applicants ? Number(body.max_applicants) : null,
      rules_content: body.rules_content || null,
      sort_order: body.sort_order ? Number(body.sort_order) : 0
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const { division_id } = await req.json();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("divisions")
    .delete()
    .eq("id", division_id)
    .eq("competition_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

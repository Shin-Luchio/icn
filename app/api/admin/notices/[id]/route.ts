import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "없는 공지입니다." }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  const allowed = ["title", "content", "is_pinned", "is_published", "competition_id"];
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key] === "" ? null : body[key];
  }
  if (body.is_published && !body.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("notices").update(updateData).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notices").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

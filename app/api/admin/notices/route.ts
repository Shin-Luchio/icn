import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .select("id,title,is_pinned,is_published,published_at,created_at,competition_id,competitions(title)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  const isPublished = body.is_published ?? false;
  const { data, error } = await supabase
    .from("notices")
    .insert({
      title: body.title,
      content: body.content,
      competition_id: body.competition_id || null,
      is_pinned: body.is_pinned ?? false,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

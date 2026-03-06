import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("id,title,event_date,location,fee,is_public,registration_open_at,registration_close_at,host_name,bank_account,description,max_applicants")
    .order("event_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("competitions")
    .insert({
      title: body.title,
      description: body.description || null,
      event_date: body.event_date,
      location: body.location,
      fee: Number(body.fee) || 0,
      bank_account: body.bank_account,
      is_public: body.is_public ?? false,
      host_name: body.host_name || null,
      registration_open_at: body.registration_open_at || null,
      registration_close_at: body.registration_close_at || null,
      max_applicants: body.max_applicants ? Number(body.max_applicants) : null,
      rules_content: body.rules_content || null
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

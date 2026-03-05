import { createSupabaseServerClient } from "@/lib/supabase-server";

export type CompetitionSummary = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  fee: number;
  bank_account: string;
};

export type Division = {
  id: string;
  competition_id: string;
  name: string;
};

export type CompetitionWithDivisions = CompetitionSummary & {
  divisions: Division[];
};

const fallbackCompetitions: CompetitionSummary[] = [
  {
    id: "fallback-1",
    title: "ICN 오픈 2026",
    description: "전국 참가 가능한 보디빌딩 오픈 대회. 남녀 클래식, 피지크, 보디빌딩 전 부문 참가 가능합니다.",
    event_date: "2026-08-30",
    location: "인천 컨벤션 센터",
    fee: 70000,
    bank_account: "신한 110-000-000000 (예금주: ICN 운영사무국)"
  },
  {
    id: "fallback-2",
    title: "ICN 챔피언십 2026",
    description: "ICN 시즌 최종 챔피언십. 각 오픈 대회 수상자만 참가 가능한 초청 대회입니다.",
    event_date: "2026-11-15",
    location: "서울 올림픽 체조경기장",
    fee: 50000,
    bank_account: "신한 110-000-000000 (예금주: ICN 운영사무국)"
  }
];

const fallbackWithDivisions: CompetitionWithDivisions[] = fallbackCompetitions.map((c) => ({
  ...c,
  divisions: [
    { id: `${c.id}-d1`, competition_id: c.id, name: "남성 보디빌딩" },
    { id: `${c.id}-d2`, competition_id: c.id, name: "남성 클래식 보디빌딩" },
    { id: `${c.id}-d3`, competition_id: c.id, name: "남성 피지크" },
    { id: `${c.id}-d4`, competition_id: c.id, name: "여성 피트니스 비키니" }
  ]
}));

export async function getPublicCompetitions() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { competitions: fallbackCompetitions, source: "fallback" as const };
  }

  const { data, error } = await supabase
    .from("competitions")
    .select("id,title,description,event_date,location,fee,bank_account")
    .eq("is_public", true)
    .order("event_date", { ascending: true });

  if (error || !data || data.length === 0) {
    return { competitions: fallbackCompetitions, source: "fallback" as const };
  }

  return { competitions: data as CompetitionSummary[], source: "database" as const };
}

export async function getCompetitionsWithDivisions(): Promise<{
  competitions: CompetitionWithDivisions[];
  source: "database" | "fallback";
}> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { competitions: fallbackWithDivisions, source: "fallback" };
  }

  const { data, error } = await supabase
    .from("competitions")
    .select("id,title,description,event_date,location,fee,bank_account,divisions(id,competition_id,name)")
    .eq("is_public", true)
    .order("event_date", { ascending: true });

  if (error || !data || data.length === 0) {
    return { competitions: fallbackWithDivisions, source: "fallback" };
  }

  return { competitions: data as CompetitionWithDivisions[], source: "database" };
}

export async function getCompetitionById(id: string): Promise<CompetitionWithDivisions | null> {
  // fallback 데이터에서 먼저 확인
  const fallback = fallbackWithDivisions.find((c) => c.id === id);

  const supabase = createSupabaseServerClient();
  if (!supabase) return fallback ?? null;

  const { data, error } = await supabase
    .from("competitions")
    .select("id,title,description,event_date,location,fee,bank_account,divisions(id,competition_id,name)")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (error || !data) return fallback ?? null;

  return data as CompetitionWithDivisions;
}

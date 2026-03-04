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

const fallbackCompetitions: CompetitionSummary[] = [
  {
    id: "fallback-1",
    title: "ICN 오픈 2026",
    description: "전국 참가 가능한 보디빌딩 대회",
    event_date: "2026-08-30",
    location: "인천 컨벤션 센터",
    fee: 70000,
    bank_account: "신한 110-000-000000 (예금주: ICN 운영사무국)"
  }
];

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

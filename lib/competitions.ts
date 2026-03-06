import { createSupabaseServerClient } from "@/lib/supabase-server";

export type CompetitionSummary = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  fee: number;
  bank_account: string;
  is_public: boolean;
  registration_open_at: string | null;
  registration_close_at: string | null;
  host_name: string | null;
  poster_image_url: string | null;
  max_applicants: number | null;
};

export type Division = {
  id: string;
  competition_id: string;
  name: string;
  gender: string | null;
  class_type: string | null;
  weight_class: string | null;
  entry_fee: number | null;
  max_applicants: number | null;
  sort_order: number;
};

export type CompetitionWithDivisions = CompetitionSummary & {
  divisions: Division[];
};


const COMPETITION_FIELDS = "id,title,description,event_date,location,fee,bank_account,is_public,registration_open_at,registration_close_at,host_name,poster_image_url,max_applicants";
const DIVISION_FIELDS = "id,competition_id,name,gender,class_type,weight_class,entry_fee,max_applicants,sort_order";

const fallbackCompetitions: CompetitionSummary[] = [
  {
    id: "fallback-1",
    title: "ICN 오픈 2026",
    description: "전국 참가 가능한 보디빌딩 오픈 대회. 남녀 클래식, 피지크, 보디빌딩 전 부문 참가 가능합니다.",
    event_date: "2026-08-30",
    location: "인천 컨벤션 센터",
    fee: 70000,
    bank_account: "신한 110-000-000000 (예금주: ICN 운영사무국)",
    is_public: true,
    registration_open_at: null,
    registration_close_at: null,
    host_name: "ICN 운영사무국",
    poster_image_url: null,
    max_applicants: null
  },
  {
    id: "fallback-2",
    title: "ICN 챔피언십 2026",
    description: "ICN 시즌 최종 챔피언십. 각 오픈 대회 수상자만 참가 가능한 초청 대회입니다.",
    event_date: "2026-11-15",
    location: "서울 올림픽 체조경기장",
    fee: 50000,
    bank_account: "신한 110-000-000000 (예금주: ICN 운영사무국)",
    is_public: true,
    registration_open_at: null,
    registration_close_at: null,
    host_name: "ICN 운영사무국",
    poster_image_url: null,
    max_applicants: null
  }
];

const fallbackWithDivisions: CompetitionWithDivisions[] = fallbackCompetitions.map((c) => ({
  ...c,
  divisions: [
    { id: `${c.id}-d1`, competition_id: c.id, name: "남성 보디빌딩", gender: "남", class_type: null, weight_class: null, entry_fee: null, max_applicants: null, sort_order: 0 },
    { id: `${c.id}-d2`, competition_id: c.id, name: "남성 클래식 보디빌딩", gender: "남", class_type: null, weight_class: null, entry_fee: null, max_applicants: null, sort_order: 1 },
    { id: `${c.id}-d3`, competition_id: c.id, name: "남성 피지크", gender: "남", class_type: null, weight_class: null, entry_fee: null, max_applicants: null, sort_order: 2 },
    { id: `${c.id}-d4`, competition_id: c.id, name: "여성 피트니스 비키니", gender: "여", class_type: null, weight_class: null, entry_fee: null, max_applicants: null, sort_order: 3 }
  ]
}));

export async function getPublicCompetitions() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { competitions: fallbackCompetitions, source: "fallback" as const };

  const { data, error } = await supabase
    .from("competitions")
    .select(COMPETITION_FIELDS)
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
  if (!supabase) return { competitions: fallbackWithDivisions, source: "fallback" };

  const { data, error } = await supabase
    .from("competitions")
    .select(`${COMPETITION_FIELDS},divisions(${DIVISION_FIELDS})`)
    .eq("is_public", true)
    .order("event_date", { ascending: true });

  if (error || !data || data.length === 0) {
    return { competitions: fallbackWithDivisions, source: "fallback" };
  }
  return { competitions: data as CompetitionWithDivisions[], source: "database" };
}

export async function getCompetitionById(id: string): Promise<CompetitionWithDivisions | null> {
  const fallback = fallbackWithDivisions.find((c) => c.id === id);
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallback ?? null;

  const { data, error } = await supabase
    .from("competitions")
    .select(`${COMPETITION_FIELDS},divisions(${DIVISION_FIELDS})`)
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (error || !data) return fallback ?? null;
  return data as CompetitionWithDivisions;
}

// 어드민용: 전체 대회 (비공개 포함)
export async function getAllCompetitionsAdmin() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { competitions: fallbackCompetitions, source: "fallback" as const };

  const { data, error } = await supabase
    .from("competitions")
    .select(`${COMPETITION_FIELDS},divisions(${DIVISION_FIELDS})`)
    .order("event_date", { ascending: false });

  if (error || !data) return { competitions: [] as CompetitionSummary[], source: "database" as const };
  return { competitions: data as CompetitionWithDivisions[], source: "database" as const };
}

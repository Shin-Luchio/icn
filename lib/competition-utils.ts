// 서버/클라이언트 모두에서 사용 가능한 순수 유틸 함수

export type RegistrationStatus = "open" | "upcoming" | "closed";

export function getRegistrationStatus(comp: {
  registration_open_at?: string | null;
  registration_close_at?: string | null;
}): RegistrationStatus {
  const now = new Date();
  const open = comp.registration_open_at ? new Date(comp.registration_open_at) : null;
  const close = comp.registration_close_at ? new Date(comp.registration_close_at) : null;

  if (!open && !close) return "open";
  if (open && now < open) return "upcoming";
  if (close && now > close) return "closed";
  return "open";
}

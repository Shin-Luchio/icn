import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        }
      }
    }
  );

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user) {
    console.error("[auth/callback] exchangeCodeForSession error:", error?.message);
    return NextResponse.redirect(`${origin}/auth/login?error=callback_error`);
  }

  // 프로필 완성 여부 확인 (테이블이 없을 경우 홈으로 진행)
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("profile_complete")
      .eq("id", user.id)
      .single();

    if (profileError) {
      // 테이블 미존재 또는 행 없음 → 프로필 입력 페이지로
      const nextEncoded = encodeURIComponent(next);
      return NextResponse.redirect(`${origin}/auth/complete-profile?next=${nextEncoded}`);
    }

    if (!profile?.profile_complete) {
      const nextEncoded = encodeURIComponent(next);
      return NextResponse.redirect(`${origin}/auth/complete-profile?next=${nextEncoded}`);
    }
  } catch (e) {
    console.error("[auth/callback] profile check error:", e);
    // DB 오류 시 홈으로 진행 (프로필 없어도 이용 가능)
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

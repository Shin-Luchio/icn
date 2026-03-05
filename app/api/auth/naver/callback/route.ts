import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

interface NaverTokenResponse {
  access_token: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface NaverUserResponse {
  resultcode: string;
  message: string;
  response: {
    id: string;
    email: string;
    name: string;
    gender?: string; // "M" | "F"
    age?: string;    // "20-29"
    mobile?: string;
  };
}

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = cookies();
  const savedState = cookieStore.get("naver_oauth_state")?.value;

  // CSRF 검증
  if (!code || !state || state !== savedState) {
    console.error("[naver/callback] CSRF state mismatch", { state, savedState });
    return NextResponse.redirect(`${siteUrl}/auth/login?error=invalid_state`);
  }

  cookieStore.delete("naver_oauth_state");

  // 1. 코드를 액세스 토큰으로 교환
  let tokenData: NaverTokenResponse;
  try {
    const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        redirect_uri: `${siteUrl}/api/auth/naver/callback`,
        code,
        state
      })
    });
    tokenData = await tokenRes.json();
  } catch (e) {
    console.error("[naver/callback] token fetch error:", e);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_token`);
  }

  if (tokenData.error || !tokenData.access_token) {
    console.error("[naver/callback] token error:", tokenData.error_description);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_token`);
  }

  // 2. 네이버 사용자 정보 조회
  let naverData: NaverUserResponse;
  try {
    const userRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    naverData = await userRes.json();
  } catch (e) {
    console.error("[naver/callback] user info fetch error:", e);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_user`);
  }

  if (naverData.resultcode !== "00") {
    console.error("[naver/callback] naver API error:", naverData.message);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_api`);
  }

  const { email, name, gender, age, mobile } = naverData.response;

  if (!email) {
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_no_email`);
  }

  // 3. Supabase admin으로 사용자 조회/생성
  const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
  const adminClient = createSupabaseAdminClient();

  // admin API로 이메일 기준 유저 검색 (listUsers는 페이지네이션 있음)
  const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (listError) {
    console.error("[naver/callback] listUsers error:", listError.message);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=server_error`);
  }

  const existingUser = listData?.users?.find((u) => u.email === email);
  const mappedGender = gender === "M" ? "male" : gender === "F" ? "female" : undefined;
  const ageNum = age ? parseInt(age.split("-")[0]) + 5 : undefined; // "20-29" → 25

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // 신규 사용자 생성
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        provider: "naver",
        gender: mappedGender,
        age: ageNum,
        mobile
      }
    });

    if (createError || !newUser.user) {
      console.error("[naver/callback] createUser error:", createError?.message);
      return NextResponse.redirect(`${siteUrl}/auth/login?error=create_user`);
    }
    userId = newUser.user.id;

    // 프로필 추가 정보 저장 (테이블이 없으면 무시)
    await adminClient
      .from("profiles")
      .update({
        gender: mappedGender ?? null,
        age: ageNum ?? null,
        phone: mobile ?? null,
        provider: "naver"
      })
      .eq("id", userId);
  }

  // 4. 매직 링크로 자동 로그인 (이메일 미발송, 즉시 리디렉션)
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${siteUrl}/auth/naver-done`
    }
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("[naver/callback] generateLink error:", linkError?.message);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=link_error`);
  }

  return NextResponse.redirect(linkData.properties.action_link);
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!clientId || !siteUrl) {
    return NextResponse.redirect(`${siteUrl ?? ""}/auth/login?error=naver_not_configured`);
  }

  // CSRF 방지용 state 생성
  const state = crypto.randomUUID();
  const cookieStore = cookies();
  cookieStore.set("naver_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5분
    path: "/"
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${siteUrl}/api/auth/naver/callback`,
    state
  });

  return NextResponse.redirect(
    `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`
  );
}
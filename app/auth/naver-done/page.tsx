"use client";

/**
 * 네이버 OAuth 완료 후 세션 처리 페이지.
 * Supabase 매직 링크가 해시 프래그먼트(#access_token=...)로 리디렉션하면
 * 브라우저 클라이언트가 자동으로 세션을 감지한다.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Route } from "next";

export default function NaverDonePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function checkAndRedirect(userId: string) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_complete")
        .eq("id", userId)
        .single();

      if (!profile?.profile_complete) {
        router.push("/auth/complete-profile" as Route);
      } else {
        router.push("/" as Route);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await checkAndRedirect(session.user.id);
      }
    });

    // 이미 세션이 있는 경우 처리
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkAndRedirect(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <p className="muted">네이버 로그인 처리 중...</p>
    </main>
  );
}
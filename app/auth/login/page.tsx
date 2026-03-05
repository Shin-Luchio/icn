"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";
import type { Route } from "next";

const socialButtons = [
  {
    provider: "kakao" as const,
    label: "카카오로 시작하기",
    style: { background: "#FEE500", color: "#000000", border: "none" }
  },
  {
    provider: "google" as const,
    label: "Google로 시작하기",
    style: { background: "#ffffff", color: "#1f2937", border: "1px solid #d1d5db" }
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const supabase = createSupabaseBrowserClient();

  // 이미 로그인된 경우 홈으로
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/" as Route);
    });
  }, [supabase, router]);

  async function signInWith(provider: "google" | "kakao") {
    setLoading(provider);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  return (
    <main>
      <div className="card" style={{ maxWidth: 420, margin: "80px auto" }}>
        <h2 style={{ marginBottom: 6 }}>로그인 / 회원가입</h2>
        <p className="muted" style={{ marginBottom: 28, fontSize: 14 }}>
          소셜 계정으로 간편하게 시작하세요
        </p>

        <div className="grid" style={{ gap: 12 }}>
          {socialButtons.map(({ provider, label, style }) => (
            <button
              key={provider}
              onClick={() => signInWith(provider)}
              disabled={!!loading}
              style={{
                ...style,
                width: "100%",
                padding: "13px 16px",
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading && loading !== provider ? 0.5 : 1,
                transition: "opacity 0.2s"
              }}
            >
              {loading === provider ? "로그인 중..." : label}
            </button>
          ))}

          {/* 네이버: 별도 서버 OAuth 라우트 */}
          <a
            href="/api/auth/naver"
            style={{
              display: "block",
              width: "100%",
              padding: "13px 16px",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 8,
              background: "#03C75A",
              color: "#ffffff",
              border: "none",
              textAlign: "center",
              cursor: "pointer",
              textDecoration: "none",
              boxSizing: "border-box",
              opacity: loading ? 0.5 : 1
            }}
          >
            네이버로 시작하기
          </a>
        </div>

        {error && (
          <p style={{ color: "var(--accent)", marginTop: 16, fontSize: 14 }}>{error}</p>
        )}

        <p className="muted" style={{ fontSize: 12, marginTop: 24, textAlign: "center", lineHeight: 1.6 }}>
          로그인하면 개인정보처리방침 및 이용약관에 동의한 것으로 간주합니다.
        </p>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link href={"/" as Route} className="muted" style={{ fontSize: 13, textDecoration: "underline" }}>
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}

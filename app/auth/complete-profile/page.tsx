"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Route } from "next";

type ProfileForm = {
  name: string;
  gender: string;
  age: string;
  phone: string;
  email: string;
};

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>({ name: "", gender: "", age: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth/login" as Route);
        return;
      }
      setUser(user);
      setForm((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
        email: user.email ?? "",
        phone: user.user_metadata?.phone ?? user.user_metadata?.mobile ?? ""
      }));
    });
  }, [supabase, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!form.name.trim()) { setError("이름을 입력해주세요."); return; }
    if (!form.gender) { setError("성별을 선택해주세요."); return; }
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 1) {
      setError("올바른 나이를 입력해주세요.");
      return;
    }
    if (!form.phone.trim()) { setError("휴대폰번호를 입력해주세요."); return; }

    setSubmitting(true);
    setError("");

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: form.name.trim(),
        gender: form.gender,
        age: Number(form.age),
        phone: form.phone.trim(),
        email: form.email.trim(),
        profile_complete: true,
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      setError("프로필 저장에 실패했습니다. 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    router.push(next as Route);
  }

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh" }}>
        <p className="muted">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: "60px auto" }}>
      <h2 style={{ marginBottom: 6 }}>회원 정보 입력</h2>
      <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
        서비스 이용을 위해 기본 정보를 입력해주세요.
      </p>

      <form className="grid" style={{ gap: 16 }} onSubmit={handleSubmit}>
        <label>
          이름 *
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="홍길동"
            required
          />
        </label>

        <label>
          성별 *
          <select name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">-- 선택하세요 --</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </label>

        <label>
          나이 *
          <input
            className="input"
            name="age"
            type="number"
            min={1}
            max={100}
            value={form.age}
            onChange={handleChange}
            placeholder="25"
            required
          />
        </label>

        <label>
          휴대폰번호 *
          <input
            className="input"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="01012345678"
            required
          />
        </label>

        <label>
          이메일
          <input
            className="input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
          />
        </label>

        {error && <p style={{ color: "var(--accent)", margin: 0, fontSize: 14 }}>{error}</p>}

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : "저장하고 시작하기"}
        </button>
      </form>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <main>
      <Suspense
        fallback={
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
            <p className="muted">로딩 중...</p>
          </div>
        }
      >
        <CompleteProfileForm />
      </Suspense>
    </main>
  );
}
